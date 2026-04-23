"use client";

import React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from "@/store/features/notification/notificationSlice";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function NotificationsPage() {
  const { data: notifications, isLoading, refetch } = useGetNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const { toast } = useToast();

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast({ title: "Update Cleared", description: "All notifications marked as read." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to clear notifications." });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Notifications" 
        description="Stay updated with real-time alerts regarding your referrals and facility status."
      >
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <Clock className="h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleMarkAllRead} disabled={isMarkingAll}>
            Mark All Read
          </Button>
        </div>
      </PageHeader>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 w-full animate-pulse bg-muted rounded-xl" />
          ))
        ) : !notifications || notifications.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto opacity-30">
              <Bell className="h-8 w-8" />
            </div>
            <p className="text-muted-foreground font-medium">No new alerts to show.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem 
              key={n.id}
              id={n.id}
              title={n.type?.replace("_", " ") || "Clinical Update"} 
              message={n.message} 
              time={formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })} 
              unread={!n.isRead}
              onMarkRead={() => markAsRead(n.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function NotificationItem({ id, title, message, time, unread, onMarkRead }: any) {
  return (
    <Card 
      onClick={() => unread && onMarkRead()}
      className={cn(
        "border-none shadow-sm transition-all hover:bg-muted/30 cursor-pointer", 
        unread ? "bg-primary/5 ring-1 ring-primary/10" : "bg-card/50"
      )}
    >
      <CardContent className="p-4 flex gap-4 items-start">
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center shrink-0", 
          unread ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
        )}>
          {unread ? <Bell className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-center">
            <span className={cn("text-sm", unread ? "font-bold text-slate-900" : "font-semibold text-slate-700")}>
              {title}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
              {time}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>
        {unread && (
          <div className="h-2 w-2 rounded-full bg-primary mt-2 animate-pulse" />
        )}
      </CardContent>
    </Card>
  );
}

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(" ");
}
