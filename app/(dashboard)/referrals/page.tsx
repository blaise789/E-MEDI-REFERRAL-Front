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
  BriefcaseMedical,
  X,
  Loader2,
  Download
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useGetReferralsQuery } from "@/store/features/referral/referralSlice";
import { format } from "date-fns";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { BASE_API_URL } from "@/lib/constants";

export default function ReferralsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("mediReferToken");
      let url = `${BASE_API_URL}/reports/referrals/export`;
      if (user?.role === "HOSPITAL_ADMIN" && user?.hospitalId) {
        url += `?hospitalId=${user.hospitalId}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Failed to generate report");
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `Referrals_Export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
      toast({ title: "Export Successful", description: "Your report has been downloaded." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Export Failed", description: error.message });
    } finally {
      setIsExporting(false);
    }
  };

  const queryFilters = {
    ...(searchTerm ? { search: searchTerm } : {}),
    ...(nationalId ? { nationalId } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  };

  const { data: referrals, isLoading } = useGetReferralsQuery(Object.keys(queryFilters).length ? queryFilters : undefined);

  const filteredReferrals = referrals?.filter(r => {
    if (activeTab === "outgoing") return r.referringHospitalId === user?.hospitalId;
    if (activeTab === "incoming") return r.receivingHospitalId === user?.hospitalId;
    return true;
  });

  const outgoingCount = referrals?.filter(r => r.referringHospitalId === user?.hospitalId).length || 0;
  const incomingCount = referrals?.filter(r => r.receivingHospitalId === user?.hospitalId).length || 0;

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

      <div className="flex flex-col gap-4 bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by patient name or diagnosis..." 
              className="pl-10 bg-background/50 border-none ring-1 ring-border/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="National ID..."
                className="pl-8 bg-background/50 border-none ring-1 ring-border/50 text-xs"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
              />
            </div>
            <Button variant="outline" className={cn("gap-2 bg-background/50", showFilters && "border-primary text-primary")} onClick={() => setShowFilters(p => !p)}>
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button onClick={handleExport} disabled={isExporting} variant="outline" className="gap-2 bg-background/50">
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-border/30 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Status</label>
              <select
                className="h-9 rounded-lg border border-border/50 bg-background/50 px-3 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="ADMITTED">Admitted</option>
                <option value="COUNTER_REFERRED">Counter-Referred</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">From Date</label>
              <Input type="date" className="h-9 bg-background/50 border-none ring-1 ring-border/50 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">To Date</label>
              <Input type="date" className="h-9 bg-background/50 border-none ring-1 ring-border/50 text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => { setStatusFilter(''); setStartDate(''); setEndDate(''); setNationalId(''); }}>
              <X className="h-3 w-3" /> Clear
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="all" className="gap-2">
              All Referrals
              <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[10px]">{referrals?.length || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="gap-2">
              Outgoing
              {outgoingCount > 0 && <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[10px]">{outgoingCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="incoming" className="gap-2">
              Incoming
              {incomingCount > 0 && <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[10px] bg-primary text-primary-foreground">{incomingCount}</Badge>}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <Card className="border-none shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50 text-[11px] uppercase tracking-wider font-bold">
                  <TableRow>
                    <TableHead className="w-75">Patient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>From / To</TableHead>
                    <TableHead>Date Initiated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                     <TableRow>
                       <TableCell colSpan={5} className="h-48 text-center">
                         <div className="flex flex-col items-center gap-2">
                           <BriefcaseMedical className="h-8 w-8 text-muted-foreground animate-pulse" />
                           <span className="text-muted-foreground">Loading referrals...</span>
                         </div>
                       </TableCell>
                     </TableRow>
                  ) : filteredReferrals?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground/20" />
                          <span>No referrals match your current view.</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReferrals?.map((referral) => (
                      <TableRow key={referral.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">
                                {referral.patient?.firstName} {referral.patient?.lastName}
                              </span>
                              {(() => {
                                const urgency = (referral as any).urgency || (referral.isEmergency ? 'EMERGENCY' : 'ROUTINE');
                                if (urgency === 'EMERGENCY') {
                                  return <span className="inline-flex items-center rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-600 ring-1 ring-inset ring-red-500/20 animate-pulse">Emergency</span>;
                                }
                                if (urgency === 'URGENT') {
                                  return <span className="inline-flex items-center rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 ring-1 ring-inset ring-amber-500/20">Urgent</span>;
                                }
                                return null;
                              })()}
                            </div>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {referral.diagnosis}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={referral.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-[11px]">
                            <span className={cn(
                              "font-medium",
                              referral.referringHospitalId === user?.hospitalId ? "text-primary" : "text-muted-foreground"
                            )}>From: {referral.referringHospital?.name}</span>
                            <span className={cn(
                              "font-medium",
                              referral.receivingHospitalId === user?.hospitalId ? "text-primary" : "text-muted-foreground"
                            )}>To: {referral.receivingHospital?.name}</span>
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
                                <DropdownMenuItem asChild>
                                  <Link href={`/referrals/${referral.id}`}>View Details</Link>
                                </DropdownMenuItem>
                                {referral.receivingHospitalId === user?.hospitalId && (
                                  <DropdownMenuItem>Update Status</DropdownMenuItem>
                                )}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    SUBMITTED: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
    ADMITTED: "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200",
    DISCHARGED: "bg-teal-100 text-teal-700 hover:bg-teal-200 border-teal-200",
    COUNTER_REFERRED: "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200",
  };

  return (
    <Badge 
      variant="outline" 
      className={cn("font-medium transition-colors", styles[status] || "bg-gray-100 text-gray-700")}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
