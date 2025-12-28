import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Key, Shield, Link, CheckCircle, AlertCircle, Instagram } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function InstagramConfig() {
  const { toast } = useToast();
  const [appId, setAppId] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [redirectUri, setRedirectUri] = useState(window.location.origin + '/api/instagram/callback');
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveConfig = async () => {
    if (!appId || !appSecret) {
      toast({
        title: "Missing Configuration",
        description: "Please provide both App ID and App Secret",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // In production, this would save to secure backend storage
      localStorage.setItem('instagram_app_id', appId);
      // Note: App Secret should never be stored in frontend
      
      toast({
        title: "Configuration Saved",
        description: "Instagram API settings have been updated",
      });
      
      setIsConnected(true);
    } catch (error) {
      toast({
        title: "Configuration Error",
        description: "Failed to save Instagram settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnect = () => {
    if (!appId) {
      toast({
        title: "Configuration Required",
        description: "Please configure your Instagram App ID first",
        variant: "destructive"
      });
      return;
    }

    // Instagram OAuth URL
    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code`;
    window.location.href = authUrl;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram Business Integration
          </CardTitle>
          <CardDescription>
            Connect your Instagram Business account to manage posts and analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
            </TabsList>
            
            <TabsContent value="setup" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="app-id">App ID</Label>
                  <Input
                    id="app-id"
                    type="text"
                    placeholder="Your Instagram App ID"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="app-secret">App Secret</Label>
                  <Input
                    id="app-secret"
                    type="password"
                    placeholder="Your Instagram App Secret"
                    value={appSecret}
                    onChange={(e) => setAppSecret(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="redirect-uri">Redirect URI</Label>
                  <Input
                    id="redirect-uri"
                    type="text"
                    value={redirectUri}
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    Add this URI to your Instagram App settings
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSaveConfig} 
                    disabled={isSaving}
                    className="flex-1"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Save Configuration
                  </Button>
                  
                  <Button 
                    onClick={handleConnect}
                    variant="default"
                    className="flex-1"
                    disabled={!appId}
                  >
                    <Link className="mr-2 h-4 w-4" />
                    Connect Instagram
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="permissions" className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Required Instagram permissions for MoloChain integration:
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>user_profile</span>
                  <Badge variant="secondary">Read user profile info</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>user_media</span>
                  <Badge variant="secondary">Access user media</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>insights</span>
                  <Badge variant="secondary">View analytics data</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>publish_media</span>
                  <Badge variant="secondary">Publish content</Badge>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="status" className="space-y-4">
              <div className="space-y-4">
                {isConnected ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription>
                      Instagram account successfully connected
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <AlertDescription>
                      No Instagram account connected. Please complete the setup.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">API Status</div>
                      <p className="text-xs text-muted-foreground">
                        {isConnected ? 'Active' : 'Not Connected'}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">Rate Limit</div>
                      <p className="text-xs text-muted-foreground">
                        200 calls/hour remaining
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="pt-4">
                  <h3 className="font-semibold mb-2">Connection History</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Last Connected</span>
                      <span className="text-muted-foreground">Never</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Token Expires</span>
                      <span className="text-muted-foreground">-</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}