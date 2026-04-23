/** @format */
"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  User, 
  Calendar, 
  Phone, 
  MapPin,
  Clipboard
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGetPatientsQuery } from "@/store/features/patient/patientSlice";
import { format } from "date-fns";

export default function PatientsPage() {
  const { data: patients, isLoading } = useGetPatientsQuery();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients?.filter(p => 
    p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nationalId?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Patient Management" 
        description="Search and manage patient medical records and transfer histories."
      >
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Register Patient
        </Button>
      </PageHeader>

      <div className="bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or National ID..." 
            className="pl-10 bg-background/50 border-none ring-1 ring-border/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Patient Details</TableHead>
                <TableHead>National ID</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Insurance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6} className="h-12 animate-pulse bg-muted/20" /></TableRow>
                ))
              ) : filteredPatients?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-48 text-center text-muted-foreground">No patients found.</TableCell></TableRow>
              ) : (
                filteredPatients?.map((patient) => (
                  <TableRow key={patient.id} className="group hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="font-semibold">{patient.firstName} {patient.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{patient.nationalId || "Not Registered"}</TableCell>
                    <TableCell className="capitalize text-sm">{patient.gender.toLowerCase()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(patient.dateOfBirth), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-primary/70">{patient.insurance || "N/A"}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                         View History
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(" ");
}
