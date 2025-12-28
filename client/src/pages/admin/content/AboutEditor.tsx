import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AboutSection } from "@/types/content";
import { Loader2, Plus, Save, Trash } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface AboutEditorProps {
  content?: AboutSection[];
}

export default function AboutEditor({ content = [] }: AboutEditorProps) {
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
        title: "Success",
        description: "About page content has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
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
        title: "New Section",
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
          Add Section
        </Button>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={section.id} className="space-y-4 p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Section {index + 1}</h3>
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
                <label htmlFor={`title-${index}`}>Title</label>
                <Input
                  id={`title-${index}`}
                  value={section.title}
                  onChange={(e) =>
                    handleUpdateSection(index, "title", e.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor={`content-${index}`}>Content</label>
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
                <label htmlFor={`active-${index}`}>Active</label>
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