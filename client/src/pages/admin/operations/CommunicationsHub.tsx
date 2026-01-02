import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { 
  Mail, MessageSquare, Send, Settings, Users, BarChart3, 
  Loader2, Plus, Trash2, Edit, Eye, CheckCircle, Clock, 
  XCircle, AlertCircle, RefreshCw, Key, Copy, AlertTriangle 
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DatePickerWithRange } from "@/components/ui/date-picker-range";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient as qc } from "@/lib/queryClient";

interface Submission {
  id: number;
  formType: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_review' | 'responded' | 'closed';
  createdAt: string;
  updatedAt: string;
}

interface SubmissionsResponse {
  submissions: Submission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SubmissionStats {
  total: number;
  pending: number;
  inReview: number;
  responded: number;
  closed: number;
  byFormType: { formType: string; count: number }[];
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  useTls: boolean;
  verified: boolean;
}

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationRecipient {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

interface ApiKey {
  id: number;
  subdomain: string;
  keyPreview: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

const emailSettingsSchema = z.object({
  smtpHost: z.string().min(1, "SMTP Host is required"),
  smtpPort: z.coerce.number().min(1).max(65535),
  smtpUsername: z.string().min(1, "Username is required"),
  smtpPassword: z.string().min(1, "Password is required"),
  fromName: z.string().min(1, "From Name is required"),
  fromEmail: z.string().email("Invalid email"),
  replyTo: z.string().email("Invalid email"),
  useTls: z.boolean()
});

const emailTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required")
});

const recipientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email")
});

const apiKeySchema = z.object({
  subdomain: z.string().min(1, "Subdomain is required"),
  description: z.string().optional()
});

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  in_review: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  responded: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
};

const statusIcons = {
  pending: Clock,
  in_review: AlertCircle,
  responded: CheckCircle,
  closed: XCircle
};

