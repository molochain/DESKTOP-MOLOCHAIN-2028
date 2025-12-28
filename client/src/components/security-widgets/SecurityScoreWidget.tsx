import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, TrendingUp, TrendingDown, Info, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface SecurityScore {
  overall: number;
  categories: {
    authentication: number;
    authorization: number;
    dataProtection: number;
    threatPrevention: number;
    compliance: number;
    monitoring: number;
  };
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
  recommendations: string[];
}

interface SecurityScoreWidgetProps {
  className?: string;
  refreshInterval?: number;
  onRefresh?: () => void;
  fullView?: boolean;
}

export default function SecurityScoreWidget({
  className,
  refreshInterval = 30000,
  onRefresh,
  fullView = false
}: SecurityScoreWidgetProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: score, refetch } = useQuery<SecurityScore>({
    queryKey: ['/api/security/score'],
    refetchInterval: refreshInterval
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  const getTrendIcon = () => {
    if (!score) return null;
    if (score.trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    if (score.trend === 'down') {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  return (
    <Card className={cn('h-full', className)} data-testid="widget-security-score">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Security Score</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8"
            data-testid="button-refresh-score"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </Button>
        </div>
        <CardDescription>Overall security posture assessment</CardDescription>
      </CardHeader>
      <CardContent>
        {score ? (
          <div className="space-y-4">
            {/* Main Score Display */}
            <div className="text-center py-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 animate-pulse" />
                <div className="relative">
                  <div className={cn('text-5xl font-bold', getScoreColor(score.overall))}>
                    {score.overall}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {getScoreLabel(score.overall)}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                {getTrendIcon()}
                <span className="text-sm text-muted-foreground">
                  {score.trend === 'up' ? 'Improving' : score.trend === 'down' ? 'Declining' : 'Stable'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={score.overall} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>Security Score</span>
                <span>100</span>
              </div>
            </div>

            {/* Category Scores */}
            {fullView && (
              <div className="space-y-3 pt-4 border-t">
                <div className="text-sm font-medium">Category Breakdown</div>
                {Object.entries(score.categories).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className={cn('font-medium', getScoreColor(value))}>{value}</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {fullView && score.recommendations.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Info className="h-4 w-4" />
                  Top Recommendations
                </div>
                <ul className="space-y-1">
                  {score.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Last Updated */}
            <div className="text-xs text-muted-foreground text-center pt-2">
              Last updated: {new Date(score.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading security score...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}