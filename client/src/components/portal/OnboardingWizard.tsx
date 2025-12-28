import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  User,
  Bell,
  Shield,
  Truck,
  BarChart3,
  Sparkles,
  X,
  PartyPopper,
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const ONBOARDING_STORAGE_KEY = 'molochain_onboarding_completed';

export function useOnboarding() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkedUserId, setCheckedUserId] = useState<number | null>(null);

  useEffect(() => {
    if (user && user.id !== checkedUserId) {
      const completed = localStorage.getItem(`${ONBOARDING_STORAGE_KEY}_${user.id}`);
      if (!completed) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
      }
      setCheckedUserId(user.id);
    } else if (!user) {
      setShowOnboarding(false);
      setCheckedUserId(null);
    }
  }, [user, checkedUserId]);

  const completeOnboarding = () => {
    if (user) {
      localStorage.setItem(`${ONBOARDING_STORAGE_KEY}_${user.id}`, 'true');
    }
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    if (user) {
      localStorage.removeItem(`${ONBOARDING_STORAGE_KEY}_${user.id}`);
    }
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    completeOnboarding,
    resetOnboarding,
  };
}

export default function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Molochain Portal',
      description: 'Your all-in-one logistics management platform',
      icon: PartyPopper,
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-transparent text-primary-foreground text-2xl font-bold">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h3 className="text-xl font-semibold">Hello, {user?.username || 'there'}!</h3>
            <p className="text-muted-foreground mt-2">
              We're excited to have you on board. Let's take a quick tour to help you get started with the platform.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">Supply Chain</Badge>
            <Badge variant="secondary">Real-time Tracking</Badge>
            <Badge variant="secondary">Analytics</Badge>
            <Badge variant="secondary">AI-Powered</Badge>
          </div>
        </div>
      ),
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Set up your account for a personalized experience',
      icon: User,
      content: (
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Your Profile</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your contact information, company details, and preferences to get the most out of Molochain.
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Username: {user?.username}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Email: {user?.email}
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                    Add phone number (optional)
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                    Set notification preferences
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            You can always update your profile later in the Settings page.
          </p>
        </div>
      ),
    },
    {
      id: 'tracking',
      title: 'Track Your Shipments',
      description: 'Monitor your logistics in real-time',
      icon: Truck,
      content: (
        <div className="space-y-4">
          <div className="grid gap-3">
            <div className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Truck className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-medium">Real-time Tracking</h4>
                  <p className="text-sm text-muted-foreground">GPS-enabled tracking for all your shipments</p>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Bell className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-medium">Instant Notifications</h4>
                  <p className="text-sm text-muted-foreground">Get alerts for delays, deliveries, and updates</p>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-medium">Performance Analytics</h4>
                  <p className="text-sm text-muted-foreground">Detailed insights into your logistics operations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'security',
      title: 'Secure Your Account',
      description: 'Enable two-factor authentication for extra security',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-amber-500/5 border-amber-500/20">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Shield className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Add an extra layer of security to protect your account and sensitive logistics data.
                </p>
                <Button variant="outline" size="sm" className="mt-3" data-testid="button-enable-2fa">
                  Enable 2FA
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Security Features:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Encrypted data transmission
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Session management
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Audit logging
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Role-based access control
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'ai',
      title: 'AI-Powered Features',
      description: 'Leverage artificial intelligence for smarter logistics',
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h4 className="font-medium">Meet Rayanava AI</h4>
            <p className="text-sm text-muted-foreground">Your intelligent logistics assistant</p>
          </div>
          <div className="grid gap-3">
            <div className="p-3 border rounded-lg text-sm">
              <strong>Route Optimization</strong> - AI-powered route planning to reduce costs
            </div>
            <div className="p-3 border rounded-lg text-sm">
              <strong>Predictive Analytics</strong> - Forecast demand and prevent delays
            </div>
            <div className="p-3 border rounded-lg text-sm">
              <strong>Smart Recommendations</strong> - Get actionable insights for your operations
            </div>
            <div className="p-3 border rounded-lg text-sm">
              <strong>Document Processing</strong> - OCR and automated data extraction
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'complete',
      title: "You're All Set!",
      description: 'Start exploring the Molochain Portal',
      icon: Check,
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <Check className="h-10 w-10 text-green-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Congratulations!</h3>
            <p className="text-muted-foreground mt-2">
              You've completed the onboarding. You're now ready to explore all the features of Molochain Portal.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'} data-testid="button-go-dashboard">
              Go to Dashboard
            </Button>
            <Button onClick={() => window.location.href = '/tracking'} data-testid="button-start-tracking">
              Start Tracking
            </Button>
          </div>
        </div>
      ),
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl" data-testid="onboarding-wizard">
        <CardHeader className="relative pb-2">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleSkip}
            data-testid="button-close-onboarding"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </div>
          </div>
          <Progress value={progress} className="h-1" />
          <div className="flex justify-center gap-2 mt-3">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentStep && 'w-6 bg-primary',
                  index !== currentStep && completedSteps.has(index) && 'bg-green-500',
                  index !== currentStep && !completedSteps.has(index) && 'bg-muted-foreground/30'
                )}
                data-testid={`step-indicator-${index}`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="min-h-[300px]">{currentStepData.content}</CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            data-testid="button-back"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            {currentStep < steps.length - 1 && (
              <Button variant="ghost" onClick={handleSkip} data-testid="button-skip">
                Skip Tour
              </Button>
            )}
            <Button onClick={handleNext} data-testid="button-next">
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              {currentStep < steps.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
