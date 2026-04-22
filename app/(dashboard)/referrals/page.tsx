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
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Filter, 
  Search, 
  ChevronRight, 
  Clock, 
  ArrowUpRight,
  MoreVertical,
  BriefcaseMedical
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useGetReferralsQuery } from "@/store/features/referral/referralSlice";
import { format } from "date-fns";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function ReferralsPage() {
  const { data: referrals, isLoading } = useGetReferralsQuery();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReferrals = referrals?.filter(r => 
    r.patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Patient Referrals" 
        description="Monitor and manage all active and historical patient transfers within the network."
      >
        <Link href="/referrals/create">
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            New Referral
          </Button>
        </Link>
      </PageHeader>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by patient or diagnosis..." 
            className="pl-10 bg-background/50 border-none ring-1 ring-border/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" className="gap-2 bg-background/50">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="bg-background/50">Export</Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-62.5">Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>From / To</TableHead>
                <TableHead>Date Initiated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow>
                   <TableCell colSpan={6} className="h-48 text-center">
                     <div className="flex flex-col items-center gap-2">
                       <BriefcaseMedical className="h-8 w-8 text-muted-foreground animate-pulse" />
                       <span className="text-muted-foreground">Loading referrals...</span>
                     </div>
                   </TableCell>
                 </TableRow>
              ) : filteredReferrals?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    No referrals found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReferrals?.map((referral) => (
                  <TableRow key={referral.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {referral.patient?.firstName} {referral.patient?.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {referral.diagnosis}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={referral.urgency === "EMERGENCY" ? "destructive" : "secondary"}>
                        {referral.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={referral.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="text-muted-foreground">From: {referral.referringHospital?.name}</span>
                        <span className="text-primary font-medium">To: {referral.receivingHospital?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(referral.createdAt), "MMM d, HH:mm")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex items-center justify-end gap-2">
                        <Link href={`/referrals/${referral.id}`}>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Update Status</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                       </div>
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    SUBMITTED: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
    ACCEPTED: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200",
    REJECTED: "bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200",
    IN_TRANSIT: "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200",
    ADMITTED: "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200",
    COUNTER_REFERRED: "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200",
  };

  return (
    <Badge 
      variant="outline" 
      className={cn("font-medium transition-colors", styles[status] || "bg-gray-100 text-gray-700")}
    >
      {status.replace("_", " ")}
    </Badge>
  );
}

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(" ");
}
