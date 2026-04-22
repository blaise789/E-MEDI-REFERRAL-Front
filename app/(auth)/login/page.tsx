"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ReferralLogo } from "@/components/referral-logo";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── LEFT PANEL – branding ── */}
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
            Digital Referral &amp; Transfer Management
          </h1>
          <p className="text-pretty text-lg text-primary-foreground/90">
            Connecting district and referral hospitals across Rwanda for faster,
            safer patient transfers — in real-time.
          </p>

        </div>

        <div className="relative text-sm text-primary-foreground/70">
          © 2026 MediRefer · Ministry of Health, Rwanda
        </div>
      </div>

      {/* ── RIGHT PANEL – form ── */}
      <div className="flex items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-4 lg:hidden">
            <Link href="/">
              <ReferralLogo className="h-10 w-auto" />
            </Link>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Staff Login</h2>
            <p className="text-muted-foreground">
              Enter your credentials to access the referral portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="clinician@hospital.rw"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    className="h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="h-12 w-full text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>



          <div className="text-center text-sm text-muted-foreground">
            Need help?{" "}
            <a
              href="tel:+250788000000"
              className="font-medium text-primary hover:underline"
            >
              Contact IT Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
