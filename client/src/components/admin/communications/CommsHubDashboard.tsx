import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Bell, 
  Send, 
  Activity, 
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

interface ChannelStatus {
  name: string;
  enabled: boolean;
  healthy: boolean;
  lastCheck: string;
  stats: {
    sent: number;
    failed: number;
    pending: number;
  };
}

interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  scheduled: number;
  queueLength: number;
}

interface AnalyticsOverview {
  summary: {
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    deliveryRate: number;
  };
  byChannel: Array<{
    channel: string;
    sent: number;
    delivered: number;
    failed: number;
    deliveryRate: number;
  }>;
}

const COMMS_HUB_URL = import.meta.env.VITE_COMMS_HUB_URL || '';
const COMMS_API_BASE = COMMS_HUB_URL ? `${COMMS_HUB_URL}/api` : '/api/communications';

export function CommsHubDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: channelStatus, isLoading: loadingChannels, refetch: refetchChannels } = useQuery<{ channels: Record<string, ChannelStatus> }>({
    queryKey: [COMMS_API_BASE, 'channels', 'status'],
  });

  const { data: queueStats, refetch: refetchQueue } = useQuery<QueueStats>({
    queryKey: [COMMS_API_BASE, 'messages', 'queue', 'stats'],
  });

  const { data: analytics } = useQuery<AnalyticsOverview>({
    queryKey: [COMMS_API_BASE, 'analytics', 'overview'],
  });

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-5 w-5" />;
      case 'sms': return <Phone className="h-5 w-5" />;
      case 'whatsapp': return <MessageSquare className="h-5 w-5" />;
      case 'push': return <Bell className="h-5 w-5" />;
      default: return <Send className="h-5 w-5" />;
    }
  };

  const handleRefresh = () => {
    refetchChannels();
    refetchQueue();
    toast({ title: 'Refreshed', description: 'Data updated successfully' });
  };

  return (
    <div className="space-y-6" data-testid="communications-hub">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communications Hub</h1>
          <p className="text-muted-foreground">Manage email, SMS, WhatsApp, and push notifications</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" data-testid="button-refresh">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="send" data-testid="tab-send">Send Message</TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {channelStatus?.channels && Object.entries(channelStatus.channels).map(([name, status]) => (
              <Card key={name} data-testid={`card-channel-${name}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize flex items-center gap-2">
                    {getChannelIcon(name)}
                    {name}
                  </CardTitle>
                  <Badge variant={status.healthy ? 'default' : 'destructive'}>
                    {status.healthy ? 'Healthy' : 'Unhealthy'}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    {status.enabled ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">{status.enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-bold text-green-600">{status.stats.sent}</div>
                      <div className="text-muted-foreground">Sent</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-yellow-600">{status.stats.pending}</div>
                      <div className="text-muted-foreground">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-red-600">{status.stats.failed}</div>
                      <div className="text-muted-foreground">Failed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {queueStats && (
            <Card data-testid="card-queue-stats">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Message Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{queueStats.pending}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{queueStats.processing}</div>
                    <div className="text-sm text-muted-foreground">Processing</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{queueStats.completed}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{queueStats.failed}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{queueStats.scheduled}</div>
                    <div className="text-sm text-muted-foreground">Scheduled</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="send">
          <SendMessageForm />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesManager />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard analytics={analytics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SendMessageForm() {
  const { toast } = useToast();
  const [channel, setChannel] = useState('email');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const sendMutation = useMutation({
    mutationFn: async (data: { channel: string; recipient: string; subject?: string; body: string }) => {
      return apiRequest('POST', `${COMMS_API_BASE}/messages/send`, data);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Message queued for delivery' });
      setRecipient('');
      setSubject('');
      setBody('');
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleSend = () => {
    if (!recipient || !body) {
      toast({ title: 'Validation Error', description: 'Recipient and body are required', variant: 'destructive' });
      return;
    }
    sendMutation.mutate({ channel, recipient, subject: subject || undefined, body });
  };

  return (
    <Card data-testid="card-send-message">
      <CardHeader>
        <CardTitle>Send Message</CardTitle>
        <CardDescription>Send a message via any channel</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="channel">Channel</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger data-testid="select-channel">
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="push">Push Notification</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              placeholder={channel === 'email' ? 'user@example.com' : '+1234567890'}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              data-testid="input-recipient"
            />
          </div>
        </div>

        {channel === 'email' && (
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Message subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              data-testid="input-subject"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="body">Message Body</Label>
          <Textarea
            id="body"
            placeholder="Enter your message..."
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            data-testid="input-body"
          />
        </div>

        <Button 
          onClick={handleSend} 
          disabled={sendMutation.isPending}
          className="w-full"
          data-testid="button-send"
        >
          {sendMutation.isPending ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function TemplatesManager() {
  const { data: templates } = useQuery<{ templates: any[]; total: number }>({
    queryKey: [COMMS_API_BASE, 'templates'],
  });

  return (
    <Card data-testid="card-templates">
      <CardHeader>
        <CardTitle>Message Templates</CardTitle>
        <CardDescription>Manage reusable message templates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {templates?.templates?.map((template) => (
            <div 
              key={template.slug} 
              className="flex items-center justify-between p-4 border rounded-lg"
              data-testid={`template-${template.slug}`}
            >
              <div>
                <div className="font-medium">{template.name}</div>
                <div className="text-sm text-muted-foreground">
                  {template.channelType} • {template.variables?.length || 0} variables
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={template.active ? 'default' : 'secondary'}>
                  {template.active ? 'Active' : 'Inactive'}
                </Badge>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </div>
          ))}
          {(!templates?.templates || templates.templates.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No templates found. Create one to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsDashboard({ analytics }: { analytics?: AnalyticsOverview }) {
  if (!analytics) {
    return (
      <Card data-testid="card-analytics-loading">
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading analytics...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="analytics-dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.totalSent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.summary.totalDelivered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.summary.totalFailed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Delivery Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.deliveryRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Channel Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.byChannel.map((ch) => (
              <div key={ch.channel} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="font-medium capitalize">{ch.channel}</div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div><span className="text-muted-foreground">Sent:</span> {ch.sent}</div>
                  <div><span className="text-muted-foreground">Delivered:</span> {ch.delivered}</div>
                  <div><span className="text-muted-foreground">Failed:</span> {ch.failed}</div>
                  <Badge variant="outline">{ch.deliveryRate}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CommunicationsHub;
