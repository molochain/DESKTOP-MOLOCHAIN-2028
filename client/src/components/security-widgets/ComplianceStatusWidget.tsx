import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Download,
  Calendar,
  Shield,
  Info
} from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface ComplianceFramework {
  id: string;
  name: string;
  score: number;
  status: 'compliant' | 'non-compliant' | 'partial';
  controls: {
    total: number;
    passed: number;
    failed: number;
    notApplicable: number;
  };
  lastAudit: Date;
  nextAudit: Date;
  findings: number;
  criticalFindings: number;
}

interface ComplianceStatusWidgetProps {
  className?: string;
  refreshInterval?: number;
  onFrameworkClick?: (framework: ComplianceFramework) => void;
  onGenerateReport?: (frameworkId: string) => void;
  fullView?: boolean;
}

const frameworkIcons: Record<string, string> = {
  'SOC2': '🛡️',
  'ISO27001': '🔒',
  'GDPR': '🇪🇺',
  'HIPAA': '🏥',
  'PCI-DSS': '💳',
  'NIST': '🏛️'
};

export default function ComplianceStatusWidget({
  className,
  refreshInterval = 60000,
  onFrameworkClick,
  onGenerateReport,
  fullView = false
}: ComplianceStatusWidgetProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  const { data: frameworks, refetch } = useQuery<ComplianceFramework[]>({
    queryKey: ['/api/compliance/status'],
    refetchInterval: refreshInterval
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'success';
      case 'partial': return 'secondary';
      case 'non-compliant': return 'destructive';
      default: return 'outline';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const overallCompliance = frameworks 
    ? Math.round(frameworks.reduce((acc, f) => acc + f.score, 0) / frameworks.length)
    : 0;

  const criticalFindingsCount = frameworks
    ? frameworks.reduce((acc, f) => acc + f.criticalFindings, 0)
    : 0;

  const upcomingAudits = frameworks
    ? frameworks
        .filter(f => f.nextAudit)
        .sort((a, b) => new Date(a.nextAudit).getTime() - new Date(b.nextAudit).getTime())
        .slice(0, 3)
    : [];

  return (
    <Card className={cn('h-full', className)} data-testid="widget-compliance-status">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <CardTitle>Compliance Status</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {criticalFindingsCount > 0 && (
              <Badge variant="destructive">
                {criticalFindingsCount} Critical
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8"
              data-testid="button-refresh-compliance"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
          </div>
        </div>
        <CardDescription>Regulatory compliance tracking</CardDescription>
      </CardHeader>
      <CardContent>
        {frameworks && frameworks.length > 0 ? (
          <div className="space-y-4">
            {/* Overall Compliance Score */}
            <div className="text-center py-3 border rounded-lg bg-accent/20">
              <p className="text-sm text-muted-foreground mb-1">Overall Compliance</p>
              <div className={cn('text-3xl font-bold', getScoreColor(overallCompliance))}>
                {overallCompliance}%
              </div>
              <Progress value={overallCompliance} className="mt-2 mx-auto w-3/4 h-2" />
            </div>

            {fullView ? (
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
                  <TabsTrigger value="audits">Audits</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-3">
                  {frameworks.map((framework) => (
                    <div
                      key={framework.id}
                      className="p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-all"
                      onClick={() => onFrameworkClick?.(framework)}
                      data-testid={`framework-item-${framework.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span>{frameworkIcons[framework.name] || '📋'}</span>
                          <span className="font-medium">{framework.name}</span>
                        </div>
                        <Badge variant={getStatusColor(framework.status)}>
                          {framework.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Compliance</span>
                          <span className={cn('font-medium', getScoreColor(framework.score))}>
                            {framework.score}%
                          </span>
                        </div>
                        <Progress value={framework.score} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground pt-1">
                          <span>{framework.controls.passed}/{framework.controls.total} controls passed</span>
                          {framework.findings > 0 && (
                            <span className="text-yellow-600">{framework.findings} findings</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="frameworks" className="space-y-3">
                  {frameworks.map((framework) => (
                    <div key={framework.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{framework.name}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onGenerateReport?.(framework.id)}
                          data-testid={`button-generate-report-${framework.id}`}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Report
                        </Button>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="text-center">
                          <p className="text-muted-foreground">Passed</p>
                          <p className="font-medium text-green-600">{framework.controls.passed}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Failed</p>
                          <p className="font-medium text-red-600">{framework.controls.failed}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">N/A</p>
                          <p className="font-medium">{framework.controls.notApplicable}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Total</p>
                          <p className="font-medium">{framework.controls.total}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="audits" className="space-y-3">
                  {upcomingAudits.length > 0 ? (
                    upcomingAudits.map((framework) => (
                      <div key={framework.id} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="font-medium">{framework.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(framework.nextAudit).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last audit: {new Date(framework.lastAudit).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>No upcoming audits scheduled</AlertDescription>
                    </Alert>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              /* Simple View */
              <div className="space-y-2">
                {frameworks.slice(0, 3).map((framework) => (
                  <div
                    key={framework.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-accent/50 cursor-pointer"
                    onClick={() => onFrameworkClick?.(framework)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{frameworkIcons[framework.name] || '📋'}</span>
                      <span className="text-sm font-medium">{framework.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm font-medium', getScoreColor(framework.score))}>
                        {framework.score}%
                      </span>
                      {framework.status === 'compliant' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Next Audit Alert */}
            {upcomingAudits.length > 0 && !fullView && (
              <Alert className="mt-3">
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  Next audit: {upcomingAudits[0].name} on{' '}
                  {new Date(upcomingAudits[0].nextAudit).toLocaleDateString()}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading compliance data...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}