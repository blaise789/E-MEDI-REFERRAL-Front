/** @format */
"use client";

import React from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Hospital as HospitalIcon, 
  MapPin, 
  Phone, 
  ChevronRight, 
  Activity, 
  BedDouble,
  Stethoscope,
  Building2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useGetHospitalsQuery } from "@/store/features/hospital/hospitalSlice";

export default function HospitalsPage() {
  const { data: hospitals, isLoading } = useGetHospitalsQuery();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Healthcare Facilities" 
        description="Directory of district and referral hospitals within the national transfer network."
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
             <Card key={idx} className="h-48 animate-pulse bg-muted/20 border-none" />
          ))
        ) : hospitals?.map((hospital) => (
          <Card key={hospital.id} className="group overflow-hidden border-none shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="h-6 w-6" />
                </div>
                <Badge variant={hospital.level === "REFERRAL" ? "default" : "secondary"}>
                  {hospital.level.replace("_", " ")}
                </Badge>
              </div>
              <CardTitle className="mt-4 text-xl">{hospital.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                {hospital.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between text-sm">
                 <div className="flex items-center gap-2 text-muted-foreground">
                   <BedDouble className="h-4 w-4" />
                   <span>{hospital.beds?.length || 0} Wards</span>
                 </div>
                 <div className="flex items-center gap-2 text-muted-foreground">
                   <Stethoscope className="h-4 w-4" />
                   <span>{hospital.specialists?.length || 0} Specialists</span>
                 </div>
              </div>

              <div className="flex gap-2">
                 <Link href={`/hospitals/${hospital.id}`} className="flex-1">
                   <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                     View details
                   </Button>
                 </Link>
                 <Button variant="ghost" size="icon" className="shrink-0 border">
                    <Phone className="h-4 w-4" />
                 </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
