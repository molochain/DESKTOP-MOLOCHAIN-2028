import { useTranslation } from 'react-i18next';
import { CommsHubDashboard } from '@/components/admin/communications/CommsHubDashboard';

export default function MultiChannelComms() {
  const { t } = useTranslation();
  
  return <CommsHubDashboard />;
}
