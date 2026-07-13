"use client"

import {
  TrendingUp,
  ShoppingBag,
  Star,
  DollarSign,
  ArrowUpRight,
} from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { GMV_TREND, RATING_TREND } from "@/lib/data"

const STATS = [
  { label: "GMV tháng này", value: "2,01 tỷ₫", delta: "+19.6%", icon: DollarSign },
  { label: "Đơn hoàn tất", value: "27.840", delta: "+18.8%", icon: ShoppingBag },
  { label: "Điểm hài lòng", value: "4.78", delta: "+0.08", icon: Star },
  { label: "Tài xế hoạt động", value: "1.284", delta: "+6.2%", icon: TrendingUp },
]

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Bảng điều khiển</h1>
        <p className="text-sm text-muted-foreground">
          Tổng quan vận hành sàn Kén · 6 tháng gần nhất
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-baseline gap-2">
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                  ▲ {s.delta.replace("+", "")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* GMV line chart */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <p className="text-sm font-bold text-foreground">Tăng trưởng GMV (tỷ₫)</p>
          <p className="mb-4 text-xs text-muted-foreground">Tổng giá trị giao dịch theo tháng</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={GMV_TREND} margin={{ left: -16, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="oklch(0.52 0.02 256)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="oklch(0.52 0.02 256)" />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid oklch(0.91 0.01 90)",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="gmv"
                stroke="var(--chart-theme-color)"
                strokeWidth={3}
                dot={{ r: 4, fill: "var(--chart-theme-color)" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Rating trend */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-bold text-foreground">Xu hướng đánh giá</p>
          <p className="mb-4 text-xs text-muted-foreground">Điểm trung bình toàn sàn</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={RATING_TREND} margin={{ left: -16, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="oklch(0.52 0.02 256)" />
              <YAxis domain={[4, 5]} tickLine={false} axisLine={false} fontSize={12} stroke="oklch(0.52 0.02 256)" />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid oklch(0.91 0.01 90)",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="var(--chart-theme-color)"
                strokeWidth={3}
                dot={{ r: 4, fill: "var(--chart-theme-color)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Purchase volume bar */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="text-sm font-bold text-foreground">Sản lượng mua hàng (nghìn đơn)</p>
        <p className="mb-4 text-xs text-muted-foreground">Số lượng đơn hoàn tất theo tháng</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={GMV_TREND} margin={{ left: -16, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="oklch(0.52 0.02 256)" />
            <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="oklch(0.52 0.02 256)" />
            <Tooltip
              cursor={{ fill: "oklch(0.96 0.005 90)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid oklch(0.91 0.01 90)",
                fontSize: 12,
              }}
            />
            <Bar dataKey="orders" fill="var(--chart-theme-color)" radius={[8, 8, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
