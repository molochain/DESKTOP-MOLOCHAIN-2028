import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, AlertCircle, CheckCircle, Info, Sparkles } from 'lucide-react';

export function AIInsightsDashboard() {
  const insights = [
    {
      type: 'opportunity',
      priority: 'high',
      title: 'Optimize Route Network',
      description: 'AI detected 15% efficiency gain potential in European shipping routes',
      impact: '+$2.4M annual savings',
      confidence: 92,
      action: 'View Analysis'
    },
    {
      type: 'alert',
      priority: 'medium',
      title: 'Demand Surge Predicted',
      description: 'Machine learning models predict 40% increase in Asian trade volume next quarter',
      impact: 'Capacity planning required',
      confidence: 85,
      action: 'Prepare Resources'
    },
    {
      type: 'success',
      priority: 'low',
      title: 'Customer Satisfaction Improved',
      description: 'NLP analysis shows 18% improvement in customer sentiment this month',
      impact: 'Retention rate +5%',
      confidence: 94,
      action: 'View Report'
    },
    {
      type: 'info',
      priority: 'medium',
      title: 'Market Trend Analysis',
      description: 'Emerging patterns in commodity prices suggest strategic positioning opportunity',
      impact: 'Competitive advantage',
      confidence: 78,
      action: 'Explore Data'
    }
  ];

  const predictions = [
    { metric: 'Revenue Growth', value: '+12%', period: 'Next Quarter' },
    { metric: 'Cost Reduction', value: '-8%', period: 'Next 6 Months' },
    { metric: 'Efficiency Gain', value: '+15%', period: 'Year End' },
    { metric: 'Market Share', value: '+3%', period: 'Next Year' }
  ];

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'opportunity':
        return TrendingUp;
      case 'alert':
        return AlertCircle;
      case 'success':
        return CheckCircle;
      case 'info':
        return Info;
      default:
        return Brain;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'opportunity':
        return 'text-blue-500';
      case 'alert':
        return 'text-yellow-500';
      case 'success':
        return 'text-green-500';
      case 'info':
        return 'text-gray-500';
      default:
        return 'text-primary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI-Powered Insights
            </CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Live Analysis
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = getTypeIcon(insight.type);
              return (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${getTypeColor(insight.type)}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{insight.title}</h3>
                          <Badge variant={getPriorityColor(insight.priority) as any}>
                            {insight.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {insight.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-medium">{insight.impact}</span>
                          <span className="text-muted-foreground">
                            Confidence: {insight.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      {insight.action}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Predictive Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {predictions.map((pred, index) => (
              <div key={index} className="text-center p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">{pred.metric}</div>
                <div className="text-2xl font-bold text-primary mb-1">{pred.value}</div>
                <div className="text-xs text-muted-foreground">{pred.period}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Model Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Prediction Accuracy</span>
              <span className="text-sm font-medium">94.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Model Training Status</span>
              <Badge className="bg-green-500">Up to date</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Data Points Analyzed</span>
              <span className="text-sm font-medium">15.8M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Insights Generated Today</span>
              <span className="text-sm font-medium">247</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}