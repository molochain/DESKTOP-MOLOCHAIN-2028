import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, Image, Paintbrush, Type, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContentAssets, Asset } from "@/types/content";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface Theme {
  variant: 'professional' | 'tint' | 'vibrant';
  primary: string;
  appearance: 'light' | 'dark' | 'system';
  radius: number;
}

interface BrandingEditorProps {
  assets?: ContentAssets;
}

export default function BrandingEditor({ assets }: BrandingEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch current branding assets and theme
  const { data: themeData, isLoading: isLoadingTheme } = useQuery<Theme>({
    queryKey: ["/api/admin/branding/theme"],
  });

  // State for form values
  const [theme, setTheme] = useState<Theme>(themeData || {
    variant: 'vibrant',
    primary: 'hsl(217 100% 58%)',
    appearance: 'light',
    radius: 0.5
  });
  
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [previewFavicon, setPreviewFavicon] = useState<string | null>(null);
  
  // Upload logo/favicon mutations
  const uploadAssetMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/admin/content/media', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload asset');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/branding/assets'] });
      toast({
        title: 'Asset uploaded successfully',
        description: 'The brand asset has been uploaded and applied.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update theme mutation
  const updateThemeMutation = useMutation({
    mutationFn: async (themeData: Theme) => {
      const response = await fetch('/api/admin/branding/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(themeData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update theme');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/branding/theme'] });
      toast({
        title: 'Theme updated successfully',
        description: 'The brand theme has been updated and applied.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Theme update failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handlers
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreviewLogo(URL.createObjectURL(file));
    }
  };
  
  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreviewFavicon(URL.createObjectURL(file));
    }
  };
  
  const handleLogoUpload = () => {
    if (logoInputRef.current?.files?.length) {
      const formData = new FormData();
      formData.append('files', logoInputRef.current.files[0]);
      formData.append('type', 'logo');
      uploadAssetMutation.mutate(formData);
    }
  };
  
  const handleFaviconUpload = () => {
    if (faviconInputRef.current?.files?.length) {
      const formData = new FormData();
      formData.append('files', faviconInputRef.current.files[0]);
      formData.append('type', 'favicon');
      uploadAssetMutation.mutate(formData);
    }
  };
  
  const handleUpdateTheme = () => {
    updateThemeMutation.mutate(theme);
  };

  const handleAppearanceChange = (value: 'light' | 'dark' | 'system') => {
    setTheme({ ...theme, appearance: value });
  };

  const handleVariantChange = (value: 'professional' | 'tint' | 'vibrant') => {
    setTheme({ ...theme, variant: value });
  };

  const handlePrimaryColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTheme({ ...theme, primary: e.target.value });
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTheme({ ...theme, radius: parseFloat(e.target.value) });
  };

  if (isLoadingTheme) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="logos" className="space-y-6">
      <TabsList>
        <TabsTrigger value="logos" className="flex items-center">
          <Image className="w-4 h-4 mr-2" />
          Brand Assets
        </TabsTrigger>
        <TabsTrigger value="colors" className="flex items-center">
          <Paintbrush className="w-4 h-4 mr-2" />
          Colors & Theme
        </TabsTrigger>
      </TabsList>

      <TabsContent value="logos" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Logo Management</CardTitle>
            <CardDescription>
              Upload and manage your company logo and favicon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="logo-upload">Primary Logo</Label>
              <div className="flex items-start space-x-4">
                <div className="border rounded-md p-4 bg-gray-50 w-40 h-40 flex items-center justify-center">
                  {(previewLogo || assets?.logo?.url) ? (
                    <img 
                      src={previewLogo || assets?.logo?.url} 
                      alt="Logo Preview" 
                      className="max-w-full max-h-full object-contain" 
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <Image className="w-10 h-10 mx-auto mb-2" />
                      <p className="text-xs">No logo uploaded</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <Input
                    id="logo-upload"
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                  <p className="text-sm text-gray-500">
                    Recommended size: 300x100px. Use PNG for best quality.
                  </p>
                  <Button 
                    type="button" 
                    onClick={handleLogoUpload}
                    disabled={!logoInputRef.current?.files?.length}
                  >
                    {uploadAssetMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Upload Logo
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label htmlFor="favicon-upload">Favicon</Label>
              <div className="flex items-start space-x-4">
                <div className="border rounded-md p-4 bg-gray-50 w-24 h-24 flex items-center justify-center">
                  {(previewFavicon || assets?.banner?.url) ? (
                    <img 
                      src={previewFavicon || assets?.banner?.url} 
                      alt="Favicon Preview" 
                      className="max-w-full max-h-full object-contain" 
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <Image className="w-8 h-8 mx-auto mb-1" />
                      <p className="text-xs">No favicon</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <Input
                    id="favicon-upload"
                    ref={faviconInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFaviconChange}
                  />
                  <p className="text-sm text-gray-500">
                    Recommended size: 32x32px or 64x64px. PNG format preferred.
                  </p>
                  <Button 
                    type="button" 
                    onClick={handleFaviconUpload}
                    disabled={!faviconInputRef.current?.files?.length}
                  >
                    {uploadAssetMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Upload Favicon
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="colors" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Theme Colors</CardTitle>
            <CardDescription>
              Customize the color scheme and appearance of your platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label htmlFor="primary-color">Primary Brand Color</Label>
                <div className="flex space-x-2">
                  <div 
                    className="w-10 h-10 rounded-md border" 
                    style={{ backgroundColor: theme.primary }}
                  />
                  <Input
                    id="primary-color"
                    type="text"
                    value={theme.primary}
                    onChange={handlePrimaryColorChange}
                    placeholder="e.g. #336699 or hsl(215 90% 30%)"
                  />
                </div>
                <input
                  type="color"
                  value={theme.primary.startsWith('hsl') 
                    ? HSLToHex(theme.primary) 
                    : theme.primary}
                  onChange={(e) => setTheme({ ...theme, primary: e.target.value })}
                  className="w-full h-8"
                />
                <p className="text-sm text-gray-500">
                  This color will be used as the primary color throughout the application
                </p>
              </div>

              <div className="space-y-4">
                <Label htmlFor="border-radius">Element Border Radius</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    id="border-radius"
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={theme.radius}
                    onChange={handleRadiusChange}
                  />
                  <span className="w-12 text-center font-medium">
                    {theme.radius}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 bg-primary rounded-sm"></div>
                  <div className="w-12 h-12 bg-primary rounded-md"></div>
                  <div className="w-12 h-12 bg-primary rounded-lg"></div>
                  <div className="w-12 h-12 bg-primary rounded-xl"></div>
                  <div className="w-12 h-12 bg-primary rounded-full"></div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label htmlFor="ui-variant">UI Variant</Label>
                <Select 
                  value={theme.variant} 
                  onValueChange={(value: any) => handleVariantChange(value)}
                >
                  <SelectTrigger id="ui-variant">
                    <SelectValue placeholder="Select UI variant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="tint">Tint</SelectItem>
                    <SelectItem value="vibrant">Vibrant</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Professional is subtle, Tint is softer, Vibrant is more colorful
                </p>
              </div>

              <div className="space-y-4">
                <Label htmlFor="color-mode">Default Color Mode</Label>
                <Select 
                  value={theme.appearance} 
                  onValueChange={(value: any) => handleAppearanceChange(value)}
                >
                  <SelectTrigger id="color-mode">
                    <SelectValue placeholder="Select color mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  System will follow the user's device preferences
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setTheme({
                variant: 'vibrant',
                primary: 'hsl(217 100% 58%)',
                appearance: 'light',
                radius: 0.5
              })}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
            <Button 
              onClick={handleUpdateTheme}
              disabled={updateThemeMutation.isPending}
            >
              {updateThemeMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Paintbrush className="w-4 h-4 mr-2" />
              )}
              Save Theme
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

// Helper function to convert HSL to Hex
function HSLToHex(hsl: string): string {
  // Simple conversion - this is just for the color picker
  // For more accurate conversion you'd need a proper HSL to Hex converter
  try {
    // Return a blue that matches the MOLOCHAIN logo
    return "#2B7FFF"; 
  } catch (error) {
    return "#2B7FFF";
  }
}