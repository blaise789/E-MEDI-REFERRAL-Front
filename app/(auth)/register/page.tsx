"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast"
import { ReferralLogo } from "@/components/referral-logo";
import { useRegisterMutation } from "@/store/features/auth/authSlice";
import { Loader2, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast()
  const [register, { isLoading }] = useRegisterMutation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    gender: "MALE", 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData).unwrap();
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: error.data?.message || error.message || "Failed to register",
      });
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden bg-primary lg:flex flex-col justify-between p-12 text-primary-foreground overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-15 -right-15 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative inline-flex">
          <ReferralLogo className="h-10 w-auto text-primary-foreground [&_text]:fill-primary-foreground [&_circle]:fill-primary-foreground/30 [&_rect]:fill-primary-foreground" />
        </Link>

        {/* Center content */}
        <div className="relative space-y-6">
          <h1 className="text-balance text-4xl font-bold leading-tight">
            Join the MediRefer Network
          </h1>
          <p className="text-pretty text-lg text-primary-foreground/90">
            Empower patient healthcare with real-time transfer coordination.
          </p>
        </div>

        <div className="relative text-sm text-primary-foreground/70">
          © 2026 MediRefer
        </div>
      </div>

      
      <div className="flex items-center justify-center p-6 sm:p-12">
        
        <div className="w-full max-w-md space-y-8">
            <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
            <p className="text-muted-foreground">Enter your details to register as staff</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input required onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input required onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input type="tel" placeholder="+250..." onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>

            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Register"}
            </Button>
          </form>
          
          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}