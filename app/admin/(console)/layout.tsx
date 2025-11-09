import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { signOut } from "@/action/mutation/auth";

export const metadata: Metadata = {
  title: "Admin Dashboard | Crop Monitoring",
  description: "Secure operations dashboard for crop monitoring.",
};

export default function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  async function handleSignOut() {
    "use server";
    await signOut();
    redirect("/admin/login");
  }

  return <AdminShell onSignOut={handleSignOut}>{children}</AdminShell>;
}
