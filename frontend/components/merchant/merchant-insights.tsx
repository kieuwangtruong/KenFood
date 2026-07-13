"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { TrendingUp, ShoppingBag, Star, Repeat, DollarSign } from "lucide-react"
import { formatVND } from "@/lib/data"
import { cn } from "@/lib/utils"

const REVENUE = [
  { day: "T2", revenue: 4.2 },
  { day: "T3", revenue: 5.1 },
  { day: "T4", revenue: 3.8 },
  { day: "T5", revenue: 6.4 },
  { day: "T6", revenue: 7.2 },
  { day: "T7", revenue: 9.8 },
  { day: "CN", revenue: 8.1 },
]

const BEST_SELLERS = [
  { name: "Phở bò tái lăn", sold: 284 },
  { name: "Phở gà ta", sold: 196 },
  { name: "Phở bò tái nạm", sold: 173 },
  { name: "Quẩy nóng", sold: 142 },
  { name: "Phở sốt vang", sold: 88 },
]

export function MerchantInsights() {
  const grossRevenue = 44600000;
  const commissionRate = 0.15;
  const netPayout = grossRevenue * (1 - commissionRate);

  const KPIS_CUSTOM = [
    { 
      label: "Doanh thu thô (Gross)", 
      value: formatVND(grossRevenue), 
      sub: "100% doanh thu bán lẻ trước thuế & phí",
      delta: "+18%", 
      icon: TrendingUp,
      color: "text-foreground"
    },
    { 
      label: "Thực nhận (Net Payout)", 
      value: formatVND(netPayout), 
      sub: "85% thực nhận sau trừ 15% phí chiết khấu sàn",
      delta: "+18%", 
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400 font-extrabold"
    },
    { 
      label: "Đơn hoàn tất", 
      value: "1.063 đơn", 
      sub: "Tổng số lượng đơn hàng hoàn thành ca trưa",
      delta: "+9%", 
      icon: ShoppingBag,
      color: "text-foreground"
    },
    { 
      label: "Đánh giá TB", 
      value: "4.9 / 5.0", 
      sub: "Độ hài lòng của khách hàng trên Kén app",
      delta: "+0.1", 
      icon: Star,
      color: "text-amber-500"
    },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Phân tích kinh doanh</h1>
        <p className="text-sm text-muted-foreground">Hiệu suất cửa hàng trong 7 ngày qua.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPIS_CUSTOM.map((k) => {
          const Icon = k.icon
          return (
            <Card key={k.label} className="gap-2 p-4 flex flex-col justify-between shadow-sm border-border bg-card">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{k.label}</span>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold text-[10px]">
                    {k.delta}
                  </Badge>
                </div>
                <p className={cn("text-xl font-bold tracking-tight mt-2.5", k.color)}>{k.value}</p>
              </div>
              <p className="text-[10px] text-muted-foreground dark:text-gray-400 font-medium mt-1 border-t border-border/40 pt-1.5">{k.sub}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="gap-4 p-4 lg:col-span-3">
          <div>
            <h2 className="text-sm font-semibold">Doanh thu theo ngày</h2>
            <p className="text-xs text-muted-foreground">Đơn vị: triệu đồng</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={REVENUE} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-theme-color)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--chart-theme-color)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--color-border)",
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="var(--chart-theme-color)" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="gap-4 p-4 lg:col-span-2">
          <div>
            <h2 className="text-sm font-semibold">Món bán chạy</h2>
            <p className="text-xs text-muted-foreground">Số phần đã bán</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={BEST_SELLERS} layout="vertical" margin={{ left: 10, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />
              <Tooltip
                cursor={{ fill: "var(--color-muted)" }}
                contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }}
              />
              <Bar dataKey="sold" fill="var(--chart-theme-color)" radius={[0, 6, 6, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
