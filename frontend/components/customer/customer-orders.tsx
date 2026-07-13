"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Phone, Star, Store, Bike, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ORDER_STEPS, type Order, formatVND } from "@/lib/data"
import { cn } from "@/lib/utils"
import { getOrders } from "@/src/api/kenServices"

function mapBackendStatusToFrontend(status: string): string {
  switch (status) {
    case "pending_payment":
    case "paid":
    case "confirmed":
      return "Chờ xác nhận";
    case "batched":
      return "Đang nấu";
    case "delivering":
      return "Đang giao";
    case "completed":
      return "Đã nhận";
    default:
      return "Chờ xác nhận";
  }
}

const formatTime = (isoString: string) => {
  try {
    const d = new Date(isoString)
    const hours = String(d.getHours()).padStart(2, "0")
    const minutes = String(d.getMinutes()).padStart(2, "0")
    return `${hours}:${minutes}`
  } catch (e) {
    return "10:00"
  }
}

export function CustomerOrders({ onChatSelect }: { onChatSelect: (channelId: string) => void }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getOrders()
        if (data) {
          const mapped: Order[] = data.map((bo: any) => ({
            id: `KEN-${bo.id}`,
            items: bo.items.map((it: any) => ({
              name: it.product_name || "Món ăn",
              qty: it.quantity,
              price: it.price
            })),
            merchant: bo.merchant_name || "Cửa hàng Kén",
            ward: bo.building_name || "Hà Nội",
            customer: "Đỗ Thu Trang",
            driver: bo.driver_name || "—",
            status: mapBackendStatusToFrontend(bo.status),
            total: bo.total_amount,
            createdAt: formatTime(bo.created_at),
            eta: bo.status === "delivering" ? 12 : 0
          }))
          setOrders(mapped)
        }
      } catch (err) {
        console.warn("Failed to load real orders:", err)
      } finally {
        setLoading(false)
      }
    }
    
    loadOrders()
    const interval = setInterval(loadOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex h-[350px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-bold">Đang tải danh sách đơn hàng...</p>
      </div>
    )
  }

  const activeOrders = orders.filter((o) => o.status !== "Đã nhận")
  const completedOrders = orders.filter((o) => o.status === "Đã nhận")

  return (
    <div className="pb-6 space-y-5">
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Đơn hàng của tôi</h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi hành trình giao nhận thời gian thực và xem lịch sử đơn hàng
        </p>
      </div>

      {/* Mobile Header */}
      <div className="bg-[#F4EFEA] dark:bg-gray-900 px-5 py-6 text-gray-900 dark:text-white border-b border-amber-600/20 dark:border-emerald-600/20 lg:hidden shrink-0">
        <h1 className="text-xl font-bold">Đơn hàng của tôi</h1>
        <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 font-semibold">
          Theo dõi trạng thái thời gian thực
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 lg:px-0">
        {/* Left Column: Active processing orders */}
        <div className="lg:col-span-2 space-y-4">
          <p className="text-xs font-bold text-foreground uppercase tracking-wider">Đơn hàng đang xử lý ({activeOrders.length})</p>
          {activeOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-xs text-muted-foreground font-semibold">
              Không có đơn hàng nào đang trong quá trình vận chuyển.
            </div>
          ) : (
            activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} onChatSelect={onChatSelect} />
            ))
          )}
        </div>

        {/* Right Column: Historical completed orders */}
        <div className="space-y-4 lg:col-span-1">
          <p className="text-xs font-bold text-foreground uppercase tracking-wider">Đã hoàn thành ({completedOrders.length})</p>
          {completedOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-xs text-muted-foreground font-semibold">
              Chưa có lịch sử đơn hàng nào.
            </div>
          ) : (
            completedOrders.map((order) => (
              <OrderCard key={order.id} order={order} onChatSelect={onChatSelect} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function OrderCard({ order, onChatSelect }: { order: Order; onChatSelect: (channelId: string) => void }) {
  const currentStep = ORDER_STEPS.indexOf(order.status)
  const isDone = order.status === "Đã nhận"

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs font-bold text-primary">{order.id}</p>
          <p className="text-sm font-semibold text-foreground">{order.merchant}</p>
        </div>
        <span className="text-[11px] text-muted-foreground">{order.createdAt}</span>
      </div>

      {/* Progress tracker */}
      <div className="mt-4 flex items-center">
        {ORDER_STEPS.map((step, i) => {
          const reached = i <= currentStep
          return (
            <div key={step} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                    reached
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {i < currentStep || isDone ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={cn(
                    "mt-1 w-14 text-center text-[9px] leading-tight",
                    reached ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step}
                </span>
              </div>
              {i < ORDER_STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-0.5 flex-1 rounded-full",
                    i < currentStep ? "bg-primary" : "bg-muted",
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Items */}
      <div className="mt-4 space-y-1 border-t border-border pt-3">
        {order.items.map((it) => (
          <div key={it.name} className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              {it.qty}× {it.name}
            </span>
            <span className="font-medium text-foreground">
              {formatVND(it.price * it.qty)}
            </span>
          </div>
        ))}
        <div className="flex justify-between pt-1 text-sm font-bold text-foreground">
          <span>Tổng cộng</span>
          <span>{formatVND(order.total)}</span>
        </div>
      </div>

      {/* Actions */}
      {!isDone ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 bg-transparent"
            onClick={() => onChatSelect("customer-driver")}
          >
            <MessageCircle className="h-4 w-4 text-primary" /> Chat tài xế
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 bg-transparent"
            onClick={() => onChatSelect("customer-merchant")}
          >
            <Store className="h-4 w-4 text-primary" /> Chat quán
          </Button>
          {order.status === "Đang giao" && (
            <p className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 py-1.5 text-xs font-semibold text-foreground">
              <Bike className="h-4 w-4 text-primary" />
              {order.driver} · còn {order.eta} phút
            </p>
          )}
        </div>
      ) : (
        <ReviewForm orderId={order.id} />
      )}
    </div>
  )
}

function ReviewForm({ orderId }: { orderId: string }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  // Pydantic-style validation: rating required (ge=1, le=5), feedback min_length=10
  const submit = () => {
    if (rating < 1) {
      setError("Vui lòng chọn số sao (1–5).")
      return
    }
    if (feedback.trim().length > 0 && feedback.trim().length < 10) {
      setError("Nhận xét phải có ít nhất 10 ký tự.")
      return
    }
    setError("")
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
        <CheckCircle2 className="h-5 w-5" />
        Cảm ơn bạn đã đánh giá {rating} sao!
      </div>
    )
  }

  return (
    <div className="mt-3 rounded-xl bg-muted/60 p-3">
      <p className="text-xs font-bold text-foreground">Đánh giá đơn hàng</p>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            aria-label={`${n} sao`}
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                n <= (hover || rating)
                  ? "fill-primary text-primary"
                  : "fill-transparent text-muted-foreground",
              )}
            />
          </button>
        ))}
      </div>
      <Textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Chia sẻ cảm nhận về món ăn và tài xế..."
        className="mt-2 min-h-16 resize-none rounded-lg bg-background text-sm"
      />
      {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}
      <Button onClick={submit} size="sm" className="mt-2 w-full">
        Gửi đánh giá
      </Button>
    </div>
  )
}
