/** @format */
"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { useGetHospitalsQuery } from "@/store/features/hospital/hospitalSlice";
import { apiSliceV1 } from "@/store/api/apiSliceV1";
import { ScrollText, Search, Calendar, RefreshCcw, User, Eye, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Inject the reports/audit endpoint
const auditApi = apiSliceV1.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAuditLogs: builder.query<any[], { hospitalId?: string; startDate?: string; endDate?: string } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.hospitalId) queryParams.append("hospitalId", params.hospitalId);
        if (params?.startDate) queryParams.append("startDate", params.startDate);
        if (params?.endDate) queryParams.append("endDate", params.endDate);
        return {
          url: `reports/audit?${queryParams.toString()}`,
        };
      },
      providesTags: ["AuditLog"],
    }),
  }),
});

const ACTION_COLORS: Record<string, string> = {
  USER_LOGIN: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  USER_LOGOUT: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800",
  REFERRAL_CREATED: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  REFERRAL_STATUS_UPDATED: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  COUNTER_REFERRAL_CREATED: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  BED_CAPACITY_UPDATED: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800",
  PATIENT_REGISTERED: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800",
  PATIENT_UPDATED: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800",
  PATIENT_DEACTIVATED: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
};

export default function AuditLogsPage() {
  const { user } = useAuth();
  const [hospitalId, setHospitalId] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const isSysAdmin = user?.role === "SYS_ADMIN";

  // Data queries
  const { data: hospitals } = useGetHospitalsQuery(undefined, { skip: !isSysAdmin });
  const { data: auditLogs, isLoading, refetch } = auditApi.useGetAuditLogsQuery({
    hospitalId: hospitalId === "ALL" ? undefined : hospitalId,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const handleReset = () => {
    setHospitalId("ALL");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
  };

  const filteredLogs = auditLogs?.filter((log) => {
    const term = searchQuery.toLowerCase();
    const actionMatch = log.action.toLowerCase().includes(term);
    const detailsMatch = log.details?.toLowerCase().includes(term) ?? false;
    const userMatch = log.performedBy
      ? `${log.performedBy.firstName} ${log.performedBy.lastName}`.toLowerCase().includes(term)
      : false;
    const patientMatch = log.referral?.patient
      ? `${log.referral.patient.firstName} ${log.referral.patient.lastName} ${log.referral.patient.nationalId}`
          .toLowerCase()
          .includes(term)
      : false;

    return actionMatch || detailsMatch || userMatch || patientMatch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Audit Logs"
          description="Comprehensive registry of critical system actions, data updates, and transfer status changes."
        />
        <Button variant="outline" size="sm" className="gap-2 self-start md:self-auto" onClick={() => refetch()}>
          <RefreshCcw className="h-4 w-4" /> Refresh Logs
        </Button>
      </div>

      {/* Filters section */}
      <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl ring-1 ring-white/10">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="search">Search Logs</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Action, user, patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50 border-none ring-1 ring-border/50 h-10"
                />
              </div>
            </div>

            {isSysAdmin && (
              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital / Facility</Label>
                <Select value={hospitalId} onValueChange={setHospitalId}>
                  <SelectTrigger id="hospital" className="bg-background/50 border-none ring-1 ring-border/50 h-10">
                    <SelectValue placeholder="All facilities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Facilities</SelectItem>
                    {hospitals?.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="startDate">From Date</Label>
              <div className="relative">
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-background/50 border-none ring-1 ring-border/50 h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">To Date</Label>
              <div className="relative">
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-background/50 border-none ring-1 ring-border/50 h-10"
                />
              </div>
            </div>
          </div>

          {(hospitalId !== "ALL" || startDate || endDate || searchQuery) && (
            <div className="flex justify-end mt-4">
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
                <RefreshCcw className="h-3 w-3 mr-2" /> Reset Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl ring-1 ring-white/10 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <ScrollText className="h-8 w-8 text-muted-foreground animate-pulse" />
              <span className="text-muted-foreground">Loading audit log stream...</span>
            </div>
          ) : filteredLogs?.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <ScrollText className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-semibold">No audit logs found</p>
              <p className="text-xs mt-1">Try modifying your filter options or search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/50 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4">Referral Context</th>
                    <th className="px-6 py-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredLogs?.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] font-bold py-0.5", ACTION_COLORS[log.action] || "bg-muted")}
                        >
                          {log.action.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.performedBy ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">
                              {log.performedBy.firstName} {log.performedBy.lastName}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mt-0.5">
                              {log.performedBy.role.replace(/_/g, " ")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">System Process</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium max-w-xs md:max-w-md">
                        <p className="leading-relaxed text-foreground/80">{log.details}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        {log.referral ? (
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-foreground/90">
                              Patient: {log.referral.patient.firstName} {log.referral.patient.lastName}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              ID: {log.referral.patient.nationalId}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                        {format(new Date(log.createdAt), "PPP p")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
