import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle, Info, RefreshCw } from 'lucide-react';

interface StorageSettingsProps {}

interface StorageConfig {
  currentProvider: 'replit' | 'google_drive';
  googleDriveAvailable: boolean;
  missingGoogleDriveConfig: string[] | null;
  requiredGoogleDriveConfig: string[];
}

interface GoogleDriveConnectionTest {
  success: boolean;
  message: string;
  folderContents?: Array<{
    id: string;
    name: string;
    mimeType: string;
  }>;
}

const StorageSettings: React.FC<StorageSettingsProps> = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [hasConfigChanges, setHasConfigChanges] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'replit' | 'google_drive'>('replit');

  // Fetch storage settings
  const { data: storageConfig, isLoading, error, refetch } = useQuery<StorageConfig>({
    queryKey: ['storage-settings'],
    queryFn: async () => {
      const response = await axios.get('/api/settings/storage');
      return response.data;
    }
  });

  // Update storage provider
  const updateStorageProvider = useMutation({
    mutationFn: async (provider: 'replit' | 'google_drive') => {
      const response = await axios.post('/api/settings/storage/update-provider', {
        provider
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: t('Storage Settings'),
        description: data.message,
        variant: 'default',
      });
      setHasConfigChanges(false);
      refetch();
    },
    onError: (error) => {
      toast({
        title: t('Storage Settings'),
        description: t('Failed to update storage provider'),
        variant: 'destructive',
      });
    }
  });

  // Test Google Drive connection
  const testDriveConnection = useMutation<GoogleDriveConnectionTest>({
    mutationFn: async () => {
      const response = await axios.post('/api/settings/storage/test-drive-connection');
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: t('Storage Settings'),
          description: t('Successfully connected to Google Drive'),
          variant: 'default',
        });
      } else {
        toast({
          title: t('Storage Settings'),
          description: data.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: t('Storage Settings'),
        description: t('Failed to connect to Google Drive'),
        variant: 'destructive',
      });
    }
  });

  // Check if Google Drive is properly configured
  const isGoogleDriveConfigured = storageConfig?.googleDriveAvailable || false;
  
  // Set selected provider when data is loaded
  useEffect(() => {
    if (storageConfig?.currentProvider) {
      setSelectedProvider(storageConfig.currentProvider);
    }
  }, [storageConfig]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">{t('Storage Settings')}</h2>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('Refresh')}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p>{t('Loading storage settings...')}</p>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('Error')}</AlertTitle>
          <AlertDescription>
            {t('Failed to load storage settings. Please try again.')}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t('Storage Provider')}</CardTitle>
              <CardDescription>
                {t('Configure where your files will be stored')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="storage-provider">{t('Current Storage Provider')}</Label>
                  <Select 
                    disabled={!isGoogleDriveConfigured} 
                    value={selectedProvider}
                    onValueChange={(value: 'replit' | 'google_drive') => {
                      setSelectedProvider(value);
                      setHasConfigChanges(value !== storageConfig?.currentProvider);
                    }}
                  >
                    <SelectTrigger id="storage-provider">
                      <SelectValue placeholder={t('Select a storage provider')} />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="replit">
                        Replit Storage
                      </SelectItem>
                      <SelectItem 
                        value="google_drive" 
                        disabled={!isGoogleDriveConfigured}
                      >
                        Google Drive {!isGoogleDriveConfigured && t('(Not Configured)')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!isGoogleDriveConfigured && storageConfig?.missingGoogleDriveConfig && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>{t('Google Drive Not Configured')}</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">
                        {t('The following environment variables are required to use Google Drive:')}
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        {storageConfig.requiredGoogleDriveConfig.map(configKey => (
                          <li key={configKey} className={`${storageConfig.missingGoogleDriveConfig?.includes(configKey) ? 'text-red-500' : 'text-green-500'}`}>
                            {configKey} {storageConfig.missingGoogleDriveConfig?.includes(configKey) ? 
                              <Badge variant="destructive">{t('Missing')}</Badge> : 
                              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">{t('Available')}</Badge>}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <LoadingButton
                variant="outline"
                onClick={() => testDriveConnection.mutate()}
                disabled={!isGoogleDriveConfigured}
                isLoading={testDriveConnection.isPending}
                loadingText={t('Testing...')}
              >
                {t('Test Google Drive Connection')}
              </LoadingButton>
              <LoadingButton 
                disabled={!hasConfigChanges}
                isLoading={updateStorageProvider.isPending}
                loadingText={t('Saving...')}
                onClick={() => updateStorageProvider.mutate(selectedProvider)}
              >
                {t('Save Changes')}
              </LoadingButton>
            </CardFooter>
          </Card>

          {testDriveConnection.isSuccess && testDriveConnection.data.success && testDriveConnection.data.folderContents && (
            <Card>
              <CardHeader>
                <CardTitle>{t('Google Drive Test Results')}</CardTitle>
                <CardDescription>
                  {t('Found {count} files in your Google Drive folder', { count: testDriveConnection.data.folderContents.length })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>{t('Files in Google Drive folder')}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Name')}</TableHead>
                      <TableHead>{t('Type')}</TableHead>
                      <TableHead>{t('ID')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testDriveConnection.data.folderContents.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>{file.mimeType.split('/').pop()}</TableCell>
                        <TableCell className="font-mono text-xs truncate max-w-[200px]">{file.id}</TableCell>
                      </TableRow>
                    ))}
                    {testDriveConnection.data.folderContents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          {t('No files found in the folder. The folder is empty.')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <Alert className="bg-amber-50 text-amber-800 border-amber-200">
            <Info className="h-4 w-4" />
            <AlertTitle>{t('How to set up Google Drive credentials')}</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                {t('To use Google Drive as a storage provider, you need to:')}
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>{t('Create a project in the Google Cloud Console')}</li>
                <li>{t('Enable the Google Drive API')}</li>
                <li>{t('Create OAuth 2.0 credentials (Client ID and Client Secret)')}</li>
                <li>{t('Authorize the application and get a refresh token')}</li>
                <li>{t('Create a folder in Google Drive to store your files and get its ID')}</li>
                <li>{t('Set all required environment variables in your Replit project')}</li>
              </ol>
              <p className="mt-2">
                {t('For detailed instructions, please refer to the Google Drive API documentation.')}
              </p>
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
};

export default StorageSettings;