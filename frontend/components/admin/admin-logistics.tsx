"use client"

import { useState, useEffect } from "react"
import { Bike, Package, TrendingUp, AlertCircle, RefreshCw, Radio } from "lucide-react"
import { DISTRICT_HEAT, DRIVERS } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/shell/badges"
import { cn } from "@/lib/utils"
import { getZoneAnalytics, compileBatches } from "@/src/api/kenServices"

function heatColor(intensity: number) {
  if (intensity > 0.75) return "bg-primary text-primary-foreground"
  if (intensity > 0.55) return "bg-primary/70 text-primary-foreground"
  if (intensity > 0.35) return "bg-primary/45 text-foreground"
  if (intensity > 0.2) return "bg-primary/25 text-foreground"
  return "bg-primary/12 text-foreground"
}

export function AdminLogistics() {
  const totalDrivers = DISTRICT_HEAT.reduce((s, d) => s + d.drivers, 0)
  const totalOrders = DISTRICT_HEAT.reduce((s, d) => s + d.orders, 0)

  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liveConnected, setLiveConnected] = useState(false)
  const [compiling, setCompiling] = useState(false)

  const handleCompileBatches = async () => {
    try {
      setCompiling(true)
      const res = await compileBatches()
      alert(`Gom đơn thành công! Đã tạo ${res?.length || 0} chuyến gom (batches) cho các tòa nhà destination.`)
      await fetchZoneAnalytics()
    } catch (err: any) {
      console.error("Failed to compile batches:", err)
      alert("Kích hoạt gom đơn thất bại: " + (err.response?.data?.detail || err.message))
    } finally {
      setCompiling(false)
    }
  }

  const fetchZoneAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getZoneAnalytics()
      if (data && data.heatmap_data) {
        setHeatmapData(data.heatmap_data)
      } else {
        setHeatmapData([])
      }
      setLiveConnected(true)
    } catch (err: any) {
      console.warn("Failed to fetch zone analytics, using mock fallback:", err)
      setError(err?.message || "Lỗi kết nối API FastAPI")
      setLiveConnected(false)
      setHeatmapData([
        { zone: "Cầu Giấy", density: 88, status: "high" },
        { zone: "Đống Đa", density: 65, status: "medium" },
        { zone: "Hai Bà Trưng", density: 42, status: "medium" },
        { zone: "Hoàn Kiếm", density: 15, status: "low" },
        { zone: "Thanh Xuân", density: 72, status: "high" }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchZoneAnalytics()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Bản đồ vận hành</h1>
        <p className="text-sm text-muted-foreground">
          Mật độ tài xế hoạt động theo quận tại Hà Nội
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard icon={Bike} label="Tài xế trực tuyến" value={String(totalDrivers)} />
        <StatCard icon={Package} label="Đơn đang xử lý" value={totalOrders.toLocaleString("vi-VN")} />
        <StatCard icon={TrendingUp} label="Quận sôi động nhất" value="Cầu Giấy" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Heatmap grid */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">Heatmap mật độ tài xế</p>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              Thấp
              <span className="h-3 w-3 rounded bg-primary/12" />
              <span className="h-3 w-3 rounded bg-primary/45" />
              <span className="h-3 w-3 rounded bg-primary/70" />
              <span className="h-3 w-3 rounded bg-primary" />
              Cao
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {DISTRICT_HEAT.map((d) => (
              <div
                key={d.district}
                className={cn(
                  "flex flex-col gap-1 rounded-xl p-4 transition-transform hover:scale-[1.02]",
                  heatColor(d.intensity),
                )}
              >
                <p className="text-sm font-bold">{d.district}</p>
                <p className="text-xs opacity-90">{d.drivers} tài xế</p>
                <p className="text-[11px] opacity-75">{d.orders} đơn / giờ</p>
              </div>
            ))}
          </div>
        </div>

        {/* Active drivers list */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-4 text-sm font-bold text-foreground">Tài xế đang hoạt động</p>
          <div className="space-y-3">
            {DRIVERS.map((d) => (
              <div key={d.id} className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={d.avatar || "/placeholder.svg"} alt={d.name} />
                    <AvatarFallback>{d.name[0]}</AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                      d.status === "delivering" ? "bg-amber-500" : "bg-emerald-500",
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{d.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {d.ward} · {d.status === "delivering" ? "Đang giao" : "Sẵn sàng"}
                  </p>
                </div>
                <StarRating rating={d.rating} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Zone Analytics via Backend API Showcase */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm mt-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Radio className={cn("h-4 w-4 animate-pulse", liveConnected ? "text-emerald-500" : "text-amber-500")} />
              Bản đồ mật độ vùng Live (FastAPI Integration)
            </h3>
            <p className="text-xs text-muted-foreground">
              Dữ liệu thời gian thực được gọi từ `/admin/zone-analytics`
            </p>
          </div>
          
          <button 
            onClick={fetchZoneAnalytics}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium border border-border rounded-lg px-2.5 py-1.5 bg-background shadow-xs cursor-pointer"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Làm mới
          </button>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center rounded-xl bg-muted/20 border border-dashed border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              Đang tải dữ liệu từ API...
            </div>
          </div>
        ) : error ? (
          <div>
            <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-600 dark:text-amber-400 mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                <strong>Không thể kết nối Backend API:</strong> {error}. Hiển thị dữ liệu giả định (Offline Fallback).
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {heatmapData.map((h, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-muted/30 p-3 flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground font-medium">{h.zone}</span>
                  <span className="text-lg font-bold text-foreground">{h.density}%</span>
                  <span className={cn(
                    "text-[10px] uppercase font-bold self-start px-1.5 py-0.5 rounded-md mt-1",
                    h.status === "high" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                    h.status === "medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  )}>
                    {h.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {heatmapData.map((h, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-muted/30 p-3 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium">{h.zone}</span>
                <span className="text-lg font-bold text-foreground">{h.density}%</span>
                <span className={cn(
                  "text-[10px] uppercase font-bold self-start px-1.5 py-0.5 rounded-md mt-1",
                  h.status === "high" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                  h.status === "medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                )}>
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Batch Compile Control Card */}
      <div className="rounded-2xl border border-primary bg-primary/5 p-5 shadow-sm mt-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Package className="h-4 w-4 text-primary animate-pulse" />
              Bộ máy gom đơn hàng loạt (Batching Engine - 10:01 AM Cutoff)
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">
              Gom tất cả đơn hàng đã thanh toán trước 10:00 AM thành các lô giao hàng (batch) theo tòa nhà
            </p>
          </div>
          <button
            onClick={handleCompileBatches}
            disabled={compiling}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border border-primary/20"
          >
            {compiling ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Đang gom đơn...
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                Kích hoạt gom đơn hàng loạt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Bike
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-3 text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
