/** @format */
import React from "react";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-7xl h-full space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
