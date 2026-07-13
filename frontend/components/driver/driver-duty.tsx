"use client"

import { Package, AlertTriangle, Wallet, Power } from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { useState } from "react"
import { DRIVER_INCOME, formatVND } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/shell/badges"
import { cn } from "@/lib/utils"

export function DriverDuty() {
  const [online, setOnline] = useState(true)
  const totalIncome = DRIVER_INCOME.reduce((s, d) => s + d.income, 0) * 1000

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="bg-[#F4EFEA] dark:bg-gray-900 border-b border-amber-600/20 dark:border-emerald-600/20 px-5 pb-6 pt-6 text-gray-900 dark:text-white">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-amber-600 dark:border-emerald-600">
            <AvatarImage src="/driver-portrait-man-1.png" alt="Nguyễn Văn Hùng" />
            <AvatarFallback>H</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-base font-extrabold text-gray-900 dark:text-white">Nguyễn Văn Hùng</p>
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <StarRating rating={4.9} size={12} /> · 2.841 chuyến
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
            {online ? "Đang bật" : "Đã tắt"}
          </button>
        </div>
      </div>

      {/* Today stats */}
      <div className="px-5 pt-5">
        <p className="mb-3 text-sm font-bold text-foreground">Thống kê ca hôm nay</p>
        <div className="grid grid-cols-3 gap-3">
          <StatTile icon={Package} value="14" label="Đơn xong" tone="primary" />
          <StatTile icon={AlertTriangle} value="2" label="Điểm phạt" tone="rose" />
          <StatTile icon={Wallet} value="560K" label="Thu nhập" tone="emerald" />
        </div>
      </div>

      {/* Income chart */}
      <div className="px-5 pt-5">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">Thu nhập 7 ngày</p>
              <p className="text-xs text-muted-foreground">Đơn vị: nghìn₫</p>
            </div>
            <p className="text-lg font-bold text-primary">{formatVND(totalIncome)}</p>
          </div>
          <ResponsiveContainer width="100%" height={170} className="mt-3">
            <BarChart data={DRIVER_INCOME} margin={{ left: -28, right: 0, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} stroke="oklch(0.52 0.02 256)" />
              <Tooltip
                cursor={{ fill: "oklch(0.96 0.005 90)" }}
                contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.91 0.01 90)", fontSize: 12 }}
              />
              <Bar dataKey="income" fill="var(--chart-theme-color)" radius={[6, 6, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Incoming order */}
      <div className="px-5 pt-5">
        <p className="mb-3 text-sm font-bold text-foreground">Đơn mới gần bạn</p>
        <div className="rounded-2xl border-2 border-primary bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              ĐƠN MỚI
            </span>
            <span className="text-sm font-bold text-foreground">+38.000₫</span>
          </div>
          <div className="mt-2 space-y-1.5 text-xs">
            <p className="flex items-center gap-1.5 text-foreground">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Phở Thìn Lò Đúc · 0.8 km
            </p>
            <p className="flex items-center gap-1.5 text-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Số 1 Đại Cồ Việt · 2.4 km
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatTile({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof Package
  value: string
  label: string
  tone: "primary" | "rose" | "emerald"
}) {
  const tones = {
    primary: "bg-primary/15 text-primary",
    rose: "bg-rose-50 text-rose-600",
    emerald: "bg-emerald-50 text-emerald-600",
  }
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
      <div className={cn("mx-auto flex h-9 w-9 items-center justify-center rounded-xl", tones[tone])}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-2 text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}
