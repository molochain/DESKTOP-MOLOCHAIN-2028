import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Plus, 
  Edit, 
  Trash2, 
  Activity,
  Shield,
  Users,
  FolderTree,
  Search,
  Filter,
  Package,
  FileText,
  Building,
  Code,
  ChevronRight,
  ChevronDown,
  Power,
  Lock,
  Unlock,
  Info
} from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface PageModule {
  id: number;
  name: string;
  displayName: string;
  type: 'page' | 'module' | 'service' | 'department';
  category: 'public' | 'protected' | 'admin' | 'developer' | 'department';
  path: string;
  componentPath: string;
  description?: string;
  icon?: string;
  parentId?: number | null;
  order: number;
  isActive: boolean;
  isVisible: boolean;
  requiresAuth: boolean;
  requiredRole?: string;
  metadata?: {
    lazy?: boolean;
    exact?: boolean;
    layout?: string;
    permissions?: string[];
    tags?: string[];
    searchKeywords?: string[];
  };
  config?: {
    showInMenu?: boolean;
    showInSidebar?: boolean;
    showInSearch?: boolean;
    customProps?: Record<string, any>;
  };
  analytics?: {
    viewCount?: number;
    lastAccessed?: string;
    popularityScore?: number;
  };
  children?: PageModule[];
  createdAt: string;
  updatedAt: string;
}

interface ModuleSetting {
  id: number;
  moduleId: number;
  settingKey: string;
  settingValue: any;
  settingType: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description?: string;
  isPublic: boolean;
}

const moduleFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  type: z.enum(['page', 'module', 'service', 'department']),
  category: z.enum(['public', 'protected', 'admin', 'developer', 'department']),
  path: z.string().min(1, 'Path is required'),
  componentPath: z.string().min(1, 'Component path is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.number().nullable().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  requiresAuth: z.boolean().optional(),
  requiredRole: z.string().optional(),
});

type ModuleFormValues = z.infer<typeof moduleFormSchema>;

