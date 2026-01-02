import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, Key, AlertTriangle, CheckCircle, XCircle, Clock, Users, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface SecuritySettings {
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireTwoFactor: boolean;
  enforcePasswordComplexity: boolean;
  auditLogsEnabled: boolean;
  ipWhitelist: string[];
  rateLimiting: {
    enabled: boolean;
    maxRequests: number;
    windowMinutes: number;
  };
}

interface SecurityStats {
  totalUsers: number;
  activeUsers: number;
  twoFactorUsers: number;
  recentFailedLogins: number;
  securityScore: number;
  lastSecurityScan: string;
}

interface AuditLog {
  id: number;
  userId: number;
  username: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: any;
  ipAddress: string;
  timestamp: string;
}

export default function SecuritySettings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newIpAddress, setNewIpAddress] = useState('');

  const { data: securitySettings, isLoading: settingsLoading } = useQuery<SecuritySettings>({
    queryKey: ['/api/admin/security/settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/security/settings');
      if (!response.ok) throw new Error('Failed to fetch security settings');
      return response.json();
    }
  });

  const { data: securityStats } = useQuery<SecurityStats>({
    queryKey: ['/api/admin/security/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/security/stats');
      if (!response.ok) throw new Error('Failed to fetch security stats');
      return response.json();
    }
  });

  const { data: auditLogs } = useQuery<AuditLog[]>({
    queryKey: ['/api/admin/security/audit-logs'],
    queryFn: async () => {
      const response = await fetch('/api/admin/security/audit-logs?limit=50');
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      return response.json();
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<SecuritySettings>) => {
      const response = await fetch('/api/admin/security/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error('Failed to update security settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/security/settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/security/stats'] });
      toast({
        title: t('admin.security.settings.toast.successTitle'),
        description: t('admin.security.settings.toast.settingsUpdated')
      });
    },
    onError: (error: any) => {
      toast({
        title: t('admin.security.settings.toast.errorTitle'),
        description: error.message || t('common.unexpectedError'),
        variant: 'destructive'
      });
    }
  });

  const securityScanMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/security/scan', {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to run security scan');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/security/stats'] });
      toast({
        title: t('admin.security.settings.toast.scanCompleteTitle'),
        description: t('admin.security.settings.toast.scanCompleteDesc')
      });
    },
    onError: (error: any) => {
      toast({
        title: t('admin.security.settings.toast.errorTitle'),
        description: error.message || t('common.unexpectedError'),
        variant: 'destructive'
      });
    }
  });

  const updateSetting = (key: keyof SecuritySettings, value: any) => {
    if (!securitySettings) return;
    
    const updatedSettings = {
      ...securitySettings,
      [key]: value
    };
    
    updateSettingsMutation.mutate({ [key]: value });
  };

  const addIpToWhitelist = () => {
    if (!newIpAddress || !securitySettings) return;
    
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(newIpAddress)) {
      toast({
        title: t('admin.security.settings.toast.invalidIpTitle'),
        description: t('admin.security.settings.toast.invalidIpDesc'),
        variant: 'destructive'
      });
      return;
    }

    const updatedWhitelist = [...securitySettings.ipWhitelist, newIpAddress];
    updateSetting('ipWhitelist', updatedWhitelist);
    setNewIpAddress('');
  };

  const removeIpFromWhitelist = (ip: string) => {
    if (!securitySettings) return;
    
    const updatedWhitelist = securitySettings.ipWhitelist.filter(addr => addr !== ip);
    updateSetting('ipWhitelist', updatedWhitelist);
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSecurityScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">{t('admin.security.settings.title')}</h2>
        <Button
          onClick={() => securityScanMutation.mutate()}
          disabled={securityScanMutation.isPending}
        >
          {securityScanMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Shield className="h-4 w-4 mr-2" />
          {t('admin.security.settings.buttons.runSecurityScan')}
        </Button>
      </div>

      {/* Security Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.security.settings.overview.securityScore')}</CardTitle>
            {getSecurityScoreIcon(securityStats?.securityScore || 0)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSecurityScoreColor(securityStats?.securityScore || 0)}`}>
              {securityStats?.securityScore || 0}%
            </div>
            <Progress value={securityStats?.securityScore || 0} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.security.settings.overview.twoFactorUsers')}</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.twoFactorUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.security.settings.overview.ofTotalUsers', { total: securityStats?.totalUsers || 0 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.security.settings.overview.failedLogins')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.recentFailedLogins || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.security.settings.overview.inLast24Hours')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.security.settings.overview.lastScan')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {securityStats?.lastSecurityScan 
                ? new Date(securityStats.lastSecurityScan).toLocaleDateString()
                : t('admin.security.settings.overview.never')
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">{t('admin.security.settings.tabs.settings')}</TabsTrigger>
          <TabsTrigger value="access">{t('admin.security.settings.tabs.accessControl')}</TabsTrigger>
          <TabsTrigger value="audit">{t('admin.security.settings.tabs.auditLogs')}</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.security.settings.sections.authenticationSettings')}</CardTitle>
                <CardDescription>
                  {t('admin.security.settings.sections.authenticationSettingsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('admin.security.settings.form.requireTwoFactor')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('admin.security.settings.form.requireTwoFactorDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings?.requireTwoFactor || false}
                    onCheckedChange={(checked) => updateSetting('requireTwoFactor', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">{t('admin.security.settings.form.sessionTimeout')}</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings?.sessionTimeout || 60}
                    onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">{t('admin.security.settings.form.maxLoginAttempts')}</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={securitySettings?.maxLoginAttempts || 5}
                    onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">{t('admin.security.settings.form.passwordMinLength')}</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={securitySettings?.passwordMinLength || 8}
                    onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('admin.security.settings.sections.securityFeatures')}</CardTitle>
                <CardDescription>
                  {t('admin.security.settings.sections.securityFeaturesDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('admin.security.settings.form.passwordComplexity')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('admin.security.settings.form.passwordComplexityDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings?.enforcePasswordComplexity || false}
                    onCheckedChange={(checked) => updateSetting('enforcePasswordComplexity', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('admin.security.settings.form.auditLogs')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('admin.security.settings.form.auditLogsDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings?.auditLogsEnabled || false}
                    onCheckedChange={(checked) => updateSetting('auditLogsEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('admin.security.settings.form.rateLimiting')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('admin.security.settings.form.rateLimitingDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings?.rateLimiting?.enabled || false}
                    onCheckedChange={(checked) => updateSetting('rateLimiting', {
                      ...securitySettings?.rateLimiting,
                      enabled: checked
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.security.settings.sections.ipWhitelist')}</CardTitle>
              <CardDescription>
                {t('admin.security.settings.sections.ipWhitelistDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder={t('admin.security.settings.form.ipPlaceholder')}
                    value={newIpAddress}
                    onChange={(e) => setNewIpAddress(e.target.value)}
                  />
                  <Button onClick={addIpToWhitelist}>
                    {t('admin.security.settings.buttons.addIp')}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {securitySettings?.ipWhitelist?.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-mono">{ip}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeIpFromWhitelist(ip)}
                      >
                        {t('admin.security.settings.buttons.remove')}
                      </Button>
                    </div>
                  ))}
                  
                  {(!securitySettings?.ipWhitelist || securitySettings.ipWhitelist.length === 0) && (
                    <p className="text-sm text-muted-foreground">
                      {t('admin.security.settings.noIpAddresses')}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.security.settings.sections.recentActivity')}</CardTitle>
              <CardDescription>
                {t('admin.security.settings.sections.recentActivityDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditLogs?.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{log.action}</Badge>
                        <span className="font-medium">{log.username}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {log.resourceType} • {log.ipAddress} • {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {(!auditLogs || auditLogs.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {t('admin.security.settings.noAuditLogs')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}