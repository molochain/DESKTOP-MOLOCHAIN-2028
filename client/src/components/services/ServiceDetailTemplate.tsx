import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertCircle, Package } from "lucide-react";
import { getServiceConfig, getServiceIcon, iconMap } from "@/config/servicesConfig";
import { useServiceDetail, type ServicePlatform } from "@/hooks/useServicesApi";
import ServiceDetailEnhanced from "./ServiceDetailEnhanced";

interface ServiceDetailTemplateProps {
  serviceId: string;
}

const getIconFromName = (iconName: string | null | undefined) => {
  if (!iconName) return null;
  const Icon = iconMap[iconName];
  return Icon ? <Icon className="w-8 h-8" /> : null;
};

export default function ServiceDetailTemplate({ serviceId }: ServiceDetailTemplateProps) {
  const { t } = useTranslation();
  const { data: apiService, isLoading, isError } = useServiceDetail(serviceId);
  const serviceConfig = getServiceConfig(serviceId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!apiService && !serviceConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full" data-testid="service-not-found">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">{t('services.detail.notFound')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {t('services.detail.notFoundDescription', { serviceId })}
            </p>
            <Link href="/services">
              <Button data-testid="back-to-services-button">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('services.detail.backToServices')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (apiService) {
    const iconElement = apiService.icon 
      ? getIconFromName(apiService.icon)
      : <Package className="w-8 h-8" />;

    const serviceStatsWithIcons = (apiService.serviceStats || []).map((stat) => ({
      label: stat.label,
      value: stat.value,
      icon: (() => {
        if (!stat.icon) return null;
        const StatIcon = iconMap[stat.icon];
        return StatIcon ? <StatIcon className="h-5 w-5" /> : null;
      })()
    }));

    return (
      <ServiceDetailEnhanced
        id={apiService.id}
        title={apiService.title}
        description={apiService.description}
        icon={iconElement}
        imageUrl={apiService.imageUrl || undefined}
        features={apiService.features}
        benefits={apiService.benefits}
        additionalInfo={apiService.additionalInfo || undefined}
        relatedServices={apiService.relatedServices || undefined}
        pricing={apiService.pricing || undefined}
        deliveryTime={apiService.deliveryTime || undefined}
        coverage={apiService.coverage || undefined}
        tags={apiService.tags || undefined}
        serviceStats={serviceStatsWithIcons}
        certifications={apiService.certifications || undefined}
      />
    );
  }

  if (serviceConfig) {
    const IconComponent = getServiceIcon(serviceConfig.iconName);

    const serviceStatsWithIcons = serviceConfig.serviceStats.map((stat) => ({
      label: stat.label,
      value: stat.value,
      icon: (() => {
        const StatIcon = iconMap[stat.iconName];
        return StatIcon ? <StatIcon className="h-5 w-5" /> : null;
      })()
    }));

    return (
      <ServiceDetailEnhanced
        id={serviceConfig.id}
        title={serviceConfig.title}
        description={serviceConfig.description}
        icon={IconComponent ? <IconComponent className="w-8 h-8" /> : null}
        imageUrl={serviceConfig.imageUrl}
        features={serviceConfig.features}
        benefits={serviceConfig.benefits}
        additionalInfo={serviceConfig.additionalInfo}
        relatedServices={serviceConfig.relatedServices}
        pricing={serviceConfig.pricing}
        deliveryTime={serviceConfig.deliveryTime}
        coverage={serviceConfig.coverage}
        tags={serviceConfig.tags}
        serviceStats={serviceStatsWithIcons}
        certifications={serviceConfig.certifications}
      />
    );
  }

  return null;
}