const ModuleTreeItem = ({ 
  module, 
  level = 0, 
  onToggle, 
  onEdit, 
  onDelete,
  t 
}: { 
  module: PageModule, 
  level?: number, 
  onToggle: (id: number, currentIsActive: boolean) => void,
  onEdit: (module: PageModule) => void,
  onDelete: (id: number) => void,
  t: (key: string) => string
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = module.children && module.children.length > 0;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page': return <FileText className="h-4 w-4" />;
      case 'module': return <Package className="h-4 w-4" />;
      case 'service': return <Settings className="h-4 w-4" />;
      case 'department': return <Building className="h-4 w-4" />;
      default: return <Code className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'public': return 'default';
      case 'protected': return 'secondary';
      case 'admin': return 'destructive';
      case 'developer': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors`}
        style={{ paddingLeft: `${level * 24 + 8}px` }}
        data-testid={`module-tree-item-${module.id}`}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0"
            onClick={() => setIsOpen(!isOpen)}
            data-testid={`button-expand-${module.id}`}
          >
            {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        )}
        {!hasChildren && <div className="w-5" />}
        
        {getTypeIcon(module.type)}
        
        <div className="flex-1 flex items-center gap-2">
          <span className="font-medium">{module.displayName}</span>
          <Badge variant={getCategoryColor(module.category)} className="text-xs">
            {t(`admin.management.pageModule.categories.${module.category}`)}
          </Badge>
          {!module.isActive && <Badge variant="outline">{t('admin.management.pageModule.status.disabled')}</Badge>}
          {!module.isVisible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
          {module.requiresAuth && <Lock className="h-3 w-3 text-muted-foreground" />}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(module.id, module.isActive)}
            data-testid={`button-toggle-${module.id}`}
          >
            <Power className={`h-4 w-4 ${module.isActive ? 'text-green-600' : 'text-gray-400'}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(module)}
            data-testid={`button-edit-${module.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(module.id)}
            data-testid={`button-delete-${module.id}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {hasChildren && isOpen && (
        <div>
          {module.children!.map((child) => (
            <ModuleTreeItem
              key={child.id}
              module={child}
              level={level + 1}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function PageModuleManager() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<PageModule | null>(null);
  const { toast } = useToast();

  const { data: modules, isLoading } = useQuery({
    queryKey: ['/api/admin/page-modules/tree'],
    queryFn: async () => {
      const response = await fetch('/api/admin/page-modules/tree');
      if (!response.ok) throw new Error('Failed to fetch modules');
      return response.json() as Promise<PageModule[]>;
    },
  });

  const { data: flatModulesResponse } = useQuery({
    queryKey: ['/api/admin/page-modules', { type: filterType, category: filterCategory }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      
      const response = await fetch(`/api/admin/page-modules?${params}`);
      if (!response.ok) throw new Error('Failed to fetch modules');
      return response.json() as Promise<{ data: PageModule[], count: number }>;
    },
  });

  const flatModules = flatModulesResponse?.data;

  const toggleModuleMutation = useMutation({
    mutationFn: async ({ moduleId, isActive }: { moduleId: number; isActive: boolean }) => {
      const response = await apiRequest('PATCH', `/api/admin/page-modules/${moduleId}/toggle`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-modules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-modules/tree'] });
      toast({
        title: t('admin.management.pageModule.toast.moduleUpdated'),
        description: t('admin.management.pageModule.toast.moduleUpdatedDesc'),
      });
    },
  });

  const saveModuleMutation = useMutation({
    mutationFn: async (data: { module: ModuleFormValues, isEdit: boolean, id?: number }) => {
      const url = data.isEdit 
        ? `/api/admin/page-modules/${data.id}` 
        : '/api/admin/page-modules';
      const method = data.isEdit ? 'PUT' : 'POST';
      
      const response = await apiRequest(method, url, data.module);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-modules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-modules/tree'] });
      setShowCreateDialog(false);
      setEditingModule(null);
      toast({
        title: t('admin.management.pageModule.toast.success'),
        description: editingModule ? t('admin.management.pageModule.toast.moduleUpdatedSuccess') : t('admin.management.pageModule.toast.moduleCreated'),
      });
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: async (moduleId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/page-modules/${moduleId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-modules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-modules/tree'] });
      toast({
        title: t('admin.management.pageModule.toast.moduleDeleted'),
        description: t('admin.management.pageModule.toast.moduleDeletedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('admin.management.pageModule.toast.deleteFailed'),
        description: error.message || t('admin.management.pageModule.toast.deleteFailedDesc'),
        variant: 'destructive',
      });
    },
  });

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      name: '',
      displayName: '',
      type: 'page',
      category: 'public',
      path: '',
      componentPath: '',
      description: '',
      icon: '',
      parentId: null,
      order: 0,
      isActive: true,
      isVisible: true,
      requiresAuth: false,
      requiredRole: '',
    },
  });

  const filteredModules = useMemo(() => {
    if (!flatModules) return [];
    return flatModules.filter((module) => {
      const matchesSearch = searchQuery
        ? module.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          module.path.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesSearch;
    });
  }, [flatModules, searchQuery]);

  const onSubmit = (data: ModuleFormValues) => {
    saveModuleMutation.mutate({
      module: data,
      isEdit: !!editingModule,
      id: editingModule?.id,
    });
  };

  const handleEdit = (module: PageModule) => {
    setEditingModule(module);
    form.reset({
      name: module.name,
      displayName: module.displayName,
      type: module.type,
      category: module.category,
      path: module.path,
      componentPath: module.componentPath,
      description: module.description || '',
      icon: module.icon || '',
      parentId: module.parentId,
      order: module.order,
      isActive: module.isActive,
      isVisible: module.isVisible,
      requiresAuth: module.requiresAuth,
      requiredRole: module.requiredRole || '',
    });
    setShowCreateDialog(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.management.pageModule.title')}</h1>
          <p className="text-muted-foreground">{t('admin.management.pageModule.subtitle')}</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingModule(null); form.reset(); }} data-testid="button-add-module">
              <Plus className="h-4 w-4 mr-2" />
              {t('admin.management.pageModule.buttons.addModule')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>{editingModule ? t('admin.management.pageModule.dialog.editTitle') : t('admin.management.pageModule.dialog.createTitle')}</DialogTitle>
              <DialogDescription>
                {editingModule ? t('admin.management.pageModule.dialog.editDescription') : t('admin.management.pageModule.dialog.createDescription')}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.management.pageModule.form.name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('admin.management.pageModule.form.namePlaceholder')} {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.management.pageModule.form.displayName')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('admin.management.pageModule.form.displayNamePlaceholder')} {...field} data-testid="input-display-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.management.pageModule.form.type')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-type">
                              <SelectValue placeholder={t('admin.management.pageModule.form.selectType')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="page">{t('admin.management.pageModule.types.page')}</SelectItem>
                            <SelectItem value="module">{t('admin.management.pageModule.types.module')}</SelectItem>
                            <SelectItem value="service">{t('admin.management.pageModule.types.service')}</SelectItem>
                            <SelectItem value="department">{t('admin.management.pageModule.types.department')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.management.pageModule.form.category')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder={t('admin.management.pageModule.form.selectCategory')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="public">{t('admin.management.pageModule.categories.public')}</SelectItem>
                            <SelectItem value="protected">{t('admin.management.pageModule.categories.protected')}</SelectItem>
                            <SelectItem value="admin">{t('admin.management.pageModule.categories.admin')}</SelectItem>
                            <SelectItem value="developer">{t('admin.management.pageModule.categories.developer')}</SelectItem>
                            <SelectItem value="department">{t('admin.management.pageModule.categories.department')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="path"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.management.pageModule.form.path')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('admin.management.pageModule.form.pathPlaceholder')} {...field} data-testid="input-path" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="componentPath"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.management.pageModule.form.componentPath')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('admin.management.pageModule.form.componentPathPlaceholder')} {...field} data-testid="input-component-path" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.management.pageModule.form.description')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('admin.management.pageModule.form.descriptionPlaceholder')} {...field} data-testid="textarea-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.management.pageModule.form.icon')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('admin.management.pageModule.form.iconPlaceholder')} {...field} data-testid="input-icon" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.management.pageModule.form.order')}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} data-testid="input-order" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requiredRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.management.pageModule.form.requiredRole')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('admin.management.pageModule.form.requiredRolePlaceholder')} {...field} data-testid="input-required-role" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-active" />
                        </FormControl>
                        <FormLabel className="!mt-0">{t('admin.management.pageModule.form.isActive')}</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isVisible"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-visible" />
                        </FormControl>
                        <FormLabel className="!mt-0">{t('admin.management.pageModule.form.isVisible')}</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requiresAuth"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-auth" />
                        </FormControl>
                        <FormLabel className="!mt-0">{t('admin.management.pageModule.form.requiresAuth')}</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} data-testid="button-cancel">
                    {t('admin.management.pageModule.buttons.cancel')}
                  </Button>
                  <Button type="submit" disabled={saveModuleMutation.isPending} data-testid="button-save">
                    {saveModuleMutation.isPending ? t('admin.management.pageModule.buttons.saving') : (editingModule ? t('admin.management.pageModule.buttons.update') : t('admin.management.pageModule.buttons.create'))}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.management.pageModule.stats.totalModules')}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flatModules?.length || 0}</div>
            <p className="text-xs text-muted-foreground">{t('admin.management.pageModule.stats.acrossAllCategories')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.management.pageModule.stats.active')}</CardTitle>
            <Power className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flatModules?.filter(m => m.isActive).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">{t('admin.management.pageModule.stats.currentlyEnabled')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.management.pageModule.stats.protected')}</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flatModules?.filter(m => m.requiresAuth).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">{t('admin.management.pageModule.stats.requireAuth')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.management.pageModule.stats.adminOnly')}</CardTitle>
            <Shield className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flatModules?.filter(m => m.category === 'admin').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">{t('admin.management.pageModule.stats.adminModules')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('admin.management.pageModule.filter.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]" data-testid="select-filter-type">
            <SelectValue placeholder={t('admin.management.pageModule.filter.filterByType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.management.pageModule.filter.allTypes')}</SelectItem>
            <SelectItem value="page">{t('admin.management.pageModule.types.page')}</SelectItem>
            <SelectItem value="module">{t('admin.management.pageModule.types.module')}</SelectItem>
            <SelectItem value="service">{t('admin.management.pageModule.types.service')}</SelectItem>
            <SelectItem value="department">{t('admin.management.pageModule.types.department')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[150px]" data-testid="select-filter-category">
            <SelectValue placeholder={t('admin.management.pageModule.filter.filterByCategory')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.management.pageModule.filter.allCategories')}</SelectItem>
            <SelectItem value="public">{t('admin.management.pageModule.categories.public')}</SelectItem>
            <SelectItem value="protected">{t('admin.management.pageModule.categories.protected')}</SelectItem>
            <SelectItem value="admin">{t('admin.management.pageModule.categories.admin')}</SelectItem>
            <SelectItem value="developer">{t('admin.management.pageModule.categories.developer')}</SelectItem>
            <SelectItem value="department">{t('admin.management.pageModule.categories.department')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Views */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">{t('admin.management.pageModule.tabs.all')}</TabsTrigger>
          <TabsTrigger value="tree">{t('admin.management.pageModule.tabs.tree')}</TabsTrigger>
          <TabsTrigger value="table">{t('admin.management.pageModule.tabs.table')}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.management.pageModule.views.allModulesTitle')}</CardTitle>
              <CardDescription>{t('admin.management.pageModule.views.allModulesDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {isLoading ? (
                    <p>{t('admin.management.pageModule.loading')}</p>
                  ) : filteredModules.map((module) => (
                    <div
                      key={module.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors"
                      data-testid={`module-item-${module.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{module.displayName}</span>
                            <Badge variant={module.isActive ? 'default' : 'outline'}>
                              {module.isActive ? t('admin.management.pageModule.status.active') : t('admin.management.pageModule.status.inactive')}
                            </Badge>
                            <Badge>{t(`admin.management.pageModule.types.${module.type}`)}</Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">{module.path}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleModuleMutation.mutate({ moduleId: module.id, isActive: !module.isActive })}
                          data-testid={`button-toggle-${module.id}`}
                        >
                          <Power className={`h-4 w-4 ${module.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(module)}
                          data-testid={`button-edit-${module.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteModuleMutation.mutate(module.id)}
                          data-testid={`button-delete-${module.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tree" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.management.pageModule.views.treeTitle')}</CardTitle>
              <CardDescription>{t('admin.management.pageModule.views.treeDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {isLoading ? (
                  <p>{t('admin.management.pageModule.loading')}</p>
                ) : modules?.map((module) => (
                  <ModuleTreeItem
                    key={module.id}
                    module={module}
                    onToggle={(id, currentIsActive) => toggleModuleMutation.mutate({ moduleId: id, isActive: !currentIsActive })}
                    onEdit={handleEdit}
                    onDelete={(id) => deleteModuleMutation.mutate(id)}
                    t={t}
                  />
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.management.pageModule.views.tableTitle')}</CardTitle>
              <CardDescription>{t('admin.management.pageModule.views.tableDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.management.pageModule.table.name')}</TableHead>
                      <TableHead>{t('admin.management.pageModule.table.type')}</TableHead>
                      <TableHead>{t('admin.management.pageModule.table.category')}</TableHead>
                      <TableHead>{t('admin.management.pageModule.table.path')}</TableHead>
                      <TableHead>{t('admin.management.pageModule.table.status')}</TableHead>
                      <TableHead>{t('admin.management.pageModule.table.auth')}</TableHead>
                      <TableHead>{t('admin.management.pageModule.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModules.map((module) => (
                      <TableRow key={module.id} data-testid={`table-row-${module.id}`}>
                        <TableCell className="font-medium">{module.displayName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{t(`admin.management.pageModule.types.${module.type}`)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge>{t(`admin.management.pageModule.categories.${module.category}`)}</Badge>
                        </TableCell>
                        <TableCell className="text-sm font-mono">{module.path}</TableCell>
                        <TableCell>
                          <Badge variant={module.isActive ? 'default' : 'secondary'}>
                            {module.isActive ? t('admin.management.pageModule.status.active') : t('admin.management.pageModule.status.inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {module.requiresAuth ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4 text-muted-foreground" />}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleModuleMutation.mutate({ moduleId: module.id, isActive: !module.isActive })}
                              data-testid={`table-button-toggle-${module.id}`}
                            >
                              <Power className={`h-4 w-4 ${module.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(module)}
                              data-testid={`table-button-edit-${module.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteModuleMutation.mutate(module.id)}
                              data-testid={`table-button-delete-${module.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
