"use client"

import { useState, useEffect } from "react"
import { Bike, Power, CheckCircle2, DollarSign, Ban, RefreshCw, PlusCircle, MinusCircle } from "lucide-react"
import { getWalletInfo, getActiveBatches, acceptBatch, getMyBatches, getBuildings } from "@/src/api/kenServices"
import axiosClient from "@/src/api/axiosClient"
import { formatVND } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/shell/badges"

export function DriverHub() {
  const [online, setOnline] = useState(true)
  
  // Fintech balance grid states
  const [balance, setBalance] = useState<number>(-20000)
  const [deposit, setDeposit] = useState<number>(100000)
  const [blockedBalance, setBlockedBalance] = useState<number>(50000)
  
  const [loading, setLoading] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [acceptedBatchId, setAcceptedBatchId] = useState<string | null>(null)
  
  // Alert dialog state
  const [alertDialog, setAlertDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "error";
  } | null>(null)

  const [buildings, setBuildings] = useState<any[]>([])
  const [activeBatches, setActiveBatches] = useState<any[]>([])
  const [realBatch, setRealBatch] = useState<any | null>(null)

  // Fetch real wallet from backend if available
  const fetchDriverWallet = async () => {
    try {
      setLoading(true)
      const data = await getWalletInfo()
      if (data) {
        setBalance(data.balance ?? -20000)
        setDeposit(data.deposit_amount ?? 100000)
        setBlockedBalance(data.blocked_balance ?? 50000)
      }
    } catch (err) {
      console.warn("Failed to fetch driver wallet, using state fallbacks:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchBuildings = async () => {
    try {
      const data = await getBuildings()
      if (data) setBuildings(data)
    } catch (err) {
      console.warn("Failed to load buildings in driver hub:", err)
    }
  }

  const loadBatches = async () => {
    try {
      setLoading(true)
      const myBatches = await getMyBatches()
      const currentActive = myBatches?.find((b: any) => b.status === "ASSIGNED" || b.status === "DELIVERING")
      if (currentActive) {
        setAcceptedBatchId(String(currentActive.id))
        setRealBatch(currentActive)
      } else {
        const available = await getActiveBatches()
        const pendingBatches = available?.filter((b: any) => b.status === "PENDING") || []
        setActiveBatches(pendingBatches)
        setAcceptedBatchId(null)
        setRealBatch(null)
      }
    } catch (err) {
      console.warn("Failed to load backend batches, using mock fallbacks:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDriverWallet()
    fetchBuildings()
    loadBatches()

    const handleWalletUpdate = () => {
      fetchDriverWallet()
      loadBatches()
    }
    window.addEventListener("wallet-updated", handleWalletUpdate)
    return () => window.removeEventListener("wallet-updated", handleWalletUpdate)
  }, [])

  // Mock batch orders details
  const mockBatch = {
    id: "batch_hanoi_091",
    ordersCount: 3,
    pickupLocation: "Bếp Kén 1 - Phở Thìn Lò Đúc (Hai Bà Trưng)",
    destinationBuilding: "Keangnam Landmark 72 (Cầu Giấy)",
    payoutPerOrder: 30000,
    totalCod: 150000,
  }

  const currentBatch = realBatch ? {
    id: String(realBatch.id),
    ordersCount: realBatch.orders?.length || 0,
    pickupLocation: "Bếp Kén 1 - Phở Thìn Lò Đúc (Hai Bà Trưng)",
    destinationBuilding: buildings.find(b => b.id === realBatch.building_id)?.name || `Tòa nhà Destination #${realBatch.building_id}`,
    payoutPerOrder: 30000,
    totalCod: realBatch.orders?.reduce((sum: number, ord: any) => sum + (ord.payment_method === "cash" ? ord.total_amount : 0), 0) || 0
  } : (activeBatches.length > 0 ? {
    id: String(activeBatches[0].id),
    ordersCount: activeBatches[0].orders?.length || 0,
    pickupLocation: "Bếp Kén 1 - Phở Thìn Lò Đúc (Hai Bà Trưng)",
    destinationBuilding: buildings.find(b => b.id === activeBatches[0].building_id)?.name || `Tòa nhà Destination #${activeBatches[0].building_id}`,
    payoutPerOrder: 30000,
    totalCod: activeBatches[0].orders?.reduce((sum: number, ord: any) => sum + (ord.payment_method === "cash" ? ord.total_amount : 0), 0) || 0
  } : mockBatch);

  const handleAcceptBatch = async () => {
    setAccepting(true)
    
    const isReal = realBatch || activeBatches.length > 0
    const targetBatchId = realBatch ? realBatch.id : (activeBatches.length > 0 ? activeBatches[0].id : null)

    if (isReal && targetBatchId) {
      try {
        const res = await acceptBatch(targetBatchId)
        if (res) {
          setAcceptedBatchId(String(res.id))
          setRealBatch(res)
          await fetchDriverWallet()
          setAlertDialog({
            show: true,
            title: "Chấp Nhận Chuyến Thành Công",
            message: `Hệ thống đã giao chuyến #${res.id} cho bạn. Tiền ký quỹ phong tỏa COD (${formatVND(currentBatch.totalCod)}) đã được áp dụng. Lương chuyến dự kiến: ${formatVND(currentBatch.ordersCount * currentBatch.payoutPerOrder)}.`,
            type: "success"
          })
        }
      } catch (err: any) {
        console.error("Accept batch failed:", err)
        setAlertDialog({
          show: true,
          title: "Giao Dịch Bị Từ Chối (Blocked)",
          message: err.response?.data?.detail || `Quy tắc Tín Quỹ Kén chặn chuyến! Hạn mức khả dụng thấp hơn tiền COD cần ứng trước (${formatVND(currentBatch.totalCod)}). Vui lòng nạp thêm tiền ký quỹ hoặc thanh toán nợ ví.`,
          type: "error"
        })
      } finally {
        setAccepting(false)
      }
    } else {
      const availableCredit = balance - blockedBalance + deposit
      const isApproved = availableCredit >= mockBatch.totalCod
      
      setTimeout(() => {
        if (isApproved) {
          setBlockedBalance(prev => prev + mockBatch.totalCod)
          setAcceptedBatchId(mockBatch.id)
          setAlertDialog({
            show: true,
            title: "Chấp Nhận Chuyến Thành Công",
            message: `Hệ thống đã giao chuyến ${mockBatch.id} cho bạn. Tiền ký quỹ phong tỏa COD (${formatVND(mockBatch.totalCod)}) đã được áp dụng. Lương chuyến dự kiến: ${formatVND(mockBatch.ordersCount * mockBatch.payoutPerOrder)}.`,
            type: "success"
          })
        } else {
          setAlertDialog({
            show: true,
            title: "Giao Dịch Bị Từ Chối (Blocked)",
            message: `Quy tắc Tín Quỹ Kén chặn chuyến! Số dư tín dụng khả dụng của bạn (${formatVND(availableCredit)}) thấp hơn tổng tiền COD cần ứng trước (${formatVND(mockBatch.totalCod)}). Vui lòng nạp thêm tiền ký quỹ hoặc thanh toán nợ ví.`,
            type: "error"
          })
        }
        setAccepting(false)
      }, 1200)
    }
  }

  const handleAdjustValue = (type: "balance" | "deposit" | "blocked", amount: number) => {
    if (type === "balance") setBalance(prev => prev + amount)
    if (type === "deposit") setDeposit(prev => Math.max(0, prev + amount))
    if (type === "blocked") setBlockedBalance(prev => Math.max(0, prev + amount))
  }

  const availableCredit = balance - blockedBalance + deposit

  return (
    <div className="pb-6 relative h-full">
      {/* Driver Identity Header */}
      <div className="bg-[#F4EFEA] dark:bg-gray-900 border-b border-amber-600/20 dark:border-emerald-600/20 px-5 pb-6 pt-6 text-gray-900 dark:text-white">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary">
            <AvatarImage src="/driver-portrait-man-1.png" alt="Nguyễn Văn Hùng" />
            <AvatarFallback>H</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-base font-extrabold text-gray-900 dark:text-white">Nguyễn Văn Hùng</p>
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <StarRating rating={4.9} size={12} /> · 2.841 chuyến · <span className="text-emerald-600 dark:text-emerald-400 font-bold">Cấp bậc: Gold</span>
            </div>
          </div>
          <button
            onClick={() => setOnline((o) => !o)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 border cursor-pointer",
              online
                ? "bg-amber-600 text-white border-amber-600 dark:bg-emerald-600 dark:text-white dark:border-emerald-600"
                : "bg-white border-amber-600 text-gray-900 hover:bg-amber-600 active:bg-amber-700 hover:text-white active:text-white dark:bg-gray-800 dark:border-emerald-600 dark:text-gray-100 dark:hover:bg-emerald-600 dark:active:bg-emerald-700 dark:hover:text-white"
            )}
          >
            <Power className="h-3.5 w-3.5" />
            {online ? "Online" : "Offline"}
          </button>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* Fintech Balance Grid (3-column) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-foreground dark:text-white uppercase tracking-wider">Tín quỹ vận hành (Fintech balance)</p>
            <button 
              onClick={fetchDriverWallet}
              className="text-[10px] text-primary flex items-center gap-1 hover:underline cursor-pointer font-bold"
            >
              <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} /> Làm mới ví
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2.5">
            {/* Column 1: Wallet Balance */}
            <div className="rounded-xl border border-border bg-card p-3 shadow-sm relative overflow-hidden flex flex-col justify-between h-24">
              <div>
                <span className="text-[9px] uppercase font-bold text-muted-foreground block">Ví Kén Balance</span>
                <span className={cn("text-sm font-black mt-1 block", balance < 0 ? "text-red-500" : "text-foreground")}>
                  {formatVND(balance)}
                </span>
              </div>
              <div className="flex gap-1.5 mt-1 border-t border-border/40 pt-1.5 justify-around">
                <button type="button" onClick={() => handleAdjustValue("balance", -50000)} className="text-muted-foreground hover:text-primary cursor-pointer"><MinusCircle className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => handleAdjustValue("balance", 50000)} className="text-muted-foreground hover:text-primary cursor-pointer"><PlusCircle className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            {/* Column 2: Ký quỹ (Deposit) */}
            <div className="rounded-xl border border-border bg-card p-3 shadow-sm relative overflow-hidden flex flex-col justify-between h-24">
              <div>
                <span className="text-[9px] uppercase font-bold text-muted-foreground block">Ký Quỹ (Deposit)</span>
                <span className="text-sm font-black text-foreground mt-1 block">
                  {formatVND(deposit)}
                </span>
              </div>
              <div className="flex gap-1.5 mt-1 border-t border-border/40 pt-1.5 justify-around">
                <button type="button" onClick={() => handleAdjustValue("deposit", -50000)} className="text-muted-foreground hover:text-primary cursor-pointer"><MinusCircle className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => handleAdjustValue("deposit", 50000)} className="text-muted-foreground hover:text-primary cursor-pointer"><PlusCircle className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            {/* Column 3: Blocked Balance */}
            <div className="rounded-xl border border-border bg-card p-3 shadow-sm relative overflow-hidden flex flex-col justify-between h-24">
              <div>
                <span className="text-[9px] uppercase font-bold text-muted-foreground block">Tạm Khóa (COD)</span>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400 mt-1 block">
                  {formatVND(blockedBalance)}
                </span>
              </div>
              <div className="flex gap-1.5 mt-1 border-t border-border/40 pt-1.5 justify-around">
                <button type="button" onClick={() => handleAdjustValue("blocked", -50000)} className="text-muted-foreground hover:text-primary cursor-pointer"><MinusCircle className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => handleAdjustValue("blocked", 50000)} className="text-muted-foreground hover:text-primary cursor-pointer"><PlusCircle className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>

          {/* Credit Check Status Alert */}
          <div className="mt-3 rounded-xl bg-muted/40 dark:bg-gray-800/40 p-3 border border-border text-[10px] space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Hạn mức tín dụng khả dụng:</span>
              <span className="font-semibold text-foreground">
                ({balance} - {blockedBalance}) + {deposit} =
              </span>
              <span className={cn("font-bold text-xs", availableCredit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
                {formatVND(availableCredit)}
              </span>
            </div>
            <div className="border-t border-border/60 my-1" />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>Quy tắc Kén: Hạn mức khả dụng phải lớn hơn hoặc bằng tổng tiền mặt COD đơn gom.</span>
            </div>
          </div>
        </div>

        {/* Batch Route Acceptance Card */}
        <div>
          <p className="text-xs font-bold text-foreground dark:text-white uppercase tracking-wider mb-2.5">Đơn gom Lobby Hub đang đề xuất</p>
          
          {acceptedBatchId === currentBatch.id ? (
            <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-500/5 p-4 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-555 mx-auto animate-bounce text-emerald-500" />
              <div>
                <p className="text-sm font-bold text-foreground">Chuyến Đi Đã Được Chấp Nhận</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Vui lòng di chuyển đến điểm lấy hàng để bắt đầu ca giao hàng.</p>
              </div>
              <button 
                type="button"
                onClick={async () => {
                  const targetBatchId = realBatch ? realBatch.id : (activeBatches.length > 0 ? activeBatches[0].id : null)
                  if (targetBatchId) {
                    try {
                      setLoading(true)
                      await axiosClient.post(`/batch/${targetBatchId}/drop`)
                      setAcceptedBatchId(null)
                      setRealBatch(null)
                      await fetchDriverWallet()
                      await loadBatches()
                    } catch (dropErr) {
                      console.error("Drop batch failed:", dropErr)
                    } finally {
                      setLoading(false)
                    }
                  } else {
                    setAcceptedBatchId(null)
                    setBlockedBalance(prev => Math.max(0, prev - mockBatch.totalCod))
                  }
                }}
                className="text-xs text-primary font-bold hover:underline cursor-pointer"
              >
                Hủy chuyến (Hoàn lại blocked)
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-primary bg-primary/5 p-4 space-y-4 shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-primary text-white text-[9px] font-black tracking-wide uppercase px-2 py-0.5">
                    Batch gom ({currentBatch.ordersCount} đơn)
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">Mã: {currentBatch.id}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-foreground block">Lương chuyến gom</span>
                  <span className="text-base font-black text-primary">
                    +{formatVND(currentBatch.ordersCount * currentBatch.payoutPerOrder)}
                  </span>
                </div>
              </div>

              {/* Route Map Visual representation */}
              <div className="relative border-l-2 border-dashed border-primary/55 ml-2.5 pl-4.5 space-y-3 text-xs">
                {/* Pickup Location */}
                <div className="relative">
                  <span className="absolute -left-[24px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-[#F4EFEA] dark:bg-gray-900 flex items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    Lấy: {currentBatch.pickupLocation}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Thu gom toàn bộ {currentBatch.ordersCount} đơn hàng loạt</p>
                </div>
                
                {/* Destination */}
                <div className="relative">
                  <span className="absolute -left-[24px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-emerald-500 bg-[#F4EFEA] dark:bg-gray-900 flex items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  <p className="font-bold text-foreground">Giao: {currentBatch.destinationBuilding}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Giao điểm cuối tập trung (Batch-Delivery)</p>
                </div>
              </div>

              <div className="border-t border-border pt-3 flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Phí thu hộ (Ứng COD):</span>
                <span className="font-black text-foreground text-sm">{formatVND(currentBatch.totalCod)}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/10 text-amber-605 dark:text-amber-400 font-extrabold text-[9px] px-2 py-1 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Lương chuyến: 30,000 VND / đơn
                </span>
              </div>

              <button
                type="button"
                onClick={handleAcceptBatch}
                disabled={accepting}
                className={cn(
                  "w-full h-11 bg-primary text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer",
                  accepting && "opacity-75 cursor-wait"
                )}
              >
                {accepting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                    Đang xử lý tín quỹ...
                  </>
                ) : (
                  <>
                    <Bike className="h-4 w-4" />
                    Chấp nhận chuyến
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Credit rule warning alert dialog */}
      {alertDialog && alertDialog.show && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border p-5 rounded-2xl max-w-[90%] space-y-4 shadow-xl text-center">
            {alertDialog.type === "error" ? (
              <div className="h-12 w-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                <Ban className="h-6 w-6" />
              </div>
            ) : (
              <div className="h-12 w-12 bg-emerald-500/10 text-emerald-650 dark:text-emerald-450 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
            )}
            
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-foreground">{alertDialog.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{alertDialog.message}</p>
            </div>

            <button
              type="button"
              onClick={() => setAlertDialog(null)}
              className="w-full py-2 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl text-xs cursor-pointer transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
