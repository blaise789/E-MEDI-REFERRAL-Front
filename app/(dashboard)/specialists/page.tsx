"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Search,
  User,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  Plus,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Edit2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useGetHospitalsQuery,
  useUpdateSpecialistStatusMutation,
  useAddSpecialistMutation,
  useUpdateSpecialistMutation,
} from "@/store/features/hospital/hospitalSlice";
import { SpecialistStatus } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const getComputedStatus = (specialist: any) => {
  if (specialist.status === "UNAVAILABLE") return "UNAVAILABLE";
  if (!specialist.workingDays || specialist.workingDays.length === 0)
    return specialist.status;

  const now = new Date();
  const days = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  const dayString = days[now.getDay()];

  if (!specialist.workingDays.includes(dayString)) return "OFF_SHIFT";

  if (specialist.shiftStartTime && specialist.shiftEndTime) {
    const currentHour =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");
    if (
      currentHour >= specialist.shiftStartTime &&
      currentHour <= specialist.shiftEndTime
    ) {
      return "ON_SHIFT";
    } else {
      return "OFF_SHIFT";
    }
  }

  return "ON_SHIFT";
};

export default function SpecialistsPage() {
  const { data: hospitals, isLoading, refetch } = useGetHospitalsQuery();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateSpecialistStatusMutation();
  const [addSpecialist, { isLoading: isAdding }] = useAddSpecialistMutation();
  const [updateSpecialist, { isLoading: isEditing }] =
    useUpdateSpecialistMutation();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSpecialist, setNewSpecialist] = useState<{
    firstName: string;
    lastName: string;
    discipline: string;
    wardId: string;
    shiftStartTime: string;
    shiftEndTime: string;
    workingDays: string[];
  }>({
    firstName: "",
    lastName: "",
    discipline: "",
    wardId: "",
    shiftStartTime: "08:00",
    shiftEndTime: "17:00",
    workingDays: [],
  });

  const DAYS = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  const toggleDay = (day: string) => {
    setNewSpecialist((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  // ── Edit specialist state ──
  type SpecialistFormData = {
    firstName: string;
    lastName: string;
    discipline: string;
    wardId: string;
    shiftStartTime: string;
    shiftEndTime: string;
    workingDays: string[];
  };
  const [editingSpecialist, setEditingSpecialist] = useState<
    (SpecialistFormData & { id: string }) | null
  >(null);

  const toggleEditDay = (day: string) => {
    if (!editingSpecialist) return;
    setEditingSpecialist((prev) =>
      !prev
        ? prev
        : {
            ...prev,
            workingDays: prev.workingDays.includes(day)
              ? prev.workingDays.filter((d) => d !== day)
              : [...prev.workingDays, day],
          },
    );
  };

  const openEditModal = (specialist: any) => {
    setEditingSpecialist({
      id: specialist.id,
      firstName: specialist.firstName,
      lastName: specialist.lastName,
      discipline: specialist.discipline || "",
      wardId: specialist.wardId || "",
      shiftStartTime: specialist.shiftStartTime || "08:00",
      shiftEndTime: specialist.shiftEndTime || "17:00",
      workingDays: specialist.workingDays || [],
    });
  };

  const isHospitalStaff =
    user?.role === "HOSPITAL_ADMIN" || user?.role === "FOCAL_PERSON";
  const myHospitalId = user?.hospitalId;
  const userHospital = hospitals?.find((h) => h.id === myHospitalId);

  // Aggregate specialists
  const allSpecialists =
    hospitals?.flatMap((h) => {
      if (isHospitalStaff && h.id !== myHospitalId) return [];
      return (
        h.specialists?.map((s) => ({
          ...s,
          hospitalName: h.name,
          location: h.location,
        })) || []
      );
    }) || [];

  const filteredSpecialists = allSpecialists.filter(
    (s) =>
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.discipline &&
        s.discipline.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleStatusUpdate = async (
    specialistId: string,
    status: SpecialistStatus,
  ) => {
    try {
      await updateStatus({ specialistId, data: { status } }).unwrap();
      toast({
        title: "Status Synchronized",
        description: "Specialist availability updated network-wide.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update availability.",
      });
    }
  };

  const handleAddSpecialist = async () => {
    if (!myHospitalId) return;
    try {
      await addSpecialist({
        hospitalId: myHospitalId,
        data: newSpecialist,
      }).unwrap();
      toast({
        title: "Specialist Registered",
        description: "Clinical consultant added to your facility.",
      });
      setIsAddModalOpen(false);
      setNewSpecialist({
        firstName: "",
        lastName: "",
        discipline: "",
        wardId: "",
        shiftStartTime: "08:00",
        shiftEndTime: "17:00",
        workingDays: [],
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to register specialist.",
      });
    }
  };

  const handleEditSpecialist = async () => {
    if (!editingSpecialist) return;
    try {
      const { id, ...data } = editingSpecialist;
      await updateSpecialist({ specialistId: id, data }).unwrap();
      toast({
        title: "Specialist Updated",
        description: "Specialist details have been saved.",
      });
      setEditingSpecialist(null);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update specialist.",
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Edit Specialist Modal */}
      {editingSpecialist && (
        <Dialog
          open={!!editingSpecialist}
          onOpenChange={(open) => {
            if (!open) setEditingSpecialist(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Specialist</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={editingSpecialist.firstName}
                    onChange={(e) =>
                      setEditingSpecialist({
                        ...editingSpecialist,
                        firstName: e.target.value,
                      })
                    }
                    className="h-12 bg-muted/50 border-none ring-1 ring-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={editingSpecialist.lastName}
                    onChange={(e) =>
                      setEditingSpecialist({
                        ...editingSpecialist,
                        lastName: e.target.value,
                      })
                    }
                    className="h-12 bg-muted/50 border-none ring-1 ring-border/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Discipline (Title)</Label>
                <Input
                  value={editingSpecialist.discipline}
                  onChange={(e) =>
                    setEditingSpecialist({
                      ...editingSpecialist,
                      discipline: e.target.value,
                    })
                  }
                  placeholder="e.g. Cardiologist..."
                  className="h-12 bg-muted/50 border-none ring-1 ring-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Assigned Ward</Label>
                <Select
                  value={editingSpecialist.wardId}
                  onValueChange={(v) =>
                    setEditingSpecialist({ ...editingSpecialist, wardId: v })
                  }
                >
                  <SelectTrigger className="h-12 bg-muted/50 border-none ring-1 ring-border/50">
                    <SelectValue placeholder="Select a ward..." />
                  </SelectTrigger>
                  <SelectContent>
                    {userHospital?.wards?.map((ward) => (
                      <SelectItem key={ward.id} value={ward.id}>
                        {ward.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Shift Start Time</Label>
                  <Input
                    type="time"
                    value={editingSpecialist.shiftStartTime}
                    onChange={(e) =>
                      setEditingSpecialist({
                        ...editingSpecialist,
                        shiftStartTime: e.target.value,
                      })
                    }
                    className="h-12 bg-muted/50 border-none ring-1 ring-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shift End Time</Label>
                  <Input
                    type="time"
                    value={editingSpecialist.shiftEndTime}
                    onChange={(e) =>
                      setEditingSpecialist({
                        ...editingSpecialist,
                        shiftEndTime: e.target.value,
                      })
                    }
                    className="h-12 bg-muted/50 border-none ring-1 ring-border/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Working Days</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DAYS.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={
                        editingSpecialist.workingDays.includes(day)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => toggleEditDay(day)}
                      className={`h-8 text-xs ${editingSpecialist.workingDays.includes(day) ? "bg-primary" : "bg-background"}`}
                    >
                      {day.substring(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setEditingSpecialist(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSpecialist}
                disabled={
                  isEditing ||
                  !editingSpecialist.firstName ||
                  !editingSpecialist.lastName
                }
              >
                {isEditing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Edit2 className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <PageHeader
        title={
          isHospitalStaff ? "Facility Specialists" : "Specialist Directory"
        }
        description={
          isHospitalStaff
            ? "Manage your on-call consultants and update their real-time availability."
            : "Directory of on-call and available specialists across the national healthcare network."
        }
      >
        <div className="flex gap-2">
          {isHospitalStaff && (
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-lg">
                  <Plus className="h-4 w-4" />
                  Add Specialist
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Register New Specialist</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        value={newSpecialist.firstName}
                        onChange={(e) =>
                          setNewSpecialist({
                            ...newSpecialist,
                            firstName: e.target.value,
                          })
                        }
                        className="h-12 bg-muted/50 border-none ring-1 ring-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        value={newSpecialist.lastName}
                        onChange={(e) =>
                          setNewSpecialist({
                            ...newSpecialist,
                            lastName: e.target.value,
                          })
                        }
                        className="h-12 bg-muted/50 border-none ring-1 ring-border/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Discipline (Title)</Label>
                    <Input
                      value={newSpecialist.discipline}
                      onChange={(e) =>
                        setNewSpecialist({
                          ...newSpecialist,
                          discipline: e.target.value,
                        })
                      }
                      placeholder="e.g. Cardiologist, General Surgeon..."
                      className="h-12 bg-muted/50 border-none ring-1 ring-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Assigned Ward</Label>
                    <Select
                      value={newSpecialist.wardId}
                      onValueChange={(v) =>
                        setNewSpecialist({ ...newSpecialist, wardId: v })
                      }
                    >
                      <SelectTrigger className="h-12 bg-muted/50 border-none ring-1 ring-border/50">
                        <SelectValue placeholder="Select a ward..." />
                      </SelectTrigger>
                      <SelectContent>
                        {userHospital?.wards?.map((ward) => (
                          <SelectItem key={ward.id} value={ward.id}>
                            {ward.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Shift Start Time</Label>
                      <Input
                        type="time"
                        value={newSpecialist.shiftStartTime}
                        onChange={(e) =>
                          setNewSpecialist({
                            ...newSpecialist,
                            shiftStartTime: e.target.value,
                          })
                        }
                        className="h-12 bg-muted/50 border-none ring-1 ring-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Shift End Time</Label>
                      <Input
                        type="time"
                        value={newSpecialist.shiftEndTime}
                        onChange={(e) =>
                          setNewSpecialist({
                            ...newSpecialist,
                            shiftEndTime: e.target.value,
                          })
                        }
                        className="h-12 bg-muted/50 border-none ring-1 ring-border/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Working Days</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {DAYS.map((day) => (
                        <Button
                          key={day}
                          type="button"
                          variant={
                            newSpecialist.workingDays.includes(day)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => toggleDay(day)}
                          className={`h-8 text-xs ${newSpecialist.workingDays.includes(day) ? "bg-primary" : "bg-background"}`}
                        >
                          {day.substring(0, 3)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddSpecialist}
                    disabled={
                      isAdding ||
                      !newSpecialist.firstName ||
                      !newSpecialist.lastName ||
                      !newSpecialist.discipline ||
                      !newSpecialist.wardId ||
                      newSpecialist.workingDays.length === 0
                    }
                  >
                    {isAdding ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add to Registry
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4 text-primary" />
            Refresh
          </Button>
        </div>
      </PageHeader>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by discipline or name..."
            className="pl-10 bg-background/50 border-none ring-1 ring-border/50 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-70">Specialist</TableHead>
                <TableHead>Ward</TableHead>
                {!isHospitalStaff && <TableHead>Facility</TableHead>}
                <TableHead>Schedule</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell
                      colSpan={5}
                      className="h-12 animate-pulse bg-muted/20"
                    />
                  </TableRow>
                ))
              ) : filteredSpecialists.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-48 text-center text-muted-foreground font-medium"
                  >
                    No specialists found in this view.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSpecialists.map((specialist) => (
                  <TableRow
                    key={specialist.id}
                    className="group hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">
                            Dr. {specialist.firstName} {specialist.lastName}
                          </span>
                          <span className="text-[10px] text-primary uppercase font-bold">
                            {specialist.discipline || "General Medicine"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-medium bg-background border-none"
                      >
                        {specialist.wardId
                          ? hospitals
                              ?.find((h) => h.id === specialist.hospitalId)
                              ?.wards?.find((w) => w.id === specialist.wardId)
                              ?.name || "Unknown"
                          : "Unassigned"}
                      </Badge>
                    </TableCell>
                    {!isHospitalStaff && (
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {specialist.hospitalName}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {specialist.location}
                          </span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      {specialist.workingDays &&
                      specialist.workingDays.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold">
                            {specialist.shiftStartTime || "00:00"} -{" "}
                            {specialist.shiftEndTime || "23:59"}
                          </span>
                          <div className="flex gap-1 flex-wrap w-32">
                            {specialist.workingDays.map((d) => (
                              <span
                                key={d}
                                className="text-[9px] bg-primary/10 text-primary px-1 rounded font-bold uppercase"
                              >
                                {d.substring(0, 3)}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No fixed schedule
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const status = getComputedStatus(specialist);
                          if (status === "ON_SHIFT" || status === "AVAILABLE") {
                            return (
                              <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-none shadow-none">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> On
                                Shift
                              </Badge>
                            );
                          }
                          if (status === "OFF_SHIFT") {
                            return (
                              <Badge
                                variant="secondary"
                                className="bg-slate-100 text-slate-500 hover:bg-slate-200 border-none shadow-none"
                              >
                                <Clock className="w-3 h-3 mr-1" /> Off Shift
                              </Badge>
                            );
                          }
                          return (
                            <Badge
                              variant="destructive"
                              className="bg-red-500/15 text-red-600 hover:bg-red-500/25 border-none shadow-none"
                            >
                              <XCircle className="w-3 h-3 mr-1" /> Unavailable
                            </Badge>
                          );
                        })()}
                        {isHospitalStaff && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(
                                specialist.id,
                                specialist.status === "UNAVAILABLE"
                                  ? "AVAILABLE"
                                  : "UNAVAILABLE",
                              )
                            }
                            disabled={isUpdating}
                            className="h-6 text-[10px] px-2"
                          >
                            {specialist.status === "UNAVAILABLE"
                              ? "Mark Available"
                              : "Mark on Leave"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isHospitalStaff && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                            onClick={() => openEditModal(specialist)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    AVAILABLE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    UNAVAILABLE: "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
        styles[status] || "bg-gray-100 text-gray-600",
      )}
    >
      <div
        className={cn(
          "h-1.5 w-1.5 rounded-full mr-2",
          status === "AVAILABLE" ? "bg-emerald-500" : "bg-rose-500",
        )}
      />
      {status}
    </Badge>
  );
}

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(" ");
}
