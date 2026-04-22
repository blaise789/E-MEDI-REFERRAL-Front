/** @format */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Hospital as HospitalIcon, 
  ClipboardCheck,
  Stethoscope,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useGetHospitalsQuery } from "@/store/features/hospital/hospitalSlice";
import { useGetPatientsQuery, useRegisterPatientMutation } from "@/store/features/patient/patientSlice";
import { useCreateReferralMutation } from "@/store/features/referral/referralSlice";
import { FormError } from "@/components/ui/form-error";

const STEPS = [
  { id: "patient",  title: "Patient Info",  icon: User },
  { id: "facility", title: "Destination",   icon: HospitalIcon },
  { id: "clinical", title: "Clinical Data", icon: Stethoscope },
  { id: "review",   title: "Review",        icon: ClipboardCheck },
];

/** Validation Schemas per step */
const validationSchemas = [
  // Step 0: Patient
  Yup.object().shape({
    patientId: Yup.string().nullable(),
    newPatient: Yup.object().when("patientId", {
      is: (val: string) => !val || val.length === 0,
      then: (schema) => schema.shape({
        firstName: Yup.string().required("First name is required"),
        lastName: Yup.string().required("Last name is required"),
        nationalId: Yup.string().required("National ID is required").min(16, "National ID must be 16 characters"),
        dateOfBirth: Yup.string().required("Date of birth is required"),
        gender: Yup.string().required("Gender is required"),
      }),
      otherwise: (schema) => schema.strip(), // Remove newPatient from validation if patientId exists
    }),
  }, [["patientId", "newPatient"]]),
  // Step 1: Facility
  Yup.object().shape({
    receivingHospitalId: Yup.string().required("Please select a receiving facility"),
    referringHospitalId: Yup.string().required("Please select a referring hospital"),
  }),
  // Step 2: Clinical
  Yup.object().shape({
    diagnosis: Yup.string().required("Initial diagnosis is required").min(3, "Diagnosis is too short"),
    reasonForTransfer: Yup.string().required("Reason for transfer is required").min(10, "Please provide more detail"),
    urgency: Yup.string().required("Urgency level is required"),
  }),
  // Step 3: Review (Confirm)
  Yup.object().shape({}),
];

