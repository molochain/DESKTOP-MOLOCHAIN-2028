import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StorageSettings from './StorageSettings';
import { Database, HardDrive, Shield, Users, Settings } from 'lucide-react';

const AdminSettings = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight">{t('Administration Settings')}</h1>
      
      <Tabs defaultValue="storage" className="space-y-4">
        <TabsList className="grid grid-cols-3 sm:grid-cols-5 lg:w-[600px]">
          <TabsTrigger value="storage" className="flex items-center">
            <HardDrive className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t('Storage')}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t('Security')}</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center">
            <Database className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t('Database')}</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t('Users')}</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t('System')}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="storage">
          <StorageSettings />
        </TabsContent>
        
        <TabsContent value="security">
          <div className="rounded-md border p-6 space-y-6">
            <h2 className="text-xl font-semibold">{t('Security Settings')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Enforce 2FA for all admin accounts</p>
                </div>
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">Session Management</p>
                  <p className="text-sm text-muted-foreground">Session timeout: 30 minutes</p>
                </div>
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">API Rate Limiting</p>
                  <p className="text-sm text-muted-foreground">1000 requests per minute</p>
                </div>
                <Shield className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="database">
          <div className="rounded-md border p-6 space-y-6">
            <h2 className="text-xl font-semibold">{t('Database Settings')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">Database Type</p>
                  <p className="text-sm text-muted-foreground">PostgreSQL 15.2</p>
                </div>
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">Connection Pool</p>
                  <p className="text-sm text-muted-foreground">Max connections: 100</p>
                </div>
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">Backup Schedule</p>
                  <p className="text-sm text-muted-foreground">Daily at 2:00 AM UTC</p>
                </div>
                <Database className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <div className="rounded-md border p-6 space-y-6">
            <h2 className="text-xl font-semibold">{t('User Management')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">Total Users</p>
                  <p className="text-sm text-muted-foreground">Active: 127 | Inactive: 23</p>
                </div>
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">User Roles</p>
                  <p className="text-sm text-muted-foreground">Admin: 5 | Manager: 18 | User: 127</p>
                </div>
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">Registration</p>
                  <p className="text-sm text-muted-foreground">Email verification required</p>
                </div>
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="system">
          <div className="rounded-md border p-6 space-y-6">
            <h2 className="text-xl font-semibold">{t('System Settings')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">Platform Version</p>
                  <p className="text-sm text-muted-foreground">MoloChain v1.0.0</p>
                </div>
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">Environment</p>
                  <p className="text-sm text-muted-foreground">{import.meta.env.MODE}</p>
                </div>
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">System Uptime</p>
                  <p className="text-sm text-muted-foreground">99.95% this month</p>
                </div>
                <Settings className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;