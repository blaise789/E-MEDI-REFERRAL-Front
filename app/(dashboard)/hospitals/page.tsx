/** @format */
"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Building2, 
  MapPin, 
  Phone, 
  BedDouble,
  Stethoscope,
  Plus,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useGetHospitalsQuery, useAddHospitalMutation } from "@/store/features/hospital/hospitalSlice";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HOSPITAL_LEVEL_LABELS, HospitalLevel } from "@/lib/types";

export default function HospitalsPage() {
  const { data: hospitals, isLoading } = useGetHospitalsQuery();
  const [addHospital, { isLoading: isAdding }] = useAddHospitalMutation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    level: "DISTRICT" as HospitalLevel,
    location: "",
    contactNumber: "",
  });

  const isSysAdmin = user?.role === "SYS_ADMIN";

  const handleAddHospital = async () => {
    if (!formData.name || !formData.location) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all required facility information.",
      });
      return;
    }

    try {
      await addHospital(formData).unwrap();
      toast({
        title: "Facility Added",
        description: "The hospital has been successfully registered to the network.",
      });
      setIsModalOpen(false);
      setFormData({ name: "", level: "DISTRICT", location: "", contactNumber: "" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: err.data?.message || "Could not register the facility.",
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Healthcare Facilities" 
        description="Directory of district and referral hospitals within the national transfer network."
      >
        {isSysAdmin && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg">
                <Plus className="h-4 w-4" />
                Add Facility
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Register Healthcare Facility</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Facility Name <span className="text-destructive">*</span></Label>
                  <Input 
                    placeholder="e.g. Nyamata District Hospital"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 bg-muted/50 border-none ring-1 ring-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Level Designator <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.level}
                    onValueChange={(v) => setFormData({ ...formData, level: v as HospitalLevel })}
                  >
                    <SelectTrigger className="h-12 bg-muted/50 border-none ring-1 ring-border/50">
                      <SelectValue placeholder="Select facility level" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(HOSPITAL_LEVEL_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location / Region <span className="text-destructive">*</span></Label>
                  <Input 
                    placeholder="e.g. Bugesera, Eastern Province"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="h-12 bg-muted/50 border-none ring-1 ring-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Hotline</Label>
                  <Input 
                    placeholder="+250..."
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="h-12 bg-muted/50 border-none ring-1 ring-border/50"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleAddHospital} disabled={isAdding}>
                  {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Register Facility
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

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
                  {HOSPITAL_LEVEL_LABELS[hospital.level]}
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
