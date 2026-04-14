import type { Metadata } from "next";
import { OfficialLineupAdminEditor } from "@/components/admin/OfficialLineupAdminEditor";

export const metadata: Metadata = {
  title: "Admin — oficiální soupiska",
  robots: { index: false, follow: false },
};

export default function AdminOfficialLineupPage() {
  return <OfficialLineupAdminEditor />;
}
