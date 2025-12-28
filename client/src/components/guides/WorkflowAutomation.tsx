import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Circle, PlayCircle, PauseCircle, RotateCcw, BookOpen, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';
import { GuideContextService, workflowGuideMap } from '@/services/guideContextService';
import { Guide } from '@/types/guides';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface WorkflowStep {
  id: number;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  description?: string;
}

interface WorkflowAutomationProps {
  workflowName: keyof typeof workflowGuideMap;
  onComplete?: () => void;
  className?: string;
}

export function WorkflowAutomation({ 
  workflowName, 
  onComplete,
  className 
}: WorkflowAutomationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeWorkflow();
  }, [workflowName]);

  const initializeWorkflow = async () => {
    const workflow = workflowGuideMap[workflowName];
    if (!workflow) {
      setError('Workflow not found');
      return;
    }

    // Initialize steps from workflow
    const workflowSteps = workflow.steps.map((step, index) => ({
      id: index + 1,
      name: step,
      status: 'pending' as const,
    }));
    setSteps(workflowSteps);

    // Load relevant guides
    try {
      const relevantGuides = await GuideContextService.fetchGuidesByCode(workflow.guides);
      setGuides(relevantGuides);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Failed to load workflow guides:', err);
      }
    }
  };

  const startWorkflow = () => {
    setIsRunning(true);
    setCurrentStep(0);
    setError(null);
    executeNextStep();
  };

  const pauseWorkflow = () => {
    setIsRunning(false);
  };

  const resumeWorkflow = () => {
    setIsRunning(true);
    executeNextStep();
  };

  const resetWorkflow = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setError(null);
    setSteps(steps.map(step => ({ ...step, status: 'pending' })));
  };

  const executeNextStep = () => {
    if (currentStep >= steps.length) {
      completeWorkflow();
      return;
    }

    // Update current step status
    setSteps(prevSteps => 
      prevSteps.map((step, index) => 
        index === currentStep 
          ? { ...step, status: 'in-progress' }
          : step
      )
    );

    // Simulate step execution
    setTimeout(() => {
      if (!isRunning) return;

      // Randomly simulate success or error (90% success rate)
      const success = Math.random() > 0.1;
      
      if (success) {
        setSteps(prevSteps => 
          prevSteps.map((step, index) => 
            index === currentStep 
              ? { ...step, status: 'completed' }
              : step
          )
        );
        
        toast({
          title: "Step completed",
          description: steps[currentStep]?.name,
        });
        
        setCurrentStep(prev => prev + 1);
        
        // Execute next step if still running
        if (currentStep + 1 < steps.length && isRunning) {
          setTimeout(() => executeNextStep(), 1000);
        } else if (currentStep + 1 >= steps.length) {
          completeWorkflow();
        }
      } else {
        handleStepError();
      }
    }, 2000);
  };

  const handleStepError = () => {
    setSteps(prevSteps => 
      prevSteps.map((step, index) => 
        index === currentStep 
          ? { ...step, status: 'error' }
          : step
      )
    );
    
    setError(`Error at step ${currentStep + 1}: ${steps[currentStep]?.name}`);
    setIsRunning(false);
    
    toast({
      title: "Workflow error",
      description: `Failed at: ${steps[currentStep]?.name}. Check guides for troubleshooting.`,
      variant: "destructive",
    });
  };

  const completeWorkflow = () => {
    setIsRunning(false);
    toast({
      title: "Workflow completed",
      description: "All steps have been executed successfully.",
    });
    onComplete?.();
  };

  const progress = (steps.filter(s => s.status === 'completed').length / steps.length) * 100;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">
              Workflow: {workflowName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </CardTitle>
            <CardDescription>
              Automated workflow with guide integration
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {!isRunning ? (
              <Button
                onClick={currentStep > 0 ? resumeWorkflow : startWorkflow}
                size="sm"
                data-testid="button-start-workflow"
              >
                <PlayCircle className="h-4 w-4 mr-1" />
                {currentStep > 0 ? 'Resume' : 'Start'}
              </Button>
            ) : (
              <Button
                onClick={pauseWorkflow}
                size="sm"
                variant="outline"
                data-testid="button-pause-workflow"
              >
                <PauseCircle className="h-4 w-4 mr-1" />
                Pause
              </Button>
            )}
            <Button
              onClick={resetWorkflow}
              size="sm"
              variant="outline"
              disabled={isRunning}
              data-testid="button-reset-workflow"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Workflow Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="steps" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="steps">Steps</TabsTrigger>
            <TabsTrigger value="guides">Related Guides</TabsTrigger>
          </TabsList>

          <TabsContent value="steps" className="mt-4 space-y-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  step.status === 'in-progress' && "bg-primary/5 border-primary",
                  step.status === 'completed' && "bg-green-50 dark:bg-green-900/20",
                  step.status === 'error' && "bg-red-50 dark:bg-red-900/20 border-red-200"
                )}
              >
                <div className="flex-shrink-0">
                  {step.status === 'completed' && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {step.status === 'in-progress' && (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                  )}
                  {step.status === 'pending' && (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  {step.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{step.name}</p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                  )}
                </div>
                <Badge 
                  variant={
                    step.status === 'completed' ? 'default' :
                    step.status === 'in-progress' ? 'secondary' :
                    step.status === 'error' ? 'destructive' : 'outline'
                  }
                >
                  {step.status}
                </Badge>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="guides" className="mt-4 space-y-2">
            {guides.length > 0 ? (
              guides.map((guide) => (
                <Link key={guide.id} href={`/guides/${guide.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm group-hover:text-primary">
                          {guide.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {guide.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No guides available for this workflow
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}