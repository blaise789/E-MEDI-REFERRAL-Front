"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InnSyncLogo } from "@/components/inn-sync-logo"
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthService } from "@/lib/services/auth-service"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    await AuthService.requestPasswordReset(email);
    setIsSubmitted(true);
  } catch (err) {
    alert("Email not found or error occurred.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden bg-primary lg:block">
        <div className="absolute inset-0">
          <img
            src="/luxury-hotel-lobby-modern-rwanda-reception.jpg"
            alt="Luxury hotel lobby"
            className="h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70" />
        </div>
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link href="/" className="inline-flex">
            <InnSyncLogo className="h-10 w-auto text-primary-foreground" />
          </Link>
          <div className="space-y-4">
            <h1 className="text-balance text-4xl font-bold leading-tight">Secure Password Recovery</h1>
            <p className="text-pretty text-lg text-primary-foreground/90">
              We'll help you regain access to your account securely. Enter your email and we'll send you reset
              instructions.
            </p>
          </div>
          <div className="text-sm text-primary-foreground/80">© 2026 INN-SYNC Ltd. All rights reserved.</div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-4 lg:hidden">
            <Link href="/">
              <InnSyncLogo className="h-10 w-auto" />
            </Link>
          </div>

          {isSubmitted ? (
            <>
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="rounded-full bg-success/10 p-4">
                    <CheckCircle className="h-12 w-12 text-success" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">Check Your Email</h2>
                  <p className="text-muted-foreground">
                    We've sent password reset instructions to <strong className="text-foreground">{email}</strong>
                  </p>
                </div>
                <Alert>
                  <AlertDescription className="text-sm text-balance">
                    If you don't receive an email within 5 minutes, check your spam folder or contact support.
                  </AlertDescription>
                </Alert>
                <Button asChild className="w-full h-12 bg-transparent" variant="outline">
                  <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>

              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Reset Password</h2>
                <p className="text-muted-foreground">
                  Enter your email address and we'll send you instructions to reset your password
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@hotel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <Button type="submit" className="h-12 w-full text-base" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Instructions"
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                Need help?{" "}
                <a href="tel:0788283362" className="font-medium text-primary hover:underline">
                  Contact Support: 0788 283 362
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
