"use client"

import React, { useState } from "react"
import { User, Phone, Mail, MapPin, Plus, Trash2, LogOut, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CATEGORIES } from "@/lib/data"
import { cn } from "@/lib/utils"

interface CustomerProfileProps {
  onLogout: () => void
}

const AVATAR_OPTIONS = [
  { id: "av-1", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", fallback: "TT" },
  { id: "av-2", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", fallback: "MT" },
  { id: "av-3", url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", fallback: "AH" },
  { id: "av-4", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", fallback: "HD" },
]

export function CustomerProfile({ onLogout }: { onLogout: () => void }) {
  const [name, setName] = useState("Đỗ Thu Trang")
  const [phone, setPhone] = useState("0987 654 321")
  const [email, setEmail] = useState("trang.do@gmail.com")
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0].url)
  const [addresses, setAddresses] = useState<string[]>([
    "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
    "Tòa B1 Keangnam Landmark, Nam Từ Liêm, Hà Nội",
  ])
  const [newAddress, setNewAddress] = useState("")
  const [favorites, setFavorites] = useState<string[]>(["pho", "chay"])
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleAddAddress = () => {
    if (newAddress.trim().length >= 10) {
      setAddresses([...addresses, newAddress.trim()])
      setNewAddress("")
    }
  }

  const handleDeleteAddress = (index: number) => {
    setAddresses(addresses.filter((_, i) => i !== index))
  }

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSave = () => {
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  return (
    <div className="pb-8 space-y-6">
      {/* Desktop Header */}
      <div className="hidden lg:block border-b border-border pb-4 bg-card px-6 py-4 shadow-sm rounded-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Hồ sơ cá nhân</h1>
        <p className="text-sm text-muted-foreground">
          Cập nhật thông tin liên lạc, danh sách địa chỉ nhận hàng và sở thích ăn uống.
        </p>
      </div>

      {/* Mobile Header */}
      <div className="bg-[#F4EFEA] dark:bg-gray-900 px-5 py-6 text-gray-900 dark:text-white border-b border-amber-600/20 dark:border-emerald-600/20 lg:hidden">
        <h1 className="text-xl font-bold">Hồ sơ cá nhân</h1>
        <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 font-semibold">
          Quản lý tài khoản và thông tin giao nhận
        </p>
      </div>

      <div className="px-4 lg:px-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Contact Info & Save/Logout actions */}
        <div className="lg:col-span-1 space-y-5">
          {/* Avatar Simulator */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm text-center">
            <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-1 justify-center">
              <Sparkles className="h-4 w-4 text-primary" /> Ảnh đại diện giả lập
            </p>
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarImage src={avatar} />
                <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                  {name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                {AVATAR_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setAvatar(opt.url)}
                    className={cn(
                      "relative h-10 w-10 rounded-full overflow-hidden border-2 transition-all",
                      avatar === opt.url ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={opt.url} alt="option" className="object-cover h-full w-full" />
                    {avatar === opt.url && (
                      <span className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white font-bold" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Info */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
              <User className="h-4 w-4 text-primary" /> Thông tin liên lạc
            </p>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Họ và tên</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Số điện thoại</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Địa chỉ Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 rounded-xl" />
              </div>
            </div>
          </section>

          {/* Form Actions */}
          <div className="space-y-2.5">
            <Button onClick={handleSave} className="w-full h-11 text-sm font-bold rounded-xl bg-primary text-primary-foreground">
              {saveSuccess ? "Đã cập nhật hồ sơ!" : "Cập nhật hồ sơ"}
            </Button>
            <Button
              variant="outline"
              onClick={onLogout}
              className="w-full h-11 text-sm font-bold rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Đăng xuất tài khoản
            </Button>
          </div>
        </div>

        {/* Right Column: Address Book & Preferences */}
        <div className="lg:col-span-2 space-y-5">
          {/* Address Book */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
              <MapPin className="h-4 w-4 text-primary" /> Sổ địa chỉ giao nhận
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {addresses.map((addr, idx) => (
                <div key={idx} className="flex gap-2.5 items-start bg-muted/40 p-3.5 rounded-xl border border-border/60">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed text-foreground flex-1 truncate-3-lines">{addr}</p>
                  <button
                    onClick={() => handleDeleteAddress(idx)}
                    className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors shrink-0"
                    aria-label="Delete address"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">Thêm địa chỉ giao hàng mới</Label>
              <div className="flex gap-2">
                <Input
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Nhập địa chỉ giao hàng chi tiết..."
                  className="rounded-xl flex-1 text-xs"
                />
                <Button onClick={handleAddAddress} size="sm" className="rounded-xl shrink-0">
                  <Plus className="h-4 w-4" /> Thêm
                </Button>
              </div>
              {newAddress && newAddress.length < 10 && (
                <span className="text-[10px] text-muted-foreground">Tối thiểu 10 ký tự</span>
              )}
            </div>
          </section>

          {/* Custom Role Prefs: Cuisines */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
            <p className="text-xs font-bold text-foreground border-b border-border pb-2">
              Sở thích ẩm thực cá nhân
            </p>
            <div className="flex flex-wrap gap-2.5">
              {CATEGORIES.map((cat) => {
                const selected = favorites.includes(cat.id)
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleFavorite(cat.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold transition-all",
                      selected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-transparent text-muted-foreground hover:border-muted-foreground"
                    )}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                )
              })}
            </div>
          </section>
        </div>
        
      </div>
    </div>
  )
}
