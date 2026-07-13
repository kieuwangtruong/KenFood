"use client"

import React, { useState } from "react"
import { Store, Phone, Mail, MapPin, Clock, Award, ShieldAlert, LogOut, Upload, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MerchantProfileProps {
  onLogout: () => void
}

export function MerchantProfile({ onLogout }: MerchantProfileProps) {
  const [storeName, setStoreName] = useState("Phở Thìn Lò Đúc")
  const [phone, setPhone] = useState("0243 971 223")
  const [email, setEmail] = useState("contact@phothinloduc.vn")
  const [address, setAddress] = useState("13 Lò Đúc, Hai Bà Trưng, Hà Nội")
  const [openTime, setOpenTime] = useState("06:00")
  const [closeTime, setCloseTime] = useState("22:00")
  const [haccpStatus, setHaccpStatus] = useState<"verified" | "pending">("verified")
  const [logo, setLogo] = useState("https://images.unsplash.com/photo-1552566626-52f8b828add9?w=150")
  const [banner, setBanner] = useState("https://images.unsplash.com/photo-1544025162-d76694265947?w=600")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleSave = () => {
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  const simulateUpload = () => {
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      alert("Đã upload hóa đơn/chứng từ thành công! Đội ngũ Kén sẽ duyệt trong 24h.")
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Hồ sơ đối tác</h1>
        <p className="text-sm text-muted-foreground">Quản lý giao diện cửa hàng và chứng chỉ kinh doanh</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Banner & Logo Visuals */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-4 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Store className="h-4 w-4 text-primary" /> Nhận diện thương hiệu
            </h2>
            
            {/* Banner Simulation */}
            <div className="relative h-32 w-full rounded-xl overflow-hidden bg-muted">
              <img src={banner} alt="Store Banner" className="object-cover h-full w-full" />
              <button className="absolute bottom-2 right-2 bg-black/60 text-white p-1.5 rounded-lg text-xs hover:bg-black/80 flex items-center gap-1 shrink-0 font-medium">
                <Upload className="h-3 w-3" /> Đổi banner
              </button>
            </div>

            {/* Logo Simulation */}
            <div className="flex items-center gap-4 pt-2">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={logo} />
                <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">PT</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">Ảnh Logo quán</p>
                <Button size="xs" variant="outline" className="text-xs h-7">
                  <Upload className="mr-1 h-3 w-3" /> Tải ảnh mới
                </Button>
              </div>
            </div>
          </Card>

          {/* Operating Hours */}
          <Card className="p-4 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" /> Thời gian hoạt động
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Giờ mở cửa</Label>
                <Input value={openTime} onChange={(e) => setOpenTime(e.target.value)} className="mt-1 h-9 rounded-lg" />
              </div>
              <div>
                <Label className="text-xs">Giờ đóng cửa</Label>
                <Input value={closeTime} onChange={(e) => setCloseTime(e.target.value)} className="mt-1 h-9 rounded-lg" />
              </div>
            </div>
          </Card>
        </div>

        {/* Store Detail Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">Thông tin liên hệ cửa hàng</h2>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Tên hiển thị cửa hàng</Label>
                <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="mt-1 rounded-xl" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Hotline hỗ trợ</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">Email liên lạc</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 rounded-xl" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Địa chỉ chi nhánh chính</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 rounded-xl" />
              </div>
            </div>
          </Card>

          {/* Certifications (HACCP / Safety) */}
          <Card className="p-5 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
              <Award className="h-4 w-4 text-primary" /> Vệ sinh An toàn Thực phẩm & Chứng nhận
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                  Chứng nhận vệ sinh đạt chuẩn HACCP quốc tế
                </p>
                <div className="flex items-center gap-1.5">
                  {haccpStatus === "verified" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <Check className="h-3 w-3" /> Đã xác thực
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      <ShieldAlert className="h-3 w-3" /> Đang kiểm duyệt
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground">Thời hạn: 31/12/2026</span>
                </div>
              </div>
              <Button onClick={simulateUpload} disabled={uploading} size="sm" variant="outline" className="rounded-lg text-xs">
                {uploading ? "Đang upload..." : "Cập nhật chứng nhận mới"}
              </Button>
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
