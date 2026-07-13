"use client"

import React, { useState } from "react"
import axiosClient from "@/src/api/axiosClient"
import { ShoppingBag, ShieldCheck, Bike, Store, Lock, User, Star, Activity, MapPin, CheckCircle, TrendingUp, Cpu, Server, Compass, Coffee } from "lucide-react"
import type { Role } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface LoginScreenProps {
  onLogin: (role: Role) => void
}

const ROLES: { id: Role; label: string; description: string; icon: typeof ShoppingBag }[] = [
  { id: "customer", label: "Khách hàng", description: "Đặt món ngon, giao hàng tức thì", icon: ShoppingBag },
  { id: "merchant", label: "Đối tác quán ăn", description: "Quản lý thực đơn & doanh thu", icon: Store },
  { id: "driver", label: "Tài xế Kén", description: "Bản đồ tối ưu, thu nhập ổn định", icon: Bike },
  { id: "admin", label: "Quản trị viên", description: "Giám sát vận hành & kiểm duyệt", icon: ShieldCheck },
]

const ROLE_IMAGES: Record<Role, string> = {
  customer: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=1000",
  driver: "https://images.unsplash.com/photo-1551281622-d04b6b60e653?q=80&w=1000",
  merchant: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000",
  admin: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000",
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<Role>("customer")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      setError("Vui lòng nhập Tên đăng nhập / Số điện thoại.")
      return
    }
    if (password.length < 4) {
      setError("Mật khẩu tối thiểu phải từ 4 ký tự.")
      return
    }
    
    setLoading(true)
    setError("")

    let email = username
    if (!email.includes("@")) {
      email = `${username}@ken.vn`
    }

    try {
      const loginRes = await axiosClient.post('/auth/login', {
        email: email,
        password: password
      })
      if (loginRes.data && loginRes.data.access_token) {
        localStorage.setItem('ken_access_token', loginRes.data.access_token)
        setLoading(false)
        onLogin(selectedRole)
      }
    } catch (err: any) {
      console.warn("Login failed, attempting auto-registration...", err)
      try {
        let fullName = "Đỗ Thu Trang"
        if (selectedRole === "merchant") fullName = "Phở Thìn Lò Đúc"
        if (selectedRole === "driver") fullName = "Nguyễn Văn Hùng"
        if (selectedRole === "admin") fullName = "Admin Kén"

        await axiosClient.post('/auth/register', {
          email: email,
          password: password,
          full_name: fullName,
          role: selectedRole
        })

        const retryRes = await axiosClient.post('/auth/login', {
          email: email,
          password: password
        })
        if (retryRes.data && retryRes.data.access_token) {
          localStorage.setItem('ken_access_token', retryRes.data.access_token)
          setLoading(false)
          onLogin(selectedRole)
        } else {
          setError("Không thể đăng nhập sau khi tự động đăng ký.")
          setLoading(false)
        }
      } catch (regErr: any) {
        console.error("Auto-registration failed:", regErr)
        setError(regErr.response?.data?.detail || "Lỗi đăng nhập/đăng ký hệ thống.")
        setLoading(false)
      }
    }
  }

  // Pre-fill simulated accounts for testing when role changes
  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setError("")
    switch (role) {
      case "customer":
        setUsername("0987654321")
        setPassword("customer123")
        break
      case "merchant":
        setUsername("phothin@ken.vn")
        setPassword("merchant123")
        break
      case "driver":
        setUsername("0912345678")
        setPassword("driver123")
        break
      case "admin":
        setUsername("admin@ken.vn")
        setPassword("admin123")
        break
    }
  }

  return (
    <div className="flex min-h-screen bg-muted/30 dark:bg-gray-955 transition-colors duration-200">
      {/* Left Column: Authentic Form */}
      <div className="flex w-full flex-col justify-center px-4 py-8 sm:px-6 md:w-[480px] lg:px-8 bg-card dark:bg-gray-900 border-r border-border dark:border-gray-800 shrink-0 shadow-lg z-10 transition-colors duration-200">
        <div className="mx-auto w-full max-w-sm space-y-6">
          
          {/* Logo Brand */}
          <div className="text-center space-y-3 pb-2">
            <div className="mx-auto flex justify-center">
              <img
                src="/logo.jpg"
                alt="Kén Logo"
                className="h-28 object-contain rounded-2xl"
                onError={(e) => {
                  e.currentTarget.src = "/logo.png"
                }}
              />
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground dark:text-gray-400 tracking-wider uppercase mt-1">
                Tinh hoa ẩm thực Việt · Delivery Ecosystem
              </p>
            </div>
          </div>
 
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-xs font-bold text-foreground dark:text-gray-250">Chọn vai trò đăng nhập</Label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => {
                  const Icon = r.icon
                  const isSelected = selectedRole === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleSelect(r.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 text-primary scale-[1.02] ring-1 ring-primary"
                          : "border-border dark:border-gray-800 bg-background dark:bg-gray-850 text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white hover:bg-muted/40 dark:hover:bg-gray-800"
                      )}
                    >
                      <Icon className="h-5 w-5 mb-1 shrink-0" />
                      <span className="text-xs font-bold whitespace-nowrap">{r.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    selectedRole === "customer" || selectedRole === "driver"
                      ? "Số điện thoại..."
                      : "Email quản lý..."
                  }
                  className="pl-10 h-10.5 rounded-xl text-xs bg-muted/10 dark:bg-gray-850 border-border dark:border-gray-800 dark:text-white"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu..."
                  className="pl-10 h-10.5 rounded-xl text-xs bg-muted/10 dark:bg-gray-850 border-border dark:border-gray-800 dark:text-white"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-destructive animate-pulse bg-destructive/5 p-2 rounded-lg border border-destructive/10">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-sm font-bold rounded-xl transition-all shadow-md bg-primary text-primary-foreground hover:bg-primary/95 disabled:opacity-70"
            >
              {loading ? "Đang xác thực..." : "Đăng nhập Hệ thống"}
            </Button>
          </form>

          {/* Quick instructions */}
          <div className="rounded-xl bg-muted/50 dark:bg-gray-850 p-3.5 border border-border dark:border-gray-800 text-[11px] text-muted-foreground dark:text-gray-400 leading-relaxed">
            <span className="font-bold text-foreground dark:text-white block mb-0.5">ℹ️ Mô phỏng hệ thống thông minh</span>
            Chọn vai trò ở trên để tự động nhập tài khoản mẫu tương ứng. Nhấn Đăng nhập để trải nghiệm Dashboard phân quyền.
          </div>
        </div>
      </div>

      {/* Right Column: Contextual Dynamic Illustration with Background Images */}
      <div className="hidden flex-1 items-center justify-center p-12 md:flex relative overflow-hidden select-none">
        
        {/* Preloaded cross-fading background images */}
        {Object.entries(ROLE_IMAGES).map(([roleKey, imageUrl]) => (
          <div
            key={roleKey}
            className={cn(
              "absolute inset-0 transition-all duration-700 ease-in-out transform",
              selectedRole === roleKey ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
            )}
          >
            <img
              src={imageUrl}
              alt={`${roleKey} layout`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Elegant overlay to match emerald theme */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/90 via-emerald-900/85 to-black/50 mix-blend-multiply" />
            <div className="absolute inset-0 bg-emerald-950/40 dark:bg-black/60" />
          </div>
        ))}
        
        {/* Abstract background graphics on top */}
        <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-3xl z-0" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-green-500/10 blur-3xl z-0" />
        
        {/* Dynamic Graphic Board overlay */}
        <div className="w-full max-w-md relative transition-all duration-350 z-10">
          
          {/* CUSTOMER GRAPHIC */}
          {selectedRole === "customer" && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2 text-white">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
                  Lobby Hub & Food Center
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight">Kén Premium Delivery</h2>
                <p className="text-xs text-emerald-100/70 max-w-sm mx-auto">
                  Trải nghiệm đặt món tiện lợi, thực phẩm tuyển chọn đạt chuẩn HACCP với mạng lưới shipper tối ưu.
                </p>
              </div>

              {/* Food Ads Preview */}
              <div className="bg-white/10 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-2xl space-y-3.5">
                <div className="flex gap-3 items-center">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-white/20 shrink-0 flex items-center justify-center text-3xl">
                    🍜
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">Phở bò tái lăn đặc biệt</p>
                    <p className="text-[11px] text-emerald-200 font-semibold">Phở Thìn Lò Đúc · Hai Bà Trưng</p>
                    <div className="mt-1 flex gap-1 items-center">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-[10px] text-white font-bold">4.9 (1.2k+ đánh giá)</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-300 shrink-0">75.000₫</span>
                </div>

                <div className="border-t border-white/5 pt-3.5 flex justify-between items-center text-xs text-white">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Bike className="h-4 w-4 text-emerald-400" />
                    <span>Lobby Hub shipper ghép:</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-300">Hoạt động (42 tài xế gần đây)</span>
                </div>
              </div>

              {/* Small delivery banner */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { icon: Coffee, label: "Đồ uống" },
                  { icon: Compass, label: "Ưu đãi lớn" },
                  { icon: CheckCircle, label: "Chuẩn HACCP" }
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 dark:bg-black/35 backdrop-blur-sm p-3 rounded-xl border border-white/5 text-center flex flex-col items-center justify-center">
                    <item.icon className="h-5 w-5 text-emerald-400 mb-1" />
                    <span className="text-[10px] text-emerald-100 font-bold">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MERCHANT GRAPHIC */}
          {selectedRole === "merchant" && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2 text-white">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
                  Store Control Center
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight">Doanh thu & Đơn hàng</h2>
                <p className="text-xs text-emerald-100/70 max-w-sm mx-auto">
                  Quản lý nhà hàng số, báo cáo bán hàng, cập nhật thực đơn và kết nối nhanh với hệ thống shipper Kén.
                </p>
              </div>

              {/* Store Analytics Mock */}
              <div className="bg-white/10 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div>
                    <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">Doanh thu hôm nay</p>
                    <p className="text-xl font-black text-white">12.400.000₫</p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +18.4%
                  </span>
                </div>

                {/* Kitchen order list mock */}
                <div className="space-y-2">
                  <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">Hàng chờ nhà bếp</p>
                  <div className="space-y-1.5">
                    {[
                      { id: "#83920", item: "2x Phở Bò Tái Lăn", status: "Đang nấu", time: "3 phút trước" },
                      { id: "#83915", item: "1x Bún Chả Hà Nội", status: "Chờ tài xế", time: "8 phút trước" }
                    ].map((order, idx) => (
                      <div key={idx} className="bg-black/20 dark:bg-black/50 p-2.5 rounded-xl flex items-center justify-between text-xs text-white">
                        <div>
                          <span className="font-mono text-[10px] text-emerald-300 font-bold">{order.id}</span>
                          <p className="font-semibold">{order.item}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">{order.status}</span>
                          <p className="text-[9px] text-emerald-200/60 mt-0.5">{order.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DRIVER GRAPHIC */}
          {selectedRole === "driver" && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2 text-white">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
                  Logistics & Shift Optimizer
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight">Vận chuyển thông minh</h2>
                <p className="text-xs text-emerald-100/70 max-w-sm mx-auto">
                  Ghi nhận ca làm việc tiện lợi, định vị tối ưu điểm điểm đến và gia tăng số cuốc xe mỗi giờ.
                </p>
              </div>

              {/* Map & Shift preview */}
              <div className="bg-white/10 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-2xl space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="h-10 w-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-300 font-bold shrink-0">
                    🏍️
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-emerald-200 font-semibold">Tài xế hoạt động</p>
                    <p className="text-sm font-bold text-white">Nguyễn Văn Hùng</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-200 font-semibold">Thu nhập tuần này</p>
                    <p className="text-sm font-bold text-white">3.450.000₫</p>
                  </div>
                </div>

                {/* Simulated Map Routing */}
                <div className="relative h-24 w-full bg-emerald-950/80 dark:bg-black/60 rounded-xl overflow-hidden border border-emerald-800/40 p-2 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-white">
                    <MapPin className="h-3 w-3 text-red-500 animate-bounce" />
                    <span className="truncate">Điểm đón: 13 Lò Đúc · Cửa hàng Phở Thìn</span>
                  </div>

                  {/* Draw simulated route */}
                  <div className="absolute inset-x-8 top-12 h-0.5 bg-emerald-600/30">
                    <div className="h-full w-2/3 bg-emerald-400 rounded-full relative">
                      <span className="absolute right-0 -top-1 h-2.5 w-2.5 bg-emerald-300 rounded-full animate-ping" />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-white self-end">
                    <MapPin className="h-3 w-3 text-emerald-400" />
                    <span className="truncate">Điểm trả: 1 Đại Cồ Việt</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN GRAPHIC */}
          {selectedRole === "admin" && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2 text-white">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
                  Control Room & Infrastructure
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight">Super Admin Dashboard</h2>
                <p className="text-xs text-emerald-100/70 max-w-sm mx-auto">
                  Theo dõi hoạt động tổng sàn, kiểm duyệt chứng nhận ATTP nhà hàng và giám sát vận hành logistics.
                </p>
              </div>

              {/* Admin metrics dashboard */}
              <div className="bg-white/10 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-2xl space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/20 dark:bg-black/50 p-3 rounded-xl">
                    <div className="flex justify-between text-emerald-200 text-[10px] font-bold">
                      <span>MÁY CHỦ</span>
                      <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-sm font-bold text-white mt-1">Hoạt động tốt</p>
                    <p className="text-[9px] text-emerald-300 font-semibold">Uptime 99.99%</p>
                  </div>
                  <div className="bg-black/20 dark:bg-black/50 p-3 rounded-xl">
                    <div className="flex justify-between text-emerald-200 text-[10px] font-bold">
                      <span>KIỂM DUYỆT MÓN</span>
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <p className="text-sm font-bold text-white mt-1">2 Đơn chờ duyệt</p>
                    <p className="text-[9px] text-emerald-300 font-semibold">Cập nhật 1 phút trước</p>
                  </div>
                </div>

                {/* Node Status Indicator */}
                <div className="space-y-2">
                  <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">Hạ tầng phân vùng Hà Nội</p>
                  <div className="space-y-1 text-[11px] text-white">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <Server className="h-3 w-3 text-emerald-400" /> Phân vùng Cầu Giấy (Node 1)
                      </span>
                      <span className="text-[9px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 font-bold">Ổn định</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <Server className="h-3 w-3 text-emerald-400" /> Phân vùng Hoàn Kiếm (Node 2)
                      </span>
                      <span className="text-[9px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 font-bold">Ổn định</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
