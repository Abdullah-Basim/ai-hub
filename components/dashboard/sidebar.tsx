"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import {
  LayoutDashboard,
  MessageSquare,
  ImageIcon,
  Film,
  History,
  Settings,
  LogOut,
  Sparkles,
  FileImage,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Text Models",
    href: "/dashboard/text",
    icon: MessageSquare,
  },
  {
    title: "Image Models",
    href: "/dashboard/image",
    icon: ImageIcon,
  },
  {
    title: "Video Models",
    href: "/dashboard/video",
    icon: Film,
  },
  {
    title: "Files",
    href: "/dashboard/files",
    icon: FileImage,
  },
  {
    title: "History",
    href: "/dashboard/history",
    icon: History,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { signOut, user } = useAuth()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-muted/40">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          <span className="font-bold">AI Hub</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn("w-full justify-start gap-2", pathname === item.href && "bg-muted")}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t p-4">
        <div className="mb-2 flex items-center gap-2 px-2">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium truncate">{user?.user_metadata?.name || user?.email}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={() => signOut()}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  )
}
