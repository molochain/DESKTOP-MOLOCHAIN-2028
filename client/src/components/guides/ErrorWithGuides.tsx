import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertCircle, BookOpen, ChevronDown, ChevronRight, ExternalLink, HelpCircle } from 'lucide-react';
import { Link } from 'wouter';
import { GuideContextService } from '@/services/guideContextService';
import { Guide } from '@/types/guides';
import { cn } from '@/lib/utils';

interface ErrorWithGuidesProps {
  error: Error | string;
  errorCode?: string;
  title?: string;
  className?: string;
  variant?: 'default' | 'destructive';
  showGuides?: boolean;
  onRetry?: () => void;
}

export function ErrorWithGuides({
  error,
  errorCode = 'API_ERROR',
  title = 'An error occurred',
  className,
  variant = 'destructive',
  showGuides = true,
  onRetry
}: ErrorWithGuidesProps) {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isGuidesOpen, setIsGuidesOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const errorMessage = typeof error === 'string' ? error : error.message;

  useEffect(() => {
    if (showGuides) {
      loadErrorGuides();
    }
  }, [errorCode, showGuides]);

  const loadErrorGuides = async () => {
    setIsLoading(true);
    try {
      const guideCodes = await GuideContextService.getErrorGuides(errorCode);
      const errorGuides = await GuideContextService.fetchGuidesByCode(guideCodes);
      setGuides(errorGuides);
      // Auto-open guides if we have them
      if (errorGuides.length > 0) {
        setIsGuidesOpen(true);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Failed to load error guides:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Alert variant={variant} className={cn("", className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>{errorMessage}</p>
        
        {errorCode && (
          <p className="text-xs text-muted-foreground">
            Error Code: {errorCode}
          </p>
        )}

        {(onRetry || (showGuides && guides.length > 0)) && (
          <div className="flex gap-2 mt-3">
            {onRetry && (
              <Button 
                size="sm" 
                onClick={onRetry}
                data-testid="button-retry"
              >
                Try Again
              </Button>
            )}
            {showGuides && guides.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsGuidesOpen(!isGuidesOpen)}
                data-testid="button-toggle-guides"
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Help Guides
                {isGuidesOpen ? (
                  <ChevronDown className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-1" />
                )}
              </Button>
            )}
          </div>
        )}

        {showGuides && guides.length > 0 && (
          <Collapsible open={isGuidesOpen} onOpenChange={setIsGuidesOpen}>
            <CollapsibleContent className="mt-3">
              <Card className="bg-background/50">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Helpful Resources
                  </CardTitle>
                  <CardDescription className="text-xs">
                    These guides may help resolve this issue
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="space-y-2">
                    {guides.map((guide) => (
                      <Link key={guide.id} href={`/guides/${guide.id}`}>
                        <div className="flex items-center justify-between p-2 rounded hover:bg-accent transition-colors cursor-pointer group">
                          <div className="flex-1">
                            <p className="text-sm font-medium group-hover:text-primary">
                              {guide.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {guide.description}
                            </p>
                          </div>
                          <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary flex-shrink-0 ml-2" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Enhanced error boundary with guide support
export class ErrorBoundaryWithGuides extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorCode: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorCode: 'RUNTIME_ERROR' };
  }

  static getDerivedStateFromError(error: Error) {
    // Determine error code based on error type
    let errorCode = 'RUNTIME_ERROR';
    
    if (error.message.includes('permission') || error.message.includes('unauthorized')) {
      errorCode = 'PERMISSION_DENIED';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorCode = 'NETWORK_ERROR';
    } else if (error.message.includes('validation')) {
      errorCode = 'VALIDATION_ERROR';
    } else if (error.message.includes('database') || error.message.includes('query')) {
      errorCode = 'DATABASE_ERROR';
    }

    return { hasError: true, error, errorCode };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Error boundary caught:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorCode: 'RUNTIME_ERROR' });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Application Error
              </CardTitle>
              <CardDescription>
                Something went wrong. The error details and helpful guides are shown below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorWithGuides
                error={this.state.error}
                errorCode={this.state.errorCode}
                title="Runtime Error"
                onRetry={this.handleReset}
              />
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for programmatic error handling with guides
export function useErrorWithGuides() {
  const [error, setError] = useState<{ message: string; code: string } | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);

  const showError = async (message: string, code: string = 'API_ERROR') => {
    setError({ message, code });
    
    try {
      const guideCodes = await GuideContextService.getErrorGuides(code);
      const errorGuides = await GuideContextService.fetchGuidesByCode(guideCodes);
      setGuides(errorGuides);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Failed to load error guides:', err);
      }
    }
  };

  const clearError = () => {
    setError(null);
    setGuides([]);
  };

  return {
    error,
    guides,
    showError,
    clearError,
    ErrorDisplay: error ? (
      <ErrorWithGuides
        error={error.message}
        errorCode={error.code}
        onRetry={clearError}
      />
    ) : null
  };
}