/** @format */
"use client";

import React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BedDouble, 
  ArrowUpRight, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetHospitalsQuery } from "@/store/features/hospital/hospitalSlice";
import { WARD_TYPE_LABELS } from "@/lib/types";

export default function BedCapacityPage() {
  const { data: hospitals, isLoading, refetch } = useGetHospitalsQuery();

  // Aggregate all beds from all hospitals
  const allBeds = hospitals?.flatMap(h => 
    h.beds?.map(b => ({ ...b, hospitalName: h.name })) || []
  ) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Live Bed Capacity" 
        description="Real-time occupancy monitoring across ICU, Maternity, and Surgical wards in the national network."
      >
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </PageHeader>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Total Network Beds" value="850" sub="Across 14 facilities" />
        <SummaryCard title="Currently Occupied" value="612" sub="72% Occupancy rate" />
        <SummaryCard title="Critical (ICU) Beds" value="12 Avail." sub="Out of 45 total" variant="warning" />
        <SummaryCard title="Maternity" value="48 Avail." sub="High demand period" />
      </div>

      <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle>Global Capacity Board</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-75">Facility</TableHead>
                <TableHead>Ward Type</TableHead>
                <TableHead>Occupancy (%)</TableHead>
                <TableHead>Available / Total</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={5} className="h-12 animate-pulse bg-muted/50" /></TableRow>
                ))
              ) : allBeds.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-48 text-center text-muted-foreground">No capacity data reported.</TableCell></TableRow>
              ) : allBeds.map((bed) => {
                const occupancyRate = Math.round((bed.occupiedBeds / bed.totalBeds) * 100);
                const available = bed.totalBeds - bed.occupiedBeds;

                return (
                  <TableRow key={bed.id} className="group hover:bg-muted/20">
                    <TableCell className="font-medium">{bed.hospitalName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-background">{WARD_TYPE_LABELS[bed.wardType]}</Badge>
                    </TableCell>
                    <TableCell className="w-50">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                          <span>{occupancyRate}%</span>
                        </div>
                        <Progress 
                          value={occupancyRate} 
                          className={cn(
                            "h-1.5",
                            occupancyRate > 90 ? "[&>div]:bg-destructive" : occupancyRate > 70 ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500"
                          )} 
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn("font-bold", available === 0 ? "text-destructive" : available < 3 ? "text-amber-600" : "text-foreground")}>
                        {available}
                      </span> / {bed.totalBeds}
                    </TableCell>
                    <TableCell className="text-right">
                       <StatusChip occupancy={occupancyRate} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ title, value, sub, variant }: any) {
  return (
    <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm">
      <CardContent className="p-6">
        <p className="text-xs font-bold text-muted-foreground uppercase">{title}</p>
        <h3 className={cn("text-2xl font-bold mt-2", variant === "warning" ? "text-amber-600" : "text-foreground")}>{value}</h3>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

function StatusChip({ occupancy }: { occupancy: number }) {
  if (occupancy >= 95) return <Badge variant="destructive" className="gap-1 animate-pulse"><AlertTriangle className="h-3 w-3" /> FULL</Badge>;
  if (occupancy >= 80) return <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">CRITICAL</Badge>;
  return <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 gap-1"><CheckCircle2 className="h-3 w-3" /> OPTIMAL</Badge>;
}

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(" ");
}
