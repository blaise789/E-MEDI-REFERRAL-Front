/** @format */
"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  message?: string | false | null;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
      <AlertCircle className="h-3 w-3" />
      <span>{message}</span>
    </div>
  );
}
