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
import { useAuth } from "@/lib/auth-context"
import { ROLE_LABELS } from "@/lib/types"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useGetUnreadCountQuery } from "@/store/features/notification/notificationSlice"
import { useSocket } from "@/lib/socket-context"

export function AppHeader() {
  const { user, logout } = useAuth()
  const { isConnected } = useSocket()
  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    skip: !user,
  })

  const hospitalName = user?.hospital?.name ?? "MediRefer"
  const unreadCount = typeof unreadData === "number" ? unreadData : 0

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
    <header className="flex h-16 items-center justify-between border-b bg-card px-6 sticky top-0 z-40 backdrop-blur-md bg-opacity-70">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <h1 className="text-lg font-bold leading-none tracking-tight">{hospitalName}</h1>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">{currentDate}</p>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold bg-muted/50 px-3 py-1 rounded-full border">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className={isConnected ? 'text-green-600' : 'text-red-500'}>
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="relative hover:bg-primary/5 transition-all">
            <Bell className={cn("h-5 w-5", unreadCount > 0 && "text-primary")} />
            {unreadCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-destructive text-white animate-in zoom-in duration-300">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
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
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                My Profile
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