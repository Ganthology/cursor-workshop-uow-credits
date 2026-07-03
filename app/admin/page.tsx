import { AdminDashboard } from "@/components/AdminDashboard";
import { getAdminStats, getRecentRedemptions } from "@/app/actions/admin";

export default async function AdminPage() {
  const [stats, redemptions] = await Promise.all([
    getAdminStats(),
    getRecentRedemptions(),
  ]);

  return <AdminDashboard stats={stats} redemptions={redemptions} />;
}
