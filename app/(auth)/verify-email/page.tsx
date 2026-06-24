"use client"

import type React from "react"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ReferralLogo } from "@/components/referral-logo"
import { useVerifyEmailMutation, useResendEmailCodeMutation } from "@/store/features/auth/authSlice"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

function VerifyEmailForm() {
  const [otp, setOtp] = useState("")
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation()
  const [resendEmailCode, { isLoading: isResending }] = useResendEmailCodeMutation()
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const email = searchParams.get("email") || "your email"

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (otp.length < 6) return

    try {
      await verifyEmail(otp).unwrap()
      toast({
        title: "Account Verified",
        description: "Your email has been verified successfully. Please login.",
      })
      router.push("/login")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.data?.message || error.message || "Invalid or expired code.",
      })
    }
  }

  const handleResendCode = async () => {
    try {
      await resendEmailCode(email).unwrap()
      toast({
        title: "Code Sent",
        description: "A new verification code has been sent to your email.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.data?.message || "Could not resend code. Try again later.",
      })
    }
  }

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
            Secure Account Verification
          </h1>
          <p className="text-pretty text-lg text-primary-foreground/90">
            Gain secure access to the MediRefer portal. Enter the code sent to your email to complete registration.
          </p>
        </div>

        <div className="relative text-sm text-primary-foreground/70">
          © 2026 MediRefer
        </div>
      </div>

      <div className="flex items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-4 lg:hidden">
            <Link href="/">
              <ReferralLogo className="h-10 w-auto" />
            </Link>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Verify Your Email</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              To ensure your security, please enter the One-Time Code (OTP) sent to <strong className="text-foreground">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP 
                maxLength={6} 
                value={otp} 
                onChange={(value) => setOtp(value)}
                onComplete={() => handleVerify()}
              >
                <InputOTPGroup className="gap-2 sm:gap-4">
                  <InputOTPSlot index={0} className="h-12 w-12 sm:h-14 sm:w-14 text-xl border-2" />
                  <InputOTPSlot index={1} className="h-12 w-12 sm:h-14 sm:w-14 text-xl border-2" />
                  <InputOTPSlot index={2} className="h-12 w-12 sm:h-14 sm:w-14 text-xl border-2" />
                  <InputOTPSlot index={3} className="h-12 w-12 sm:h-14 sm:w-14 text-xl border-2" />
                  <InputOTPSlot index={4} className="h-12 w-12 sm:h-14 sm:w-14 text-xl border-2" />
                  <InputOTPSlot index={5} className="h-12 w-12 sm:h-14 sm:w-14 text-xl border-2" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button type="submit" className="h-12 w-full text-base" disabled={isLoading || otp.length < 6}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>

          <div className="flex flex-col items-center gap-4 text-center">
            <button
              onClick={handleResendCode}
              disabled={isResending}
              className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
            >
              {isResending ? "Resending..." : "Resend Code"}
            </button>

            <div className="text-sm text-muted-foreground">
              Need help?{" "}
              <a href="tel:0788283362" className="font-medium text-primary hover:underline">
                Contact Support: 0788 283 362
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}