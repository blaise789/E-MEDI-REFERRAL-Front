/** @format */
"use client";

import React from "react";
import { useGetProfileQuery } from "@/store/features/auth/authSlice";
import { 
  User, 
  Mail, 
  Building2, 
  ShieldCheck, 
  Calendar, 
  Phone,
  MapPin,
  Stethoscope,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HOSPITAL_LEVEL_LABELS } from "@/lib/types";

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetProfileQuery();

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    SYS_ADMIN: "bg-red-500/10 text-red-500 border-red-500/20",
    HOSPITAL_ADMIN: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    CLINICIAN: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    FOCAL_PERSON: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-700">
      {/* Header / Hero Section */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 bg-card/40 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl">
          <div className="h-32 w-32 rounded-3xl bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-4xl font-bold shadow-2xl transform transition hover:scale-105 duration-300">
            {profile?.firstName[0]}
            {profile?.lastName[0]}
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-4xl font-extrabold tracking-tight">
                {profile?.firstName} {profile?.lastName}
              </h1>
              <div className="flex gap-2 mx-auto md:mx-0">
                <Badge className={`px-3 py-1 text-xs font-medium border ${roleColors[profile?.role || ""]}`}>
                  {profile?.role.replace("_", " ")}
                </Badge>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Active
                </div>
              </div>
            </div>
            <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
              <Mail className="h-4 w-4" />
              {profile?.email}
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1 border border-primary/20">VERIFIED</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Account Details */}
        <Card className="bg-card/40 backdrop-blur-md border-white/10 shadow-lg overflow-hidden group">
          <CardHeader className="border-b border-white/5 space-y-1 bg-white/5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Account Security
            </CardTitle>
            <CardDescription>Internal system identification and metadata</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-emerald-500/10">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Platform Access</p>
                  <p className="text-sm font-bold text-emerald-500">Authorized & Synchronized</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Member Since</p>
                  <p className="text-sm font-medium">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {profile?.telephone && (
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Contact</p>
                    <p className="text-sm font-medium">{profile?.telephone}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hospital Assignment */}
        <Card className="bg-card/40 backdrop-blur-md border-white/10 shadow-lg overflow-hidden group">
          <CardHeader className="border-b border-white/5 space-y-1 bg-white/5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-secondary" />
              Professional Assignment
            </CardTitle>
            <CardDescription>Your current institutional facility mapping</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {profile?.hospital ? (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-secondary/10">
                      <Stethoscope className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Facility Name</p>
                      <p className="text-sm font-bold text-primary">{profile.hospital.name}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-secondary/10">
                      <ShieldCheck className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Facility Level</p>
                      <Badge variant="outline" className="mt-1">
                        {HOSPITAL_LEVEL_LABELS[profile.hospital.level] || profile.hospital.level}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-secondary/10">
                      <MapPin className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Location / Province</p>
                      <p className="text-sm font-medium">{profile.hospital.location}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-10 space-y-4 text-center">
                <div className="p-4 rounded-full bg-muted/20">
                  <Building2 className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="font-bold text-muted-foreground uppercase tracking-wider">Unassigned</p>
                  <p className="text-sm text-muted-foreground/60 max-w-50">You are currently not assigned to a specific hospital facility.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
