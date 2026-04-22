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
import { useGetReferralsQuery } from "@/store/features/referral/referralSlice";
import { useGetHospitalsQuery } from "@/store/features/hospital/hospitalSlice";

const data = [
  { name: "Mon", referrals: 12, emergency: 4 },
  { name: "Tue", referrals: 19, emergency: 7 },
  { name: "Wed", referrals: 15, emergency: 3 },
  { name: "Thu", referrals: 22, emergency: 8 },
  { name: "Fri", referrals: 30, emergency: 12 },
  { name: "Sat", referrals: 10, emergency: 2 },
  { name: "Sun", referrals: 8, emergency: 1 },
];

export default function DashboardPage() {
  const { data: referrals, isLoading: loadingReferrals } = useGetReferralsQuery();
  const { data: hospitals, isLoading: loadingHospitals } = useGetHospitalsQuery();

  const totalReferrals = referrals?.length || 0;
  const emergencyReferrals = referrals?.filter(r => r.urgency === "EMERGENCY").length || 0;
  const activeReferrals = referrals?.filter(r => r.status === "IN_TRANSIT" || r.status === "SUBMITTED").length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Dashboard Overview" 
        description="Real-time monitoring of patient transfers and hospital capacities across the network."
      />

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Referrals" 
          value={totalReferrals.toString()} 
          icon={ClipboardList} 
          trend="+12% from last week" 
          trendType="up"
        />
        <StatsCard 
          title="Emergency Cases" 
          value={emergencyReferrals.toString()} 
          icon={AlertCircle} 
          trend="+5% from last week" 
          trendColor="text-destructive"
          trendType="up"
        />
        <StatsCard 
          title="Active Transfers" 
          value={activeReferrals.toString()} 
          icon={TrendingUp} 
          trend="Currently in transit" 
          trendType="neutral"
        />
        <StatsCard 
          title="Avg. Acceptance Time" 
          value="14m" 
          icon={Stethoscope} 
          trend="-2m from yesterday" 
          trendType="down"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-sm border-none bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Referral Volume</CardTitle>
          </CardHeader>
          <CardContent className="h-75">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.05)'}} 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="referrals" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="emergency" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-sm border-none bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Bed Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent className="h-75">
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Line type="monotone" dataKey="referrals" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
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
