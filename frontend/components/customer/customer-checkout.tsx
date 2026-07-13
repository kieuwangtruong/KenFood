"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MapPin, Wallet, CreditCard, Banknote, Bike, CheckCircle2, Loader2, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/shell/badges"
import { DRIVERS, FOOD_ITEMS, formatVND } from "@/lib/data"
import { cn } from "@/lib/utils"
import { getBuildings, getWalletInfo, topupWallet } from "@/src/api/kenServices"
import axiosClient from "@/src/api/axiosClient"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CustomerCheckout({ cart }: { cart?: any[] }) {
  const CART = cart && cart.length > 0 ? cart : [FOOD_ITEMS[0], FOOD_ITEMS[3]]
  const [buildings, setBuildings] = useState<any[]>([])
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("")
  const [loadingBuildings, setLoadingBuildings] = useState(true)
  
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "WALLET" | "PAYOS">("WALLET")
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [loadingWallet, setLoadingWallet] = useState(false)
  const [walletError, setWalletError] = useState<string | null>(null)
  
  const [isLockedOut, setIsLockedOut] = useState(false)
  const [bypassCutoff, setBypassCutoff] = useState(false)
  
  const [matchState, setMatchState] = useState<"idle" | "matching" | "matched">("idle")
  const [addressError, setAddressError] = useState("")

  const subtotal = CART.reduce((s, f) => s + f.price, 0)
  const shipping = 15000
  const total = subtotal + shipping

  const matchedDriver = DRIVERS[0]

  // Check 10:00 AM lockout
  useEffect(() => {
    const checkTime = () => {
      const now = new Date()
      const hours = now.getHours()
      if (hours >= 10) {
        setIsLockedOut(true)
      } else {
        setIsLockedOut(false)
      }
    }
    checkTime()
    const interval = setInterval(checkTime, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch buildings on mount
  useEffect(() => {
    async function loadBuildings() {
      try {
        setLoadingBuildings(true)
        const res = await getBuildings()
        setBuildings(res || [])
        if (res && res.length > 0) {
          setSelectedBuildingId(String(res[0].id))
        }
      } catch (err) {
        console.warn("Failed to fetch buildings, using mock list:", err)
        const mockBuildings = [
          { id: 1, name: "Keangnam Landmark 72", address: "Khu đô thị mới Cầu Giấy, Mễ Trì, Nam Từ Liêm, Hà Nội" },
          { id: 2, name: "Viettel Complex Tower", address: "285 Cách Mạng Tháng Tám, Quận 10, TP. Hồ Chí Minh" },
          { id: 3, name: "FPT Tower Cầu Giấy", address: "Số 10 Phạm Văn Bạch, Dịch Vọng, Cầu Giấy, Hà Nội" },
          { id: 4, name: "Lotte Center Hanoi", address: "54 Liễu Giai, Cống Vị, Ba Đình, Hà Nội" }
        ]
        setBuildings(mockBuildings)
        setSelectedBuildingId("1")
      } finally {
        setLoadingBuildings(false)
      }
    }
    loadBuildings()
  }, [])

  // Fetch wallet balance when paymentMethod is WALLET
  const fetchWalletBalance = async () => {
    try {
      setLoadingWallet(true)
      setWalletError(null)
      const data = await getWalletInfo()
      if (data && typeof data.available_balance === 'number') {
        setWalletBalance(data.available_balance)
      } else {
        setWalletBalance(50000) // fallback
      }
    } catch (err: any) {
      console.warn("Failed to fetch wallet balance, using mock fallback:", err)
      // Use mock balance that is insufficient by default so the warning is shown, but can be topped up
      setWalletBalance(50000) // Insufficient since total order is > 50,000 VND
    } finally {
      setLoadingWallet(false)
    }
  }

  useEffect(() => {
    if (paymentMethod === "WALLET") {
      fetchWalletBalance()
    }
  }, [paymentMethod])

  // Real Topup with simulated fallback webhook triggers
  const handleMockTopup = async () => {
    const topupAmount = 100000
    try {
      setLoadingWallet(true)
      const res = await topupWallet(1, topupAmount)
      if (res && res.payment_url) {
        window.open(res.payment_url, "_blank")
        
        if (res.payment_url.includes("mock.payos.vn") && res.order_code) {
          try {
            await axiosClient.post('/payos/simulate-success', null, {
              params: {
                order_code: res.order_code,
                amount: topupAmount
              }
            })
            await fetchWalletBalance()
            alert(`Khởi tạo yêu cầu nạp tiền ${formatVND(topupAmount)} thành công!\nHệ thống phát hiện môi trường thử nghiệm và đã tự động mô phỏng nạp tiền thành công vào Ví Kén của bạn.`)
          } catch (simErr) {
            console.error("Simulation failed:", simErr)
            alert(`Khởi tạo link thanh toán thành công. Vui lòng thanh toán qua link: ${res.payment_url}`)
          }
        } else {
          alert(`Vui lòng thanh toán qua link PayOS vừa mở để nạp tiền vào tài khoản.`)
        }
      }
    } catch (err: any) {
      console.warn("Topup request failed:", err)
      alert("Yêu cầu nạp tiền thất bại: " + (err.response?.data?.detail || err.message))
    } finally {
      setLoadingWallet(false)
    }
  }

  const confirm = async () => {
    if (!selectedBuildingId) {
      setAddressError("Vui lòng chọn tòa nhà giao hàng.")
      return
    }
    
    if (paymentMethod === "WALLET" && walletBalance < total) {
      setAddressError("Số dư ví của bạn không đủ. Vui lòng nạp thêm tiền.")
      return
    }

    try {
      setAddressError("")
      setMatchState("matching")
      
      const res = await axiosClient.post('/order/checkout', {
        merchant_id: CART[0].merchant_id || 1,
        building_id: parseInt(selectedBuildingId, 10),
        payment_method: paymentMethod.toLowerCase(),
        items: CART.map((item: any) => {
          let pId = 1
          if (typeof item.id === 'number') {
            pId = item.id
          } else if (typeof item.id === 'string') {
            const numericId = parseInt(item.id.replace(/\D/g, ''), 10)
            pId = isNaN(numericId) ? 1 : numericId
          }
          return {
            product_id: pId,
            quantity: 1
          }
        })
      })

      if (res.data) {
        const orderData = res.data.order;
        const checkoutUrl = res.data.payos_checkout_url;

        if (paymentMethod === "PAYOS" && checkoutUrl) {
          window.open(checkoutUrl, "_blank")
          
          if (checkoutUrl.includes("mock.payos.vn") && orderData.payos_order_code) {
            try {
              await axiosClient.post('/payos/simulate-success', null, {
                params: {
                  order_code: orderData.payos_order_code,
                  amount: total
                }
              })
            } catch (simErr) {
              console.error("Simulation failed:", simErr)
            }
          }
        }

        setTimeout(() => {
          setMatchState("matched")
          if (paymentMethod === "WALLET") {
            fetchWalletBalance()
          }
        }, 2200)
      }
    } catch (err: any) {
      setMatchState("idle")
      console.error("Checkout failed:", err)
      setAddressError("Đặt hàng thất bại: " + (err.response?.data?.detail || err.message))
    }
  }

  const selectedBuilding = buildings.find(b => String(b.id) === selectedBuildingId)
  const isLocked = isLockedOut && !bypassCutoff

  return (
    <div className="pb-6">
      <div className="bg-[#F4EFEA] dark:bg-gray-900 px-5 py-6 text-gray-900 dark:text-white border-b border-amber-600/20 dark:border-emerald-600/20">
        <h1 className="text-xl font-bold">Thanh toán</h1>
        <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 font-semibold">
          Xác nhận đơn & ghép tài xế qua Lobby Hub
        </p>
      </div>

      <div className="space-y-4 px-5 pt-5">
        {/* 10:00 AM Time Lockout Banner */}
        {isLockedOut && (
          <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-600 dark:text-amber-400 font-semibold shadow-sm">
            <Clock className="h-5 w-5 shrink-0 text-amber-500 mt-0.5 animate-pulse" />
            <div className="space-y-1.5 flex-1">
              <p className="font-bold">Đã đến hạn chót đặt đơn trưa (10:00 AM Cutoff)</p>
              <p className="text-[11px] opacity-90">Lunch shift cutoff reached. Next available shift is now open.</p>
              
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setBypassCutoff(!bypassCutoff)}
                  className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 rounded text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
                >
                  {bypassCutoff ? "Bật lại chế độ khóa" : "Bỏ qua để đặt thử (Bypass Lock)"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Address (Building Dropdown) */}
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
          <Label className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <MapPin className="h-4 w-4 text-primary" /> Điểm giao hàng (Tòa nhà Destination)
          </Label>
          
          <Select 
            value={selectedBuildingId} 
            onValueChange={(val) => setSelectedBuildingId(val || "")}
            disabled={loadingBuildings}
          >
            <SelectTrigger className="h-10.5 rounded-xl border border-border bg-background text-foreground text-xs font-semibold cursor-pointer">
              <SelectValue placeholder={loadingBuildings ? "Đang tải danh sách tòa nhà..." : "Chọn tòa nhà destination"} />
            </SelectTrigger>
            <SelectContent>
              {buildings.map((b) => (
                <SelectItem key={b.id} value={String(b.id)} className="text-xs">
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedBuilding && (
            <div className="text-[10px] text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/40 font-medium">
              <span className="font-bold block text-foreground mb-0.5">Địa chỉ chi tiết:</span>
              {selectedBuilding.address}
            </div>
          )}
          
          {addressError && (
            <p className="mt-1 text-xs font-medium text-destructive">{addressError}</p>
          )}
        </section>

        {/* Cart */}
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-bold text-foreground">Giỏ hàng ({CART.length} món)</p>
          <div className="mt-3 space-y-3">
            {CART.map((f) => (
              <div key={f.id} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={f.image_url || f.image || "/placeholder.svg"}
                    alt={f.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-foreground">{f.name}</p>
                  <p className="text-[11px] text-muted-foreground">{f.merchant_name || f.merchant}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">{formatVND(f.price)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Controlled Radio Group Payment Methods */}
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
          <p className="text-xs font-bold text-foreground">Phương thức thanh toán</p>
          <div className="space-y-2">
            {/* Wallet Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod("WALLET")}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all active:scale-[0.99] cursor-pointer",
                paymentMethod === "WALLET" ? "border-primary bg-primary/5 shadow-xs" : "border-border bg-background"
              )}
            >
              <Wallet className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-foreground">Ví Kén Pay (Fintech Wallet)</span>
                  <span className="text-[9px] uppercase px-1 rounded bg-primary/10 text-primary font-extrabold tracking-wider">Khuyên dùng</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Khấu trừ tự động nhanh chóng & bảo mật
                </p>
              </div>
              <div className="h-4.5 w-4.5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                {paymentMethod === "WALLET" && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </div>
            </button>

            {/* PayOS Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod("PAYOS")}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all active:scale-[0.99] cursor-pointer",
                paymentMethod === "PAYOS" ? "border-primary bg-primary/5 shadow-xs" : "border-border bg-background"
              )}
            >
              <CreditCard className="h-5 w-5 text-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-foreground">Cổng thanh toán PayOS QR</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Quét mã VietQR chuyển khoản ngân hàng 24/7
                </p>
              </div>
              <div className="h-4.5 w-4.5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                {paymentMethod === "PAYOS" && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </div>
            </button>

            {/* Cash Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod("CASH")}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all active:scale-[0.99] cursor-pointer",
                paymentMethod === "CASH" ? "border-primary bg-primary/5 shadow-xs" : "border-border bg-background"
              )}
            >
              <Banknote className="h-5 w-5 text-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-foreground">Tiền mặt (COD)</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Thanh toán trực tiếp khi shipper bàn giao hàng
                </p>
              </div>
              <div className="h-4.5 w-4.5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                {paymentMethod === "CASH" && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </div>
            </button>
          </div>

          {/* WALLET Details Panel */}
          {paymentMethod === "WALLET" && (
            <div className="mt-3 bg-muted/40 dark:bg-gray-800/50 p-4 rounded-xl border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Số dư Ví Kén hiện tại:</span>
                {loadingWallet ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                ) : (
                  <span className="text-sm font-black text-foreground">{formatVND(walletBalance)}</span>
                )}
              </div>
              
              {walletBalance < total && !loadingWallet && (
                <div className="space-y-2 border-t border-border/60 pt-2.5">
                  <p className="text-[11px] text-destructive font-bold flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                    Số dư không đủ thanh toán đơn hàng ({formatVND(total)})
                  </p>
                  
                  <button
                    type="button"
                    onClick={handleMockTopup}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-primary bg-primary/5 rounded-lg text-xs font-black text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    Nạp tiền Ví Kén (+100.000₫)
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Lobby Hub matching */}
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Bike className="h-4 w-4 text-primary" /> Lobby Hub · Ghép tài xế
          </p>
          {matchState === "idle" && (
            <p className="mt-2 text-xs text-muted-foreground">
              Nhấn xác nhận để hệ thống ghép tài xế gần bạn nhất.
            </p>
          )}
          {matchState === "matching" && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-muted/60 p-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">Đang tìm tài xế phù hợp...</p>
            </div>
          )}
          {matchState === "matched" && (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-500/20 p-3">
              <Avatar className="h-11 w-11 border-2 border-emerald-500">
                <AvatarImage src={matchedDriver.avatar || "/placeholder.svg"} alt={matchedDriver.name} />
                <AvatarFallback>{matchedDriver.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="flex items-center gap-1 text-sm font-bold text-foreground">
                  {matchedDriver.name}
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </p>
                <p className="text-[11px] text-muted-foreground dark:text-gray-400">
                  {matchedDriver.vehicle} · {matchedDriver.plate}
                </p>
              </div>
              <StarRating rating={matchedDriver.rating} />
            </div>
          )}
        </section>

        {/* Summary */}
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="space-y-1.5 text-sm">
            <Row label="Tạm tính" value={formatVND(subtotal)} />
            <Row label="Phí giao hàng" value={formatVND(shipping)} />
            <div className="my-2 border-t border-border" />
            <Row label="Tổng cộng" value={formatVND(total)} bold />
          </div>
        </section>

        <Button 
          onClick={confirm} 
          className={cn(
            "h-12 w-full text-base font-bold rounded-xl text-white",
            (isLocked || matchState === "matching" || (paymentMethod === "WALLET" && walletBalance < total)) &&
            "bg-gray-400 dark:bg-gray-700 text-gray-250 cursor-not-allowed hover:bg-gray-400 dark:hover:bg-gray-700 font-bold"
          )}
          disabled={isLocked || matchState === "matching" || (paymentMethod === "WALLET" && walletBalance < total)}
        >
          {isLocked 
            ? "Hết giờ đặt ca trưa (Khóa sau 10:00)" 
            : paymentMethod === "WALLET" && walletBalance < total 
              ? "Số dư Ví không đủ" 
              : matchState === "matched" 
                ? "Đã xác nhận đơn hàng" 
                : `Đặt đơn · ${formatVND(total)}`
          }
        </Button>
      </div>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={cn(bold ? "font-bold text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
      <span className={cn("text-foreground", bold && "font-bold")}>{value}</span>
    </div>
  )
}
