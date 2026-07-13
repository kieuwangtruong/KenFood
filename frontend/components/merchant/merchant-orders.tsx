"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Check, X, ChefHat, Bike, MapPin } from "lucide-react"
import { formatVND } from "@/lib/data"

type Stage = "new" | "cooking" | "ready"
type LiveOrder = {
  id: string
  customer: string
  ward: string
  items: { name: string; qty: number; price: number }[]
  total: number
  placed: string
  stage: Stage
  driver?: string
}

const INITIAL: LiveOrder[] = [
  {
    id: "KEN-83942",
    customer: "Đỗ Thu Trang",
    ward: "Cầu Giấy",
    items: [{ name: "Phở bò tái lăn đặc biệt", qty: 2, price: 75000 }],
    total: 150000,
    placed: "vừa xong",
    stage: "new",
  },
  {
    id: "KEN-83939",
    customer: "Vũ Đức Mạnh",
    ward: "Đống Đa",
    items: [
      { name: "Phở bò tái lăn đặc biệt", qty: 1, price: 75000 },
      { name: "Quẩy nóng", qty: 2, price: 10000 },
    ],
    total: 95000,
    placed: "1 phút trước",
    stage: "new",
  },
  {
    id: "KEN-83930",
    customer: "Lê Hải Yến",
    ward: "Hai Bà Trưng",
    items: [{ name: "Phở gà ta", qty: 3, price: 70000 }],
    total: 210000,
    placed: "4 phút trước",
    stage: "cooking",
  },
  {
    id: "KEN-83921",
    customer: "Ngô Thanh Tùng",
    ward: "Hoàn Kiếm",
    items: [{ name: "Phở bò tái nạm", qty: 1, price: 72000 }],
    total: 72000,
    placed: "9 phút trước",
    stage: "ready",
    driver: "Nguyễn Văn Hùng",
  },
]

const COLUMNS: { stage: Stage; label: string; icon: typeof Clock; tone: string }[] = [
  { stage: "new", label: "Đơn mới", icon: Clock, tone: "text-primary" },
  { stage: "cooking", label: "Đang chế biến", icon: ChefHat, tone: "text-sky-600" },
  { stage: "ready", label: "Chờ tài xế", icon: Bike, tone: "text-emerald-600" },
]

export function MerchantOrders() {
  const [orders, setOrders] = useState<LiveOrder[]>(INITIAL)

  const advance = (id: string) =>
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, stage: o.stage === "new" ? "cooking" : "ready", driver: o.stage === "cooking" ? "Trần Minh Tuấn" : o.driver }
          : o,
      ),
    )
  const reject = (id: string) => setOrders((prev) => prev.filter((o) => o.id !== id))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bảng đơn trực tiếp</h1>
        <p className="text-sm text-muted-foreground">
          Xác nhận và theo dõi đơn theo từng giai đoạn chế biến.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const Icon = col.icon
          const list = orders.filter((o) => o.stage === col.stage)
          return (
            <div key={col.stage} className="rounded-2xl bg-muted/40 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className={`flex items-center gap-2 text-sm font-semibold ${col.tone}`}>
                  <Icon className="size-4" />
                  {col.label}
                </span>
                <Badge variant="secondary" className="bg-card">
                  {list.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {list.map((o) => (
                  <Card key={o.id} className="gap-3 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-muted-foreground">{o.id}</span>
                      <span className="text-[11px] text-muted-foreground">{o.placed}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{o.customer}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" /> {o.ward}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {o.items.map((it, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {it.qty}× {it.name}
                          </span>
                          <span className="font-medium">{formatVND(it.qty * it.price)}</span>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Tổng</span>
                      <span className="font-semibold text-primary">{formatVND(o.total)}</span>
                    </div>

                    {o.stage === "new" && (
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 gap-1.5" onClick={() => advance(o.id)}>
                          <Check className="size-3.5" /> Nhận đơn
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 bg-transparent text-destructive hover:text-destructive"
                          onClick={() => reject(o.id)}
                        >
                          <X className="size-3.5" /> Từ chối
                        </Button>
                      </div>
                    )}
                    {o.stage === "cooking" && (
                      <Button size="sm" className="w-full gap-1.5" onClick={() => advance(o.id)}>
                        <Bike className="size-3.5" /> Báo món xong
                      </Button>
                    )}
                    {o.stage === "ready" && o.driver && (
                      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-2.5 py-2 text-xs text-emerald-700">
                        <Bike className="size-3.5" />
                        Tài xế <span className="font-semibold">{o.driver}</span> đang đến lấy
                      </div>
                    )}
                  </Card>
                ))}
                {list.length === 0 && (
                  <p className="py-6 text-center text-xs text-muted-foreground">Trống</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
