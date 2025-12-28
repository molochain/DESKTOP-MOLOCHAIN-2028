import React, { useState, useEffect } from 'react';
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

export default function Settings() {
  const { toast } = useToast();
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [editedKeys, setEditedKeys] = useState<{ [key: string]: string }>({});
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});

  // Fetch system settings
  const { data: settings, isLoading, error } = useQuery<SystemSettings>({
    queryKey: ['/api/settings'],
    retry: 1,
  });

  // Update API key mutation
  const updateApiKey = useMutation({
    mutationFn: async ({ id, key }: { id: string; key: string }) => {
      return apiRequest('PATCH', `/api/settings/api-keys/${id}`, { key });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'API key updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update API key',
        variant: 'destructive',
      });
    },
  });

  // Toggle feature mutation
  const toggleFeature = useMutation({
    mutationFn: async ({ feature, enabled }: { feature: string; enabled: boolean }) => {
      return apiRequest('PATCH', '/api/settings/features', { feature, enabled });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Feature updated successfully',
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
        title: 'Error',
        description: 'API key cannot be empty',
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Default settings if no data
  const defaultSettings: SystemSettings = {
    apiKeys: [
      {
        id: 'openai',
        name: 'OpenAI API Key',
        service: 'openai',
        key: '',
        isActive: false,
        description: 'Required for AI-powered features including chat assistants, content generation, and analytics',
        required: true,
      },
      {
        id: 'stripe',
        name: 'Stripe Secret Key',
        service: 'stripe',
        key: '',
        isActive: false,
        description: 'Required for payment processing, subscriptions, and billing management',
        required: true,
      },
      {
        id: 'instagram',
        name: 'Instagram Access Token',
        service: 'instagram',
        key: '',
        isActive: false,
        description: 'Required for Instagram marketing features and social media integration',
        required: false,
      },
      {
        id: 'google-maps',
        name: 'Google Maps API Key',
        service: 'google-maps',
        key: '',
        isActive: false,
        description: 'Required for location services, route optimization, and mapping features',
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
  };

  const currentSettings = settings || defaultSettings;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <SettingsIcon className="w-8 h-8" />
              System Settings
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage API keys, features, and system configuration
            </p>
          </div>
        </div>

        <Tabs defaultValue="api-keys">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Key Management
                </CardTitle>
                <CardDescription>
                  Configure API keys for third-party services. Keep these keys secure and never share them publicly.
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
                            <Badge variant="secondary">Required</Badge>
                          )}
                          {apiKey.isActive ? (
                            <Badge variant="default" className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Not Configured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {apiKey.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`key-${apiKey.id}`}>API Key</Label>
                      <div className="flex items-center gap-2">
                        {isEditing[apiKey.id] ? (
                          <>
                            <Input
                              id={`key-${apiKey.id}`}
                              type="text"
                              value={editedKeys[apiKey.id] || ''}
                              onChange={(e) => setEditedKeys(prev => ({ ...prev, [apiKey.id]: e.target.value }))}
                              placeholder="Enter your API key"
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
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Input
                              id={`key-${apiKey.id}`}
                              type={showKeys[apiKey.id] ? 'text' : 'password'}
                              value={apiKey.key || ''}
                              readOnly
                              placeholder={apiKey.key ? maskApiKey(apiKey.key) : 'Not configured'}
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
                              Edit
                            </Button>
                          </>
                        )}
                      </div>
                      {apiKey.lastUsed && (
                        <p className="text-xs text-muted-foreground">
                          Last used: {new Date(apiKey.lastUsed).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                <Alert>
                  <Shield className="w-4 h-4" />
                  <AlertTitle>Security Notice</AlertTitle>
                  <AlertDescription>
                    API keys are encrypted and stored securely. Never share your API keys in public repositories or client-side code.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feature Configuration</CardTitle>
                <CardDescription>
                  Enable or disable platform features based on your needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {Object.entries(currentSettings.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</h3>
                        <p className="text-sm text-muted-foreground">
                          {feature === 'openAI' && 'AI-powered features including chat and content generation'}
                          {feature === 'stripe' && 'Payment processing and subscription management'}
                          {feature === 'instagram' && 'Instagram marketing and social media integration'}
                          {feature === 'googleMaps' && 'Location services and mapping features'}
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

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Settings</CardTitle>
                <CardDescription>
                  Monitor and optimize system performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Cache Performance</h3>
                      <Badge variant={currentSettings.performance.cacheHitRate > 80 ? 'default' : 'secondary'}>
                        {currentSettings.performance.cacheHitRate}% Hit Rate
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Cache Enabled</span>
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
                    <h3 className="font-semibold mb-2">Optimization Level</h3>
                    <div className="flex gap-2">
                      {['standard', 'balanced', 'performance'].map((level) => (
                        <Badge
                          key={level}
                          variant={currentSettings.performance.optimizationLevel === level ? 'default' : 'outline'}
                          className="capitalize"
                        >
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertTitle>Performance Tip</AlertTitle>
                  <AlertDescription>
                    Enable caching to improve response times. Current cache hit rate is {currentSettings.performance.cacheHitRate}%.
                    Target is 85% for optimal performance.
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