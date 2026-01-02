import { useTranslation } from 'react-i18next';
import { Card } from "@/components/ui/card";
import AdminLayout from "@/components/admin/AdminLayout";
import ActivityLog from "@/components/admin/ActivityLog";

export default function AdminActivity() {
  const { t } = useTranslation();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">{t('admin.operations.activity.title')}</h2>
        <ActivityLog />
      </div>
    </AdminLayout>
  );
}
