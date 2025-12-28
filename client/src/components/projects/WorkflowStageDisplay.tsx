import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface WorkflowStageDisplayProps {
  instanceId: number;
  currentStage: string;
  stages: { name: string; label: string }[];
}

export function WorkflowStageDisplay({
  instanceId,
  currentStage,
  stages,
}: WorkflowStageDisplayProps) {
  const [selectedStage, setSelectedStage] = useState("");
  const queryClient = useQueryClient();

  const { mutate: transition, isLoading } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/workflows/${instanceId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStage: selectedStage }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to transition stage");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setSelectedStage("");
    },
  });

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg border">
      <div className="space-y-2">
        <h3 className="font-medium">Current Stage</h3>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
            {currentStage}
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium">Transition to Stage</h3>
        <div className="flex items-center gap-2">
          <Select value={selectedStage} onValueChange={setSelectedStage}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {stages.map((stage) => (
                <SelectItem 
                  key={stage.name} 
                  value={stage.name}
                  disabled={stage.name === currentStage}
                >
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => transition()} 
            disabled={!selectedStage || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Transition
          </Button>
        </div>
      </div>
    </div>
  );
}
