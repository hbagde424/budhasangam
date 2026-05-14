// app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getAuth();
  if (!session) redirect("/login");
  return <DashboardLayout session={session}>{children}</DashboardLayout>;
}
