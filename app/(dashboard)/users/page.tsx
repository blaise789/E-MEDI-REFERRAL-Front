/** @format */
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
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  UserCog, 
  ShieldCheck, 
  Stethoscope, 
  Hospital as HospitalIcon,
  MoreVertical,
  Pencil,
  Trash2,
  User,
  UserPlus,
  Users as UsersIcon,
  Filter
} from "lucide-react";
import { useGetUsersQuery, useDeleteUserMutation } from "@/store/features/user/userSlice";
import { useAuth } from "@/lib/auth-context";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { EditUserDialog } from "@/components/users/edit-user-dialog";
import { CreateUserDialog } from "@/components/users/create-user-dialog";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const filteredUsers = users?.filter(u => {
    const matchesSearch = 
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete).unwrap();
      toast({ title: "User removed", description: "The account has been successfully deleted." });
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Delete failed", 
        description: err.data?.message || "An error occurred." 
      });
    } finally {
      setUserToDelete(null);
    }
  };

  const stats = [
    { label: "Total Staff", count: users?.length || 0, icon: UsersIcon, color: "text-primary" },
    { label: "Clinicians", count: users?.filter(u => u.role === "CLINICIAN").length || 0, icon: User, color: "text-slate-500" },
    { label: "Focal Persons", count: users?.filter(u => u.role === "FOCAL_PERSON").length || 0, icon: Stethoscope, color: "text-emerald-500" },
    { label: "Administrators", count: users?.filter(u => ["SYS_ADMIN", "HOSPITAL_ADMIN"].includes(u.role)).length || 0, icon: ShieldCheck, color: "text-blue-500" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <PageHeader 
          title="User Management" 
          description="Oversee system access, manage personnel roles, and assign staff to facilities."
        />
        <Button onClick={() => setIsCreating(true)} className="gap-2 shadow-lg shadow-primary/20">
          <UserPlus className="h-4 w-4" />
          Add New User
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-card/40 backdrop-blur-md ring-1 ring-white/10">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn("h-10 w-10 rounded-xl bg-background flex items-center justify-center shadow-sm", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight">{stat.count}</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{stat.label}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/30 p-4 rounded-2xl border border-white/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10 bg-background/50 ring-1 ring-border/50 border-none h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none w-full md:w-auto">
          {["ALL", "CLINICIAN", "FOCAL_PERSON", "HOSPITAL_ADMIN", "SYS_ADMIN"].map((role) => (
            <Button
              key={role}
              variant={roleFilter === role ? "default" : "ghost"}
              size="sm"
              onClick={() => setRoleFilter(role)}
              className="text-xs font-semibold h-9"
            >
              {role === "ALL" ? "All Staff" : role.replace("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      <Card className="border-none shadow-xl bg-card/60 backdrop-blur-xl ring-1 ring-white/10 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="py-4 pl-6">User / Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned Hospital</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4} className="h-16 animate-pulse bg-muted/10 px-6" /></TableRow>
                ))
              ) : filteredUsers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Filter className="h-10 w-10 opacity-20" />
                      <p className="text-sm font-medium">No users match your criteria.</p>
                      <Button variant="link" onClick={() => {setSearchTerm(""); setRoleFilter("ALL");}}>Clear all filters</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers?.map((u) => (
                  <TableRow key={u.id} className="group hover:bg-muted/30 transition-colors border-white/5">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shadow-inner">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{u.firstName} {u.lastName}</span>
                          <span className="text-[11px] text-muted-foreground">{u.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={u.role} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <HospitalIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        {u.hospital?.name || <span className="text-muted-foreground italic text-xs font-normal">Unassigned</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary"><MoreVertical className="h-4 w-4" /></Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-48">
                           <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest pl-2">Member Settings</DropdownMenuLabel>
                           <DropdownMenuSeparator />
                           <DropdownMenuItem onClick={() => setEditingUser(u)} className="gap-2">
                             <Pencil className="h-4 w-4" /> Edit Permissions
                           </DropdownMenuItem>
                           {u.id !== currentUser?.id && (
                             <DropdownMenuItem onClick={() => setUserToDelete(u.id)} className="text-destructive gap-2">
                               <Trash2 className="h-4 w-4" /> Remove Access
                             </DropdownMenuItem>
                           )}
                         </DropdownMenuContent>
                       </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateUserDialog open={isCreating} onOpenChange={setIsCreating} />
      
      {editingUser && (
        <EditUserDialog 
          user={editingUser} 
          open={!!editingUser} 
          onOpenChange={(open) => !open && setEditingUser(null)} 
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently revoke this user's access to the Digital Referral Platform. Their historical data and audit logs will be preserved, but they will no longer be able to log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Revoke Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const configs: any = {
    SYS_ADMIN: { label: "Sys Admin", icon: ShieldCheck, class: "bg-purple-100/50 text-purple-700 border-purple-200" },
    HOSPITAL_ADMIN: { label: "Hosp Admin", icon: UserCog, class: "bg-blue-100/50 text-blue-700 border-blue-200" },
    FOCAL_PERSON: { label: "Focal Person", icon: Stethoscope, class: "bg-emerald-100/50 text-emerald-700 border-emerald-200" },
    CLINICIAN: { label: "Clinician", icon: User, class: "bg-slate-100/50 text-slate-700 border-slate-200" },
  };

  const config = configs[role] || configs.CLINICIAN;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1.5 font-semibold text-[11px] py-1", config.class)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(" ");
}
