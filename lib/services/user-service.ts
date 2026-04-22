import type { User } from "@/lib/types";
import { hasActionPermission } from "@/lib/config";
import type { Role } from "@/lib/types";

export class UserService {

  static async getUsers(): Promise<User[]> {
    const res = await fetch("/api/users", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
  }

  static async getUser(userId: string): Promise<User> {
    const res = await fetch(`/api/users/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
  }

  static async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
    hospitalId?: string;
    telephone?: string;
  }): Promise<User> {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error("Failed to create user");
    return res.json();
  }

  static async updateUser(userId: string, updates: Partial<Pick<User, "firstName" | "lastName" | "telephone" | "role" | "hospitalId">>): Promise<User> {
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update user");
    return res.json();
  }

  static async changeUserRole(userId: string, newRole: Role): Promise<User> {
    const res = await fetch(`/api/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (!res.ok) throw new Error("Failed to change user role");
    return res.json();
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const validation = this.validatePassword(newPassword);
    if (!validation.valid) {
      throw new Error(validation.errors.join(", "));
    }

    const res = await fetch(`/api/users/${userId}/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });
    if (!res.ok) throw new Error("Failed to change password");
  }

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (password.length < 8) errors.push("Password must be at least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("Password must contain an uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("Password must contain a lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("Password must contain a number");
    return { valid: errors.length === 0, errors };
  }

  /** Check if a role can perform an action (delegates to lib/config) */
  static hasPermission(role: Role, action: string): boolean {
    return hasActionPermission(role, action);
  }
}
