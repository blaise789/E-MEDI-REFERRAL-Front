/** @format */
"use client";

import React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollText, ShieldAlert } from "lucide-react";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Audit Logs" 
        description="Traceability and accountability logs for all system actions and data transitions."
      />

      <div className="flex flex-col gap-2">
        <AuditItem action="USER_LOGIN" user="blaise@gmail.com" target="System" time="5 minutes ago" />
        <AuditItem action="REFERRAL_STATUS_CHANGE" user="Dr. John" target="Ref #8321" time="12 minutes ago" />
        <AuditItem action="BED_CAPACITY_UPDATE" user="Nurse Mary" target="Masaka ICU" time="45 minutes ago" />
        <AuditItem action="USER_REGISTERED" user="Admin Jane" target="New Clinician" time="1 hour ago" />
      </div>
    </div>
  );
}

function AuditItem({ action, user, target, time }: any) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors border-b border-border/50 text-sm">
      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <ScrollText className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="grid grid-cols-4 flex-1">
        <span className="font-mono text-xs font-bold text-primary">{action}</span>
        <span className="text-muted-foreground text-center">{user}</span>
        <span className="text-muted-foreground text-center">{target}</span>
        <span className="text-muted-foreground text-right">{time}</span>
      </div>
    </div>
  );
}
