import type { Metadata } from "next";
import { AdminSetup } from "@/components/admin/setup";

export const metadata: Metadata = {
  title: "Admin: testing setup",
  description: "District setup for a screening window: levels, dates, the talent-pool rule with a live preview, and accommodations with their effect on scores made explicit.",
};

export default function AdminPage() {
  return <AdminSetup />;
}
