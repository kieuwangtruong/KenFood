"use client"

import { useState, useEffect } from "react"
import { getMyBatches, completeBatch } from "@/src/api/kenServices"
import { ChevronRight, MapPin, Store, Package, Bike, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

const CYCLE = [
  { id: 0, action: "Nhận đơn", next: "Đến nhà hàng", icon: CheckCircle2, color: "bg-primary" },
  { id: 1, action: "Đến nhà hàng", next: "Lấy món", icon: Store, color: "bg-sky-500" },
  { id: 2, action: "Lấy món", next: "Bắt đầu giao", icon: Package, color: "bg-emerald-600" },
  { id: 3, action: "Đang giao", next: "Hoàn tất", icon: Bike, color: "bg-teal-600" },
  { id: 4, action: "Hoàn tất", next: "Xong", icon: CheckCircle2, color: "bg-emerald-500" },
]

export function DeliveryCycleBar() {
  const [step, setStep] = useState(0)
  const [assignedBatch, setAssignedBatch] = useState<any | null>(null)
  
  const current = CYCLE[step]
  const Icon = current.icon
  const isDone = step === CYCLE.length - 1

  const syncBatch = async () => {
    try {
      const myBatches = await getMyBatches()
      const active = myBatches?.find((b: any) => b.status === "ASSIGNED" || b.status === "DELIVERING")
      if (active) {
        setAssignedBatch(active)
      } else {
        setAssignedBatch(null)
      }
    } catch (err) {
      console.warn("Failed to sync batch in cycle bar:", err)
    }
  }

  useEffect(() => {
    syncBatch()
    const interval = setInterval(syncBatch, 5000)
    return () => clearInterval(interval)
  }, [])

  const advance = async () => {
    if (step === 3 && assignedBatch) {
      try {
        await completeBatch(assignedBatch.id)
        setStep(4)
        window.dispatchEvent(new Event("wallet-updated"))
      } catch (err: any) {
        console.error("Complete batch failed:", err)
        alert("Thất bại khi hoàn tất chuyến đi: " + (err.response?.data?.detail || err.message))
      }
    } else if (isDone) {
      setStep(0)
      setAssignedBatch(null)
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div className="border-t border-border bg-card px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[11px] font-bold text-primary">
          {assignedBatch ? `BATCH #${assignedBatch.id}` : "KEN-83920"}
        </p>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3" /> 2.4 km · 8 phút
        </span>
      </div>

      {/* Step dots */}
      <div className="mb-2 flex items-center gap-1">
        {CYCLE.map((c, i) => (
          <div
            key={c.id}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i <= step ? current.color : "bg-muted",
            )}
          />
        ))}
      </div>

      {/* Swipe-style action button */}
      <button
        onClick={advance}
        className={cn(
          "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-white transition-colors",
          current.color,
        )}
      >
        <span className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <span className="text-sm font-bold">
            {isDone ? "Giao hàng thành công!" : current.action}
          </span>
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold opacity-90">
          {isDone ? "Đơn mới" : `Trượt: ${current.next}`}
          <ChevronRight className="h-4 w-4" />
        </span>
      </button>
    </div>
  )
}
