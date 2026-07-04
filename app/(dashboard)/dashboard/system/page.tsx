/** @format */
"use client";

import React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useGetHospitalDashboardQuery } from "@/store/features/hospital/hospitalSlice";
import { apiSliceV1 } from "@/store/api/apiSliceV1";
import {
  Hospital as HospitalIcon,
  Users,
  Activity,
  BedDouble,
  TrendingUp,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

// Inject the system dashboard endpoint
const systemDashboardApi = apiSliceV1.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getSystemDashboard: builder.query<any, void>({
      query: () => "reports/dashboard",
      providesTags: ["Hospital", "Patient", "Referral"],
    }),
  }),
});

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-700 border-blue-200",
  ADMITTED: "bg-purple-100 text-purple-700 border-purple-200",
  DISCHARGED: "bg-teal-100 text-teal-700 border-teal-200",
  COUNTER_REFERRED: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function SystemDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = systemDashboardApi.useGetSystemDashboardQuery();

  if (user?.role !== "SYS_ADMIN") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="font-semibold text-lg">Access Restricted</h2>
          <p className="text-muted-foreground text-sm">This dashboard is only accessible to System Administrators.</p>
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="flex items-center justify-center h-96">Loading system stats...</div>;

  const bedPct = data?.bedSummary
    ? Math.round((data.bedSummary.occupiedBeds / data.bedSummary.totalBeds) * 100) || 0
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="System Admin Dashboard"
        description="Network-wide overview across all registered hospitals and facilities."
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={HospitalIcon}
          label="Total Hospitals"
          value={data?.totalHospitals ?? "—"}
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          label="Active Patients"
          value={data?.totalPatients ?? "—"}
          color="bg-emerald-500"
        />
        <StatCard
          icon={Activity}
          label="Total Referrals"
          value={data?.totalReferrals ?? "—"}
          color="bg-violet-500"
        />
        <StatCard
          icon={BedDouble}
          label="Bed Occupancy"
          value={`${bedPct}%`}
          sub={`${data?.bedSummary?.occupiedBeds ?? 0} / ${data?.bedSummary?.totalBeds ?? 0}`}
          color={bedPct > 85 ? "bg-rose-500" : "bg-amber-500"}
        />
      </div>

      {/* Referrals by Status */}
      <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl ring-1 ring-white/10">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Referrals by Status
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex flex-wrap gap-3">
          {data?.referralsByStatus?.map((item: { status: string; count: number }) => (
            <div key={item.status} className={cn("px-4 py-3 rounded-xl border flex flex-col items-center min-w-25", STATUS_COLORS[item.status] || "bg-muted")}>
              <span className="text-2xl font-bold">{item.count}</span>
              <span className="text-[10px] font-bold uppercase mt-1">{item.status.replace(/_/g, " ")}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Hospital Performance Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl ring-1 ring-white/10">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <HospitalIcon className="h-4 w-4 text-primary" /> Hospital Referral Flow
            </CardTitle>
          </CardHeader>
          <CardContent className="h-75 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.hospitalSummary?.map((h: any) => ({
                name: h.name.replace(/ Hospital/gi, ''),
                Sent: h.sentCount,
                Received: h.receivedCount
              })) || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 11}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                <Bar dataKey="Sent" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Received" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl ring-1 ring-white/10">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-primary" /> Hospital Bed Occupancy (%)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-75 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.hospitalSummary?.map((h: any) => ({
                name: h.name.replace(/ Hospital/gi, ''),
                Occupancy: h.bedOccupancy.total > 0 ? Math.round((h.bedOccupancy.occupied / h.bedOccupancy.total) * 100) : 0
              })) || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 11}} unit="%" />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                <Bar dataKey="Occupancy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: any; sub?: string; color: string }) {
  return (
    <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl ring-1 ring-white/10 overflow-hidden">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
