"use client"

import { Bell, User, ChevronDown, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { ROLE_LABELS } from "@/lib/types"
import Link from "next/link"

export function AppHeader() {
  const { user, logout } = useAuth()

  const hospitalName = user?.hospital?.name ?? "MediRefer"

  const currentDate = new Date().toLocaleDateString("en-RW", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const userName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : "Loading..."

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`
    : "U"

  const displayRole = user?.role ? ROLE_LABELS[user.role] : "Staff"

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold leading-none">{hospitalName}</h1>
        <p className="text-xs text-muted-foreground leading-none mt-1">{currentDate}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] bg-destructive text-white">
              !
            </Badge>
          </Button>
        </Link>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-3 h-10 px-2">
              <Avatar className="h-8 w-8 border">
                {user?.profilePicture?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profilePicture.url} alt={userName} className="h-full w-full object-cover rounded-full" />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initials || "?"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium leading-none">{userName}</span>
                <span className="text-[10px] text-muted-foreground leading-none mt-1">{displayRole}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings?tab=security">
                <Settings className="mr-2 h-4 w-4" />
                Security
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}