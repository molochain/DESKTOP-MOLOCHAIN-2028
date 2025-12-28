import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'wouter';

interface HealthRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'reliability' | 'security' | 'maintenance';
  title: string;
  description: string;
  estimatedImpact: 'low' | 'medium' | 'high';
  confidence: number;
  preventiveScore: number;
  createdAt: string;
}

interface HealthRecommendationsData {
  recommendations: HealthRecommendation[];
  totalRecommendations: number;
  priorityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

const priorityColors = {
  critical: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-green-500 text-white'
};

export default function HealthRecommendationsWidget() {
  const { data, isLoading, error, isError } = useQuery<HealthRecommendationsData>({
    queryKey: ['health-recommendations-widget'],
    queryFn: async () => {
      const response = await fetch('/api/health-recommendations');
      if (response.status === 503) {
        return { recommendations: [], totalRecommendations: 0, priorityCounts: { critical: 0, high: 0, medium: 0, low: 0 }, disabled: true };
      }
      if (!response.ok) {
        throw new Error('Failed to fetch health recommendations');
      }
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    retry: false,
  });

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Health Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load health recommendations
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if ((data as any)?.disabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-gray-400" />
            AI Health Recommendations
          </CardTitle>
          <CardDescription>AI-powered system insights</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-muted/50">
            <Brain className="h-4 w-4" />
            <AlertDescription>
              AI recommendations are currently disabled. Contact your administrator to enable this feature.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Health Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const topRecommendations = data?.recommendations
    .sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 3) || [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Health Recommendations
          </CardTitle>
          <Link href="/admin/health-recommendations">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <CardDescription>
          Intelligent system optimization suggestions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="space-y-1">
            <div className="text-lg font-bold text-red-600">
              {data?.priorityCounts.critical || 0}
            </div>
            <div className="text-xs text-muted-foreground">Critical</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-bold text-orange-600">
              {data?.priorityCounts.high || 0}
            </div>
            <div className="text-xs text-muted-foreground">High</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-bold text-yellow-600">
              {data?.priorityCounts.medium || 0}
            </div>
            <div className="text-xs text-muted-foreground">Medium</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-bold text-green-600">
              {data?.priorityCounts.low || 0}
            </div>
            <div className="text-xs text-muted-foreground">Low</div>
          </div>
        </div>

        {/* Top Recommendations */}
        {topRecommendations.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              All systems running optimally
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {topRecommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className="border rounded-lg p-3 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={priorityColors[recommendation.priority]}>
                        {recommendation.priority.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {recommendation.category}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm leading-tight">
                      {recommendation.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {recommendation.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span>
                      Impact: <span className="font-medium">{recommendation.estimatedImpact}</span>
                    </span>
                    <span>
                      Confidence: <span className="font-medium">{(recommendation.confidence * 100).toFixed(0)}%</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(recommendation.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {data && data.totalRecommendations > 3 && (
          <div className="text-center pt-2">
            <Link href="/admin/health-recommendations">
              <Button variant="ghost" size="sm" className="text-xs">
                View {data.totalRecommendations - 3} more recommendations
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}