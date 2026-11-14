import type { Metadata } from "next";
import React from "react";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "OrienX Account",
  description: "Sign in or create your OrienX account.",
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthShell>{children}</AuthShell>;
}
