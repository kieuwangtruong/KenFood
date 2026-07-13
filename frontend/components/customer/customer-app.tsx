"use client"

import { useState } from "react"
import { Home, Ticket, ClipboardList, ShoppingCart, MessageSquare, User as UserIcon, ArrowLeft, Wallet } from "lucide-react"
import { MobileTabBar, type NavItem } from "@/components/shell/sidebar"
import { CustomerHome } from "./customer-home"
import { CustomerWallet } from "./customer-wallet"
import { CustomerVouchers } from "./customer-vouchers"
import { CustomerOrders } from "./customer-orders"
import { CustomerCheckout } from "./customer-checkout"
import { CustomerProfile } from "./customer-profile"
import { ChatComponent } from "@/components/chat-component"
import { useChat } from "@/lib/chat-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

const NAV: NavItem[] = [
  { id: "home", label: "Trang chủ", icon: Home },
  { id: "wallet", label: "Ví Kén", icon: Wallet },
  { id: "vouchers", label: "Ưu đãi", icon: Ticket },
  { id: "chat", label: "Tin nhắn", icon: MessageSquare },
  { id: "orders", label: "Đơn hàng", icon: ClipboardList },
  { id: "profile", label: "Hồ sơ", icon: UserIcon },
]

export function CustomerApp({
  onLogout,
  theme,
  toggleTheme,
}: {
  onLogout: () => void
  theme: "light" | "dark"
  toggleTheme: () => void
}) {
  const [tab, setTab] = useState("home")
  const [cart, setCart] = useState<any[]>([])
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
  const { getChannelsForRole } = useChat()

  const channels = getChannelsForRole("customer")

  const handleOpenChannel = (channelId: string) => {
    setActiveChannelId(channelId)
    setTab("chat")
  }

  return (
    <div className="flex h-full w-full flex-col bg-background dark:bg-gray-900 text-foreground dark:text-white overflow-hidden">
      
      {/* Desktop Top Navbar for Customer App */}
      <header className="hidden lg:block border-b border-amber-600/30 dark:border-emerald-600/30 bg-[#F4EFEA] dark:bg-gray-900 shrink-0 px-6 py-4 shadow-sm z-30">
        <div className="mx-auto max-w-[1400px] flex items-center justify-between">
          <div className="flex items-center gap-2.5 px-1">
            <img
              src="/logo.jpg"
              alt="Kén Logo"
              className="h-10 w-auto object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.src = "/logo.png"
              }}
            />
            <span className="font-black text-gray-900 dark:text-white tracking-tight"><span className="text-secondary dark:text-amber-500 font-bold">Customer</span></span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-2">
              {NAV.map((item) => {
                const Icon = item.icon
                const isActive = tab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTab(item.id)
                      if (item.id !== "chat") {
                        // Set default channel or reset
                      } else if (!activeChannelId) {
                        setActiveChannelId("customer-driver")
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 border cursor-pointer",
                      isActive
                        ? "bg-amber-600 text-white border-amber-600 dark:bg-emerald-600 dark:text-white dark:border-emerald-600"
                        : "bg-white border-amber-600 text-gray-900 hover:bg-amber-600 active:bg-amber-700 hover:text-white active:text-white dark:bg-gray-800 dark:border-emerald-600 dark:text-gray-100 dark:hover:bg-emerald-600 dark:active:bg-emerald-700 dark:hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                )
              })}
            </nav>
            <div className="h-6 w-px bg-border dark:bg-gray-700" />
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>
      </header>

      {/* Mobile Top Navbar for Customer App */}
      <header className="lg:hidden border-b border-amber-600/30 dark:border-emerald-600/30 bg-[#F4EFEA] dark:bg-gray-900 flex items-center justify-between px-4 py-3 shrink-0 z-30">
        <div className="flex items-center gap-2 px-1">
          <img
            src="/logo.jpg"
            alt="Kén Logo"
            className="h-10 w-auto object-contain rounded-lg"
            onError={(e) => {
              e.currentTarget.src = "/logo.png"
            }}
          />
          <span className="font-black text-gray-900 dark:text-white text-sm tracking-tight"><span className="text-secondary dark:text-amber-500 font-bold">Customer</span></span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </header>

      {/* Main Responsive Viewport Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="mx-auto max-w-[1400px] h-full w-full p-0 lg:p-6">
          {tab === "home" && (
            <CustomerHome 
              onCheckout={(product?: any) => {
                if (product) {
                  setCart([product])
                }
                setTab("checkout")
              }}
            />
          )}
          {tab === "wallet" && <CustomerWallet />}
          {tab === "vouchers" && <CustomerVouchers />}
          
          {/* Messaging View */}
          {tab === "chat" && (
            <div className="h-full flex flex-col bg-muted/10 dark:bg-gray-900/10 rounded-2xl overflow-hidden">
              {/* Desktop Widescreen Split-Pane Layout */}
              <div className="hidden lg:grid lg:grid-cols-3 border border-border dark:border-gray-800 bg-card dark:bg-gray-800 h-full shadow-sm flex-1 min-h-0">
                {/* Left Column (Inbox Channels List) */}
                <div className="lg:col-span-1 border-r border-border dark:border-gray-800 flex flex-col min-h-0 bg-muted/10 dark:bg-gray-900/30">
                  <div className="p-4 border-b border-border dark:border-gray-800 bg-card dark:bg-gray-850 shrink-0">
                    <p className="text-xs font-bold text-muted-foreground dark:text-gray-400 uppercase tracking-wider">Hộp thư hỗ trợ</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                    {channels.map((chan) => (
                      <button
                        key={chan.id}
                        onClick={() => setActiveChannelId(chan.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all",
                          activeChannelId === chan.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-muted dark:hover:bg-gray-700 text-foreground dark:text-white"
                        )}
                      >
                        <Avatar className="h-9 w-9 border dark:border-gray-700 shrink-0">
                          {chan.avatar && <AvatarImage src={chan.avatar} />}
                          <AvatarFallback className="font-bold text-xs bg-muted dark:bg-gray-800 text-foreground dark:text-white">
                            {chan.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{chan.name}</p>
                          <p className={cn("text-[10px] truncate mt-0.5", activeChannelId === chan.id ? "text-primary-foreground/85" : "text-muted-foreground dark:text-gray-450")}>
                            {chan.lastMessage || "Chưa có tin nhắn"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Column (Active Chat Window) */}
                <div className="lg:col-span-2 flex flex-col min-h-0 bg-background dark:bg-gray-900">
                  {activeChannelId ? (
                    activeChannelId === "customer-driver" ? (
                      <ChatComponent
                        channelId="customer-driver"
                        currentRole="customer"
                        currentUserName="Đỗ Thu Trang"
                        partnerName="Nguyễn Văn Hùng"
                        partnerAvatar="/driver-portrait-man-1.png"
                        partnerRole="driver"
                      />
                    ) : (
                      <ChatComponent
                        channelId="customer-merchant"
                        currentRole="customer"
                        currentUserName="Đỗ Thu Trang"
                        partnerName="Phở Thìn Lò Đúc"
                        partnerAvatar="/store-placeholder.png"
                        partnerRole="merchant"
                      />
                    )
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground font-semibold">
                      Chọn một cuộc hội thoại từ hộp thư
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile view */}
              <div className="lg:hidden flex-1 flex flex-col min-h-0 h-full">
                {activeChannelId ? (
                  <div className="flex-1 flex flex-col min-h-0 h-full">
                    <div className="bg-card dark:bg-gray-800 px-3 py-1.5 border-b border-border dark:border-gray-850 flex items-center shrink-0">
                      <button
                        onClick={() => setActiveChannelId(null)}
                        className="flex items-center gap-1 text-xs font-bold text-primary dark:text-emerald-400 hover:bg-muted dark:hover:bg-gray-700 p-1.5 rounded-lg transition-colors shrink-0"
                      >
                        <ArrowLeft className="h-4 w-4" /> Hộp thư
                      </button>
                    </div>
                    <div className="flex-1 min-h-0 bg-background dark:bg-gray-900">
                      {activeChannelId === "customer-driver" ? (
                        <ChatComponent
                          channelId="customer-driver"
                          currentRole="customer"
                          currentUserName="Đỗ Thu Trang"
                          partnerName="Nguyễn Văn Hùng"
                          partnerAvatar="/driver-portrait-man-1.png"
                          partnerRole="driver"
                        />
                      ) : (
                        <ChatComponent
                          channelId="customer-merchant"
                          currentRole="customer"
                          currentUserName="Đỗ Thu Trang"
                          partnerName="Phở Thìn Lò Đúc"
                          partnerAvatar="/store-placeholder.png"
                          partnerRole="merchant"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col min-h-0 bg-background dark:bg-gray-900">
                    <div className="bg-[#F4EFEA] dark:bg-gray-900 px-5 py-6 border-b border-amber-600/20 dark:border-emerald-600/20 text-gray-900 dark:text-white shrink-0">
                      <h1 className="text-xl font-bold">Tin nhắn của tôi</h1>
                      <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 font-semibold">
                        Trao đổi trực tiếp với tài xế và cửa hàng
                      </p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                      {channels.map((chan) => (
                        <button
                          key={chan.id}
                          onClick={() => setActiveChannelId(chan.id)}
                          className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-border dark:border-gray-800 bg-card dark:bg-gray-800 shadow-sm text-left hover:border-primary/30 dark:hover:border-primary/50 transition-all active:scale-[0.99]"
                        >
                          <Avatar className="h-11 w-11 border">
                            {chan.avatar && <AvatarImage src={chan.avatar} />}
                            <AvatarFallback className="font-bold bg-muted text-xs">
                              {chan.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{chan.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {chan.lastMessage || "Chưa có tin nhắn mới"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "orders" && (
            <CustomerOrders onChatSelect={handleOpenChannel} />
          )}
          
          {tab === "checkout" && <CustomerCheckout cart={cart} />}
          
          {tab === "profile" && (
            <CustomerProfile onLogout={onLogout} />
          )}
        </div>
      </div>

      {/* Mobile Tab Navigation Bar */}
      <div className="lg:hidden shrink-0 border-t border-border dark:border-gray-800 z-30">
        <MobileTabBar items={NAV} active={tab} onSelect={(t) => {
          setTab(t)
        }} />
      </div>
    </div>
  )
}
