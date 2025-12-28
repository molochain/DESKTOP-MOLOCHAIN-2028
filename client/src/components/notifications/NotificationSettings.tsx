import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  Shield, 
  Users, 
  Activity, 
  FileText,
  Mail,
  Smartphone,
  Volume2,
  Save,
  Info
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface NotificationPreferences {
  email: {
    enabled: boolean;
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    categories: {
      security: boolean;
      user: boolean;
      system: boolean;
      compliance: boolean;
      activity: boolean;
    };
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    categories: {
      security: boolean;
      user: boolean;
      system: boolean;
      compliance: boolean;
      activity: boolean;
    };
  };
  sms: {
    enabled: boolean;
    criticalOnly: boolean;
    phoneNumber?: string;
  };
  priorities: {
    critical: 'all' | 'email' | 'sms' | 'none';
    high: 'all' | 'email' | 'sms' | 'none';
    medium: 'all' | 'email' | 'sms' | 'none';
    low: 'all' | 'email' | 'sms' | 'none';
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
}

interface NotificationSettingsProps {
  className?: string;
  onSave?: (preferences: NotificationPreferences) => void;
  onCancel?: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  security: <Shield className="h-4 w-4" />,
  user: <Users className="h-4 w-4" />,
  system: <Activity className="h-4 w-4" />,
  compliance: <FileText className="h-4 w-4" />,
  activity: <Activity className="h-4 w-4" />
};

const categoryLabels: Record<string, string> = {
  security: 'Security Alerts',
  user: 'User Management',
  system: 'System Updates',
  compliance: 'Compliance Reports',
  activity: 'Activity Logs'
};

export default function NotificationSettings({
  className,
  onSave,
  onCancel
}: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      enabled: true,
      frequency: 'immediate',
      categories: {
        security: true,
        user: true,
        system: true,
        compliance: true,
        activity: false
      }
    },
    inApp: {
      enabled: true,
      sound: true,
      desktop: false,
      categories: {
        security: true,
        user: true,
        system: true,
        compliance: true,
        activity: true
      }
    },
    sms: {
      enabled: false,
      criticalOnly: true,
      phoneNumber: ''
    },
    priorities: {
      critical: 'all',
      high: 'all',
      medium: 'email',
      low: 'none'
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
      timezone: 'UTC'
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Fetch user preferences
  const { data: savedPreferences } = useQuery<NotificationPreferences>({
    queryKey: ['/api/notifications/preferences']
  });

  useEffect(() => {
    if (savedPreferences) {
      setPreferences(savedPreferences);
    }
  }, [savedPreferences]);

  // Save preferences mutation
  const saveMutation = useMutation({
    mutationFn: (prefs: NotificationPreferences) => 
      apiRequest('/api/notifications/preferences', 'PUT', prefs),
    onSuccess: () => {
      toast({
        title: 'Settings Saved',
        description: 'Your notification preferences have been updated'
      });
      setHasChanges(false);
      onSave?.(preferences);
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/preferences'] });
    },
    onError: () => {
      toast({
        title: 'Save Failed',
        description: 'Failed to save notification preferences',
        variant: 'destructive'
      });
    }
  });

  const handleSave = () => {
    saveMutation.mutate(preferences);
  };

  const updatePreference = (path: string[], value: any) => {
    setPreferences(prev => {
      const updated = { ...prev };
      let current: any = updated;
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      setHasChanges(true);
      return updated;
    });
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updatePreference(['inApp', 'desktop'], true);
        toast({
          title: 'Desktop Notifications Enabled',
          description: 'You will now receive desktop notifications'
        });
      } else {
        toast({
          title: 'Permission Denied',
          description: 'Desktop notifications require browser permission',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="channels" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="space-y-4 mt-4">
            {/* Email Notifications */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="email-enabled">Email Notifications</Label>
                </div>
                <Switch
                  id="email-enabled"
                  checked={preferences.email.enabled}
                  onCheckedChange={(checked) => updatePreference(['email', 'enabled'], checked)}
                />
              </div>
              {preferences.email.enabled && (
                <div className="ml-6 space-y-2">
                  <Label className="text-sm text-muted-foreground">Frequency</Label>
                  <RadioGroup
                    value={preferences.email.frequency}
                    onValueChange={(value) => updatePreference(['email', 'frequency'], value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="immediate" id="immediate" />
                      <Label htmlFor="immediate" className="text-sm">Immediate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hourly" id="hourly" />
                      <Label htmlFor="hourly" className="text-sm">Hourly Digest</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="daily" id="daily" />
                      <Label htmlFor="daily" className="text-sm">Daily Digest</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekly" id="weekly" />
                      <Label htmlFor="weekly" className="text-sm">Weekly Summary</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>

            <Separator />

            {/* In-App Notifications */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="inapp-enabled">In-App Notifications</Label>
                </div>
                <Switch
                  id="inapp-enabled"
                  checked={preferences.inApp.enabled}
                  onCheckedChange={(checked) => updatePreference(['inApp', 'enabled'], checked)}
                />
              </div>
              {preferences.inApp.enabled && (
                <div className="ml-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound" className="text-sm">Sound Alerts</Label>
                    <Switch
                      id="sound"
                      checked={preferences.inApp.sound}
                      onCheckedChange={(checked) => updatePreference(['inApp', 'sound'], checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="desktop" className="text-sm">Desktop Notifications</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="desktop"
                        checked={preferences.inApp.desktop}
                        onCheckedChange={(checked) => {
                          if (checked && 'Notification' in window && Notification.permission !== 'granted') {
                            requestNotificationPermission();
                          } else {
                            updatePreference(['inApp', 'desktop'], checked);
                          }
                        }}
                      />
                      {preferences.inApp.desktop && 'Notification' in window && Notification.permission !== 'granted' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={requestNotificationPermission}
                        >
                          Enable
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* SMS Notifications */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="sms-enabled">SMS Notifications</Label>
                </div>
                <Switch
                  id="sms-enabled"
                  checked={preferences.sms.enabled}
                  onCheckedChange={(checked) => updatePreference(['sms', 'enabled'], checked)}
                />
              </div>
              {preferences.sms.enabled && (
                <div className="ml-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="critical-only" className="text-sm">Critical Alerts Only</Label>
                    <Switch
                      id="critical-only"
                      checked={preferences.sms.criticalOnly}
                      onCheckedChange={(checked) => updatePreference(['sms', 'criticalOnly'], checked)}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4 mt-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Choose which categories of notifications you want to receive
              </AlertDescription>
            </Alert>

            {/* Email Categories */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Email Notifications</Label>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {categoryIcons[key]}
                    <Label htmlFor={`email-${key}`} className="text-sm">{label}</Label>
                  </div>
                  <Switch
                    id={`email-${key}`}
                    checked={preferences.email.categories[key as keyof typeof preferences.email.categories]}
                    onCheckedChange={(checked) => 
                      updatePreference(['email', 'categories', key], checked)
                    }
                    disabled={!preferences.email.enabled}
                  />
                </div>
              ))}
            </div>

            <Separator />

            {/* In-App Categories */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">In-App Notifications</Label>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {categoryIcons[key]}
                    <Label htmlFor={`inapp-${key}`} className="text-sm">{label}</Label>
                  </div>
                  <Switch
                    id={`inapp-${key}`}
                    checked={preferences.inApp.categories[key as keyof typeof preferences.inApp.categories]}
                    onCheckedChange={(checked) => 
                      updatePreference(['inApp', 'categories', key], checked)
                    }
                    disabled={!preferences.inApp.enabled}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            {/* Priority Settings */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Priority Routing</Label>
              <p className="text-xs text-muted-foreground">
                Choose how to receive notifications based on priority
              </p>
              {Object.entries(preferences.priorities).map(([priority, value]) => (
                <div key={priority} className="flex items-center justify-between">
                  <Label className="text-sm capitalize">{priority} Priority</Label>
                  <RadioGroup
                    value={value}
                    onValueChange={(val) => updatePreference(['priorities', priority], val)}
                    className="flex gap-3"
                  >
                    <div className="flex items-center">
                      <RadioGroupItem value="all" id={`${priority}-all`} />
                      <Label htmlFor={`${priority}-all`} className="text-xs ml-1">All</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="email" id={`${priority}-email`} />
                      <Label htmlFor={`${priority}-email`} className="text-xs ml-1">Email</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="sms" id={`${priority}-sms`} />
                      <Label htmlFor={`${priority}-sms`} className="text-xs ml-1">SMS</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="none" id={`${priority}-none`} />
                      <Label htmlFor={`${priority}-none`} className="text-xs ml-1">None</Label>
                    </div>
                  </RadioGroup>
                </div>
              ))}
            </div>

            <Separator />

            {/* Quiet Hours */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="quiet-hours">Quiet Hours</Label>
                </div>
                <Switch
                  id="quiet-hours"
                  checked={preferences.quietHours.enabled}
                  onCheckedChange={(checked) => updatePreference(['quietHours', 'enabled'], checked)}
                />
              </div>
              {preferences.quietHours.enabled && (
                <div className="ml-6 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Suppress non-critical notifications during quiet hours
                  </p>
                  <div className="flex gap-2 items-center">
                    <input
                      type="time"
                      value={preferences.quietHours.start}
                      onChange={(e) => updatePreference(['quietHours', 'start'], e.target.value)}
                      className="px-2 py-1 text-sm border rounded"
                    />
                    <span className="text-sm">to</span>
                    <input
                      type="time"
                      value={preferences.quietHours.end}
                      onChange={(e) => updatePreference(['quietHours', 'end'], e.target.value)}
                      className="px-2 py-1 text-sm border rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || saveMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}