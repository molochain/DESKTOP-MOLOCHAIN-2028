import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { useProjectUpdates } from "@/contexts/ProjectUpdateContext";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Milestone {
  id: number;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "delayed";
  dueDate: string;
  completedAt?: string;
  priority: "low" | "medium" | "high";
  progress: number;
  assignedTo?: number;
  workflowInstanceId?: number;
  currentStage?: string;
}

interface WorkflowStage {
  name: string;
  description: string;
  requiresApproval: boolean;
  assignees?: number[];
}

interface WorkflowTemplate {
  id: number;
  name: string;
  description: string;
  stages: WorkflowStage[];
}

interface MilestoneTrackerProps {
  projectId: number;
}

export default function MilestoneTracker({ projectId }: MilestoneTrackerProps) {
  const { subscribeToProject, unsubscribeFromProject } = useProjectUpdates();
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const { toast } = useToast();

  // Subscribe to project updates
  useEffect(() => {
    subscribeToProject(projectId);
    return () => unsubscribeFromProject(projectId);
  }, [projectId, subscribeToProject, unsubscribeFromProject]);

  // Fetch milestones
  const { data: milestones, isLoading: milestonesLoading } = useQuery<Milestone[]>({
    queryKey: [`/api/projects/${projectId}/milestones`],
  });

  // Fetch workflow templates
  const { data: workflowTemplates } = useQuery<WorkflowTemplate[]>({
    queryKey: ['/api/workflow-templates'],
  });

  // Mutation for applying workflow template
  const applyWorkflowMutation = useMutation({
    mutationFn: async ({ milestoneId, templateId }: { milestoneId: number; templateId: number }) => {
      const response = await fetch(`/api/milestones/${milestoneId}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId }),
      });
      if (!response.ok) throw new Error('Failed to apply workflow');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Workflow Applied",
        description: "The workflow has been successfully applied to the milestone.",
      });
      setShowWorkflowDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to apply workflow template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "delayed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  if (milestonesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {milestones?.map((milestone) => (
          <Card
            key={milestone.id}
            className={`cursor-pointer transition-shadow hover:shadow-md ${
              selectedMilestone === milestone.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedMilestone(milestone.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold">
                  {milestone.title}
                </CardTitle>
                <Badge className={getStatusColor(milestone.status)}>
                  {milestone.status.replace("_", " ")}
                </Badge>
              </div>
              <CardDescription className="mt-1">
                {milestone.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(milestone.dueDate), "MMM d, yyyy")}
                  </div>
                  <div className={`font-medium ${getPriorityColor(milestone.priority)}`}>
                    {milestone.priority} priority
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Progress</span>
                    <span>{milestone.progress}%</span>
                  </div>
                  <Progress value={milestone.progress} className="h-2" />
                </div>

                {milestone.currentStage && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <ArrowRight className="w-4 h-4" />
                    Current Stage: {milestone.currentStage}
                  </div>
                )}

                {milestone.status === "completed" ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Completed on {format(new Date(milestone.completedAt!), "MMM d, yyyy")}
                  </div>
                ) : milestone.status === "delayed" ? (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    Past due date
                  </div>
                ) : null}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMilestone(milestone.id);
                  setShowWorkflowDialog(true);
                }}
              >
                {milestone.workflowInstanceId ? "View Workflow" : "Apply Workflow"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Workflow Templates</DialogTitle>
            <DialogDescription>
              Select a workflow template to apply to this milestone
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {workflowTemplates?.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  if (selectedMilestone) {
                    applyWorkflowMutation.mutate({
                      milestoneId: selectedMilestone,
                      templateId: template.id,
                    });
                  }
                }}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {template.stages.map((stage, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {stage.name}
                        {stage.requiresApproval && (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}