export default function CommunicationsHub() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("submissions");
  
  const [page, setPage] = useState(1);
  const [formTypeFilter, setFormTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isSubmissionSheetOpen, setIsSubmissionSheetOpen] = useState(false);
  
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  
  const [isRecipientDialogOpen, setIsRecipientDialogOpen] = useState(false);
  
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);

  const submissionsQuery = useQuery<SubmissionsResponse>({
    queryKey: ['/api/admin/submissions', { page, formType: formTypeFilter, status: statusFilter, startDate: dateRange.from?.toISOString(), endDate: dateRange.to?.toISOString() }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (formTypeFilter !== 'all') params.set('formType', formTypeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (dateRange.from) params.set('startDate', dateRange.from.toISOString());
      if (dateRange.to) params.set('endDate', dateRange.to.toISOString());
      
      const res = await fetch(`/api/admin/submissions?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch submissions');
      const json = await res.json();
      return {
        submissions: json.data || [],
        total: json.pagination?.total || 0,
        page: json.pagination?.page || 1,
        limit: json.pagination?.limit || 10,
        totalPages: json.pagination?.totalPages || 1
      };
    }
  });

  const statsQuery = useQuery<SubmissionStats>({
    queryKey: ['/api/admin/submissions/stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/submissions/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const json = await res.json();
      const data = json.data || {};
      return {
        total: data.total || 0,
        pending: data.byStatus?.pending || 0,
        inReview: data.byStatus?.in_review || 0,
        responded: data.byStatus?.responded || 0,
        closed: data.byStatus?.closed || 0,
        byFormType: (data.byFormType || []).map((ft: { formTypeName: string; count: number }) => ({
          formType: ft.formTypeName,
          count: ft.count
        }))
      };
    }
  });

  const emailSettingsQuery = useQuery<EmailSettings | null>({
    queryKey: ['/api/admin/email/settings'],
    queryFn: async () => {
      const res = await fetch('/api/admin/email/settings');
      if (!res.ok) throw new Error('Failed to fetch email settings');
      const json = await res.json();
      if (!json.data) return null;
      return {
        smtpHost: json.data.smtpHost || '',
        smtpPort: json.data.smtpPort || 587,
        smtpUsername: json.data.smtpUsername || '',
        smtpPassword: json.data.smtpPassword || '',
        fromName: json.data.fromName || '',
        fromEmail: json.data.fromEmail || '',
        replyTo: json.data.replyToEmail || '',
        useTls: json.data.useTls ?? true,
        verified: json.data.isVerified || false
      };
    }
  });

  const templatesQuery = useQuery<EmailTemplate[]>({
    queryKey: ['/api/admin/email/templates'],
    queryFn: async () => {
      const res = await fetch('/api/admin/email/templates');
      if (!res.ok) throw new Error('Failed to fetch templates');
      const json = await res.json();
      return (json.data || []).map((t: Record<string, unknown>) => ({
        id: t.id,
        name: t.name,
        subject: t.subject,
        body: t.htmlBody,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      }));
    }
  });

  const recipientsQuery = useQuery<NotificationRecipient[]>({
    queryKey: ['/api/admin/email/recipients'],
    queryFn: async () => {
      const res = await fetch('/api/admin/email/recipients');
      if (!res.ok) throw new Error('Failed to fetch recipients');
      const json = await res.json();
      return json.data || [];
    }
  });

  const apiKeysQuery = useQuery<ApiKey[]>({
    queryKey: ['/api/admin/email/api-keys'],
    queryFn: async () => {
      const res = await fetch('/api/admin/email/api-keys');
      if (!res.ok) throw new Error('Failed to fetch API keys');
      const json = await res.json();
      return json.data || [];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest('PATCH', `/api/admin/submissions/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/submissions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/submissions/stats'] });
      toast({ title: t('admin.operations.communications.toast.statusUpdated') });
    },
    onError: () => {
      toast({ title: t('admin.operations.communications.toast.statusUpdateFailed'), variant: "destructive" });
    }
  });

  const emailSettingsForm = useForm<z.infer<typeof emailSettingsSchema>>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      smtpHost: "",
      smtpPort: 587,
      smtpUsername: "",
      smtpPassword: "",
      fromName: "",
      fromEmail: "",
      replyTo: "",
      useTls: true
    }
  });

  const saveEmailSettingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof emailSettingsSchema>) => {
      const payload = {
        ...data,
        replyToEmail: data.replyTo,
      };
      const res = await apiRequest('PUT', '/api/admin/email/settings', payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/settings'] });
      toast({ title: t('admin.operations.communications.toast.settingsSaved') });
    },
    onError: () => {
      toast({ title: t('admin.operations.communications.toast.settingsSaveFailed'), variant: "destructive" });
    }
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/admin/email/settings/test', {});
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t('admin.operations.communications.toast.connectionSuccess') });
    },
    onError: () => {
      toast({ title: t('admin.operations.communications.toast.connectionFailed'), variant: "destructive" });
    }
  });

  const templateForm = useForm<z.infer<typeof emailTemplateSchema>>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: { name: "", subject: "", body: "" }
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof emailTemplateSchema>) => {
      if (editingTemplate) {
        const res = await apiRequest('PUT', `/api/admin/email/templates/${editingTemplate.id}`, data);
        return res.json();
      }
      const res = await apiRequest('POST', '/api/admin/email/templates', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/templates'] });
      setIsTemplateDialogOpen(false);
      setEditingTemplate(null);
      templateForm.reset();
      toast({ title: editingTemplate ? t('admin.operations.communications.toast.templateUpdated') : t('admin.operations.communications.toast.templateCreated') });
    },
    onError: () => {
      toast({ title: t('admin.operations.communications.toast.templateSaveFailed'), variant: "destructive" });
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/email/templates/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/templates'] });
      toast({ title: t('admin.operations.communications.toast.templateDeleted') });
    },
    onError: () => {
      toast({ title: t('admin.operations.communications.toast.templateDeleteFailed'), variant: "destructive" });
    }
  });

  const recipientForm = useForm<z.infer<typeof recipientSchema>>({
    resolver: zodResolver(recipientSchema),
    defaultValues: { name: "", email: "" }
  });

  const saveRecipientMutation = useMutation({
    mutationFn: async (data: z.infer<typeof recipientSchema>) => {
      const res = await apiRequest('POST', '/api/admin/email/recipients', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/recipients'] });
      setIsRecipientDialogOpen(false);
      recipientForm.reset();
      toast({ title: t('admin.operations.communications.toast.recipientAdded') });
    },
    onError: () => {
      toast({ title: t('admin.operations.communications.toast.recipientAddFailed'), variant: "destructive" });
    }
  });

  const deleteRecipientMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/email/recipients/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/recipients'] });
      toast({ title: t('admin.operations.communications.toast.recipientRemoved') });
    },
    onError: () => {
      toast({ title: t('admin.operations.communications.toast.recipientRemoveFailed'), variant: "destructive" });
    }
  });

  const toggleRecipientMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest('PATCH', `/api/admin/email/recipients/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/recipients'] });
    },
    onError: () => {
      toast({ title: t('admin.operations.communications.toast.recipientUpdateFailed'), variant: "destructive" });
    }
  });

  const apiKeyForm = useForm<z.infer<typeof apiKeySchema>>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: { subdomain: "", description: "" }
  });

  const createApiKeyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof apiKeySchema>) => {
      const res = await apiRequest('POST', '/api/admin/email/api-keys', data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/api-keys'] });
      setGeneratedApiKey(data.data.rawApiKey);
      apiKeyForm.reset();
      toast({ title: t('admin.operations.communications.toast.apiKeyCreated') });
    },
    onError: () => {
      toast({ title: t('admin.operations.communications.toast.apiKeyCreateFailed'), variant: "destructive" });
    }
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/email/api-keys/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/api-keys'] });
      toast({ title: t('admin.operations.communications.toast.apiKeyDeleted') });
    },
    onError: () => {
      toast({ title: t('admin.operations.communications.toast.apiKeyDeleteFailed'), variant: "destructive" });
    }
  });

  const toggleApiKeyMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest('PATCH', `/api/admin/email/api-keys/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/api-keys'] });
    },
    onError: () => {
      toast({ title: t('admin.operations.communications.toast.apiKeyUpdateFailed'), variant: "destructive" });
    }
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: t('admin.operations.communications.toast.copiedToClipboard') });
    } catch {
      toast({ title: t('admin.operations.communications.toast.copyFailed'), variant: "destructive" });
    }
  };

  const openSubmissionDetails = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsSubmissionSheetOpen(true);
  };

  const openTemplateDialog = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template);
      templateForm.reset({
        name: template.name,
        subject: template.subject,
        body: template.body
      });
    } else {
      setEditingTemplate(null);
      templateForm.reset({ name: "", subject: "", body: "" });
    }
    setIsTemplateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight" data-testid="page-title">{t('admin.operations.communications.title')}</h2>
          <p className="text-muted-foreground">{t('admin.operations.communications.subtitle')}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="communications-tabs">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="submissions" data-testid="tab-submissions">
            <MessageSquare className="h-4 w-4 mr-2" />
            {t('admin.operations.communications.tabs.submissions')}
          </TabsTrigger>
          <TabsTrigger value="statistics" data-testid="tab-statistics">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t('admin.operations.communications.tabs.statistics')}
          </TabsTrigger>
          <TabsTrigger value="email-settings" data-testid="tab-email-settings">
            <Settings className="h-4 w-4 mr-2" />
            {t('admin.operations.communications.tabs.emailSettings')}
          </TabsTrigger>
          <TabsTrigger value="templates-recipients" data-testid="tab-templates-recipients">
            <Mail className="h-4 w-4 mr-2" />
            {t('admin.operations.communications.tabs.templatesRecipients')}
          </TabsTrigger>
          <TabsTrigger value="api-keys" data-testid="tab-api-keys">
            <Key className="h-4 w-4 mr-2" />
            {t('admin.operations.communications.tabs.apiKeys')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.operations.communications.cards.filters')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="w-48">
                  <Label>{t('admin.operations.communications.form.formType')}</Label>
                  <Select value={formTypeFilter} onValueChange={setFormTypeFilter} data-testid="filter-form-type">
                    <SelectTrigger>
                      <SelectValue placeholder={t('admin.operations.communications.labels.allTypes')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('admin.operations.communications.labels.allTypes')}</SelectItem>
                      <SelectItem value="contact">{t('admin.operations.communications.labels.contact')}</SelectItem>
                      <SelectItem value="quote">{t('admin.operations.communications.labels.quote')}</SelectItem>
                      <SelectItem value="support">{t('admin.operations.communications.labels.support')}</SelectItem>
                      <SelectItem value="feedback">{t('admin.operations.communications.labels.feedback')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-48">
                  <Label>{t('admin.operations.communications.table.status')}</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="filter-status">
                    <SelectTrigger>
                      <SelectValue placeholder={t('admin.operations.communications.labels.allStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('admin.operations.communications.labels.allStatus')}</SelectItem>
                      <SelectItem value="pending">{t('admin.operations.communications.stats.pending')}</SelectItem>
                      <SelectItem value="in_review">{t('admin.operations.communications.stats.inReview')}</SelectItem>
                      <SelectItem value="responded">{t('admin.operations.communications.stats.responded')}</SelectItem>
                      <SelectItem value="closed">{t('admin.operations.communications.stats.closed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Label>{t('admin.operations.communications.form.dateRange')}</Label>
                  <DatePickerWithRange
                    date={dateRange}
                    onDateChange={setDateRange}
                    data-testid="filter-date-range"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.operations.communications.cards.formSubmissions')}</CardTitle>
              <CardDescription>
                {t('admin.operations.communications.cards.totalSubmissions', { count: submissionsQuery.data?.total ?? 0 })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissionsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <Table data-testid="submissions-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('admin.operations.communications.table.date')}</TableHead>
                        <TableHead>{t('admin.operations.communications.table.name')}</TableHead>
                        <TableHead>{t('admin.operations.communications.table.email')}</TableHead>
                        <TableHead>{t('admin.operations.communications.table.formType')}</TableHead>
                        <TableHead>{t('admin.operations.communications.table.subject')}</TableHead>
                        <TableHead>{t('admin.operations.communications.table.status')}</TableHead>
                        <TableHead>{t('admin.operations.communications.table.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissionsQuery.data?.submissions?.map((submission) => {
                        const StatusIcon = statusIcons[submission.status];
                        return (
                          <TableRow 
                            key={submission.id} 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => openSubmissionDetails(submission)}
                            data-testid={`submission-row-${submission.id}`}
                          >
                            <TableCell>{format(new Date(submission.createdAt), 'MMM d, yyyy')}</TableCell>
                            <TableCell className="font-medium">{submission.name}</TableCell>
                            <TableCell>{submission.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{submission.formType}</Badge>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">{submission.subject}</TableCell>
                            <TableCell>
                              <Badge className={statusColors[submission.status]}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {t(`admin.operations.communications.status.${submission.status}`)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" data-testid={`view-submission-${submission.id}`}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {(!submissionsQuery.data?.submissions || submissionsQuery.data.submissions.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            {t('admin.operations.communications.labels.noSubmissionsFound')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t('admin.operations.communications.stats.total')}</CardDescription>
                <CardTitle className="text-3xl">{statsQuery.data?.total || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t('admin.operations.communications.stats.pending')}</CardDescription>
                <CardTitle className="text-3xl text-yellow-600">{statsQuery.data?.pending || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t('admin.operations.communications.stats.inReview')}</CardDescription>
                <CardTitle className="text-3xl text-blue-600">{statsQuery.data?.inReview || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t('admin.operations.communications.stats.responded')}</CardDescription>
                <CardTitle className="text-3xl text-green-600">{statsQuery.data?.responded || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t('admin.operations.communications.stats.closed')}</CardDescription>
                <CardTitle className="text-3xl text-gray-600">{statsQuery.data?.closed || 0}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.operations.communications.form.formType')}</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsQuery.data?.byFormType || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="formType" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.operations.communications.cards.emailSettings')}</CardTitle>
              <CardDescription>{t('admin.operations.communications.cards.emailSettingsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...emailSettingsForm}>
                <form onSubmit={emailSettingsForm.handleSubmit((data) => saveEmailSettingsMutation.mutate(data))} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={emailSettingsForm.control}
                      name="smtpHost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.operations.communications.form.smtpHost')}</FormLabel>
                          <FormControl>
                            <Input placeholder="smtp.example.com" {...field} data-testid="input-smtp-host" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailSettingsForm.control}
                      name="smtpPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.operations.communications.form.smtpPort')}</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="587" {...field} data-testid="input-smtp-port" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailSettingsForm.control}
                      name="smtpUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.operations.communications.form.username')}</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} data-testid="input-smtp-username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailSettingsForm.control}
                      name="smtpPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.operations.communications.form.password')}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} data-testid="input-smtp-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailSettingsForm.control}
                      name="fromName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.operations.communications.form.fromName')}</FormLabel>
                          <FormControl>
                            <Input placeholder="MoloChain" {...field} data-testid="input-from-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailSettingsForm.control}
                      name="fromEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.operations.communications.form.fromEmail')}</FormLabel>
                          <FormControl>
                            <Input placeholder="noreply@example.com" {...field} data-testid="input-from-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailSettingsForm.control}
                      name="replyTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.operations.communications.form.replyTo')}</FormLabel>
                          <FormControl>
                            <Input placeholder="support@example.com" {...field} data-testid="input-reply-to" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailSettingsForm.control}
                      name="useTls"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 pt-6">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-use-tls" />
                          </FormControl>
                          <FormLabel className="!mt-0">{t('admin.operations.communications.form.useTls')}</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={saveEmailSettingsMutation.isPending} data-testid="button-save-settings">
                      {saveEmailSettingsMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {t('admin.operations.communications.buttons.saveSettings')}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => testConnectionMutation.mutate()} disabled={testConnectionMutation.isPending} data-testid="button-test-connection">
                      {testConnectionMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {t('admin.operations.communications.buttons.testConnection')}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates-recipients" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('admin.operations.communications.cards.emailTemplates')}</CardTitle>
              </div>
              <Button onClick={() => openTemplateDialog()} data-testid="button-add-template">
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.operations.communications.buttons.addTemplate')}
              </Button>
            </CardHeader>
            <CardContent>
              <Table data-testid="templates-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.operations.communications.table.name')}</TableHead>
                    <TableHead>{t('admin.operations.communications.table.subject')}</TableHead>
                    <TableHead>{t('admin.operations.communications.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templatesQuery.data?.map((template) => (
                    <TableRow key={template.id} data-testid={`template-row-${template.id}`}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.subject}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openTemplateDialog(template)} data-testid={`edit-template-${template.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteTemplateMutation.mutate(template.id)} data-testid={`delete-template-${template.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!templatesQuery.data || templatesQuery.data.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        {t('admin.operations.communications.labels.noTemplatesFound')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('admin.operations.communications.cards.notificationRecipients')}</CardTitle>
              </div>
              <Button onClick={() => setIsRecipientDialogOpen(true)} data-testid="button-add-recipient">
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.operations.communications.buttons.addRecipient')}
              </Button>
            </CardHeader>
            <CardContent>
              <Table data-testid="recipients-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.operations.communications.table.name')}</TableHead>
                    <TableHead>{t('admin.operations.communications.table.email')}</TableHead>
                    <TableHead>{t('admin.operations.communications.table.status')}</TableHead>
                    <TableHead>{t('admin.operations.communications.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipientsQuery.data?.map((recipient) => (
                    <TableRow key={recipient.id} data-testid={`recipient-row-${recipient.id}`}>
                      <TableCell className="font-medium">{recipient.name}</TableCell>
                      <TableCell>{recipient.email}</TableCell>
                      <TableCell>
                        <Switch
                          checked={recipient.isActive}
                          onCheckedChange={(checked) => 
                            toggleRecipientMutation.mutate({ id: recipient.id, isActive: checked })
                          }
                          data-testid={`toggle-recipient-${recipient.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteRecipientMutation.mutate(recipient.id)}
                          data-testid={`delete-recipient-${recipient.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!recipientsQuery.data || recipientsQuery.data.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        {t('admin.operations.communications.labels.noRecipientsFound')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('admin.operations.communications.cards.emailApiKeys')}</CardTitle>
                <CardDescription>{t('admin.operations.communications.cards.emailApiKeysDesc')}</CardDescription>
              </div>
              <Button onClick={() => setIsApiKeyDialogOpen(true)} data-testid="button-add-api-key">
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.operations.communications.buttons.createApiKey')}
              </Button>
            </CardHeader>
            <CardContent>
              {apiKeysQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table data-testid="api-keys-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.operations.communications.table.keyPreview')}</TableHead>
                      <TableHead>{t('admin.operations.communications.table.subdomain')}</TableHead>
                      <TableHead>{t('admin.operations.communications.form.description')}</TableHead>
                      <TableHead>{t('admin.operations.communications.table.status')}</TableHead>
                      <TableHead>{t('admin.operations.communications.table.lastUsed')}</TableHead>
                      <TableHead>{t('admin.operations.communications.table.created')}</TableHead>
                      <TableHead>{t('admin.operations.communications.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeysQuery.data?.map((apiKey) => (
                      <TableRow key={apiKey.id} data-testid={`api-key-row-${apiKey.id}`}>
                        <TableCell className="font-mono text-sm">{apiKey.keyPreview}</TableCell>
                        <TableCell className="font-medium">{apiKey.subdomain}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                          {apiKey.description || '-'}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={apiKey.isActive}
                            onCheckedChange={(checked) => 
                              toggleApiKeyMutation.mutate({ id: apiKey.id, isActive: checked })
                            }
                            data-testid={`toggle-api-key-${apiKey.id}`}
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {apiKey.lastUsedAt 
                            ? format(new Date(apiKey.lastUsedAt), 'MMM d, yyyy') 
                            : t('admin.operations.communications.table.never')}
                        </TableCell>
                        <TableCell>{format(new Date(apiKey.createdAt), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteApiKeyMutation.mutate(apiKey.id)}
                            data-testid={`delete-api-key-${apiKey.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!apiKeysQuery.data || apiKeysQuery.data.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          {t('admin.operations.communications.labels.noApiKeysFound')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={isSubmissionSheetOpen} onOpenChange={setIsSubmissionSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{t('admin.operations.communications.dialogs.submissionDetails')}</SheetTitle>
            <SheetDescription>
              {t('admin.operations.communications.dialogs.submissionDetailsDesc')}
            </SheetDescription>
          </SheetHeader>
          {selectedSubmission && (
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <Label>{t('admin.operations.communications.table.status')}</Label>
                <Select 
                  value={selectedSubmission.status} 
                  onValueChange={(value) => updateStatusMutation.mutate({ id: selectedSubmission.id, status: value })}
                  data-testid="select-submission-status"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t('admin.operations.communications.stats.pending')}</SelectItem>
                    <SelectItem value="in_review">{t('admin.operations.communications.stats.inReview')}</SelectItem>
                    <SelectItem value="responded">{t('admin.operations.communications.stats.responded')}</SelectItem>
                    <SelectItem value="closed">{t('admin.operations.communications.stats.closed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label className="text-muted-foreground">{t('admin.operations.communications.form.formType')}</Label>
                  <p className="font-medium">{selectedSubmission.formType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('admin.operations.communications.form.name')}</Label>
                  <p className="font-medium">{selectedSubmission.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('admin.operations.communications.form.email')}</Label>
                  <p className="font-medium">{selectedSubmission.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('admin.operations.communications.table.subject')}</Label>
                  <p className="font-medium">{selectedSubmission.subject}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('admin.operations.communications.labels.message')}</Label>
                  <p className="whitespace-pre-wrap bg-muted p-3 rounded-md text-sm">
                    {selectedSubmission.message}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('admin.operations.communications.labels.submitted')}</Label>
                  <p className="font-medium">
                    {format(new Date(selectedSubmission.createdAt), 'PPpp')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{editingTemplate ? t('admin.operations.communications.dialogs.editTemplate') : t('admin.operations.communications.dialogs.addTemplate')}</DialogTitle>
            <DialogDescription>
              {editingTemplate ? t('admin.operations.communications.dialogs.updateTemplate') : t('admin.operations.communications.dialogs.createTemplate')}
            </DialogDescription>
          </DialogHeader>
          <Form {...templateForm}>
            <form onSubmit={templateForm.handleSubmit((data) => saveTemplateMutation.mutate(data))} className="space-y-4">
              <FormField
                control={templateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.operations.communications.form.templateName')}</FormLabel>
                    <FormControl>
                      <Input placeholder="Welcome Email" {...field} data-testid="input-template-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={templateForm.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.operations.communications.form.subjectLine')}</FormLabel>
                    <FormControl>
                      <Input placeholder="Welcome to our platform!" {...field} data-testid="input-template-subject" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={templateForm.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.operations.communications.form.emailBody')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter email body content..." 
                        rows={8}
                        {...field} 
                        data-testid="input-template-body"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                  {t('admin.operations.communications.buttons.cancel')}
                </Button>
                <Button type="submit" disabled={saveTemplateMutation.isPending} data-testid="button-save-template">
                  {saveTemplateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingTemplate ? t('admin.operations.communications.buttons.update') : t('admin.operations.communications.buttons.create')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRecipientDialogOpen} onOpenChange={setIsRecipientDialogOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{t('admin.operations.communications.dialogs.addRecipient')}</DialogTitle>
            <DialogDescription>
              {t('admin.operations.communications.dialogs.addRecipientDesc')}
            </DialogDescription>
          </DialogHeader>
          <Form {...recipientForm}>
            <form onSubmit={recipientForm.handleSubmit((data) => saveRecipientMutation.mutate(data))} className="space-y-4">
              <FormField
                control={recipientForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.operations.communications.form.name')}</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} data-testid="input-recipient-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={recipientForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.operations.communications.form.email')}</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} data-testid="input-recipient-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsRecipientDialogOpen(false)}>
                  {t('admin.operations.communications.buttons.cancel')}
                </Button>
                <Button type="submit" disabled={saveRecipientMutation.isPending} data-testid="button-save-recipient">
                  {saveRecipientMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t('admin.operations.communications.buttons.addRecipient')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isApiKeyDialogOpen} onOpenChange={(open) => {
        setIsApiKeyDialogOpen(open);
        if (!open) {
          setGeneratedApiKey(null);
          apiKeyForm.reset();
        }
      }}>
        <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{t('admin.operations.communications.dialogs.createApiKey')}</DialogTitle>
            <DialogDescription>
              {t('admin.operations.communications.dialogs.createApiKeyDesc')}
            </DialogDescription>
          </DialogHeader>
          
          {generatedApiKey ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium">{t('admin.operations.communications.apiKey.warning')}</p>
                  <p>{t('admin.operations.communications.apiKey.warningDesc')}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t('admin.operations.communications.apiKey.yourApiKey')}</Label>
                <div className="flex gap-2">
                  <Input 
                    value={generatedApiKey} 
                    readOnly 
                    className="font-mono text-sm"
                    data-testid="input-generated-api-key"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(generatedApiKey)}
                    data-testid="button-copy-api-key"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={() => {
                  setIsApiKeyDialogOpen(false);
                  setGeneratedApiKey(null);
                  apiKeyForm.reset();
                }} data-testid="button-close-api-key-dialog">
                  {t('admin.operations.communications.buttons.done')}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <Form {...apiKeyForm}>
              <form onSubmit={apiKeyForm.handleSubmit((data) => createApiKeyMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={apiKeyForm.control}
                  name="subdomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.operations.communications.form.subdomainName')}</FormLabel>
                      <FormControl>
                        <Input placeholder="my-subdomain" {...field} data-testid="input-api-key-subdomain" />
                      </FormControl>
                      <FormDescription>
                        {t('admin.operations.communications.apiKey.subdomainDesc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={apiKeyForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.operations.communications.apiKey.descriptionOptional')}</FormLabel>
                      <FormControl>
                        <Input placeholder="API key for production environment" {...field} data-testid="input-api-key-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsApiKeyDialogOpen(false)}>
                    {t('admin.operations.communications.buttons.cancel')}
                  </Button>
                  <Button type="submit" disabled={createApiKeyMutation.isPending} data-testid="button-generate-api-key">
                    {createApiKeyMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t('admin.operations.communications.buttons.generateKey')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
