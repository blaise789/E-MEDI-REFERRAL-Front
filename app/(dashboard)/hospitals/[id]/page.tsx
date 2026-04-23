"use client";

import React, { use } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  BedDouble,
  Stethoscope,
  Activity,
  ArrowLeft,
  Building2,
  Users
} from "lucide-react";
import Link from "next/link";
import {
  useGetHospitalDashboardQuery
} from "@/store/features/hospital/hospitalSlice";
import { cn } from "@/lib/utils";
import { WARD_TYPE_LABELS, WardType, SPECIALIST_DISCIPLINE_LABELS, SpecialistDiscipline } from "@/lib/types";

export default function HospitalDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const { data, isLoading } = useGetHospitalDashboardQuery(unwrappedParams.id);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-24 bg-muted/20 rounded-lg"></div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="h-32 bg-muted/20 rounded-lg"></div>
          <div className="h-32 bg-muted/20 rounded-lg"></div>
          <div className="h-32 bg-muted/20 rounded-lg"></div>
        </div>
        <div className="h-96 bg-muted/20 rounded-lg"></div>
      </div>
    );
  }

  if (!data?.hospital) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <h2>Hospital not found.</h2>
        <Link href="/hospitals">
          <Button variant="link" className="mt-4">
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  const { hospital, bedSummary, beds, specialists } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <Link href="/hospitals">
          <Button variant="ghost" className="mb-4 gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Facilities
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{hospital.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant={hospital.level === "REFERRAL" ? "default" : "secondary"} className="uppercase">
                  {hospital.level.replace("_", " ")}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  ID: <span className="font-mono text-xs">{hospital.id.split("-")[0]}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Capacity"
          value={bedSummary.totalBeds}
          icon={<BedDouble className="h-5 w-5 text-muted-foreground" />}
          sub="Physical bed count"
        />
        <SummaryCard
          title="Available Beds"
          value={bedSummary.availableBeds}
          icon={<Activity className="h-5 w-5 text-emerald-500" />}
          sub="Ready for intake"
          valueClassName={bedSummary.availableBeds === 0 ? "text-rose-500" : "text-emerald-500"}
        />
        <SummaryCard
          title="Specialists"
          value={specialists?.length || 0}
          icon={<Stethoscope className="h-5 w-5 text-indigo-500" />}
          sub="Registered doctors"
        />
      </div>

      <div className="grid xl:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Live Bed Capacity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ward</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead className="text-right">Avail / Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beds?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No wards configured
                    </TableCell>
                  </TableRow>
                ) : (
                  beds?.map((bed: any) => {
                    const occupancyRate = Math.round((bed.occupiedBeds / bed.totalBeds) * 100) || 0;
                    const available = bed.totalBeds - bed.occupiedBeds;
                    return (
                      <TableRow key={bed.id}>
                        <TableCell className="font-medium">
                          {WARD_TYPE_LABELS[bed.wardType as WardType] || bed.wardType}
                        </TableCell>
                        <TableCell className="w-1/2">
                          <div className="flex items-center gap-3">
                            <Progress 
                              value={occupancyRate} 
                              className={cn(
                                "h-2 w-full",
                                occupancyRate > 90 ? "[&>div]:bg-destructive" : occupancyRate > 75 ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500"
                              )} 
                            />
                            <span className="text-xs font-bold w-8 text-right">{occupancyRate}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cn(
                            "font-bold text-base",
                            available === 0 ? "text-destructive" : available < 3 ? "text-amber-500" : "text-emerald-600"
                          )}>{available}</span>
                          <span className="text-muted-foreground text-xs"> / {bed.totalBeds}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-indigo-500" />
              <CardTitle className="text-lg">Specialist Roster</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specialists?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No specialists registered
                    </TableCell>
                  </TableRow>
                ) : (
                  specialists?.map((doc: any) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                            {doc.firstName[0]}{doc.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-sm leading-tight">Dr. {doc.firstName} {doc.lastName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {SPECIALIST_DISCIPLINE_LABELS[doc.discipline as SpecialistDiscipline] || doc.discipline}
                      </TableCell>
                      <TableCell className="text-right">
                        <StatusBadge status={doc.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, sub, icon, valueClassName }: any) {
  return (
    <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm ring-1 ring-white/10">
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            {title}
          </p>
          {icon}
        </div>
        <div>
          <h3 className={cn("text-3xl font-bold", valueClassName || "text-foreground")}>
            {value}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "AVAILABLE":
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Available</Badge>;
    case "IN_THEATRE":
      return <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200">In Theatre</Badge>;
    case "ON_CALL":
      return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">On Call</Badge>;
    default:
      return <Badge variant="secondary" className="text-muted-foreground">Unavailable</Badge>;
  }
}
