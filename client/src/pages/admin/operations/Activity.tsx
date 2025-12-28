import { Card } from "@/components/ui/card";
import AdminLayout from "@/components/admin/AdminLayout";
import ActivityLog from "@/components/admin/ActivityLog";

export default function AdminActivity() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Activity Monitoring</h2>
        <ActivityLog />
      </div>
    </AdminLayout>
  );
}
