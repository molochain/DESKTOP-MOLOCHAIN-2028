import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AboutSection, ServiceCard, ContentAssets } from "@/types/content";
import AboutEditor from "./AboutEditor";
import ServicesEditor from "./ServicesEditor";
import BrandingEditor from "./BrandingEditor";
import { Loader2, Paintbrush, FileText, Briefcase } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function ContentManager() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const { data: aboutContent, isLoading: isLoadingAbout } = useQuery<AboutSection[]>({
    queryKey: ["/api/admin/content/about"],
  });

  const { data: services, isLoading: isLoadingServices } = useQuery<ServiceCard[]>({
    queryKey: ["/api/admin/content/services"],
  });

  const { data: brandAssets, isLoading: isLoadingBranding } = useQuery<ContentAssets>({
    queryKey: ["/api/admin/branding/assets"],
  });

  if (isLoadingAbout || isLoadingServices || isLoadingBranding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">{t('admin.content.manager.title')}</h2>
      </div>

      <Tabs defaultValue="about" className="space-y-4">
        <TabsList>
          <TabsTrigger value="about" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            {t('admin.content.manager.tabs.aboutPage')}
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center">
            <Briefcase className="w-4 h-4 mr-2" />
            {t('admin.content.manager.tabs.services')}
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center">
            <Paintbrush className="w-4 h-4 mr-2" />
            {t('admin.content.manager.tabs.branding')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.content.manager.cards.aboutPageContent')}</CardTitle>
            </CardHeader>
            <CardContent>
              <AboutEditor content={aboutContent} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.content.manager.cards.servicesContent')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ServicesEditor services={services} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <BrandingEditor assets={brandAssets} />
        </TabsContent>
      </Tabs>
    </div>
  );
}