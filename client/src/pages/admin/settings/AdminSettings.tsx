import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StorageSettings from './StorageSettings';
import { Database, HardDrive, Shield, Users, Settings } from 'lucide-react';

const AdminSettings = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight">{t('admin.settings.title')}</h1>
      
      <Tabs defaultValue="storage" className="space-y-4">
        <TabsList className="grid grid-cols-3 sm:grid-cols-5 lg:w-[600px]">
          <TabsTrigger value="storage" className="flex items-center">
            <HardDrive className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t('admin.settings.tabs.storage')}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t('admin.settings.tabs.security')}</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center">
            <Database className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t('admin.settings.tabs.database')}</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t('admin.settings.tabs.users')}</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t('admin.settings.tabs.system')}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="storage">
          <StorageSettings />
        </TabsContent>
        
        <TabsContent value="security">
          <div className="rounded-md border p-6 space-y-6">
            <h2 className="text-xl font-semibold">{t('admin.settings.security.title')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">{t('admin.settings.security.twoFactor.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.settings.security.twoFactor.description')}</p>
                </div>
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">{t('admin.settings.security.session.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.settings.security.session.description')}</p>
                </div>
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">{t('admin.settings.security.rateLimit.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.settings.security.rateLimit.description')}</p>
                </div>
                <Shield className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="database">
          <div className="rounded-md border p-6 space-y-6">
            <h2 className="text-xl font-semibold">{t('admin.settings.database.title')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">{t('admin.settings.database.type.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.settings.database.type.description')}</p>
                </div>
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">{t('admin.settings.database.pool.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.settings.database.pool.description')}</p>
                </div>
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">{t('admin.settings.database.backup.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.settings.database.backup.description')}</p>
                </div>
                <Database className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <div className="rounded-md border p-6 space-y-6">
            <h2 className="text-xl font-semibold">{t('admin.settings.users.title')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">{t('admin.settings.users.total.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.settings.users.total.description')}</p>
                </div>
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">{t('admin.settings.users.roles.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.settings.users.roles.description')}</p>
                </div>
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">{t('admin.settings.users.registration.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.settings.users.registration.description')}</p>
                </div>
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="system">
          <div className="rounded-md border p-6 space-y-6">
            <h2 className="text-xl font-semibold">{t('admin.settings.system.title')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">{t('admin.settings.system.version.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.settings.system.version.description')}</p>
                </div>
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">{t('admin.settings.system.environment.title')}</p>
                  <p className="text-sm text-muted-foreground">{import.meta.env.MODE}</p>
                </div>
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                <div>
                  <p className="font-medium">{t('admin.settings.system.uptime.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.settings.system.uptime.description')}</p>
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