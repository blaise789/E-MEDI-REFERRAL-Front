/** @format */
"use client";

import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateUserMutation } from "@/store/features/user/userSlice";
import { useGetHospitalsQuery } from "@/store/features/hospital/hospitalSlice";
import { useAuth } from "@/lib/auth-context";
import { Role } from "@/lib/types";
import { Loader2, UserPlus, Eye, EyeOff } from "lucide-react";
import { FormError } from "../ui/form-error";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const [createUser] = useCreateUserMutation();
  const { data: hospitals } = useGetHospitalsQuery();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "CLINICIAN" as Role,
      hospitalId: currentUser?.hospitalId || "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      email: Yup.string().email("Invalid email address").required("Email is required"),
      password: Yup.string().min(8, "Must be at least 8 characters").required("Password is required"),
      role: Yup.string().required("Role is required"),
      hospitalId: Yup.string().when("role", {
        is: (role: string) => role !== "SYS_ADMIN",
        then: (schema) => schema.required("Hospital assignment is required for this role"),
      }),
    }),
    onSubmit: async (values) => {
      try {
        await createUser({
          ...values,
          hospitalId: values.role === "SYS_ADMIN" ? undefined : values.hospitalId,
        }).unwrap();
        
        toast({
          title: "User created",
          description: `Successfully added ${values.firstName} to the system.`,
        });
        onOpenChange(false);
        formik.resetForm();
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Creation failed",
          description: err.data?.message || "Check your input and try again.",
        });
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 border-none shadow-2xl bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <UserPlus className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight">Add New Staff Member</DialogTitle>
          <DialogDescription>
            Register a new clinician or administrator. They will be able to log in immediately with the provided credentials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                {...formik.getFieldProps("firstName")}
                className="bg-background/50"
              />
              <FormError message={formik.touched.firstName && formik.errors.firstName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...formik.getFieldProps("lastName")}
                className="bg-background/50"
              />
              <FormError message={formik.touched.lastName && formik.errors.lastName} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@hospital.rw"
              {...formik.getFieldProps("email")}
              className="bg-background/50"
            />
            <FormError message={formik.touched.email && formik.errors.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Temporary Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                {...formik.getFieldProps("password")}
                className="bg-background/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FormError message={formik.touched.password && formik.errors.password} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>System Role</Label>
              <Select
                onValueChange={(val) => formik.setFieldValue("role", val)}
                defaultValue={formik.values.role}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLINICIAN">Clinician</SelectItem>
                  <SelectItem value="FOCAL_PERSON">Focal Person</SelectItem>
                  <SelectItem value="HOSPITAL_ADMIN">Hospital Admin</SelectItem>
                  {currentUser?.role === "SYS_ADMIN" && (
                    <SelectItem value="SYS_ADMIN">System Admin</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assigned Facility</Label>
              <Select
                disabled={formik.values.role === "SYS_ADMIN" || currentUser?.role === "HOSPITAL_ADMIN"}
                onValueChange={(val) => formik.setFieldValue("hospitalId", val)}
                value={formik.values.hospitalId}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  {hospitals?.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormError message={formik.touched.hospitalId && formik.errors.hospitalId} />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={formik.isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={formik.isSubmitting} className="min-w-32">
              {formik.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
