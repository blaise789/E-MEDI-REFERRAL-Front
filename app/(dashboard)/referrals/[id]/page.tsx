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
  useAddCounterReferralMutation,
  useDeleteReferralMutation
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
  Plus,
  AlertTriangle,
  Download,
  LogOut,
  Trash2
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
  const { data: referral, isLoading, refetch } = useGetReferralByIdQuery(id as string);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateReferralStatusMutation();
  const [submitCounter, { isLoading: isCounterLoading }] = useAddCounterReferralMutation();
  const [deleteReferral, { isLoading: isDeleting }] = useDeleteReferralMutation();
  
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [dischargeNotes, setDischargeNotes] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [counterRefer, setCounterRefer] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSubmittingDischarge, setIsSubmittingDischarge] = useState(false);

  const handleUpdateStatus = async (status: string) => {
    try {
      await updateStatus({ id: id as string, status: status as any }).unwrap();
      toast({ title: "Status Updated", description: `Referral is now ${status.replace("_", " ")}` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.data?.message || "Failed to update status" });
    }
  };

  const handleDischarge = async () => {
    setIsSubmittingDischarge(true);
    try {
      const token = localStorage.getItem("mediReferToken");
      const res = await fetch(`${BASE_API_URL}/referrals/${id}/discharge`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dischargeNotes, followUpInstructions: followUp, counterRefer }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to discharge patient");
      }
      toast({ title: "Patient Discharged", description: counterRefer ? "Counter-referral submitted to source hospital." : "Patient successfully discharged." });
      setIsDischargeModalOpen(false);
      refetch();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Discharge Failed", description: err.message });
    } finally {
      setIsSubmittingDischarge(false);
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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this referral? This action cannot be undone.")) return;
    try {
      await deleteReferral(id as string).unwrap();
      toast({ title: "Referral Deleted", description: "The referral has been permanently deleted." });
      router.push("/referrals");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Delete Failed", description: err.data?.message || "Failed to delete referral" });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-96">Loading...</div>;
  if (!referral) return <div className="text-center h-96 flex items-center justify-center">Referral not found.</div>;

  const isReceiving = referral.receivingHospitalId === user?.hospitalId;
  const isSysAdmin = user?.role === "SYS_ADMIN";
  const isHospitalAdmin = user?.role === "HOSPITAL_ADMIN" && (referral.referringHospitalId === user?.hospitalId || referral.receivingHospitalId === user?.hospitalId);
  const canDelete = isSysAdmin || isHospitalAdmin;

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
          <div className="flex items-center gap-2">
            {(referral.status === "ADMITTED" || referral.status === "COUNTER_REFERRED") && (
              <Button onClick={handleDownloadPdf} disabled={isExporting} variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
                <FileText className="h-4 w-4" />
                {isExporting ? "Generating..." : "Download Discharge Summary"}
              </Button>
            )}
            {canDelete && (
              <Button onClick={handleDelete} disabled={isDeleting} variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Patient & Clinical */}
        <div className="lg:col-span-2 space-y-8">
          {/* Printable Template Form */}
          <div className="bg-white border border-slate-300 w-full text-slate-900 font-sans shadow-sm rounded-sm overflow-hidden text-sm">
            
            <div className="text-center py-4 border-b border-slate-300 bg-white">
               <h1 className="text-2xl font-bold tracking-tight text-slate-800">Medical Referral Form</h1>
               <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">Case ID: {referral.id.substring(0, 8)}</p>
            </div>

            {/* Header */}
            <div className="bg-slate-100/80 border-b border-slate-300 px-3 py-1.5">
              <h2 className="text-[13px] font-bold text-slate-800">Refer to</h2>
            </div>
            {/* Row 1: Hospital & Ward */}
            <div className="grid grid-cols-2 border-b border-slate-300">
              <div className="px-3 py-2 border-r border-slate-300 bg-white">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Target Hospital:</p>
                <p className="font-semibold">{referral.receivingHospital?.name || "N/A"}</p>
              </div>
              <div className="px-3 py-2 bg-white">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Target Ward / Specialty:</p>
                <p className="font-semibold">
                   {referral.ward ? `${referral.ward.name} (Beds: ${referral.ward.occupiedBeds}/${referral.ward.totalBeds})` : referral.targetWardName || "Unspecified"}
                </p>
              </div>
            </div>
            {/* Row 2: Assigned Specialist */}
            <div className="border-b border-slate-300 px-3 py-2 bg-white">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Assigned Specialist:</p>
                <p className="font-semibold">
                   {referral.assignedSpecialist ? `Dr. ${referral.assignedSpecialist.firstName} ${referral.assignedSpecialist.lastName} (${referral.assignedSpecialist.discipline})` : "None Requested"}
                </p>
            </div>

            {/* Header */}
            <div className="bg-slate-100/80 border-b border-slate-300 px-3 py-1.5 mt-2 border-t">
              <h2 className="text-[13px] font-bold text-slate-800">Patient information</h2>
            </div>
            {/* Row 1 */}
            <div className="grid grid-cols-3 border-b border-slate-300 bg-white">
              <div className="px-3 py-2 border-r border-slate-300 col-span-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Full Name:</p>
                <p className="font-semibold">{referral.patient?.firstName} {referral.patient?.lastName}</p>
              </div>
              <div className="px-3 py-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">National ID:</p>
                <p className="font-semibold">{referral.patient?.nationalId || "N/A"}</p>
              </div>
            </div>
            {/* Row 2 */}
            <div className="grid grid-cols-3 border-b border-slate-300 bg-white">
              <div className="px-3 py-2 border-r border-slate-300">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Date of Birth / Gender:</p>
                <p className="font-semibold">{(referral.patient as any)?.dateOfBirth ? new Date((referral.patient as any).dateOfBirth).toLocaleDateString() : 'N/A'} · {referral.patient?.gender}</p>
              </div>
              <div className="px-3 py-2 border-r border-slate-300">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Contact Number:</p>
                <p className="font-semibold">{referral.patient?.contactNumber || "N/A"}</p>
              </div>
              <div className="px-3 py-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Email:</p>
                <p className="font-semibold">{referral.patient?.email || "N/A"}</p>
              </div>
            </div>
            {/* Row 3 */}
            <div className="border-b border-slate-300 px-3 py-2 bg-white">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Address (Cell, Sector, District):</p>
                <p className="font-semibold">
                  {[referral.patient?.cell, referral.patient?.sector, referral.patient?.district].filter(Boolean).join(', ') || "N/A"}
                </p>
            </div>

            {/* Header */}
            <div className="bg-slate-100/80 border-b border-slate-300 px-3 py-1.5 mt-2 border-t">
              <h2 className="text-[13px] font-bold text-slate-800">Clinical & Transfer Information</h2>
            </div>
            <div className="border-b border-slate-300 px-3 py-3 min-h-[60px] bg-white">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Clinical Diagnosis of referring healthcare practitioner:</p>
                <p className="font-semibold whitespace-pre-wrap">{referral.diagnosis}</p>
            </div>
            <div className="border-b border-slate-300 px-3 py-3 min-h-[60px] bg-white">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Reason for Referral:</p>
                <p className="font-semibold whitespace-pre-wrap">{referral.reasonForTransfer}</p>
            </div>
            <div className="border-b border-slate-300 px-3 py-3 min-h-[60px] bg-white">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Significant Findings:</p>
                <p className="font-semibold whitespace-pre-wrap">{(referral as any).significantFindings || "None reported"}</p>
            </div>
            <div className="border-b border-slate-300 px-3 py-3 min-h-[60px] bg-white">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Procedures & Treatments Received:</p>
                <p className="font-semibold whitespace-pre-wrap">{(referral as any).proceduresReceived || "None reported"}</p>
            </div>
            <div className="border-b border-slate-300 px-3 py-3 min-h-[60px] bg-white">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Current Medications:</p>
                <p className="font-semibold whitespace-pre-wrap">{(referral as any).currentMedications || "None reported"}</p>
            </div>
            <div className="grid grid-cols-2 border-b border-slate-300 bg-white">
              <div className="px-3 py-2 border-r border-slate-300">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Immediate Condition:</p>
                <p className="font-semibold">{(referral as any).patientCondition || "N/A"}</p>
              </div>
              <div className="px-3 py-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Transport Mode & Monitoring:</p>
                <p className="font-semibold">
                  {(referral as any).transportType === 'PRIVATE' ? 'Private Vehicle' : 'Ambulance'} 
                  {((referral as any).monitoringRequired) ? ` - ${(referral as any).monitoringRequired}` : ''}
                </p>
              </div>
            </div>

            {/* Header */}
            <div className="bg-slate-100/80 border-b border-slate-300 px-3 py-1.5 mt-2 border-t">
              <h2 className="text-[13px] font-bold text-slate-800">Patient insurance information (if applicable)</h2>
            </div>
            <div className="border-b border-slate-300 px-3 py-2 bg-white">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Insurance carrier:</p>
                <p className="font-semibold">{referral.patient?.insurance || "None / Out-of-pocket"}</p>
            </div>

            {/* Header */}
            <div className="bg-slate-100/80 border-b border-slate-300 px-3 py-1.5 mt-2 border-t">
              <h2 className="text-[13px] font-bold text-slate-800">Referring clinician information</h2>
            </div>
            <div className="grid grid-cols-2 bg-white">
              <div className="px-3 py-2 border-r border-slate-300">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Initiated By (Name & Role):</p>
                <p className="font-semibold">
                  {referral.initiatedBy?.firstName} {referral.initiatedBy?.lastName} ({referral.initiatedBy?.role.replace("_", " ")})
                </p>
                {(referral as any).referringDoctorName && (
                  <p className="text-[11px] text-slate-500 mt-1 font-medium italic">Referring Doctor: {(referral as any).referringDoctorName}</p>
                )}
              </div>
              <div className="px-3 py-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Origin Hospital:</p>
                <p className="font-semibold">{referral.referringHospital?.name || "N/A"}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{referral.referringHospital?.location}</p>
              </div>
            </div>
          </div>
          {/* End Printable Template Form */}

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
                          <Button className="w-full h-11" onClick={() => handleUpdateStatus("ADMITTED")} disabled={isUpdating}>
                            <Plus className="h-4 w-4 mr-2" /> Confirm Admission
                          </Button>
                        </>
                      )}
                      {referral.status === "ADMITTED" && (
                        <Button 
                          className="w-full h-11 bg-slate-900 hover:bg-slate-800" 
                          onClick={() => setIsDischargeModalOpen(true)}
                        >
                          <LogOut className="h-4 w-4 mr-2" /> Discharge Patient
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

      {/* Discharge Patient Modal */}
      <Dialog open={isDischargeModalOpen} onOpenChange={setIsDischargeModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5" /> Discharge Patient
            </DialogTitle>
            <DialogDescription>
              Complete this patient's care episode. Optionally send a counter-referral back to {referral.referringHospital?.name} for follow-up care.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Discharge Summary / Treatment Notes <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea 
                id="notes" 
                placeholder="Describe treatment provided and patient's condition at discharge..." 
                className="min-h-28"
                value={dischargeNotes}
                onChange={(e) => setDischargeNotes(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30">
              <input 
                type="checkbox" 
                id="counterRefer" 
                checked={counterRefer}
                onChange={(e) => setCounterRefer(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <label htmlFor="counterRefer" className="text-sm font-medium cursor-pointer">
                Send counter-referral to <strong>{referral.referringHospital?.name}</strong> with follow-up instructions
              </label>
            </div>
            {counterRefer && (
              <div className="space-y-2">
                <Label htmlFor="followup">Follow-up Instructions</Label>
                <Textarea 
                  id="followup" 
                  placeholder="Medication dosages, appointment schedules, therapy requirements..." 
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDischargeModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDischarge} 
              className="bg-slate-900 hover:bg-slate-800" 
              disabled={isSubmittingDischarge}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isSubmittingDischarge ? "Discharging..." : "Confirm Discharge"}
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
    case "ADMITTED": return <Activity className={cn(iconClass, "text-purple-600")} />;
    case "DISCHARGED": return <CheckCircle2 className={cn(iconClass, "text-emerald-600")} />;
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
