import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ServiceCard } from "@/types/content";
import { Loader2, Plus, Save, Trash } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from 'react-i18next';

interface ServicesEditorProps {
  services?: ServiceCard[];
}

export default function ServicesEditor({ services = [] }: ServicesEditorProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [serviceCards, setServiceCards] = useState<ServiceCard[]>(services || []);

  const updateMutation = useMutation({
    mutationFn: async (updatedServices: ServiceCard[]) => {
      const response = await fetch("/api/admin/content/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedServices),
      });

      if (!response.ok) {
        throw new Error("Failed to update services");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/services"] });
      toast({
        title: t('admin.content.services.toast.successTitle'),
        description: t('admin.content.services.toast.successDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('admin.content.services.toast.errorTitle'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddService = () => {
    setServiceCards([
      ...serviceCards,
      {
        id: Date.now(), // Temporary ID for new services
        title: t('admin.content.services.newServiceTitle'),
        description: "",
        icon: "",
        order: serviceCards.length,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  };

  const handleUpdateService = (index: number, field: keyof ServiceCard, value: any) => {
    const updatedServices = [...serviceCards];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value,
      updatedAt: new Date().toISOString(),
    };
    setServiceCards(updatedServices);
  };

  const handleRemoveService = (index: number) => {
    setServiceCards(serviceCards.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    updateMutation.mutate(serviceCards);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-4">
        <Button onClick={handleAddService} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.content.services.buttons.addService')}
        </Button>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {t('admin.content.services.buttons.saveChanges')}
        </Button>
      </div>

      <div className="space-y-6">
        {serviceCards.map((service, index) => (
          <div key={service.id} className="space-y-4 p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{t('admin.content.services.labels.service')} {index + 1}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveService(index)}
              >
                <Trash className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor={`title-${index}`}>{t('admin.content.services.labels.title')}</label>
                <Input
                  id={`title-${index}`}
                  value={service.title}
                  onChange={(e) =>
                    handleUpdateService(index, "title", e.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor={`description-${index}`}>{t('admin.content.services.labels.description')}</label>
                <Textarea
                  id={`description-${index}`}
                  value={service.description}
                  onChange={(e) =>
                    handleUpdateService(index, "description", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor={`icon-${index}`}>{t('admin.content.services.labels.icon')}</label>
                <Input
                  id={`icon-${index}`}
                  value={service.icon}
                  onChange={(e) =>
                    handleUpdateService(index, "icon", e.target.value)
                  }
                  placeholder="e.g. Truck, Box, Ship"
                />
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor={`active-${index}`}>{t('admin.content.services.labels.active')}</label>
                <Switch
                  id={`active-${index}`}
                  checked={service.active}
                  onCheckedChange={(checked) =>
                    handleUpdateService(index, "active", checked)
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}