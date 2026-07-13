"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Pencil, Star } from "lucide-react"
import { FOOD_ITEMS, formatVND } from "@/lib/data"
import { QualityBadgePill } from "@/components/shell/badges"

type Dish = (typeof FOOD_ITEMS)[number] & { available: boolean }

const MINE: Dish[] = FOOD_ITEMS.slice(0, 5).map((f, i) => ({ ...f, available: i !== 3 }))

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  approved: { text: "Đã duyệt", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending: { text: "Chờ duyệt", className: "bg-amber-50 text-amber-700 border-amber-200" },
  rejected: { text: "Bị từ chối", className: "bg-rose-50 text-rose-700 border-rose-200" },
}

export function MerchantMenu() {
  const [dishes, setDishes] = useState<Dish[]>(MINE)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [desc, setDesc] = useState("")
  const [err, setErr] = useState<string | null>(null)

  const toggle = (id: string) =>
    setDishes((prev) => prev.map((d) => (d.id === id ? { ...d, available: !d.available } : d)))

  const addDish = () => {
    if (!name.trim() || !price.trim()) {
      setErr("Vui lòng nhập tên món và giá bán.")
      return
    }
    if (Number.isNaN(Number(price)) || Number(price) <= 0) {
      setErr("Giá bán phải là số dương.")
      return
    }
    setDishes((prev) => [
      {
        ...FOOD_ITEMS[0],
        id: `new-${Date.now()}`,
        name,
        price: Number(price),
        rating: 0,
        reviews: 0,
        status: "pending",
        badges: [],
        available: true,
      },
      ...prev,
    ])
    setName("")
    setPrice("")
    setDesc("")
    setErr(null)
    setOpen(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Thực đơn của bạn</h1>
          <p className="text-sm text-muted-foreground">
            {dishes.filter((d) => d.available).length}/{dishes.length} món đang mở bán
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <span className={cn(buttonVariants({ variant: "default" }), "gap-1.5 cursor-pointer")}>
                <Plus className="size-4" /> Thêm món mới
              </span>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm món vào thực đơn</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="dish-name">Tên món</Label>
                <Input
                  id="dish-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Phở bò sốt vang"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dish-price">Giá bán (VND)</Label>
                <Input
                  id="dish-price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="VD: 75000"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dish-desc">Mô tả</Label>
                <Textarea
                  id="dish-desc"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Thành phần, khẩu phần..."
                  rows={3}
                />
              </div>
              {err && <p className="text-sm font-medium text-destructive">{err}</p>}
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Món mới sẽ ở trạng thái "Chờ duyệt" cho tới khi Kén kiểm định chất lượng.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} className="bg-transparent">
                Hủy
              </Button>
              <Button onClick={addDish}>Gửi kiểm duyệt</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {dishes.map((d) => {
          const status = STATUS_LABEL[d.status]
          return (
            <Card key={d.id} className="gap-0 overflow-hidden p-0">
              <div className="relative h-36">
                <img
                  src={d.image || "/placeholder.svg"}
                  alt={d.name}
                  className={`h-full w-full object-cover ${!d.available ? "grayscale" : ""}`}
                />
                <Badge className={`absolute left-2 top-2 border ${status.className}`} variant="outline">
                  {status.text}
                </Badge>
              </div>
              <div className="space-y-3 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-tight">{d.name}</p>
                  <span className="whitespace-nowrap font-semibold text-primary">{formatVND(d.price)}</span>
                </div>
                {d.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {d.badges.map((b) => (
                      <QualityBadgePill key={b} badge={b} />
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="size-3 fill-primary text-primary" />
                  {d.rating > 0 ? `${d.rating} · ${d.reviews} đánh giá` : "Chưa có đánh giá"}
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <Switch checked={d.available} onCheckedChange={() => toggle(d.id)} id={`sw-${d.id}`} />
                    <Label htmlFor={`sw-${d.id}`} className="text-xs text-muted-foreground">
                      {d.available ? "Đang bán" : "Tạm hết"}
                    </Label>
                  </div>
                  <Button size="sm" variant="ghost" className="gap-1.5 text-xs">
                    <Pencil className="size-3.5" /> Sửa
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
