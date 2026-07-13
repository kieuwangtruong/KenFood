"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, X, ShieldQuestion, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QualityBadgePill, StarRating } from "@/components/shell/badges"
import { FOOD_ITEMS, formatVND, type FoodItem } from "@/lib/data"

export function AdminVerification() {
  const [queue, setQueue] = useState<FoodItem[]>(
    FOOD_ITEMS.filter((f) => f.status === "pending"),
  )
  const [resolved, setResolved] = useState<{ item: FoodItem; action: "approved" | "rejected" }[]>([])

  const decide = (item: FoodItem, action: "approved" | "rejected") => {
    setQueue((q) => q.filter((f) => f.id !== item.id))
    setResolved((r) => [{ item, action }, ...r])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Kiểm duyệt chất lượng</h1>
        <p className="text-sm text-muted-foreground">
          Hàng đợi kiểm duyệt món ăn đang chờ phê duyệt
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Clock className="h-4 w-4" />
        <span className="font-semibold">{queue.length}</span> món đang chờ kiểm duyệt
      </div>

      {queue.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card py-12 text-center">
          <ShieldQuestion className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Hàng đợi trống</p>
          <p className="text-xs text-muted-foreground">Tất cả món ăn đã được xử lý.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {queue.map((f) => (
            <div key={f.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex gap-4 p-4">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={f.image || "/placeholder.svg"}
                    alt={f.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-sm font-bold text-foreground">{f.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {f.merchant} · {f.ward}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {f.badges.map((b) => (
                      <QualityBadgePill key={b} badge={b} />
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <StarRating rating={f.rating} />
                    <p className="text-sm font-bold text-foreground">{formatVND(f.price)}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-border p-3">
                <Button
                  variant="outline"
                  className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/5"
                  onClick={() => decide(f, "rejected")}
                >
                  <X className="h-4 w-4" /> Từ chối
                </Button>
                <Button className="gap-1.5" onClick={() => decide(f, "approved")}>
                  <Check className="h-4 w-4" /> Phê duyệt
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-bold text-foreground">Lịch sử xử lý gần đây</p>
          <div className="space-y-2">
            {resolved.map(({ item, action }, i) => (
              <div
                key={`${item.id}-${i}`}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 text-sm"
              >
                <span className="font-medium text-foreground">{item.name}</span>
                <span
                  className={
                    action === "approved"
                      ? "flex items-center gap-1 text-xs font-semibold text-emerald-600"
                      : "flex items-center gap-1 text-xs font-semibold text-destructive"
                  }
                >
                  {action === "approved" ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  {action === "approved" ? "Đã duyệt" : "Đã từ chối"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
