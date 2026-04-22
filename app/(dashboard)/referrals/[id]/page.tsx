/** @format */
"use client";

import React from "react";
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
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function ReferralDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { data: referral, isLoading } = useGetReferralByIdQuery(id as string);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateReferralStatusMutation();

  const handleUpdateStatus = async (status: string) => {
    try {
      await updateStatus({ id: id as string, status: status as any }).unwrap();
      toast({ title: "Status Updated", description: `Referral is now ${status.replace("_", " ")}` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.data?.message || "Failed to update status" });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-96">Loading...</div>;
  if (!referral) return <div className="text-center h-96 flex items-center justify-center">Referral not found.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader 
          title={`Referral Details`} 
          description={`Reference ID: ${referral.id.substring(0, 8)}`}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Patient & Clinical */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl">
            <CardHeader className="border-b pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Patient Profile
                </CardTitle>
                <Badge variant={referral.urgency === "EMERGENCY" ? "destructive" : "secondary"}>
                  {referral.urgency}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <DetailItem label="Full Name" value={`${referral.patient?.firstName} ${referral.patient?.lastName}`} />
                <DetailItem label="National ID" value={referral.patient?.nationalId || "N/A"} />
                <DetailItem label="Gender" value={referral.patient?.gender || "N/A"} />
              </div>
              <div className="space-y-4">
                <DetailItem label="Diagnosis" value={referral.diagnosis} />
                <DetailItem label="Reason for Transfer" value={referral.reasonForTransfer} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Transfer Chain
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between relative px-4">
                <HospitalNode name={referral.referringHospital?.name || ""} sub="Referring Facility" />
                <div className="flex-1 border-t-2 border-dashed mx-4 relative">
                   <Truck className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 text-primary bg-background p-1" />
                </div>
                <HospitalNode name={referral.receivingHospital?.name || ""} sub="Receiving Facility" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Status & Actions */}
        <div className="space-y-8">
          <Card className="border-none shadow-lg bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/70">Current Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-3">
                 <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                   <StatusIcon status={referral.status} />
                 </div>
                 <h2 className="text-2xl font-bold">{referral.status.replace("_", " ")}</h2>
                 <p className="text-xs text-muted-foreground text-center">
                   Last updated {format(new Date(referral.updatedAt), "PPP p")}
                 </p>
              </div>

              <div className="grid gap-2">
                 {referral.status === "SUBMITTED" && (
                   <>
                     <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUpdateStatus("ACCEPTED")}>
                       <CheckCircle2 className="h-4 w-4 mr-2" /> Accept Referral
                     </Button>
                     <Button variant="outline" className="w-full text-destructive border-destructive/20" onClick={() => handleUpdateStatus("REJECTED")}>
                       <XCircle className="h-4 w-4 mr-2" /> Reject Referral
                     </Button>
                   </>
                 )}
                 {referral.status === "ACCEPTED" && (
                   <Button className="w-full" onClick={() => handleUpdateStatus("IN_TRANSIT")}>
                     <Truck className="h-4 w-4 mr-2" /> Dispatch Ambulance
                   </Button>
                 )}
                 {referral.status === "IN_TRANSIT" && (
                    <Button className="w-full" onClick={() => handleUpdateStatus("ADMITTED")}>
                      <Activity className="h-4 w-4 mr-2" /> Confirm Admission
                    </Button>
                 )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl">
             <CardHeader>
                <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Audit Trail</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <TimelineItem time={referral.createdAt} action="Referral Created" user="Dr. Blaise" />
                {referral.logs?.map(log => (
                  <TimelineItem key={log.id} time={log.createdAt} action={log.action} user="System" />
                ))}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function HospitalNode({ name, sub }: { name: string; sub: string }) {
  return (
    <div className="text-center">
      <div className="h-12 w-12 rounded-xl bg-background border flex items-center justify-center mx-auto mb-2 text-primary shadow-sm">
        <HospitalIcon className="h-6 w-6" />
      </div>
      <p className="text-sm font-bold truncate max-w-30">{name}</p>
      <p className="text-[10px] text-muted-foreground uppercase">{sub}</p>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "SUBMITTED": return <FileText className="h-8 w-8 text-primary" />;
    case "ACCEPTED": return <CheckCircle2 className="h-8 w-8 text-emerald-600" />;
    case "REJECTED": return <XCircle className="h-8 w-8 text-rose-600" />;
    case "IN_TRANSIT": return <Truck className="h-8 w-8 text-amber-600" />;
    case "ADMITTED": return <Activity className="h-8 w-8 text-purple-600" />;
    default: return <Clock className="h-8 w-8 text-muted-foreground" />;
  }
}

function TimelineItem({ time, action, user }: { time: string; action: string; user: string }) {
  return (
    <div className="flex gap-3 relative pb-4 last:pb-0">
      <div className="absolute left-1.75 top-6 bottom-0 w-px bg-border" />
      <div className="h-4 w-4 rounded-full bg-primary/20 ring-4 ring-background z-10 shrink-0" />
      <div className="space-y-1">
        <p className="text-sm font-medium">{action}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          {user} · {format(new Date(time), "HH:mm")}
        </p>
      </div>
    </div>
  );
}
