/** @format */
"use client";

import React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ClipboardList, 
  AlertCircle, 
  BedDouble, 
  Stethoscope,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { useAuth } from "@/lib/auth-context";
import { apiSliceV1 } from "@/store/api/apiSliceV1";

const hospitalDashboardApi = apiSliceV1.injectEndpoints({
  endpoints: (builder: any) => ({
    getHospitalMetrics: builder.query({
      query: (hospitalId?: string) => hospitalId ? `/reports/metrics?hospitalId=${hospitalId}` : "/reports/metrics",
      providesTags: ["Dashboard"],
    }),
  }),
});

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  React.useEffect(() => {
    if (user?.role === "SYS_ADMIN") {
      router.replace("/dashboard/system");
    }
  }, [user, router]);

  const { data, isLoading } = hospitalDashboardApi.useGetHospitalMetricsQuery(user?.hospitalId, { skip: !user }) as any;

  if (isLoading || user?.role === "SYS_ADMIN") {
    return <div className="flex items-center justify-center h-96 text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Dashboard Overview" 
        description="Real-time monitoring of patient transfers and hospital capacities across the network."
      />

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard 
          title="Total Referrals" 
          value={data?.totalReferrals?.toString() ?? "—"} 
          icon={ClipboardList} 
          trend="+12% from last week" 
          trendType="up"
        />
        <StatsCard 
          title="New Requests" 
          value={data?.submittedReferrals?.toString() ?? "—"} 
          icon={TrendingUp} 
          trend="Awaiting review" 
          trendType="neutral"
        />
        <StatsCard 
          title="Admitted Cases" 
          value={data?.admittedReferrals?.toString() ?? "—"} 
          icon={Stethoscope} 
          trend="Completed transfers" 
          trendType="up"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-sm border-none bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Referral Volume</CardTitle>
          </CardHeader>
          <CardContent className="h-75">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.referralVolumeData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.05)'}} 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="referrals" name="Total Referrals" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="admitted" name="Admitted Cases" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-sm border-none bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Bed Occupancy Rate (%)</CardTitle>
          </CardHeader>
          <CardContent className="h-75">
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.bedOccupancyData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} unit="%" />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Occupancy Rate" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, trend, trendType, trendColor }: any) {
  return (
    <Card className="shadow-sm border-none bg-card/50 backdrop-blur-sm overflow-hidden relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={cn("text-xs flex items-center gap-1 mt-1", trendColor || "text-muted-foreground")}>
          {trendType === "up" && <ArrowUpRight className="h-3 w-3" />}
          {trendType === "down" && <ArrowDownRight className="h-3 w-3" />}
          {trend}
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(" ");
}
