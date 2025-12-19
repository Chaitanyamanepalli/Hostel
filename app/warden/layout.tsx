"use client"

import type React from "react"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardShell } from "@/components/dashboard-shell"

export default function WardenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard allowedRoles={["warden"]}>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  )
}
