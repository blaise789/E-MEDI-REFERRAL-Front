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
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useGetPatientsQuery, useRegisterPatientMutation, useDeactivatePatientMutation } from "@/store/features/patient/patientSlice";
import { format } from "date-fns";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: patients, isLoading } = useGetPatientsQuery(searchTerm ? { search: searchTerm } : undefined);
  const [registerPatient, { isLoading: isRegistering }] = useRegisterPatientMutation();
  const [deactivatePatient] = useDeactivatePatientMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Deactivate ${name}? They will be hidden from searches.`)) return;
    try {
      await deactivatePatient(id).unwrap();
      toast({ title: "Patient Deactivated" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.data?.message });
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: "", lastName: "", nationalId: "", gender: "",
      dateOfBirth: "", contactNumber: "", insurance: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      gender: Yup.string().required("Gender is required"),
      dateOfBirth: Yup.date().required("Date of birth is required"),
      nationalId: Yup.string().required("National ID is required").min(16, "Must be 16 digits"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await registerPatient({
          ...values,
          dateOfBirth: new Date(values.dateOfBirth).toISOString(),
        }).unwrap();
        toast({ title: "Success", description: "Patient registered efficiently!" });
        setIsDialogOpen(false);
        resetForm();
      } catch (err: any) {
        toast({ title: "Error", description: err.data?.message || "Failed to register patient", variant: "destructive" });
      }
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Patient Management" 
        description="Search and manage patient medical records and transfer histories."
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Register Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
               <DialogTitle>Register New Patient</DialogTitle>
            </DialogHeader>
            <form onSubmit={formik.handleSubmit} className="space-y-4 py-2">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>First Name</Label>
                   <Input id="firstName" {...formik.getFieldProps("firstName")} />
                   {formik.touched.firstName && formik.errors.firstName && <div className="text-xs text-destructive">{formik.errors.firstName as string}</div>}
                 </div>
                 <div className="space-y-2">
                   <Label>Last Name</Label>
                   <Input id="lastName" {...formik.getFieldProps("lastName")} />
                   {formik.touched.lastName && formik.errors.lastName && <div className="text-xs text-destructive">{formik.errors.lastName as string}</div>}
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>National ID <span className="text-destructive">*</span></Label>
                  <Input id="nationalId" {...formik.getFieldProps("nationalId")} placeholder="16-digit ID" />
                  {formik.touched.nationalId && formik.errors.nationalId && <div className="text-xs text-destructive">{formik.errors.nationalId as string}</div>}
                 </div>
                 <div className="space-y-2">
                   <Label>Gender</Label>
                   <Select value={formik.values.gender} onValueChange={(val) => formik.setFieldValue("gender", val)}>
                     <SelectTrigger>
                       <SelectValue placeholder="Select" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                     </SelectContent>
                   </Select>
                   {formik.touched.gender && formik.errors.gender && <div className="text-xs text-destructive">{formik.errors.gender as string}</div>}
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Date of Birth</Label>
                   <Input type="date" id="dateOfBirth" {...formik.getFieldProps("dateOfBirth")} />
                   {formik.touched.dateOfBirth && formik.errors.dateOfBirth && <div className="text-xs text-destructive">{formik.errors.dateOfBirth as string}</div>}
                 </div>
                 <div className="space-y-2">
                   <Label>Contact Number</Label>
                   <Input id="contactNumber" {...formik.getFieldProps("contactNumber")} placeholder="+250..." />
                 </div>
               </div>

               <div className="space-y-2">
                 <Label>Insurance Details</Label>
                 <Input id="insurance" {...formik.getFieldProps("insurance")} placeholder="Mutuelle/RAMA" />
               </div>

               <div className="flex justify-end gap-3 pt-4">
                 <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                 <Button type="submit" disabled={isRegistering}>
                   {isRegistering ? "Registering..." : "Complete Registration"}
                 </Button>
               </div>
            </form>
          </DialogContent>
        </Dialog>
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
              ) : patients?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-48 text-center text-muted-foreground">No patients found.</TableCell></TableRow>
              ) : (
                patients?.map((patient) => (
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
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/patients/${patient.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">View</Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MapPin className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild><Link href={`/patients/${patient.id}`}>View Profile</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild><Link href={`/patients/${patient.id}/edit`}>Edit</Link></DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeactivate(patient.id, `${patient.firstName} ${patient.lastName}`)}>Deactivate</DropdownMenuItem>
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

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(" ");
}
