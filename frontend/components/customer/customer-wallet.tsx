"use client"

import React, { useState, useEffect } from "react"
import { Wallet, Plus, RefreshCw, ArrowUpRight, ArrowDownLeft, Lock, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { getWalletInfo, topupWallet } from "@/src/api/kenServices"
import axiosClient from "@/src/api/axiosClient"
import { formatVND } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function CustomerWallet() {
  const [wallet, setWallet] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [topupAmount, setTopupAmount] = useState<string>("100000")
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const walletData = await getWalletInfo()
      setWallet(walletData)

      const txRes = await axiosClient.get("/wallet/transactions")
      setTransactions(txRes.data || [])
    } catch (err: any) {
      console.error("Failed to fetch wallet info or transactions:", err)
      setError("Không thể tải thông tin ví từ máy chủ. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseInt(topupAmount, 10)
    if (isNaN(amountNum) || amountNum < 1000) {
      alert("Số tiền nạp tối thiểu là 1.000₫")
      return
    }

    try {
      setActionLoading(true)
      const res = await topupWallet(1, amountNum)
      if (res && res.payment_url) {
        window.open(res.payment_url, "_blank")
        
        // Simulating success in a dev/test environment
        if (res.payment_url.includes("mock.payos.vn") && res.order_code) {
          try {
            await axiosClient.post('/payos/simulate-success', null, {
              params: {
                order_code: res.order_code,
                amount: amountNum
              }
            })
            await fetchData()
            alert(`Khởi tạo link thanh toán thành công!\nHệ thống phát hiện môi trường thử nghiệm đã tự động nạp thành công ${formatVND(amountNum)} vào Ví Kén của bạn.`)
          } catch (simErr) {
            console.error("Simulation failed:", simErr)
            alert(`Khởi tạo link thanh toán thành công. Vui lòng truy cập để thanh toán: ${res.payment_url}`)
          }
        } else {
          alert(`Đã mở trang thanh toán PayOS. Vui lòng hoàn tất giao dịch để số dư cập nhật.`)
        }
      }
    } catch (err: any) {
      console.error("Topup failed:", err)
      alert("Nạp tiền thất bại: " + (err.response?.data?.detail || err.message))
    } finally {
      setActionLoading(false)
    }
  }

  const getTxTypeDetails = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return { label: "Nạp tiền Ví Kén", icon: ArrowUpRight, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 dark:bg-emerald-500/20" }
      case "DEDUCT":
        return { label: "Thanh toán đơn hàng", icon: ArrowDownLeft, color: "text-rose-600 dark:text-rose-450", bg: "bg-rose-500/10 dark:bg-rose-500/20" }
      case "BLOCK":
        return { label: "Khóa tiền ký quỹ (COD)", icon: Lock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 dark:bg-amber-500/20" }
      case "RELEASE":
        return { label: "Hoàn khóa ký quỹ (COD)", icon: RefreshCw, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 dark:bg-blue-500/20" }
      case "PAYOUT":
        return { label: "Thu nhập đơn hàng", icon: ArrowUpRight, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/10 dark:bg-sky-500/20" }
      default:
        return { label: "Giao dịch khác", icon: Wallet, color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-500/10 dark:bg-gray-500/20" }
    }
  }

  const getTxStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20">Thành công</span>
      case "PENDING":
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-500/20 animate-pulse">Chờ xử lý</span>
      case "FAILED":
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-500/20">Thất bại</span>
      default:
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">{status}</span>
    }
  }

  return (
    <div className="pb-8 space-y-6">
      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between border-b border-border pb-4 bg-card px-6 py-4 shadow-sm rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ví điện tử Kén Pay</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý số dư khả dụng, ký quỹ tín dụng, lịch sử giao dịch và nạp tiền 24/7.
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" className="rounded-xl flex items-center gap-1.5 cursor-pointer">
          <RefreshCw className="h-3.5 w-3.5" /> Tải lại
        </Button>
      </div>

      {/* Mobile Header */}
      <div className="bg-[#F4EFEA] dark:bg-gray-900 px-5 py-6 text-gray-900 dark:text-white border-b border-amber-600/20 dark:border-emerald-600/20 lg:hidden flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Ví Kén Pay</h1>
          <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 font-semibold">
            Thanh toán tiện lợi, hoàn tiền tức thì
          </p>
        </div>
        <button onClick={fetchData} className="p-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 lg:px-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: Wallet Balance details and Top-up card */}
        <div className="lg:col-span-1 space-y-5">
          {/* Balance card */}
          <section className="relative overflow-hidden rounded-2xl border border-amber-600 dark:border-emerald-600 bg-gradient-to-br from-amber-600/90 via-amber-600 to-amber-700 dark:from-emerald-800 dark:via-emerald-900 dark:to-emerald-950 p-6 text-white shadow-md">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mr-6 -mt-6 h-28 w-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 h-32 w-32 rounded-full bg-black/10 blur-xl pointer-events-none" />
            
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-100 dark:text-emerald-300">Tổng số dư khả dụng</span>
              <Wallet className="h-5 w-5 text-amber-200 dark:text-emerald-400" />
            </div>

            {loading ? (
              <div className="h-10 mt-3 flex items-center">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            ) : (
              <h2 className="text-3xl font-black mt-2 tracking-tight">
                {formatVND(wallet?.balance ?? 0)}
              </h2>
            )}

            <div className="border-t border-white/20 mt-6 pt-4 grid grid-cols-2 gap-4 relative z-10 text-xs">
              <div>
                <p className="text-white/70 text-[10px] font-bold uppercase">Ký quỹ (Đảm bảo)</p>
                <p className="font-bold text-white mt-0.5">
                  {loading ? "..." : formatVND(wallet?.deposit_amount ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-white/70 text-[10px] font-bold uppercase">Tạm khóa (Pending)</p>
                <p className="font-bold text-white mt-0.5">
                  {loading ? "..." : formatVND(wallet?.blocked_balance ?? 0)}
                </p>
              </div>
            </div>
          </section>

          {/* Top-up Form */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
              <Plus className="h-4 w-4 text-primary" /> Nạp tiền vào ví (Qua PayOS)
            </h3>
            <form onSubmit={handleTopup} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-semibold">Chọn hoặc nhập số tiền (VND)</label>
                <div className="grid grid-cols-3 gap-2">
                  {["50000", "100000", "200000"].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupAmount(amt)}
                      className={cn(
                        "py-2 px-1 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer",
                        topupAmount === amt
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background hover:bg-muted"
                      )}
                    >
                      +{parseInt(amt, 10) / 1000}K
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder="Nhập số tiền tự do..."
                  className="rounded-xl mt-2 h-10 text-xs"
                />
              </div>
              <Button
                type="submit"
                disabled={actionLoading}
                className="w-full h-11 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-xs"
              >
                {actionLoading ? (
                  <span className="flex items-center gap-1.5 justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang khởi tạo...
                  </span>
                ) : (
                  "Tiến hành nạp tiền"
                )}
              </Button>
            </form>
            <div className="bg-amber-500/10 dark:bg-emerald-500/10 border border-border/40 p-3.5 rounded-xl text-[10px] text-muted-foreground leading-relaxed flex gap-2">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground block mb-0.5">Môi trường giả lập PayOS:</span>
                Sau khi bấm nạp, hệ thống sẽ mở link PayOS Sandbox. Giao dịch sẽ tự động được hoàn thành thành công để cập nhật số dư của bạn.
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Transaction history feed */}
        <div className="lg:col-span-2 space-y-5">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm min-h-[400px] flex flex-col">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-3 flex items-center justify-between">
              <span>Lịch sử giao dịch gần đây</span>
              <span className="text-[10px] text-muted-foreground font-normal">Hiển thị tối đa 20 giao dịch mới nhất</span>
            </h3>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-xs text-muted-foreground">Đang tải lịch sử giao dịch...</p>
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-xs text-destructive">
                <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                <p>{error}</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground">
                <Wallet className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="font-semibold">Chưa có giao dịch nào được ghi nhận</p>
                <p className="mt-1 opacity-80">Mọi biến động số dư của bạn sẽ xuất hiện tại đây.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 mt-3 divide-y divide-border/60">
                {transactions.map((tx) => {
                  const details = getTxTypeDetails(tx.type)
                  const TxIcon = details.icon
                  const isPositive = tx.amount > 0
                  return (
                    <div key={tx.id} className="py-3 flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-3">
                        <div className={cn("h-9.5 w-9.5 rounded-xl flex items-center justify-center shrink-0", details.bg)}>
                          <TxIcon className={cn("h-4.5 w-4.5", details.color)} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {details.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                            {tx.description || `Mã tham chiếu: ${tx.reference_id}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn("text-xs font-black", isPositive ? "text-emerald-600 dark:text-emerald-450" : "text-rose-600 dark:text-rose-400")}>
                          {isPositive ? "+" : ""}{formatVND(tx.amount)}
                        </p>
                        <div className="mt-1 flex items-center justify-end gap-1.5">
                          {getTxStatusBadge(tx.status)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
