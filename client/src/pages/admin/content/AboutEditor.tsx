import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AboutSection } from "@/types/content";
import { Loader2, Plus, Save, Trash } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from 'react-i18next';

interface AboutEditorProps {
  content?: AboutSection[];
}

export default function AboutEditor({ content = [] }: AboutEditorProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sections, setSections] = useState(content || []);

  const updateMutation = useMutation({
    mutationFn: async (updatedContent: AboutSection[]) => {
      const response = await fetch("/api/admin/content/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedContent),
      });

      if (!response.ok) {
        throw new Error("Failed to update content");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/about"] });
      toast({
        title: t('admin.content.about.toast.successTitle'),
        description: t('admin.content.about.toast.successDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('admin.content.about.toast.errorTitle'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        id: Date.now(), // Temporary ID for new sections
        title: t('admin.content.about.newSectionTitle'),
        content: "",
        order: sections.length,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  };

  const handleUpdateSection = (index: number, field: keyof AboutSection, value: any) => {
    const updatedSections = [...sections];
    updatedSections[index] = {
      ...updatedSections[index],
      [field]: value,
      updatedAt: new Date().toISOString(),
    };
    setSections(updatedSections);
  };

  const handleRemoveSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    updateMutation.mutate(sections);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-4">
        <Button onClick={handleAddSection} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.content.about.buttons.addSection')}
        </Button>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {t('admin.content.about.buttons.saveChanges')}
        </Button>
      </div>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={section.id} className="space-y-4 p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{t('admin.content.about.labels.section')} {index + 1}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveSection(index)}
              >
                <Trash className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor={`title-${index}`}>{t('admin.content.about.labels.title')}</label>
                <Input
                  id={`title-${index}`}
                  value={section.title}
                  onChange={(e) =>
                    handleUpdateSection(index, "title", e.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor={`content-${index}`}>{t('admin.content.about.labels.content')}</label>
                <Textarea
                  id={`content-${index}`}
                  value={section.content}
                  onChange={(e) =>
                    handleUpdateSection(index, "content", e.target.value)
                  }
                  rows={5}
                />
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor={`active-${index}`}>{t('admin.content.about.labels.active')}</label>
                <Switch
                  id={`active-${index}`}
                  checked={section.active}
                  onCheckedChange={(checked) =>
                    handleUpdateSection(index, "active", checked)
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