import { useParams } from "wouter";
import ServiceDetailTemplate from "@/components/services/ServiceDetailTemplate";

export default function ServicePage() {
  const params = useParams<{ serviceId: string }>();
  const serviceId = params.serviceId || "";
  
  return <ServiceDetailTemplate serviceId={serviceId} />;
}
