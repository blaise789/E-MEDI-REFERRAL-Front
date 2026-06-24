import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ReferralLogo } from "@/components/referral-logo"
import {
  Hospital,
  Ambulance,
  ClipboardList,
  Users,
  BarChart3,
  Shield,
  Bell,
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  HeartPulse,
  BedDouble,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <ReferralLogo className="h-10 w-auto" />
          <nav className="flex items-center gap-3">
            <Link href="/login">
              <Button size="sm">Staff Login</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b bg-linear-to-br from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left – copy */}
            <div className="flex flex-col justify-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm font-medium w-fit">
                <Sparkles className="h-4 w-4 text-primary" />
                Rwanda's Digital Health Referral Platform
              </div>

              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Fast, Accurate &nbsp;
                <span className="text-primary">Patient Transfers</span>{" "}
                Across Rwanda
              </h1>

              <p className="text-pretty text-lg text-muted-foreground md:text-xl">
                MediRefer connects district and referral hospitals in real-time.
                Track bed capacity, specialist availability, and patient transfer
                status — all in one secure platform designed for Rwandan
                healthcare facilities.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/login">
                  <Button size="lg" className="gap-2">
                    Access Staff Portal
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>INHSRG 2020 Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>Real-Time Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>Rwanda-Optimized</span>
                </div>
              </div>
            </div>

            {/* Right – image + stat badge */}
            <div className="relative">
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl border bg-muted shadow-2xl">
                <Image
                  src="/specialist.avif"
                  alt="Medical specialist reviewing a patient referral"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* floating stat */}
              <div className="absolute -bottom-6 -left-6 rounded-xl border bg-background p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <HeartPulse className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">98%</p>
                    <p className="text-sm text-muted-foreground">Transfer Success Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="border-b py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Everything a Hospital Network Needs
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Comprehensive tools for clinicians, hospital admins, and system administrators
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ClipboardList,
                title: "Patient Referrals",
                desc: "Create and track routine or emergency patient transfers between hospitals.",
              },
              {
                icon: BedDouble,
                title: "Bed Capacity",
                desc: "Real-time view of available beds across ICU, Maternity, Surgical, and other wards.",
              },
              {
                icon: Stethoscope,
                title: "Specialist Availability",
                desc: "Know instantly which specialists are available, in theatre, or on call.",
              },
              {
                icon: Hospital,
                title: "Hospital Directory",
                desc: "Manage district and referral hospital profiles, levels, and contact details.",
              },
              {
                icon: Ambulance,
                title: "Transfer Tracking",
                desc: "Follow every referral from submission through transit to admission.",
              },
              {
                icon: Bell,
                title: "Instant Notifications",
                desc: "Staff receive real-time alerts on accepted, rejected, or updated referrals.",
              },
              {
                icon: Shield,
                title: "Role-Based Access",
                desc: "Secure permissions for Clinicians, Focal Persons, Hospital Admins, and System Admins.",
              },
              {
                icon: BarChart3,
                title: "Audit & Reports",
                desc: "Full audit logs and analytics on referral patterns, outcomes, and capacity trends.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <Card
                key={title}
                className="border-2 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES SECTION ── */}
      <section className="border-b py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Built for Every Role in the System
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Each user type has a tailored experience
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                role: "Clinician",
                desc: "Initiate referrals, document diagnoses, and pre-transfer treatment for patients.",
                color: "bg-primary/10 text-primary",
              },
              {
                role: "Focal Person",
                desc: "Monitor incoming referrals, manage bed assignments, and coordinate transfers.",
                color: "bg-success/10 text-success",
              },
              {
                role: "Hospital Admin",
                desc: "Manage ward capacity, specialist rosters, and hospital-level configurations.",
                color: "bg-warning/10 text-warning",
              },
              {
                role: "System Admin",
                desc: "Oversee all hospitals, users, audit logs, and system-wide settings.",
                color: "bg-destructive/10 text-destructive",
              },
            ].map(({ role, desc, color }) => (
              <div
                key={role}
                className="rounded-xl border p-6 transition-all hover:shadow-md"
              >
                <div className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${color}`}>
                  {role}
                </div>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-b bg-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Modernize Patient Transfers?
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Join hospitals across Rwanda using MediRefer for faster, safer referral management
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="gap-2">
                  Access Staff Portal
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <ReferralLogo className="h-8 w-auto" />
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span>Kigali, Rwanda</span>
              <span>© 2026 MediRefer. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
