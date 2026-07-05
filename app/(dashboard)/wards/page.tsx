"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BedDouble,
  Plus,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Settings2,
  ArrowRightLeft,
  ShieldAlert,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetHospitalsQuery,
  useUpdateWardOccupancyMutation,
  useAddWardMutation,
  useRecalibrateWardMutation,
} from "@/store/features/hospital/hospitalSlice";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/lib/socket-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BedCapacityPage() {
  const { data: hospitals, isLoading, refetch } = useGetHospitalsQuery();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isConnected } = useSocket();
  console.log(isConnected)

  const [updateCapacity, { isLoading: isUpdating }] = useUpdateWardOccupancyMutation();
  const [addWard, { isLoading: isAdding }] = useAddWardMutation();
  const [recalibrate, { isLoading: isRecalibrating }] = useRecalibrateWardMutation();

  const myHospitalId = user?.hospitalId;
  const isHospitalStaff = user?.role !== "SYS_ADMIN";

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newWard, setNewWard] = useState({
    name: "General Ward",
    totalBeds: 10,
  });

  const allBeds =
    hospitals?.flatMap((h) => {
      if (isHospitalStaff && h.id !== myHospitalId) return [];
      return h.wards?.map((b: any) => ({ ...b, hospitalName: h.name })) || [];
    }) || [];

  const handleUpdate = async (
    bedId: string,
    current: number,
    delta: number,
    total: number,
  ) => {
    const newValue = Math.min(total, Math.max(0, current + delta));
    try {
      await updateCapacity({
        bedId,
        data: { occupiedBeds: newValue },
      }).unwrap();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.data?.message || "You might not have permission.",
      });
    }
  };

  const handleAddWard = async () => {
    if (!myHospitalId) return;
    try {
      await addWard({ hospitalId: myHospitalId, data: newWard }).unwrap();
      toast({
        title: "Ward Registered",
        description: "New ward configuration added successfully.",
      });
      setIsAddModalOpen(false);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: err.data?.message || "Failed to register new ward.",
      });
    }
  };



  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title={isHospitalStaff ? "Facility Capacity" : "Live Bed Capacity"}
        description={
          isHospitalStaff
            ? "Manage your ward occupancy levels and coordinate intake availability."
            : "Real-time occupancy monitoring across the national clinical network."
        }
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border text-[11px] font-medium">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500",
              )}
            />
            {isConnected ? "LIVE NETWORK ACTIVE" : "OFFLINE - RECONNECTING..."}
          </div>

          <div className="flex gap-2">
            {isHospitalStaff && (
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="gap-2 shadow-lg"
                  >
                    <Plus className="h-4 w-4" />
                    Add Ward
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Register New Ward</DialogTitle>
                  </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Ward Name</Label>
                        <Input
                          value={newWard.name}
                          onChange={(e) => setNewWard({ ...newWard, name: e.target.value })}
                          placeholder="e.g. ICU A"
                          className="h-12 bg-muted/50 border-none ring-1 ring-border/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Total Bed Count</Label>
                        <Input
                          type="number"
                          value={newWard.totalBeds}
                          onChange={(e) =>
                            setNewWard({
                              ...newWard,
                              totalBeds: parseInt(e.target.value),
                            })
                          }
                          className="h-12 bg-muted/50 border-none ring-1 ring-border/50"
                        />
                      </div>
                    </div>
                  <DialogFooter>
                    <Button
                      variant="ghost"
                      onClick={() => setIsAddModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddWard} disabled={isAdding || !newWard.name}>
                      {isAdding ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Confirm Ward
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4 text-primary" />
              Sync
            </Button>
          </div>
        </div>
      </PageHeader>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Active Wards"
          value={allBeds.length}
          sub="Reporting live data"
        />
        <SummaryCard
          title="Avg. Occupancy"
          value={`${Math.round((allBeds.reduce((acc, b) => acc + b.occupiedBeds / b.totalBeds, 0) / (allBeds.length || 1)) * 100)}%`}
          sub="Balanced load"
        />
        <SummaryCard
          title="Critical (ICU)"
          value={allBeds
            .filter((b: any) => b.name?.includes("ICU"))
            .reduce((acc, b) => acc + (b.totalBeds - b.occupiedBeds), 0)}
          sub="Available ICU beds"
          variant="warning"
        />
        <SummaryCard
          title="Total Capacity"
          value={allBeds.reduce((acc, b) => acc + b.totalBeds, 0)}
          sub="Physical bed count"
        />
      </div>

      <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            {isHospitalStaff
              ? "My Facility Capacity"
              : "National Capacity Board"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-60">Facility / Ward</TableHead>
                <TableHead>Occupancy (%)</TableHead>
                <TableHead>Available / Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell
                      colSpan={4}
                      className="h-12 animate-pulse bg-muted/50"
                    />
                  </TableRow>
                ))
              ) : allBeds.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-48 text-center text-muted-foreground font-medium"
                  >
                    No active wards reported. Register your first ward above.
                  </TableCell>
                </TableRow>
              ) : (
                allBeds.map((bed) => {
                  const occupancyRate = Math.round(
                    (bed.occupiedBeds / bed.totalBeds) * 100,
                  );
                  const available = bed.totalBeds - bed.occupiedBeds;

                  return (
                    <TableRow
                      key={bed.id}
                      className="group hover:bg-muted/10 transition-colors"
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-primary mb-1">
                            {bed.hospitalName}
                          </span>
                          <div className="flex items-center gap-2">
                            <BedDouble className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">
                              {bed.name}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="w-64">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold text-muted-foreground mr-10">
                            <span>{occupancyRate}%</span>
                          </div>
                          <Progress
                            value={occupancyRate}
                            className={cn(
                              "h-1.5 w-40",
                              occupancyRate > 90
                                ? "[&>div]:bg-destructive"
                                : occupancyRate > 70
                                  ? "[&>div]:bg-amber-500"
                                  : "[&>div]:bg-emerald-500",
                            )}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-baseline gap-1">
                          <span
                            className={cn(
                              "text-lg font-bold",
                              available === 0
                                ? "text-destructive"
                                : available < 3
                                  ? "text-amber-600"
                                  : "text-emerald-600",
                            )}
                          >
                            {available}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            / {bed.totalBeds}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {isHospitalStaff ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full hover:bg-rose-50 hover:text-rose-600 border-none bg-muted/40"
                              onClick={() =>
                                handleUpdate(
                                  bed.id,
                                  bed.occupiedBeds,
                                  1,
                                  bed.totalBeds,
                                )
                              }
                              disabled={
                                isUpdating || bed.occupiedBeds === bed.totalBeds
                              }
                            >
                              +
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full hover:bg-emerald-50 hover:text-emerald-600 border-none bg-muted/40"
                              onClick={() =>
                                handleUpdate(
                                  bed.id,
                                  bed.occupiedBeds,
                                  -1,
                                  bed.totalBeds,
                                )
                              }
                              disabled={isUpdating || bed.occupiedBeds === 0}
                            >
                              -
                            </Button>

                            {(user?.role === "HOSPITAL_ADMIN" ||
                              user?.role === "SYS_ADMIN") && (
                              <RecalibrateDialog
                                bed={bed}
                                onRecalibrate={(val) =>
                                  recalibrate({
                                    bedId: bed.id,
                                    data: { occupiedBeds: val },
                                  }).unwrap()
                                }
                              />
                            )}

                            <StatusChip occupancy={occupancyRate} />
                          </div>
                        ) : (
                          <StatusChip occupancy={occupancyRate} />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ title, value, sub, variant }: any) {
  return (
    <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm ring-1 ring-white/10">
      <CardContent className="p-6">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {title}
        </p>
        <h3
          className={cn(
            "text-2xl font-bold mt-2",
            variant === "warning" ? "text-amber-600" : "text-foreground",
          )}
        >
          {value}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

function RecalibrateDialog({ bed, onRecalibrate }: { bed: any, onRecalibrate: (val: number) => Promise<any> }) {
  const [value, setValue] = useState(bed.occupiedBeds);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onRecalibrate(value);
      setOpen(false);
    } catch (e: any) {
      // Error handled by parent toast usually
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px] gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
          <Settings2 className="h-3 w-3" />
          Recalibrate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Administrative Overload</DialogTitle>
          <DialogDescription>
            Manually force the occupied bed count for <strong>{bed.name}</strong>.
            Use this only to resolve discrepancies between data and reality.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-dashed">
             <div className="space-y-0.5">
               <Label className="text-xs text-muted-foreground">Current Digital Count</Label>
               <p className="text-xl font-black">{bed.occupiedBeds} / {bed.totalBeds}</p>
             </div>
             <ArrowRightLeft className="h-5 w-5 text-muted-foreground opacity-30" />
             <div className="space-y-0.5 text-right">
               <Label className="text-xs text-muted-foreground">New Override</Label>
               <p className="text-xl font-black text-primary">{value} / {bed.totalBeds}</p>
             </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupancy">Actual Occupied Beds</Label>
            <Input 
              id="occupancy" 
              type="number" 
              min={0} 
              max={bed.totalBeds} 
              value={value} 
              onChange={(e) => setValue(parseInt(e.target.value) || 0)}
              className="h-12 text-lg font-bold"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
            Force Sync
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusChip({ occupancy }: { occupancy: number }) {
  if (occupancy >= 95)
    return (
      <Badge
        variant="destructive"
        className="text-[9px] h-5 animate-pulse uppercase"
      >
        FULL
      </Badge>
    );
  if (occupancy >= 80)
    return (
      <Badge
        variant="outline"
        className="text-[9px] h-5 border-amber-500 text-amber-600 bg-amber-50 uppercase"
      >
        HIGH
      </Badge>
    );
  return (
    <Badge
      variant="outline"
      className="text-[9px] h-5 border-emerald-500 text-emerald-600 bg-emerald-50 uppercase"
    >
      AVAIL
    </Badge>
  );
}

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(" ");
}
