import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  BookOpen, 
  ChevronRight, 
  FileText, 
  Clock, 
  Eye, 
  CheckCircle,
  Circle,
  Home,
  ChevronLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Guide {
  id: number;
  categoryId: number;
  code: string;
  title: string;
  description: string;
  path: string;
  content: any;
  tags: string[];
  viewCount: number;
  documents: GuideDocument[];
}

interface GuideDocument {
  id: number;
  guideId: number;
  documentType: string;
  title: string;
  content: string;
  filePath: string;
  sortOrder: number;
}

interface GuideContent {
  content: string;
  path: string;
  title: string;
}

export default function GuideDetailsPage() {
  const params = useParams();
  const guideId = params.id;
  const [userProgress, setUserProgress] = useState(0);

  const { data: guide, isLoading: guideLoading } = useQuery<Guide>({
    queryKey: [`/api/guides/${guideId}`],
    enabled: !!guideId,
  });

  const { data: content, isLoading: contentLoading } = useQuery<GuideContent>({
    queryKey: [`/api/guides/${guideId}/content`],
    enabled: !!guideId,
  });

  const progressMutation = useMutation({
    mutationFn: (progress: { status: string; progress: number }) =>
      apiRequest(`/api/guides/${guideId}/progress`, {
        method: 'POST',
        body: JSON.stringify(progress),
      }),
    onSuccess: () => {
      toast({
        title: "Progress saved",
        description: "Your progress has been updated",
      });
    },
  });

  const markAsComplete = () => {
    setUserProgress(100);
    progressMutation.mutate({ status: 'completed', progress: 100 });
  };

  const updateProgress = (progress: number) => {
    setUserProgress(progress);
    progressMutation.mutate({ 
      status: progress === 100 ? 'completed' : 'in_progress', 
      progress 
    });
  };

  if (guideLoading || contentLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle>Guide Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested guide could not be found.</p>
            <Link href="/guides">
              <Button className="mt-4">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Guides
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/guides">Guides</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{guide.title}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-4">{guide.title}</CardTitle>
                  {guide.description && (
                    <p className="text-muted-foreground mb-4">{guide.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  {guide.viewCount} views
                </div>
              </div>
              {guide.tags && guide.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {guide.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {content?.content ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <pre className="whitespace-pre-wrap font-sans">{content.content}</pre>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <p>No content available for this guide.</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={userProgress} className="mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                {userProgress}% complete
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => updateProgress(25)} 
                  variant={userProgress >= 25 ? "secondary" : "outline"}
                  className="w-full justify-start"
                >
                  {userProgress >= 25 ? <CheckCircle className="mr-2 h-4 w-4" /> : <Circle className="mr-2 h-4 w-4" />}
                  Started Reading
                </Button>
                <Button 
                  onClick={() => updateProgress(50)} 
                  variant={userProgress >= 50 ? "secondary" : "outline"}
                  className="w-full justify-start"
                >
                  {userProgress >= 50 ? <CheckCircle className="mr-2 h-4 w-4" /> : <Circle className="mr-2 h-4 w-4" />}
                  Halfway Through
                </Button>
                <Button 
                  onClick={() => updateProgress(75)} 
                  variant={userProgress >= 75 ? "secondary" : "outline"}
                  className="w-full justify-start"
                >
                  {userProgress >= 75 ? <CheckCircle className="mr-2 h-4 w-4" /> : <Circle className="mr-2 h-4 w-4" />}
                  Almost Done
                </Button>
                <Button 
                  onClick={markAsComplete} 
                  variant={userProgress === 100 ? "default" : "outline"}
                  className="w-full justify-start"
                >
                  {userProgress === 100 ? <CheckCircle className="mr-2 h-4 w-4" /> : <Circle className="mr-2 h-4 w-4" />}
                  Mark as Complete
                </Button>
              </div>
            </CardContent>
          </Card>

          {guide.documents && guide.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Related Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {guide.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{doc.title}</span>
                      </div>
                      <Badge variant="outline">{doc.documentType}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Guide Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Code:</span>
                  <span className="font-mono">{guide.code}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Path:</span>
                  <span className="text-xs font-mono truncate max-w-[200px]">{guide.path}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Views:</span>
                  <span>{guide.viewCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Link href="/guides">
            <Button variant="outline" className="w-full">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Guides
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}