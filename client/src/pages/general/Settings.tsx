import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Key, Settings as SettingsIcon, Shield, CheckCircle, XCircle, AlertCircle, Loader2, Save } from 'lucide-react';

interface ApiKeyConfig {
  id: string;
  name: string;
  service: string;
  key: string;
  isActive: boolean;
  lastUsed?: string;
  description: string;
  required: boolean;
}

interface SystemSettings {
  apiKeys: ApiKeyConfig[];
  features: {
    openAI: boolean;
    stripe: boolean;
    instagram: boolean;
    googleMaps: boolean;
  };
  performance: {
    cacheEnabled: boolean;
    cacheHitRate: number;
    optimizationLevel: string;
  };
}

const getDefaultSettings = (t: (key: string) => string): SystemSettings => ({
  apiKeys: [
    {
      id: 'openai',
      name: t('settings.apiKeys.openai.name'),
      service: 'openai',
      key: '',
      isActive: false,
      description: t('settings.apiKeys.openai.description'),
      required: true,
    },
    {
      id: 'stripe',
      name: t('settings.apiKeys.stripe.name'),
      service: 'stripe',
      key: '',
      isActive: false,
      description: t('settings.apiKeys.stripe.description'),
      required: true,
    },
    {
      id: 'instagram',
      name: t('settings.apiKeys.instagram.name'),
      service: 'instagram',
      key: '',
      isActive: false,
      description: t('settings.apiKeys.instagram.description'),
      required: false,
    },
    {
      id: 'google-maps',
      name: t('settings.apiKeys.googleMaps.name'),
      service: 'google-maps',
      key: '',
      isActive: false,
      description: t('settings.apiKeys.googleMaps.description'),
      required: false,
    },
  ],
  features: {
    openAI: false,
    stripe: false,
    instagram: false,
    googleMaps: false,
  },
  performance: {
    cacheEnabled: true,
    cacheHitRate: 0,
    optimizationLevel: 'standard',
  },
});

