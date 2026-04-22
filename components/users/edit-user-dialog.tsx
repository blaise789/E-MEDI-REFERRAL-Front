/** @format */
"use client";

import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useUpdateUserMutation } from "@/store/features/user/userSlice";
import { useGetHospitalsQuery } from "@/store/features/hospital/hospitalSlice";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Role } from "@/lib/types";

interface EditUserDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const { user: currentUser } = useAuth();
  const { data: hospitals } = useGetHospitalsQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    role: user?.role || "CLINICIAN",
    hospitalId: user?.hospitalId || "",
    telephone: user?.telephone || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        role: user.role,
        hospitalId: user.hospitalId || "",
        telephone: user.telephone || "",
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    try {
      await updateUser({
        id: user.id,
        data: {
          role: formData.role,
          hospitalId: formData.hospitalId || null,
          telephone: formData.telephone,
        }
      }).unwrap();

      toast({
        title: "User updated",
        description: `Successfully updated permissions for ${user.firstName}.`,
      });
      onOpenChange(false);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: err.data?.message || "An error occurred.",
      });
    }
  };

  const isSysAdmin = currentUser?.role === "SYS_ADMIN";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-white/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Edit User Permissions</DialogTitle>
          <DialogDescription>
            Modify the role and facility access for <strong>{user?.firstName} {user?.lastName}</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>User Role</Label>
            <Select 
              value={formData.role} 
              onValueChange={(val) => setFormData({...formData, role: val as Role})}
            >
              <SelectTrigger className="bg-background/50 border-none ring-1 ring-border/50">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLINICIAN">Clinician</SelectItem>
                <SelectItem value="FOCAL_PERSON">Focal Person</SelectItem>
                <SelectItem value="HOSPITAL_ADMIN">Hospital Administrator</SelectItem>
                {isSysAdmin && <SelectItem value="SYS_ADMIN">System Administrator</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assigned Hospital</Label>
            <Select 
              value={formData.hospitalId || "unassigned"} 
              onValueChange={(val) => setFormData({...formData, hospitalId: val === "unassigned" ? "" : val})}
              disabled={!isSysAdmin} // Only SysAdmins can move users between hospitals
            >
              <SelectTrigger className="bg-background/50 border-none ring-1 ring-border/50">
                <SelectValue placeholder="Select a facility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">No Hospital Assigned</SelectItem>
                {hospitals?.map(h => (
                  <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isSysAdmin && (
              <p className="text-[10px] text-muted-foreground italic">
                Only System Administrators can reassign users to different facilities.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Telephone (Optional)</Label>
            <Input 
              value={formData.telephone} 
              onChange={(e) => setFormData({...formData, telephone: e.target.value})}
              placeholder="+250..."
              className="bg-background/50 border-none ring-1 ring-border/50"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isUpdating} className="gap-2 px-6">
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
