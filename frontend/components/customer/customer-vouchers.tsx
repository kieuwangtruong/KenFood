"use client"

import { useState } from "react"
import { Ticket, Copy, Check, Store } from "lucide-react"
import { VOUCHERS, formatVND } from "@/lib/data"
import { cn } from "@/lib/utils"

const COLOR_MAP: Record<string, string> = {
  amber: "from-amber-400 to-amber-500",
  emerald: "from-emerald-400 to-emerald-500",
  lime: "from-lime-400 to-lime-500",
  rose: "from-rose-400 to-rose-500",
  orange: "from-orange-400 to-orange-500",
  sky: "from-sky-400 to-sky-500",
}

export function CustomerVouchers() {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (code: string) => {
    navigator.clipboard?.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="pb-6">
      <div className="bg-[#F4EFEA] dark:bg-gray-900 px-5 py-6 text-gray-900 dark:text-white border-b border-amber-600/20 dark:border-emerald-600/20">
        <h1 className="text-xl font-bold">Ưu đãi của bạn</h1>
        <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 font-semibold">
          Mã giảm giá theo cửa hàng · Áp dụng tại thanh toán
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 px-5 pt-5">
        {VOUCHERS.map((v) => (
          <div
            key={v.id}
            className="relative flex overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <div
              className={cn(
                "flex w-24 shrink-0 flex-col items-center justify-center bg-gradient-to-br p-3 text-center text-white",
                COLOR_MAP[v.color],
              )}
            >
              <Ticket className="mb-1 h-5 w-5" />
              <p className="text-sm font-extrabold leading-tight">{v.discount}</p>
            </div>

            <div className="flex flex-1 flex-col justify-center gap-1 p-3">
              <p className="flex items-center gap-1 text-xs font-semibold text-foreground">
                <Store className="h-3.5 w-3.5 text-muted-foreground" />
                {v.store}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Đơn tối thiểu {formatVND(v.minOrder)} · HSD {v.expires}
              </p>
              <button
                onClick={() => copy(v.code)}
                className="mt-1 flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-primary bg-primary/5 px-2.5 py-1 text-xs font-bold text-foreground"
              >
                {copied === v.code ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" /> Đã chép
                  </>
                ) : (
                  <>
                    {v.code} <Copy className="h-3.5 w-3.5 text-primary" />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
