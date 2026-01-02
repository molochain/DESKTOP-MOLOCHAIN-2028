import { useTranslation } from 'react-i18next';
import { useParams } from "wouter";
import ServiceDetailTemplate from "@/components/services/ServiceDetailTemplate";

export default function ServicePage() {
  const { t } = useTranslation();
  const params = useParams<{ serviceId: string }>();
  const serviceId = params.serviceId || "";
  
  return <ServiceDetailTemplate serviceId={serviceId} />;
}