export default function CreateReferralPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  
  const { user } = useAuth();
  
  // Data Queries
  const { data: hospitals, isLoading: isLoadingHospitals } = useGetHospitalsQuery();
  const { data: patients, isLoading: isLoadingPatients } = useGetPatientsQuery();
  const [createReferral] = useCreateReferralMutation();
  const [registerPatient] = useRegisterPatientMutation();

  const formik = useFormik({
    initialValues: {
      patientId: "",
      referringHospitalId: user?.hospitalId || "", // Default to user's hospital if assigned
      receivingHospitalId: "",
      urgency: "ROUTINE",
      reasonForTransfer: "",
      diagnosis: "",
      preTransferTreatment: "",
      transportType: "AMBULANCE",
      newPatient: {
         firstName: "",
         lastName: "",
         nationalId: "",
         dateOfBirth: "",
         gender: "MALE"
      }
    },
    validationSchema: validationSchemas[currentStep],
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let patientId = values.patientId;
        
        // Validation check for SysAdmin without hospital
        if (!values.referringHospitalId) {
          toast({
             variant: "destructive",
             title: "Configuration Error",
             description: "As a System Admin without an assigned facility, you must select the 'Referring Hospital' in Step 1."
          });
          setSubmitting(false);
          return;
        }

        // If no patient selected, register the new patient first
        if (!patientId) {
          const patient = await registerPatient(values.newPatient).unwrap();
          patientId = patient.id;
        }

        await createReferral({
          patientId,
          referringHospitalId: values.referringHospitalId,
          receivingHospitalId: values.receivingHospitalId,
          urgency: values.urgency as any,
          reasonForTransfer: values.reasonForTransfer,
          diagnosis: values.diagnosis,
          preTransferTreatment: values.preTransferTreatment,
          transportType: values.transportType,
        }).unwrap();

        toast({
          title: "Referral Submitted",
          description: "The patient transfer request has been broadcasted to the receiving facility.",
        });
        router.push("/referrals");
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: error.data?.message || "An error occurred while submitting the referral.",
        });
      } finally {
        setSubmitting(false);
      }
    }
  });

  const nextStep = async () => {
    // Validate current step before proceeding
    const errors = await formik.validateForm();
    
    // Check if there are errors related to the current step
    if (Object.keys(errors).length === 0) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
      // Reset touched for the next step to avoid immediate error flashing
      formik.setTouched({});
    } else {
      // Logic to touch all fields that have errors, including nested ones
      const touchedFields: any = {};
      
      const markTouched = (obj: any, prefix = "") => {
        Object.keys(obj).forEach(key => {
          const path = prefix ? `${prefix}.${key}` : key;
          if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
            markTouched(obj[key], path);
          } else {
            touchedFields[path] = true;
          }
        });
      };
      
      markTouched(errors);
      formik.setTouched(touchedFields);

      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please complete all required fields for this step before continuing.",
      });
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Initiate Referral" 
        description="Follow the clinical workflow to coordinate a secure patient transfer between facilities."
      />

      {/* Stepper Header */}
      <div className="flex justify-between items-center mb-8 bg-card/30 p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-sm overflow-x-auto">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex flex-col items-center gap-2 relative z-10 shrink-0 px-4 md:px-0">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300",
              currentStep >= idx ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "bg-muted text-muted-foreground"
            )}>
              <step.icon className="h-5 w-5" />
            </div>
            <span className={cn("text-xs font-medium", currentStep >= idx ? "text-foreground" : "text-muted-foreground")}>
              {step.title}
            </span>
            {idx < STEPS.length - 1 && (
               <div className={cn(
                 "absolute left-1/2 top-5 w-full h-0.5 -z-10",
                 currentStep > idx ? "bg-primary" : "bg-muted"
               )} />
            )}
          </div>
        ))}
      </div>

      <Card className="border-none shadow-xl bg-card/60 backdrop-blur-xl ring-1 ring-white/20">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            {currentStep === 0 && "Select or Register Patient"}
            {currentStep === 1 && "Facility Selection"}
            {currentStep === 2 && "Clinical Details"}
            {currentStep === 3 && "Confirm Referral"}
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-100">
          {currentStep === 0 && (
             <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <div className="space-y-4">
                 <Label>Select Existing Patient</Label>
                 <Select 
                    disabled={isLoadingPatients}
                    value={formik.values.patientId} 
                    onValueChange={(val) => formik.setFieldValue("patientId", val)}
                 >
                   <SelectTrigger className="bg-background/50 border-none ring-1 ring-border/50 h-12">
                     <SelectValue placeholder={isLoadingPatients ? "Loading patients..." : "Search patients..."} />
                   </SelectTrigger>
                   <SelectContent>
                     {patients?.length === 0 && !isLoadingPatients && (
                       <div className="p-4 text-sm text-muted-foreground text-center">No registered patients found.</div>
                     )}
                     {patients?.map(p => (
                       <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.nationalId})</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
                 <FormError message={formik.touched.patientId && formik.errors.patientId} />
               </div>
               
               <div className="relative py-4">
                 <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-dashed" /></div>
                 <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or Register New</span></div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>First Name</Label>
                   <Input 
                      name="newPatient.firstName"
                      disabled={!!formik.values.patientId} 
                      placeholder="e.g. John" 
                      className="bg-background/50 border-none ring-1 ring-border/50"
                      value={formik.values.newPatient.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                   />
                   <FormError message={formik.touched.newPatient?.firstName && (formik.errors.newPatient as any)?.firstName} />
                 </div>
                 <div className="space-y-2">
                   <Label>Last Name</Label>
                   <Input 
                      name="newPatient.lastName"
                      disabled={!!formik.values.patientId} 
                      placeholder="e.g. Doe" 
                      className="bg-background/50 border-none ring-1 ring-border/50"
                      value={formik.values.newPatient.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                   />
                   <FormError message={formik.touched.newPatient?.lastName && (formik.errors.newPatient as any)?.lastName} />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>National ID</Label>
                    <Input 
                      name="newPatient.nationalId"
                      disabled={!!formik.values.patientId} 
                      placeholder="12345678..." 
                      className="bg-background/50 border-none ring-1 ring-border/50"
                      value={formik.values.newPatient.nationalId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <FormError message={formik.touched.newPatient?.nationalId && (formik.errors.newPatient as any)?.nationalId} />
                 </div>
                 <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input 
                      name="newPatient.dateOfBirth"
                      type="date"
                      disabled={!!formik.values.patientId} 
                      className="bg-background/50 border-none ring-1 ring-border/50"
                      value={formik.values.newPatient.dateOfBirth}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <FormError message={formik.touched.newPatient?.dateOfBirth && (formik.errors.newPatient as any)?.dateOfBirth} />
                 </div>
               </div>
             </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              {/* Referring Hospital (Only for SysAdmins without an assigned facility) */}
              {!user?.hospitalId && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-primary/80 uppercase tracking-wider">Referring Hospital (Source)</Label>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Admin Action Required</Badge>
                  </div>
                  <Select 
                    value={formik.values.referringHospitalId} 
                    onValueChange={(val) => formik.setFieldValue("referringHospitalId", val)}
                  >
                    <SelectTrigger className="bg-background/50 border-none ring-1 ring-border/50 h-12">
                      <SelectValue placeholder="Select the source hospital..." />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitals?.map(hospital => (
                        <SelectItem key={hospital.id} value={hospital.id}>{hospital.name} ({hospital.location})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormError message={formik.touched.referringHospitalId && formik.errors.referringHospitalId} />
                </div>
              )}

              <div className="space-y-4">
                 <Label className="text-sm font-semibold text-primary/80 uppercase tracking-wider">Receiving Hospital (Destination)</Label>
                 <div className="grid gap-4">
                    {hospitals?.filter(h => h.id !== formik.values.referringHospitalId).map(hospital => (
                      <div 
                        key={hospital.id} 
                        onClick={() => formik.setFieldValue("receivingHospitalId", hospital.id)}
                        className={cn(
                          "cursor-pointer p-4 rounded-xl border-2 transition-all flex justify-between items-center",
                          formik.values.receivingHospitalId === hospital.id ? "border-primary bg-primary/5 shadow-inner" : "border-transparent bg-muted/30 hover:bg-muted/50"
                        )}
                      >
                         <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center text-primary border shadow-sm">
                             <HospitalIcon className="h-5 w-5" />
                           </div>
                           <div className="flex flex-col">
                             <span className="font-semibold text-foreground">{hospital.name}</span>
                             <span className="text-xs text-muted-foreground">{hospital.level.replace("_", " ")} · {hospital.location}</span>
                           </div>
                         </div>
                         {formik.values.receivingHospitalId === hospital.id && <ClipboardCheck className="h-5 w-5 text-primary" />}
                      </div>
                    ))}
                 </div>
                 <FormError message={formik.touched.receivingHospitalId && formik.errors.receivingHospitalId} />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid gap-6 animate-in slide-in-from-right-4 duration-300">
               <div className="space-y-4">
                 <Label>Referral Urgency</Label>
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => formik.setFieldValue("urgency", "ROUTINE")}
                      className={cn(
                        "p-4 rounded-xl border flex flex-col items-center gap-2",
                        formik.values.urgency === "ROUTINE" ? "border-primary bg-primary/5" : "border-border"
                      )}
                    >
                       <span className="text-sm font-semibold">Routine</span>
                    </button>
                    <button 
                       type="button"
                      onClick={() => formik.setFieldValue("urgency", "EMERGENCY")}
                      className={cn(
                        "p-4 rounded-xl border flex flex-col items-center gap-2",
                        formik.values.urgency === "EMERGENCY" ? "border-destructive/50 bg-destructive/5 text-destructive" : "border-border"
                      )}
                    >
                       <AlertCircle className={formik.values.urgency === "EMERGENCY" ? "animate-pulse" : ""} />
                       <span className="text-sm font-semibold">Emergency</span>
                    </button>
                 </div>
                 <FormError message={formik.touched.urgency && formik.errors.urgency} />
               </div>

               <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Diagnosis</Label>
                    <Input 
                      name="diagnosis"
                      placeholder="Primary diagnosis..." 
                      className="bg-background/50 border-none ring-1 ring-border/50"
                      value={formik.values.diagnosis}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <FormError message={formik.touched.diagnosis && formik.errors.diagnosis} />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason for Transfer</Label>
                    <Textarea 
                      name="reasonForTransfer"
                      placeholder="Describe why the patient needs transfer (e.g. ICU required, specialized surgery)..." 
                      className="bg-background/50 border-none ring-1 ring-border/50 min-h-25"
                      value={formik.values.reasonForTransfer}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <FormError message={formik.touched.reasonForTransfer && formik.errors.reasonForTransfer} />
                  </div>
               </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Patient & Facility</h3>
                    <div className="space-y-2">
                       <div className="text-sm border-b pb-2 flex justify-between">
                         <span className="text-muted-foreground">Patient:</span>
                         <span className="font-medium text-right ml-2">{formik.values.patientId ? "Existing Selected" : `${formik.values.newPatient.firstName} ${formik.values.newPatient.lastName}`}</span>
                       </div>
                       <div className="text-sm border-b pb-2 flex justify-between">
                         <span className="text-muted-foreground">Source Hospital:</span>
                         <span className="font-medium text-right ml-2">{hospitals?.find(h => h.id === formik.values.referringHospitalId)?.name || "Not Selected"}</span>
                       </div>
                       <div className="text-sm border-b pb-2 flex justify-between">
                         <span className="text-muted-foreground">Destination:</span>
                         <span className="font-medium text-right ml-2">{hospitals?.find(h => h.id === formik.values.receivingHospitalId)?.name || "Not Selected"}</span>
                       </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Clinical</h3>
                    <div className="space-y-2">
                       <div className="text-sm border-b pb-2 flex justify-between">
                         <span className="text-muted-foreground">Urgency:</span>
                         <Badge variant={formik.values.urgency === "EMERGENCY" ? "destructive" : "secondary"}>{formik.values.urgency}</Badge>
                       </div>
                       <div className="text-sm border-b pb-2 flex justify-between gap-10">
                         <span className="text-muted-foreground">Diagnosis:</span>
                         <span className="font-medium text-right truncate max-w-40">{formik.values.diagnosis}</span>
                       </div>
                    </div>
                  </div>
               </div>
               <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800">
                 <AlertCircle className="h-5 w-5 shrink-0" />
                 <p className="text-sm leading-relaxed">
                   Confirm that all clinical data is accurate. Upon submission, a real-time notification will be sent to the receiving facility's focal person.
                 </p>
               </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6 mt-6">
          <Button 
            variant="ghost" 
            onClick={prevStep} 
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={nextStep} className="gap-2 px-8 shadow-lg">
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={() => formik.handleSubmit()} 
              disabled={formik.isSubmitting} 
              className="gap-2 px-8 bg-primary shadow-lg shadow-primary/30"
            >
              {formik.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
              Submit Referral
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(" ");
}
