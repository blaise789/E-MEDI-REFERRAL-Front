/** @format */
"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useGetPatientByIdQuery,
  useDeactivatePatientMutation,
} from "@/store/features/patient/patientSlice";
import {
  User,
  ArrowLeft,
  Calendar,
  Phone,
  IdCard,
  Shield,
  Activity,
  AlertTriangle,
  Pencil,
  PowerOff,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-700 border-blue-200",
  ADMITTED: "bg-purple-100 text-purple-700 border-purple-200",
  COUNTER_REFERRED: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function PatientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { data: patient, isLoading } = useGetPatientByIdQuery(id as string);
  const [deactivate, { isLoading: isDeactivating }] = useDeactivatePatientMutation();
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  const handleDeactivate = async () => {
    try {
      await deactivate(id as string).unwrap();
      toast({ title: "Patient Deactivated", description: "The patient record has been deactivated." });
      setIsDeactivateOpen(false);
      router.push("/patients");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.data?.message || "Failed to deactivate patient." });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-96">Loading...</div>;
  if (!patient) return <div className="text-center h-96 flex items-center justify-center">Patient not found.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/patients">Patients</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{patient.firstName} {patient.lastName}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <PageHeader
              title={`${patient.firstName} ${patient.lastName}`}
              description={`National ID: ${patient.nationalId} · Registered ${format(new Date(patient.createdAt), "PPP")}`}
            />
          </div>
          <div className="flex gap-2">
            <Link href={`/patients/${id}/edit`}>
              <Button variant="outline" className="gap-2">
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            </Link>
            {(patient as any).isActive !== false && (
              <Button
                variant="outline"
                className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/5"
                onClick={() => setIsDeactivateOpen(true)}
              >
                <PowerOff className="h-4 w-4" /> Deactivate
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl ring-1 ring-white/10">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Patient Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="flex items-center justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/5">
                <User className="h-10 w-10 text-primary/60" />
              </div>
            </div>
            <Detail icon={IdCard} label="National ID" value={patient.nationalId} />
            <Detail icon={User} label="Gender" value={patient.gender} />
            <Detail icon={Calendar} label="Date of Birth" value={format(new Date(patient.dateOfBirth), "PPP")} />
            <Detail icon={Shield} label="Insurance" value={patient.insurance || "None / Out-of-pocket"} />
            <Detail icon={Phone} label="Contact" value={(patient as any).contactNumber || "—"} />
            {(patient as any).email && <Detail icon={Activity} label="Email" value={(patient as any).email} />}
            {((patient as any).cell || (patient as any).sector || (patient as any).district) && (
              <Detail 
                icon={MapPin} 
                label="Address" 
                value={[patient.district ? `District: ${patient.district}` : '', patient.sector ? `Sector: ${patient.sector}` : '', patient.cell ? `Cell: ${patient.cell}` : ''].filter(Boolean).join(' · ')} 
              />
            )}
            <div className="pt-2">
              <Badge variant={((patient as any).isActive === false) ? "destructive" : "secondary"}>
                {((patient as any).isActive === false) ? "Inactive" : "Active"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl ring-1 ring-white/10">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Referral History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {!(patient as any).referrals?.length ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No referrals on record for this patient.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(patient as any).referrals.map((r: any) => (
                    <Link key={r.id} href={`/referrals/${r.id}`}>
                      <div className="p-4 rounded-xl border hover:bg-muted/30 transition-colors cursor-pointer group">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold">{r.diagnosis}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {r.referringHospital?.name} → {r.receivingHospital?.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {format(new Date(r.createdAt), "PPP p")}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className={cn("text-[10px]", STATUS_STYLES[r.status])}>
                              {r.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Deactivate Confirmation Modal */}
      <Dialog open={isDeactivateOpen} onOpenChange={setIsDeactivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Deactivate Patient
            </DialogTitle>
            <DialogDescription>
              This will mark <strong>{patient.firstName} {patient.lastName}</strong> as inactive. They will no longer appear in patient searches. This action can be reversed by an admin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeactivateOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeactivate} disabled={isDeactivating}>
              {isDeactivating ? "Deactivating..." : "Yes, Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary/60" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
