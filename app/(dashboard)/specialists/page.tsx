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
  TableRow 
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
  RefreshCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  useGetHospitalsQuery,
  useUpdateSpecialistStatusMutation,
  useAddSpecialistMutation
} from "@/store/features/hospital/hospitalSlice";
import { SPECIALIST_DISCIPLINE_LABELS, SpecialistDiscipline, SpecialistStatus } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function SpecialistsPage() {
  const { data: hospitals, isLoading, refetch } = useGetHospitalsQuery();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
  const [updateStatus, { isLoading: isUpdating }] = useUpdateSpecialistStatusMutation();
  const [addSpecialist, { isLoading: isAdding }] = useAddSpecialistMutation();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSpecialist, setNewSpecialist] = useState({ 
    firstName: "", 
    lastName: "", 
    discipline: "GENERAL_SURGERY" as SpecialistDiscipline 
  });

  const isHospitalStaff = user?.role === "HOSPITAL_ADMIN" || user?.role === "FOCAL_PERSON";
  const myHospitalId = user?.hospitalId;

  // Aggregate specialists
  const allSpecialists = hospitals?.flatMap(h => {
    if (isHospitalStaff && h.id !== myHospitalId) return [];
    return h.specialists?.map(s => ({ ...s, hospitalName: h.name, location: h.location })) || [];
  }) || [];

  const filteredSpecialists = allSpecialists.filter(s => 
    s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.discipline.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusUpdate = async (specialistId: string, status: SpecialistStatus) => {
    try {
      await updateStatus({ specialistId, data: { status } }).unwrap();
      toast({ title: "Status Synchronized", description: "Specialist availability updated network-wide." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update availability." });
    }
  };

  const handleAddSpecialist = async () => {
    if (!myHospitalId) return;
    try {
      await addSpecialist({ hospitalId: myHospitalId, data: newSpecialist }).unwrap();
      toast({ title: "Specialist Registered", description: "Clinical consultant added to your facility." });
      setIsAddModalOpen(false);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to register specialist." });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title={isHospitalStaff ? "Facility Specialists" : "Specialist Directory"} 
        description={isHospitalStaff ? "Manage your on-call consultants and update their real-time availability." : "Directory of on-call and available specialists across the national healthcare network."}
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
                        onChange={(e) => setNewSpecialist({...newSpecialist, firstName: e.target.value})}
                        className="h-12 bg-muted/50 border-none ring-1 ring-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input 
                        value={newSpecialist.lastName} 
                        onChange={(e) => setNewSpecialist({...newSpecialist, lastName: e.target.value})}
                        className="h-12 bg-muted/50 border-none ring-1 ring-border/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Specialty / Discipline</Label>
                    <Select value={newSpecialist.discipline} onValueChange={(v) => setNewSpecialist({...newSpecialist, discipline: v as SpecialistDiscipline})}>
                      <SelectTrigger className="h-12 bg-muted/50 border-none ring-1 ring-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SPECIALIST_DISCIPLINE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddSpecialist} disabled={isAdding || !newSpecialist.firstName || !newSpecialist.lastName}>
                    {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
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
        <div className="flex items-center gap-4">
           {!isHospitalStaff && (
             <>
               <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">12 Available Now</Badge>
               <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">4 In Theatre</Badge>
             </>
           )}
        </div>
      </div>

      <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-70">Specialist</TableHead>
                <TableHead>Discipline</TableHead>
                {!isHospitalStaff && <TableHead>Facility</TableHead>}
                <TableHead>Availability</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={5} className="h-12 animate-pulse bg-muted/20" /></TableRow>
                ))
              ) : filteredSpecialists.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-48 text-center text-muted-foreground font-medium">No specialists found in this view.</TableCell></TableRow>
              ) : filteredSpecialists.map((specialist) => (
                <TableRow key={specialist.id} className="group hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">Dr. {specialist.firstName} {specialist.lastName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">L-{specialist.id.substring(0, 4)}-MED</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-medium bg-background border-none">
                      {SPECIALIST_DISCIPLINE_LABELS[specialist.discipline as SpecialistDiscipline]}
                    </Badge>
                  </TableCell>
                  {!isHospitalStaff && (
                    <TableCell>
                      <div className="flex flex-col">
                         <span className="text-sm font-medium">{specialist.hospitalName}</span>
                         <span className="text-xs text-muted-foreground flex items-center gap-1">
                           <MapPin className="h-3 w-3" /> {specialist.location}
                         </span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    {isHospitalStaff ? (
                       <Select 
                          defaultValue={specialist.status} 
                          onValueChange={(v) => handleStatusUpdate(specialist.id, v as SpecialistStatus)}
                          disabled={isUpdating}
                       >
                         <SelectTrigger className="w-40 border-none bg-background/50 h-8 text-[10px] font-bold uppercase ring-1 ring-border/50">
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="AVAILABLE">Available</SelectItem>
                           <SelectItem value="ON_CALL">On Call</SelectItem>
                           <SelectItem value="IN_THEATRE">In Theatre</SelectItem>
                           <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                         </SelectContent>
                       </Select>
                    ) : (
                      <StatusBadge status={specialist.status} />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                     <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                           <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                           <MessageSquare className="h-4 w-4" />
                        </Button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
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
    IN_THEATRE: "bg-amber-100 text-amber-700 border-amber-200",
    ON_CALL: "bg-blue-100 text-blue-700 border-blue-200",
    UNAVAILABLE: "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <Badge 
      variant="outline" 
      className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", styles[status] || "bg-gray-100 text-gray-600")}
    >
      <div className={cn("h-1.5 w-1.5 rounded-full mr-2", 
        status === "AVAILABLE" ? "bg-emerald-500" : 
        status === "IN_THEATRE" ? "bg-amber-500" : 
        status === "ON_CALL" ? "bg-blue-500" : "bg-rose-500"
      )} />
      {status.replace("_", " ")}
    </Badge>
  );
}

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(" ");
}
