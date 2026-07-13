"use client"

import React, { useState } from "react"
import { ShieldCheck, User, Phone, Mail, Award, Lock, LogOut, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AdminProfileProps {
  onLogout: () => void
}

const AVATAR_OPTIONS = [
  { id: "av-a1", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", fallback: "SA" },
  { id: "av-a2", url: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150", fallback: "AD" },
]

const PERMISSIONS = [
  { id: "p1", name: "Toàn quyền hệ thống (Super Admin)", enabled: true },
  { id: "p2", name: "Quản lý & Duyệt nhà bán hàng", enabled: true },
  { id: "p3", name: "Theo dõi & Ghép tài xế thời gian thực", enabled: true },
  { id: "p4", name: "Xem báo cáo tài chính & GMV đối soát", enabled: true },
  { id: "p5", name: "Hỗ trợ kỹ thuật & Ghi nhật ký máy chủ", enabled: false },
]

export function AdminProfile({ onLogout }: AdminProfileProps) {
  const [name, setName] = useState("Kén Super Admin")
  const [phone, setPhone] = useState("0900 000 111")
  const [email, setEmail] = useState("super.admin@ken.vn")
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0].url)
  const [grade, setGrade] = useState("Cấp 5 (Tối cao)")
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = () => {
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Hồ sơ Quản trị viên</h1>
        <p className="text-sm text-muted-foreground">Xem phân quyền bảo mật và thông tin điều hành</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-5 text-center flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarImage src={avatar} alt="Admin Avatar" />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">SA</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">{name}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
                <ShieldCheck className="h-3.5 w-3.5" /> Quản trị viên Tối cao
              </span>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAvatar(opt.url)}
                  className={`relative h-10 w-10 rounded-full overflow-hidden border-2 transition-all ${
                    avatar === opt.url ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
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
          </Card>

          <Card className="p-4 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
              <Award className="h-4 w-4 text-primary" /> Cấp bậc bảo mật
            </h2>
            <div>
              <Label className="text-xs">Grade cấp phép</Label>
              <Input value={grade} onChange={(e) => setGrade(e.target.value)} className="mt-1 h-9 rounded-lg" />
            </div>
          </Card>
        </div>

        {/* Permissions & Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
              <User className="h-4 w-4 text-primary" /> Thông tin liên lạc nội bộ
            </h2>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Tên quản trị viên</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 rounded-xl" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Điện thoại</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">Email hệ thống</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 rounded-xl" />
                </div>
              </div>
            </div>
          </Card>

          {/* Secure Permissions Checklist */}
          <Card className="p-5 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
              <Lock className="h-4 w-4 text-primary" /> Phân quyền truy cập tài khoản
            </h2>
            <div className="space-y-3">
              {PERMISSIONS.map((perm) => (
                <div key={perm.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-xs font-semibold text-foreground/80">{perm.name}</span>
                  <div
                    className={`h-5 w-10 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                      perm.enabled ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out transform ${
                        perm.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Save / Logout */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleSave} className="flex-1 h-11 text-sm font-bold rounded-xl bg-primary text-primary-foreground">
              {saveSuccess ? "Đã lưu hồ sơ thành công!" : "Lưu thay đổi hồ sơ"}
            </Button>
            <Button
              variant="outline"
              onClick={onLogout}
              className="sm:w-44 h-11 text-sm font-bold rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5 flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
