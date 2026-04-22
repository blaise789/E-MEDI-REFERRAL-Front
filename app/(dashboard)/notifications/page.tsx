/** @format */
"use client";

import React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function NotificationsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Notifications" 
        description="Stay updated with real-time alerts regarding your referrals and facility status."
      />

      <div className="flex flex-col gap-4">
        <NotificationItem 
          title="New Referral Received" 
          message="A new emergency referral has been sent from Masaka District Hospital." 
          time="2 minutes ago" 
          unread 
        />
        <NotificationItem 
          title="Referral Accepted" 
          message="CHUK has accepted the transfer request for patient John Doe." 
          time="15 minutes ago" 
        />
        <NotificationItem 
          title="Bed Capacity Alert" 
          message="ICU occupancy at King Faisal Hospital has reached 95%." 
          time="1 hour ago" 
        />
      </div>
    </div>
  );
}

function NotificationItem({ title, message, time, unread }: any) {
  return (
    <Card className={cn("border-none shadow-sm transition-all hover:bg-muted/30 cursor-pointer", unread ? "bg-primary/5" : "bg-card/50")}>
      <CardContent className="p-4 flex gap-4 items-start">
        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", unread ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
          <Bell className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-sm">{title}</span>
            <span className="text-[10px] text-muted-foreground uppercase">{time}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
        </div>
        {unread && (
          <div className="h-2 w-2 rounded-full bg-primary mt-2" />
        )}
      </CardContent>
    </Card>
  );
}

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(" ");
}
