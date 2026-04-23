/** @format */
"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  useGetReferralByIdQuery, 
  useUpdateReferralStatusMutation,
  useAddCounterReferralMutation 
} from "@/store/features/referral/referralSlice";
import { 
  Clock, 
  User, 
  Hospital as HospitalIcon, 
  Stethoscope, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Truck,
  Activity,
  FileText,
  ArrowUpRight,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { BASE_API_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function ReferralDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: referral, isLoading } = useGetReferralByIdQuery(id as string);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateReferralStatusMutation();
  const [submitCounter, { isLoading: isCounterLoading }] = useAddCounterReferralMutation();
  
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [dischargeNotes, setDischargeNotes] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleUpdateStatus = async (status: string) => {
    try {
      await updateStatus({ id: id as string, status: status as any }).unwrap();
      toast({ title: "Status Updated", description: `Referral is now ${status.replace("_", " ")}` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.data?.message || "Failed to update status" });
    }
  };

  const handleCounterReferral = async () => {
    try {
      await submitCounter({ 
        id: id as string, 
        data: { dischargeNotes, followUpInstructions: followUp } 
      }).unwrap();
      toast({ title: "Counter-Referral Submitted", description: "Patient has been successfully referred back to the source hospital." });
      setIsCounterModalOpen(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.data?.message || "Failed to submit counter-referral" });
    }
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`${BASE_API_URL}/referrals/${id}/pdf`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Referral_${(referral as any).id.substring(0, 8)}.pdf`;
      a.click();
    } catch (error) {
       toast({ variant: "destructive", title: "Export Failed", description: "Could not generate PDF summary." });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-96">Loading...</div>;
  if (!referral) return <div className="text-center h-96 flex items-center justify-center">Referral not found.</div>;

  const isReceiving = referral.receivingHospitalId === user?.hospitalId;
  const isSysAdmin = user?.role === "SYS_ADMIN";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/referrals">Referrals</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{referral.patient?.firstName} {referral.patient?.lastName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <PageHeader 
              title={`Referral Details`} 
              description={`Clinical transfer record for ${referral.patient?.firstName} ${referral.patient?.lastName}`}
            />
          </div>
          {(referral.status === "ADMITTED" || referral.status === "COUNTER_REFERRED") && (
            <Button onClick={handleDownloadPdf} disabled={isExporting} variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
              <FileText className="h-4 w-4" />
              {isExporting ? "Generating..." : "Download Discharge Summary"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Patient & Clinical */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl ring-1 ring-white/10">
            <CardHeader className="border-b pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Patient Profile
                </CardTitle>
                <div className="flex gap-2">
                   {referral.urgency === "EMERGENCY" && (
                     <Badge variant="destructive" className="animate-pulse">Critical / Emergency</Badge>
                   )}
                   <Badge variant="secondary">Case ID: {referral.id.substring(0, 8)}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 grid md:grid-cols-2 gap-8 font-medium">
              <div className="space-y-6">
                <DetailItem label="Full Name" value={`${referral.patient?.firstName} ${referral.patient?.lastName}`} />
                <DetailItem label="National ID / Gender" value={`${referral.patient?.nationalId || "N/A"} · ${referral.patient?.gender}`} />
                <DetailItem label="Insurance Provider" value={referral.patient?.insurance || "None / Out-of-pocket"} />
                <DetailItem label="Initiated By" value={`${referral.initiatedBy?.firstName} ${referral.initiatedBy?.lastName} (${referral.initiatedBy?.role.replace("_", " ")})`} />
              </div>
              <div className="space-y-6">
                <DetailItem label="Clinical Diagnosis" value={referral.diagnosis} />
                <DetailItem label="Reason for Transfer" value={referral.reasonForTransfer} />
                <DetailItem label="Transport Mode" value={referral.transportType || "Ambulance"} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl ring-1 ring-white/10 overflow-hidden">
            <CardHeader className="border-b pb-4 bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Transfer Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 pb-10">
              <div className="flex items-center justify-between relative px-8">
                {/* Visual Connection Line */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[70%] h-0.5 border-t-2 border-dashed border-primary/20 -z-10" />
                
                <HospitalNode name={referral.referringHospital?.name || ""} sub="Origin" active={referral.status === "SUBMITTED"} />
                
                <div className="bg-background px-4 py-2 rounded-full border shadow-sm flex items-center gap-2 animate-bounce">
                  <Truck className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">En Route</span>
                </div>

                <HospitalNode name={referral.receivingHospital?.name || ""} sub="Destination" active={referral.status === "ADMITTED"} />
              </div>
            </CardContent>
          </Card>

          {referral.counterReferral && (
             <Card className="border-none shadow-sm bg-primary/5 ring-1 ring-primary/20">
               <CardHeader className="border-b border-primary/10">
                 <CardTitle className="text-lg flex items-center gap-2 text-primary">
                   <CheckCircle2 className="h-5 w-5" />
                   Discharge & Counter-Referral Feedback
                 </CardTitle>
               </CardHeader>
               <CardContent className="pt-6 space-y-6">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-primary/60 uppercase">Discharge Notes</span>
                    <p className="text-sm leading-relaxed">{referral.counterReferral.dischargeNotes}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-primary/60 uppercase">Follow-up Instructions</span>
                    <div className="p-4 bg-white/50 rounded-lg border border-primary/10 text-sm italic">
                      "{referral.counterReferral.followUpInstructions}"
                    </div>
                  </div>
               </CardContent>
             </Card>
          )}
        </div>

        {/* Right Column: Status & Actions */}
        <div className="space-y-8">
          <Card className="border-none shadow-lg bg-primary/5 border-primary/20 ring-1 ring-primary/20 overflow-hidden">
            <div className="h-1 bg-primary animate-pulse" />
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/70">Current Clinical Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <div className="flex flex-col items-center gap-3">
                 <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-2 ring-8 ring-primary/5">
                   <StatusIcon status={referral.status} />
                 </div>
                 <h2 className="text-2xl font-bold tracking-tight">{referral.status.replace("_", " ")}</h2>
                 <p className="text-[10px] uppercase font-bold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                   Updated {format(new Date(referral.updatedAt), "PPP p")}
                 </p>
              </div>

              <div className="grid gap-3 pt-4">
                 {isReceiving && !isSysAdmin ? (
                   <>
                     {referral.status === "SUBMITTED" && (
                       <>
                         <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-11" onClick={() => handleUpdateStatus("ACCEPTED")} disabled={isUpdating}>
                           <CheckCircle2 className="h-4 w-4 mr-2" /> Accept Transfer
                         </Button>
                         <Button variant="outline" className="w-full text-destructive border-destructive/20 h-11 hover:bg-destructive/5" onClick={() => handleUpdateStatus("REJECTED")} disabled={isUpdating}>
                           <XCircle className="h-4 w-4 mr-2" /> Reject Admission
                         </Button>
                       </>
                     )}
                     {referral.status === "ACCEPTED" && (
                       <Button className="w-full h-11" onClick={() => handleUpdateStatus("IN_TRANSIT")} disabled={isUpdating}>
                         <Truck className="h-4 w-4 mr-2" /> Dispatch Ambulance
                       </Button>
                     )}
                     {referral.status === "IN_TRANSIT" && (
                        <Button className="w-full h-11" onClick={() => handleUpdateStatus("ADMITTED")} disabled={isUpdating}>
                          <Plus className="h-4 w-4 mr-2" /> Confirmed Admission
                        </Button>
                     )}
                     {referral.status === "ADMITTED" && (
                        <Button 
                          className="w-full h-11 bg-slate-900" 
                          onClick={() => setIsCounterModalOpen(true)}
                        >
                          <Stethoscope className="h-4 w-4 mr-2" /> Counter-Refer Patient
                        </Button>
                     )}
                   </>
                 ) : isSysAdmin ? (
                   <div className="p-4 bg-muted/50 rounded-xl text-center">
                     <p className="text-xs text-muted-foreground italic">System Admins are impartial observers of clinical transitions.</p>
                   </div>
                 ) : (
                    <div className="p-4 bg-primary/5 rounded-xl text-center border border-primary/10">
                      <p className="text-xs text-primary font-medium">Monitoring return loop from receiving facility.</p>
                    </div>
                 )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl ring-1 ring-white/10">
             <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Audit Trail</CardTitle>
             </CardHeader>
             <CardContent className="space-y-6 pt-4">
                {referral.logs?.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No audit logs available.</p>
                )}
                {referral.logs?.map((log: any) => (
                  <TimelineItem 
                    key={log.id} 
                    time={log.createdAt} 
                    action={log.action.replace(/_/g, " ").replace("STATUS CHANGED TO ", "")} 
                    user={`${log.performedBy?.firstName || "System"} ${log.performedBy?.lastName || ""}`} 
                    role={log.performedBy?.role}
                  />
                ))}
                <TimelineItem 
                  time={referral.createdAt} 
                  action="Referral Submitted" 
                  user={`${referral.initiatedBy?.firstName} ${referral.initiatedBy?.lastName}`} 
                  role={referral.initiatedBy?.role}
                />
             </CardContent>
          </Card>
        </div>
      </div>

      {/* Counter-Referral Modal */}
      <Dialog open={isCounterModalOpen} onOpenChange={setIsCounterModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Counter-Referral Feedback</DialogTitle>
            <DialogDescription>
              Complete the patient care cycle by providing discharge notes and follow-up instructions back to {referral.referringHospital?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Discharge Summary & Treatment Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Describe treatment provided and patient's stable condition..." 
                className="min-h-32"
                value={dischargeNotes}
                onChange={(e) => setDischargeNotes(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="followup">Follow-up Instructions</Label>
              <Textarea 
                id="followup" 
                placeholder="Medication, appointment schedules, or therapy requirements..." 
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCounterModalOpen(false)}>Cancel</Button>
            <Button 
                onClick={handleCounterReferral} 
                className="bg-primary" 
                disabled={isCounterLoading || !dischargeNotes || !followUp}
            >
              {isCounterLoading ? "Submitting..." : "Submit Counter-Referral"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
      <p className="text-sm font-medium text-foreground/80">{value}</p>
    </div>
  );
}

function HospitalNode({ name, sub, active }: { name: string; sub: string; active?: boolean }) {
  return (
    <div className="text-center group">
      <div className={cn(
        "h-14 w-14 rounded-2xl border flex items-center justify-center mx-auto mb-3 shadow-sm transition-all duration-500",
        active ? "bg-primary text-primary-foreground border-primary scale-110 shadow-lg shadow-primary/20" : "bg-background text-muted-foreground border-border"
      )}>
        <HospitalIcon className="h-7 w-7" />
      </div>
      <p className="text-xs font-bold truncate max-w-25">{name}</p>
      <p className="text-[9px] text-muted-foreground uppercase tracking-tighter">{sub}</p>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  const iconClass = "h-10 w-10";
  switch (status) {
    case "SUBMITTED": return <FileText className={cn(iconClass, "text-primary")} />;
    case "ACCEPTED": return <CheckCircle2 className={cn(iconClass, "text-emerald-600")} />;
    case "REJECTED": return <XCircle className={cn(iconClass, "text-rose-600")} />;
    case "IN_TRANSIT": return <Truck className={cn(iconClass, "text-amber-600")} />;
    case "ADMITTED": return <Activity className={cn(iconClass, "text-purple-600")} />;
    case "COUNTER_REFERRED": return <ArrowUpRight className={cn(iconClass, "text-slate-600")} />;
    default: return <Clock className={cn(iconClass, "text-muted-foreground")} />;
  }
}

function TimelineItem({ time, action, user, role }: { time: string; action: string; user: string; role?: string }) {
  return (
    <div className="flex gap-4 relative pb-6 last:pb-0">
      <div className="absolute left-2 top-8 bottom-0 w-px bg-border/50" />
      <div className="h-4 w-4 rounded-full bg-primary/20 ring-4 ring-background z-10 shrink-0 mt-1" />
      <div className="space-y-1.5">
        <p className="text-xs font-bold text-foreground leading-none uppercase tracking-tight">{action}</p>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">{user}</span>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 uppercase font-bold text-muted-foreground/60">{role?.replace("_", " ")}</Badge>
          <span className="text-[10px] text-muted-foreground/40 font-medium">{format(new Date(time), "HH:mm")}</span>
        </div>
      </div>
    </div>
  );
}
