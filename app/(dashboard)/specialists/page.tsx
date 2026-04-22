/** @format */
"use client";

import React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Stethoscope, 
  Search, 
  User, 
  MapPin, 
  Clock,
  Phone,
  MessageSquare
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetHospitalsQuery } from "@/store/features/hospital/hospitalSlice";
import { SPECIALIST_DISCIPLINE_LABELS } from "@/lib/types";

export default function SpecialistsPage() {
  const { data: hospitals, isLoading } = useGetHospitalsQuery();

  // Aggregate all specialists from all hospitals
  const allSpecialists = hospitals?.flatMap(h => 
    h.specialists?.map(s => ({ ...s, hospitalName: h.name, location: h.location })) || []
  ) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Specialist Directory" 
        description="Directory of on-call and available specialists across the national healthcare network."
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by discipline or name..." 
            className="pl-10 bg-background/50 border-none ring-1 ring-border/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">12 Available Now</Badge>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">4 In Theatre</Badge>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-70">Specialist</TableHead>
                <TableHead>Discipline</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead className="text-right">Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={5} className="h-12 animate-pulse bg-muted/20" /></TableRow>
                ))
              ) : allSpecialists.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-48 text-center text-muted-foreground">No specialists found.</TableCell></TableRow>
              ) : allSpecialists.map((specialist) => (
                <TableRow key={specialist.id} className="group hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">Dr. {specialist.firstName} {specialist.lastName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">L-7832-MED</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-medium bg-background border-none">
                      {SPECIALIST_DISCIPLINE_LABELS[specialist.discipline]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                       <span className="text-sm font-medium">{specialist.hospitalName}</span>
                       <span className="text-xs text-muted-foreground flex items-center gap-1">
                         <MapPin className="h-3 w-3" /> {specialist.location}
                       </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={specialist.status} />
                  </TableCell>
                  <TableCell className="text-right">
                     <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                           <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                           <MessageSquare className="h-4 w-4" />
                        </Button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    AVAILABLE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    IN_THEATRE: "bg-amber-100 text-amber-700 border-amber-200",
    ON_CALL: "bg-blue-100 text-blue-700 border-blue-200",
    UNAVAILABLE: "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <Badge 
      variant="outline" 
      className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", styles[status] || "bg-gray-100 text-gray-600")}
    >
      <div className={cn("h-1.5 w-1.5 rounded-full mr-2", 
        status === "AVAILABLE" ? "bg-emerald-500" : 
        status === "IN_THEATRE" ? "bg-amber-500" : 
        status === "ON_CALL" ? "bg-blue-500" : "bg-rose-500"
      )} />
      {status.replace("_", " ")}
    </Badge>
  );
}

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(" ");
}
