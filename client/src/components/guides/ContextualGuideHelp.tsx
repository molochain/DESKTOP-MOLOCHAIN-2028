import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Link } from 'wouter';
import { BookOpen, HelpCircle, ChevronRight, X, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { GuideContextService } from '@/services/guideContextService';
import { Guide } from '@/types/guides';
import { useToast } from '@/hooks/use-toast';

interface ContextualGuideHelpProps {
  className?: string;
  variant?: 'inline' | 'floating' | 'sidebar';
  showTitle?: boolean;
}

export function ContextualGuideHelp({ 
  className, 
  variant = 'floating',
  showTitle = true 
}: ContextualGuideHelpProps) {
  const [location] = useLocation();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRelevantGuides();
  }, [location]);

  const loadRelevantGuides = async () => {
    setIsLoading(true);
    try {
      const guideCodes = await GuideContextService.getRelevantGuides(location);
      const relevantGuides = await GuideContextService.fetchGuidesByCode(guideCodes);
      setGuides(relevantGuides);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to load contextual guides:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (guides.length === 0) return null;

  if (variant === 'inline') {
    return (
      <div className={cn("space-y-2", className)}>
        {showTitle && (
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>Related Guides</span>
          </div>
        )}
        <div className="grid gap-2">
          {guides.map((guide) => (
            <Link key={guide.id} href={`/guides/${guide.id}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm">{guide.title}</CardTitle>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardDescription className="text-xs mt-1">
                    {guide.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Helpful Guides
          </CardTitle>
          <CardDescription className="text-sm">
            Resources to help you with this section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {guides.map((guide) => (
                <Link key={guide.id} href={`/guides/${guide.id}`}>
                  <div className="p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium group-hover:text-primary">
                          {guide.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {guide.description}
                        </p>
                        {guide.tags && guide.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {guide.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary mt-1 flex-shrink-0 ml-2" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  // Floating variant
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "fixed bottom-24 right-4 z-40 shadow-lg",
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-contextual-help"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      {isOpen && (
        <Card className="fixed bottom-40 right-4 z-40 w-80 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Relevant Guides
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
                data-testid="button-close-help"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-sm">
              Helpful resources for this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading guides...</p>
                ) : (
                  guides.map((guide) => (
                    <Link key={guide.id} href={`/guides/${guide.id}`}>
                      <div className="p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                        <p className="text-sm font-medium">{guide.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {guide.description}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </ScrollArea>
            <div className="mt-3 pt-3 border-t">
              <Link href="/guides">
                <Button variant="outline" size="sm" className="w-full">
                  View All Guides
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}