export default function Settings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [editedKeys, setEditedKeys] = useState<{ [key: string]: string }>({});
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});

  const defaultSettings = useMemo(() => getDefaultSettings(t), [t]);

  const { data: settings, isLoading, error } = useQuery<SystemSettings>({
    queryKey: ['/api/settings'],
    retry: 1,
  });

  const updateApiKey = useMutation({
    mutationFn: async ({ id, key }: { id: string; key: string }) => {
      return apiRequest('PATCH', `/api/settings/api-keys/${id}`, { key });
    },
    onSuccess: () => {
      toast({
        title: t('settings.toast.success'),
        description: t('settings.toast.apiKeyUpdated'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error) => {
      toast({
        title: t('settings.toast.error'),
        description: t('settings.toast.apiKeyUpdateFailed'),
        variant: 'destructive',
      });
    },
  });

  const toggleFeature = useMutation({
    mutationFn: async ({ feature, enabled }: { feature: string; enabled: boolean }) => {
      return apiRequest('PATCH', '/api/settings/features', { feature, enabled });
    },
    onSuccess: () => {
      toast({
        title: t('settings.toast.success'),
        description: t('settings.toast.featureUpdated'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
  });

  const handleToggleShowKey = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEditKey = (id: string) => {
    setIsEditing(prev => ({ ...prev, [id]: true }));
    const currentKey = settings?.apiKeys.find(k => k.id === id)?.key || '';
    setEditedKeys(prev => ({ ...prev, [id]: currentKey }));
  };

  const handleSaveKey = async (id: string) => {
    const newKey = editedKeys[id];
    if (!newKey || newKey.trim() === '') {
      toast({
        title: t('settings.toast.error'),
        description: t('settings.toast.apiKeyEmpty'),
        variant: 'destructive',
      });
      return;
    }

    await updateApiKey.mutateAsync({ id, key: newKey });
    setIsEditing(prev => ({ ...prev, [id]: false }));
  };

  const handleCancelEdit = (id: string) => {
    setIsEditing(prev => ({ ...prev, [id]: false }));
    setEditedKeys(prev => ({ ...prev, [id]: '' }));
  };

  const maskApiKey = (key: string) => {
    if (!key || key.length < 8) return '••••••••';
    return `${key.substring(0, 4)}••••••••${key.substring(key.length - 4)}`;
  };

  const getFeatureDescription = (feature: string): string => {
    const descriptions: { [key: string]: string } = {
      openAI: t('settings.features.openAI.description'),
      stripe: t('settings.features.stripe.description'),
      instagram: t('settings.features.instagram.description'),
      googleMaps: t('settings.features.googleMaps.description'),
    };
    return descriptions[feature] || '';
  };

  const getFeatureName = (feature: string): string => {
    const names: { [key: string]: string } = {
      openAI: t('settings.features.openAI.name'),
      stripe: t('settings.features.stripe.name'),
      instagram: t('settings.features.instagram.name'),
      googleMaps: t('settings.features.googleMaps.name'),
    };
    return names[feature] || feature.replace(/([A-Z])/g, ' $1').trim();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const currentSettings = settings || defaultSettings;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <SettingsIcon className="w-8 h-8" />
              {t('settings.title')}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t('settings.description')}
            </p>
          </div>
        </div>

        <Tabs defaultValue="api-keys">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="api-keys">{t('settings.tabs.apiKeys')}</TabsTrigger>
            <TabsTrigger value="features">{t('settings.tabs.features')}</TabsTrigger>
            <TabsTrigger value="performance">{t('settings.tabs.performance')}</TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  {t('settings.apiKeyManagement.title')}
                </CardTitle>
                <CardDescription>
                  {t('settings.apiKeyManagement.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentSettings.apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{apiKey.name}</h3>
                          {apiKey.required && (
                            <Badge variant="secondary">{t('settings.badges.required')}</Badge>
                          )}
                          {apiKey.isActive ? (
                            <Badge variant="default" className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              {t('settings.badges.active')}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              {t('settings.badges.notConfigured')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {apiKey.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`key-${apiKey.id}`}>{t('settings.apiKeyManagement.apiKeyLabel')}</Label>
                      <div className="flex items-center gap-2">
                        {isEditing[apiKey.id] ? (
                          <>
                            <Input
                              id={`key-${apiKey.id}`}
                              type="text"
                              value={editedKeys[apiKey.id] || ''}
                              onChange={(e) => setEditedKeys(prev => ({ ...prev, [apiKey.id]: e.target.value }))}
                              placeholder={t('settings.apiKeyManagement.placeholder')}
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSaveKey(apiKey.id)}
                              disabled={updateApiKey.isPending}
                            >
                              {updateApiKey.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelEdit(apiKey.id)}
                            >
                              {t('settings.buttons.cancel')}
                            </Button>
                          </>
                        ) : (
                          <>
                            <Input
                              id={`key-${apiKey.id}`}
                              type={showKeys[apiKey.id] ? 'text' : 'password'}
                              value={apiKey.key || ''}
                              readOnly
                              placeholder={apiKey.key ? maskApiKey(apiKey.key) : t('settings.apiKeyManagement.notConfiguredPlaceholder')}
                              className="flex-1"
                              data-testid={`input-api-key-${apiKey.id}`}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleShowKey(apiKey.id)}
                              data-testid={`button-toggle-view-${apiKey.id}`}
                            >
                              {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleEditKey(apiKey.id)}
                              data-testid={`button-edit-${apiKey.id}`}
                            >
                              {t('settings.buttons.edit')}
                            </Button>
                          </>
                        )}
                      </div>
                      {apiKey.lastUsed && (
                        <p className="text-xs text-muted-foreground">
                          {t('settings.apiKeyManagement.lastUsed')}: {new Date(apiKey.lastUsed).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                <Alert>
                  <Shield className="w-4 h-4" />
                  <AlertTitle>{t('settings.alerts.securityNotice.title')}</AlertTitle>
                  <AlertDescription>
                    {t('settings.alerts.securityNotice.description')}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.featureConfiguration.title')}</CardTitle>
                <CardDescription>
                  {t('settings.featureConfiguration.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {Object.entries(currentSettings.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{getFeatureName(feature)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {getFeatureDescription(feature)}
                        </p>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => toggleFeature.mutate({ feature, enabled: checked })}
                        data-testid={`switch-feature-${feature}`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.performance.title')}</CardTitle>
                <CardDescription>
                  {t('settings.performance.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{t('settings.performance.cachePerformance')}</h3>
                      <Badge variant={currentSettings.performance.cacheHitRate > 80 ? 'default' : 'secondary'}>
                        {currentSettings.performance.cacheHitRate}% {t('settings.performance.hitRate')}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t('settings.performance.cacheEnabled')}</span>
                        <Switch
                          checked={currentSettings.performance.cacheEnabled}
                          data-testid="switch-cache-enabled"
                        />
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${currentSettings.performance.cacheHitRate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{t('settings.performance.optimizationLevel')}</h3>
                    <div className="flex gap-2">
                      {['standard', 'balanced', 'performance'].map((level) => (
                        <Badge
                          key={level}
                          variant={currentSettings.performance.optimizationLevel === level ? 'default' : 'outline'}
                          className="capitalize"
                        >
                          {t(`settings.performance.levels.${level}`)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertTitle>{t('settings.alerts.performanceTip.title')}</AlertTitle>
                  <AlertDescription>
                    {t('settings.alerts.performanceTip.description', { hitRate: currentSettings.performance.cacheHitRate })}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
