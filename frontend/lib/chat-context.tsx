"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export type Message = {
  id: string
  sender: "customer" | "driver" | "merchant" | "admin" | "ken"
  senderName: string
  text: string
  timestamp: string
}

export type ChatChannel = {
  id: string
  name: string
  avatar: string
  role: "customer" | "driver" | "merchant" | "admin"
  lastMessage?: string
}

type ChatContextType = {
  messages: Record<string, Message[]>
  sendMessage: (channelId: string, sender: Message["sender"], senderName: string, text: string) => void
  getChannelsForRole: (role: string) => ChatChannel[]
  getMessagesForChannel: (channelId: string) => Message[]
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

const INITIAL_MESSAGES: Record<string, Message[]> = {
  "customer-driver": [
    {
      id: "cd-1",
      sender: "customer",
      senderName: "Đỗ Thu Trang",
      text: "Anh ơi, đơn hàng của em sắp tới chưa ạ?",
      timestamp: "10:25",
    },
    {
      id: "cd-2",
      sender: "driver",
      senderName: "Nguyễn Văn Hùng",
      text: "Chào em, anh đang đợi lấy phở tại quán Thìn nhé. Khoảng 5 phút nữa anh xuất phát.",
      timestamp: "10:26",
    },
    {
      id: "cd-3",
      sender: "customer",
      senderName: "Đỗ Thu Trang",
      text: "Dạ vâng, phiền anh báo em khi gần tới nhé. Em cảm ơn!",
      timestamp: "10:27",
    },
  ],
  "customer-merchant": [
    {
      id: "cm-1",
      sender: "customer",
      senderName: "Đỗ Thu Trang",
      text: "Quán ơi, phở tái lăn cho mình nhiều hành và nước béo nhé ạ.",
      timestamp: "10:19",
    },
    {
      id: "cm-2",
      sender: "merchant",
      senderName: "Phở Thìn Lò Đúc",
      text: "Dạ Phở Thìn xin chào! Quán đã ghi nhận yêu cầu nhiều hành nước béo của bạn rồi nhé.",
      timestamp: "10:20",
    },
  ],
  "driver-merchant": [
    {
      id: "dm-1",
      sender: "driver",
      senderName: "Nguyễn Văn Hùng",
      text: "Đơn KEN-83920 của khách Đỗ Thu Trang xong chưa quán ơi?",
      timestamp: "10:23",
    },
    {
      id: "dm-2",
      sender: "merchant",
      senderName: "Phở Thìn Lò Đúc",
      text: "Đang chần thịt bò rồi tài xế ơi, chờ khoảng 2 phút nữa chần xong xếp hộp là lấy nhé.",
      timestamp: "10:24",
    },
  ],
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ken_chat_messages")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error("Failed to parse chat messages from localStorage", e)
        }
      }
    }
    return INITIAL_MESSAGES
  })

  useEffect(() => {
    localStorage.setItem("ken_chat_messages", JSON.stringify(messages))
  }, [messages])

  const sendMessage = (channelId: string, sender: Message["sender"], senderName: string, text: string) => {
    if (!text.trim()) return

    const now = new Date()
    const timestamp = now.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })

    const newMessage: Message = {
      id: `${channelId}-${Date.now()}`,
      sender,
      senderName,
      text,
      timestamp,
    }

    setMessages((prev) => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), newMessage],
    }))
  }

  const getChannelsForRole = (role: string): ChatChannel[] => {
    if (role === "customer") {
      return [
        {
          id: "customer-driver",
          name: "Tài xế: Nguyễn Văn Hùng",
          avatar: "/driver-portrait-man-1.png",
          role: "driver",
          lastMessage: messages["customer-driver"]?.[messages["customer-driver"].length - 1]?.text,
        },
        {
          id: "customer-merchant",
          name: "Cửa hàng: Phở Thìn Lò Đúc",
          avatar: "/store-placeholder.png", // fallback or store icon
          role: "merchant",
          lastMessage: messages["customer-merchant"]?.[messages["customer-merchant"].length - 1]?.text,
        },
      ]
    } else if (role === "driver") {
      return [
        {
          id: "customer-driver",
          name: "Khách hàng: Đỗ Thu Trang",
          avatar: "/avatar-placeholder.png",
          role: "customer",
          lastMessage: messages["customer-driver"]?.[messages["customer-driver"].length - 1]?.text,
        },
        {
          id: "driver-merchant",
          name: "Cửa hàng: Phở Thìn Lò Đúc",
          avatar: "/store-placeholder.png",
          role: "merchant",
          lastMessage: messages["driver-merchant"]?.[messages["driver-merchant"].length - 1]?.text,
        },
      ]
    } else if (role === "merchant") {
      return [
        {
          id: "customer-merchant",
          name: "Khách hàng: Đỗ Thu Trang",
          avatar: "/avatar-placeholder.png",
          role: "customer",
          lastMessage: messages["customer-merchant"]?.[messages["customer-merchant"].length - 1]?.text,
        },
        {
          id: "driver-merchant",
          name: "Tài xế: Nguyễn Văn Hùng",
          avatar: "/driver-portrait-man-1.png",
          role: "driver",
          lastMessage: messages["driver-merchant"]?.[messages["driver-merchant"].length - 1]?.text,
        },
      ]
    }
    return []
  }

  const getMessagesForChannel = (channelId: string): Message[] => {
    return messages[channelId] || []
  }

  return (
    <ChatContext.Provider value={{ messages, sendMessage, getChannelsForRole, getMessagesForChannel }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
