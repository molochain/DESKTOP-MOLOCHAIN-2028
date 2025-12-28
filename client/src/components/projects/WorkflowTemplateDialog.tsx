import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface WorkflowTemplateDialogProps {
  onSelect: (templateId: number) => void;
  trigger?: React.ReactNode;
}

export function WorkflowTemplateDialog({ onSelect, trigger }: WorkflowTemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: templates, isLoading } = useQuery({
    queryKey: ['/api/workflow-templates'],
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Select Workflow Template</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Workflow Template</DialogTitle>
          <DialogDescription>
            Choose a workflow template to apply to this milestone.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : templates?.length === 0 ? (
            <p className="text-center text-muted-foreground">No templates available</p>
          ) : (
            <div className="space-y-4">
              {templates?.map((template: any) => (
                <button
                  key={template.id}
                  onClick={() => {
                    onSelect(template.id);
                    setOpen(false);
                  }}
                  className="w-full p-4 text-left rounded-lg border hover:bg-accent transition-colors"
                >
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
