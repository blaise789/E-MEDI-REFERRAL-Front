"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InnSyncLogo } from "@/components/inn-sync-logo"
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { AuthService } from "@/lib/services/auth-service"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    await AuthService.resetPassword({ token, newPassword: formData.password });
    setIsSuccess(true);
  } catch (err) {
    alert("Invalid or expired token.");
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
            <h1 className="text-balance text-4xl font-bold leading-tight">Create a Secure New Password</h1>
            <p className="text-pretty text-lg text-primary-foreground/90">
              Choose a strong password to protect your account and keep your hotel operations secure.
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

          {isSuccess ? (
            <>
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="rounded-full bg-success/10 p-4">
                    <CheckCircle2 className="h-12 w-12 text-success" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">Password Reset Successful</h2>
                  <p className="text-muted-foreground">
                    Your password has been successfully reset. You can now sign in with your new password.
                  </p>
                </div>
                <Button asChild className="w-full h-12 text-base">
                  <Link href="/login">Continue to Login</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Create New Password</h2>
                <p className="text-muted-foreground">Enter a strong password to secure your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={8}
                        className="h-12 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        className="h-12 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="h-12 w-full text-base" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
