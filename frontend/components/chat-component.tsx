"use client"

import React, { useState, useRef, useEffect } from "react"
import { Send, User, Store, Bike, Sparkles } from "lucide-react"
import { useChat } from "@/lib/chat-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ChatComponentProps {
  channelId: string
  currentRole: "customer" | "driver" | "merchant" | "admin"
  currentUserName: string
  partnerName: string
  partnerAvatar?: string
  partnerRole: "customer" | "driver" | "merchant" | "admin"
}

const QUICK_REPLIES: Record<string, string[]> = {
  customer: [
    "Anh ơi sắp đến chưa ạ?",
    "Em cảm ơn anh!",
    "Gửi ở quầy lễ tân giúp em nhé.",
    "Cửa hàng cho mình xin thêm đũa muỗng với.",
  ],
  driver: [
    "Anh đang lấy đồ ăn rồi nhé.",
    "Đang trên đường giao tới em ơi, khoảng 3 phút nữa nhé.",
    "Anh đứng ở cổng rồi nha.",
    "Quán chuẩn bị xong món chưa ạ?",
  ],
  merchant: [
    "Món ăn chuẩn bị xong rồi ạ.",
    "Dạ quán đang chuẩn bị món nóng hổi, giao ngay nhé.",
    "Quán xin lỗi vì sự chuẩn bị hơi chậm trễ.",
    "Cảm ơn quý khách đã ủng hộ quán!",
  ],
}

export function ChatComponent({
  channelId,
  currentRole,
  currentUserName,
  partnerName,
  partnerAvatar,
  partnerRole,
}: ChatComponentProps) {
  const { getMessagesForChannel, sendMessage } = useChat()
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const messages = getMessagesForChannel(channelId)

  // Scroll to bottom on load/new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return
    sendMessage(channelId, currentRole as any, currentUserName, textToSend.trim())
    setInput("")
  }

  const getPartnerIcon = () => {
    switch (partnerRole) {
      case "driver":
        return <Bike className="h-4 w-4" />
      case "merchant":
        return <Store className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const quickReplies = QUICK_REPLIES[currentRole] || []

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Active Chat Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 shadow-sm shrink-0">
        <Avatar className="h-9.5 w-9.5 border border-primary/20">
          {partnerAvatar && <AvatarImage src={partnerAvatar} alt={partnerName} />}
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
            {partnerName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{partnerName}</p>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-0.5 capitalize">
              {getPartnerIcon()} {partnerRole === "merchant" ? "Cửa hàng đối tác" : partnerRole === "driver" ? "Tài xế" : "Khách hàng"}
            </span>
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto bg-muted/20 p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-60">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            <p className="text-xs font-medium text-foreground">Bắt đầu cuộc hội thoại</p>
            <p className="text-[10px] text-muted-foreground">Tin nhắn được mã hóa và truyền thời gian thực</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender === currentRole
            return (
              <div key={m.id} className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
                {!isMe && (
                  <Avatar className="h-7 w-7 border shrink-0">
                    {partnerAvatar && <AvatarImage src={partnerAvatar} />}
                    <AvatarFallback className="bg-muted text-[10px] font-bold">
                      {m.senderName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex flex-col space-y-0.5 max-w-[75%]">
                  {!isMe && <span className="text-[9px] text-muted-foreground px-1">{m.senderName}</span>}
                  <div
                    className={cn(
                      "px-3 py-2 text-xs rounded-2xl shadow-sm break-words",
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-card text-foreground border border-border rounded-bl-none"
                    )}
                  >
                    <p className="leading-relaxed font-medium">{m.text}</p>
                  </div>
                  <span className={cn("text-[9px] text-muted-foreground px-1.5", isMe ? "text-right" : "text-left")}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Interaction Panel */}
      <div className="border-t border-border bg-card p-3 shrink-0">
        {/* Quick Replies */}
        {quickReplies.length > 0 && (
          <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
            {quickReplies.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="rounded-full border border-border bg-muted/40 hover:bg-primary/10 hover:border-primary/40 px-3 py-1 text-[11px] font-bold text-foreground/80 transition-all duration-150 shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend(input)
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập nội dung tin nhắn..."
            className="flex-1 h-9.5 rounded-xl border border-border bg-muted/20 focus-visible:ring-primary/40"
          />
          <Button
            type="submit"
            size="icon"
            className="shrink-0 h-9.5 w-9.5 rounded-xl transition-transform active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Gửi tin nhắn"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
