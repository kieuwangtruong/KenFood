"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, LifeBuoy, FileText, AlertTriangle, CheckCircle2 } from "lucide-react"

type Msg = { id: number; from: "me" | "ken"; text: string; time: string }

const FAQ = [
  "Làm sao để rút doanh thu về tài khoản?",
  "Tôi muốn khiếu nại một đơn bị hủy",
  "Cập nhật giấy phép vệ sinh ATTP",
]

const TICKETS = [
  { id: "TK-2041", subject: "Yêu cầu rút 12.400.000₫", status: "Đang xử lý", tone: "amber" },
  { id: "TK-2033", subject: "Khiếu nại đơn KEN-83120", status: "Đã giải quyết", tone: "emerald" },
  { id: "TK-2018", subject: "Cập nhật chứng nhận HACCP", status: "Đã giải quyết", tone: "emerald" },
]

export function MerchantSupport() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: 1, from: "ken", text: "Chào Phở Thìn! Trung tâm hỗ trợ đối tác Kén có thể giúp gì cho bạn hôm nay?", time: "09:01" },
  ])
  const [input, setInput] = useState("")
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = (text: string) => {
    if (!text.trim()) return
    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    setMessages((prev) => [...prev, { id: Date.now(), from: "me", text, time: now }])
    setInput("")
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "ken",
          text: "Cảm ơn bạn đã liên hệ. Mình đã ghi nhận và sẽ phản hồi chi tiết trong ít phút. Mã hỗ trợ: TK-2042.",
          time: now,
        },
      ])
    }, 900)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Trung tâm hỗ trợ</h1>
        <p className="text-sm text-muted-foreground">Kết nối trực tiếp với đội vận hành Kén.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Chat */}
        <Card className="flex h-[30rem] flex-col gap-0 overflow-hidden p-0 lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-border bg-[#F4EFEA] dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-white">
              <LifeBuoy className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Hỗ trợ đối tác Kén</p>
              <p className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 font-semibold">
                <span className="size-1.5 rounded-full bg-emerald-400" /> Trực tuyến · phản hồi ~2 phút
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                    m.from === "me"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-card text-card-foreground shadow-sm"
                  }`}
                >
                  <p>{m.text}</p>
                  <p className={`mt-1 text-[10px] ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {m.time}
                  </p>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {FAQ.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập nội dung cần hỗ trợ..."
              />
              <Button type="submit" size="icon" className="shrink-0">
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Tickets */}
        <Card className="gap-3 p-4">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Phiếu hỗ trợ gần đây</h2>
          </div>
          <div className="space-y-2.5">
            {TICKETS.map((t) => (
              <div key={t.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-muted-foreground">{t.id}</span>
                  <Badge
                    variant="secondary"
                    className={
                      t.tone === "amber"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }
                  >
                    {t.tone === "amber" ? (
                      <AlertTriangle className="mr-1 size-3" />
                    ) : (
                      <CheckCircle2 className="mr-1 size-3" />
                    )}
                    {t.status}
                  </Badge>
                </div>
                <p className="mt-1.5 text-sm">{t.subject}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full bg-transparent">
            Tạo phiếu hỗ trợ mới
          </Button>
        </Card>
      </div>
    </div>
  )
}
