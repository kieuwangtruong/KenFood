"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation, MapPin, Phone, Search, Layers, Locate } from "lucide-react"
import { DRIVERS, formatVND } from "@/lib/data"

const NEARBY_ORDERS = [
  { id: "KEN-83931", merchant: "Phở Thìn Lò Đúc", dropWard: "Cầu Giấy", distance: 2.3, fee: 28000, items: 2 },
  { id: "KEN-83928", merchant: "Bánh Mì 25", dropWard: "Hoàn Kiếm", distance: 1.1, fee: 18000, items: 1 },
  { id: "KEN-83925", merchant: "An Nhiên Vegan", dropWard: "Tây Hồ", distance: 3.8, fee: 42000, items: 3 },
]

export function DriverMaps() {
  const [selected, setSelected] = useState<string | null>("KEN-83931")
  const me = DRIVERS[0]

  return (
    <div className="flex flex-col">
      {/* Map canvas */}
      <div className="relative h-[44vh] w-full overflow-hidden border-b border-border dark:border-gray-800">
        <img
          src="/hanoi-map-route-navigation.png"
          alt="Bản đồ định tuyến khu vực Hà Nội"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/40" />

        {/* Dynamic Curved Route Path in Unified Brand Color */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M 50 50 Q 61 38 72 30"
            fill="none"
            stroke="var(--chart-theme-color)"
            strokeWidth="1.2"
            strokeDasharray="2,2"
            className="opacity-90 dark:opacity-100"
          />
        </svg>

        {/* Search bar overlay */}
        <div className="absolute inset-x-3 top-3">
          <div className="flex items-center gap-2 rounded-2xl bg-card/95 px-3 py-2.5 shadow-lg backdrop-blur">
            <Search className="size-4 text-muted-foreground" />
            <input
              placeholder="Tìm địa điểm, đường phố..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Driver pin */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="absolute -inset-4 animate-ping rounded-full bg-primary/30" />
          <div className="relative flex size-9 items-center justify-center rounded-full border-2 border-card bg-primary shadow-lg">
            <Navigation className="size-4 fill-secondary text-secondary" />
          </div>
        </div>

        {/* Destination pin */}
        <div className="absolute right-[28%] top-[30%]">
          <div className="flex size-8 items-center justify-center rounded-full border-2 border-card bg-secondary shadow-lg">
            <MapPin className="size-4 text-primary" />
          </div>
        </div>

        {/* Map controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-2">
          <Button size="icon" variant="secondary" className="size-10 rounded-xl shadow-md">
            <Layers className="size-4" />
          </Button>
          <Button size="icon" className="size-10 rounded-xl shadow-md">
            <Locate className="size-4" />
          </Button>
        </div>
      </div>

      {/* Nearby orders sheet */}
      <div className="-mt-4 rounded-t-3xl bg-background px-4 pb-4 pt-4">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Đơn quanh bạn</h2>
          <Badge variant="secondary" className="gap-1 bg-primary/15 text-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            {NEARBY_ORDERS.length} đơn mới
          </Badge>
        </div>

        <div className="flex flex-col gap-2.5">
          {NEARBY_ORDERS.map((o) => {
            const active = selected === o.id
            return (
              <Card
                key={o.id}
                onClick={() => setSelected(o.id)}
                className={`cursor-pointer gap-0 border p-3 transition-colors ${
                  active ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{o.merchant}</p>
                  <span className="font-mono text-sm font-bold text-primary">{formatVND(o.fee)}</span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" /> {o.dropWard}
                  </span>
                  <span>{o.distance} km</span>
                  <span>{o.items} món</span>
                </div>
                {active && (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="flex-1 gap-1.5">
                      <Navigation className="size-3.5" /> Chỉ đường
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 bg-transparent">
                      <Phone className="size-3.5" /> Gọi
                    </Button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        <Card className="mt-3 flex-row items-center gap-3 bg-white border border-amber-600 dark:bg-gray-800 dark:border-emerald-600 p-3 text-gray-900 dark:text-white">
          <img src={me.avatar || "/placeholder.svg"} alt={me.name} className="size-10 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{me.name}</p>
            <p className="text-xs text-gray-650 dark:text-gray-400 font-semibold">
              {me.vehicle} • {me.plate}
            </p>
          </div>
          <Badge className="bg-primary text-primary-foreground">★ {me.rating}</Badge>
        </Card>
      </div>
    </div>
  )
}
