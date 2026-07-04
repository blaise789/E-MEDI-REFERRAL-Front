/** @format */
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useGetPatientByIdQuery, useUpdatePatientMutation } from "@/store/features/patient/patientSlice";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { FormError } from "@/components/ui/form-error";

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  gender: Yup.string().required("Gender is required"),
  dateOfBirth: Yup.string().required("Date of birth is required"),
  insurance: Yup.string().nullable(),
  contactNumber: Yup.string().nullable(),
  email: Yup.string().email("Invalid email").nullable(),
});

export default function EditPatientPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { data: patient, isLoading } = useGetPatientByIdQuery(id as string);
  const [updatePatient] = useUpdatePatientMutation();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: patient?.firstName || "",
      lastName: patient?.lastName || "",
      gender: patient?.gender || "Male",
      dateOfBirth: patient?.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split("T")[0] : "",
      insurance: patient?.insurance || "",
      contactNumber: (patient as any)?.contactNumber || "",
      email: (patient as any)?.email || "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await updatePatient({ id: id as string, data: values }).unwrap();
        toast({ title: "Patient Updated", description: "Patient record has been updated successfully." });
        router.push(`/patients/${id}`);
      } catch (err: any) {
        toast({ variant: "destructive", title: "Update Failed", description: err.data?.message || "Could not update patient." });
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (isLoading) return <div className="flex items-center justify-center h-96">Loading...</div>;
  if (!patient) return <div className="text-center h-96 flex items-center justify-center">Patient not found.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/patients">Patients</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href={`/patients/${id}`}>{patient.firstName} {patient.lastName}</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Edit</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader title="Edit Patient" description={`Updating record for ${patient.firstName} ${patient.lastName} · ID: ${patient.nationalId}`} />
        </div>
      </div>

      <Card className="border-none shadow-xl bg-card/60 backdrop-blur-xl ring-1 ring-white/20">
        <CardHeader>
          <CardTitle className="text-lg">Patient Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input name="firstName" value={formik.values.firstName} onChange={formik.handleChange} onBlur={formik.handleBlur} className="bg-background/50 border-none ring-1 ring-border/50" />
              <FormError message={formik.touched.firstName && formik.errors.firstName} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input name="lastName" value={formik.values.lastName} onChange={formik.handleChange} onBlur={formik.handleBlur} className="bg-background/50 border-none ring-1 ring-border/50" />
              <FormError message={formik.touched.lastName && formik.errors.lastName} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={formik.values.gender} onValueChange={(v) => formik.setFieldValue("gender", v)}>
                <SelectTrigger className="bg-background/50 border-none ring-1 ring-border/50 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" name="dateOfBirth" value={formik.values.dateOfBirth} onChange={formik.handleChange} onBlur={formik.handleBlur} className="bg-background/50 border-none ring-1 ring-border/50" />
              <FormError message={formik.touched.dateOfBirth && formik.errors.dateOfBirth} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Insurance Provider</Label>
              <Input name="insurance" placeholder="e.g. RSSB, MMI..." value={formik.values.insurance} onChange={formik.handleChange} className="bg-background/50 border-none ring-1 ring-border/50" />
            </div>
            <div className="space-y-2">
              <Label>Contact Number</Label>
              <Input name="contactNumber" placeholder="+250..." value={formik.values.contactNumber} onChange={formik.handleChange} className="bg-background/50 border-none ring-1 ring-border/50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input name="email" type="email" placeholder="patient@example.com" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} className="bg-background/50 border-none ring-1 ring-border/50" />
            <FormError message={formik.touched.email && formik.errors.email} />
            <p className="text-[11px] text-muted-foreground">Used to send email notifications when referrals are created.</p>
          </div>
        </CardContent>
        <CardFooter className="border-t p-6 flex justify-between">
          <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={() => formik.handleSubmit()} disabled={formik.isSubmitting} className="gap-2 px-8">
            {formik.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
