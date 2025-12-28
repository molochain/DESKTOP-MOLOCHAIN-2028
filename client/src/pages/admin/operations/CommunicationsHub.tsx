import { useState } from "react";
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
      toast({ title: "Status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
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
      toast({ title: "Email settings saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save email settings", variant: "destructive" });
    }
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/admin/email/settings/test', {});
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Connection test successful" });
    },
    onError: () => {
      toast({ title: "Connection test failed", variant: "destructive" });
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
      toast({ title: editingTemplate ? "Template updated" : "Template created" });
    },
    onError: () => {
      toast({ title: "Failed to save template", variant: "destructive" });
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/email/templates/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/templates'] });
      toast({ title: "Template deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete template", variant: "destructive" });
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
      toast({ title: "Recipient added" });
    },
    onError: () => {
      toast({ title: "Failed to add recipient", variant: "destructive" });
    }
  });

  const deleteRecipientMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/email/recipients/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/recipients'] });
      toast({ title: "Recipient removed" });
    },
    onError: () => {
      toast({ title: "Failed to remove recipient", variant: "destructive" });
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
      toast({ title: "Failed to update recipient", variant: "destructive" });
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
      toast({ title: "API key created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create API key", variant: "destructive" });
    }
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/email/api-keys/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/api-keys'] });
      toast({ title: "API key deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete API key", variant: "destructive" });
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
      toast({ title: "Failed to update API key", variant: "destructive" });
    }
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
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
          <h2 className="text-3xl font-bold tracking-tight" data-testid="page-title">Communications Hub</h2>
          <p className="text-muted-foreground">Manage form submissions and email settings</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="communications-tabs">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="submissions" data-testid="tab-submissions">
            <MessageSquare className="h-4 w-4 mr-2" />
            Submissions
          </TabsTrigger>
          <TabsTrigger value="statistics" data-testid="tab-statistics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="email-settings" data-testid="tab-email-settings">
            <Settings className="h-4 w-4 mr-2" />
            Email Settings
          </TabsTrigger>
          <TabsTrigger value="templates-recipients" data-testid="tab-templates-recipients">
            <Mail className="h-4 w-4 mr-2" />
            Templates & Recipients
          </TabsTrigger>
          <TabsTrigger value="api-keys" data-testid="tab-api-keys">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="w-48">
                  <Label>Form Type</Label>
                  <Select value={formTypeFilter} onValueChange={setFormTypeFilter} data-testid="filter-form-type">
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="contact">Contact</SelectItem>
                      <SelectItem value="quote">Quote</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-48">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="filter-status">
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="responded">Responded</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Label>Date Range</Label>
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
              <CardTitle>Form Submissions</CardTitle>
              <CardDescription>
                {submissionsQuery.data?.total ?? 0} total submissions
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
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Form Type</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
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
                                {submission.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openSubmissionDetails(submission);
                                }}
                                data-testid={`view-submission-${submission.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {(!submissionsQuery.data?.submissions || submissionsQuery.data.submissions.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            No submissions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {submissionsQuery.data && submissionsQuery.data.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Page {submissionsQuery.data.page} of {submissionsQuery.data.totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          data-testid="pagination-prev"
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(p => p + 1)}
                          disabled={page >= submissionsQuery.data.totalPages}
                          data-testid="pagination-next"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card data-testid="stat-total">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsQuery.data?.total ?? 0}</div>
              </CardContent>
            </Card>
            <Card data-testid="stat-pending">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{statsQuery.data?.pending ?? 0}</div>
              </CardContent>
            </Card>
            <Card data-testid="stat-in-review">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Review</CardTitle>
                <AlertCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{statsQuery.data?.inReview ?? 0}</div>
              </CardContent>
            </Card>
            <Card data-testid="stat-responded">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Responded</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{statsQuery.data?.responded ?? 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Submissions by Form Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]" data-testid="chart-by-form-type">
                {statsQuery.isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsQuery.data?.byFormType ?? []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="formType" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>SMTP Configuration</CardTitle>
                  <CardDescription>Configure your email server settings</CardDescription>
                </div>
                {emailSettingsQuery.data?.verified && (
                  <Badge className="bg-green-100 text-green-800" data-testid="smtp-verified-badge">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Form {...emailSettingsForm}>
                <form onSubmit={emailSettingsForm.handleSubmit((data) => saveEmailSettingsMutation.mutate(data))} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={emailSettingsForm.control}
                      name="smtpHost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Host</FormLabel>
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
                          <FormLabel>SMTP Port</FormLabel>
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
                          <FormLabel>SMTP Username</FormLabel>
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
                          <FormLabel>SMTP Password</FormLabel>
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
                          <FormLabel>From Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Company Name" {...field} data-testid="input-from-name" />
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
                          <FormLabel>From Email</FormLabel>
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
                          <FormLabel>Reply-To Email</FormLabel>
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
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Use TLS</FormLabel>
                            <FormDescription>Enable TLS encryption for SMTP connection</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-use-tls"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => testConnectionMutation.mutate()}
                      disabled={testConnectionMutation.isPending}
                      data-testid="button-test-connection"
                    >
                      {testConnectionMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Test Connection
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={saveEmailSettingsMutation.isPending}
                      data-testid="button-save-settings"
                    >
                      {saveEmailSettingsMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Save Settings
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
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Manage email templates for notifications</CardDescription>
              </div>
              <Button onClick={() => openTemplateDialog()} data-testid="button-add-template">
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </CardHeader>
            <CardContent>
              <Table data-testid="templates-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templatesQuery.data?.map((template) => (
                    <TableRow key={template.id} data-testid={`template-row-${template.id}`}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.subject}</TableCell>
                      <TableCell>{format(new Date(template.createdAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openTemplateDialog(template)}
                            data-testid={`edit-template-${template.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteTemplateMutation.mutate(template.id)}
                            data-testid={`delete-template-${template.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!templatesQuery.data || templatesQuery.data.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No templates found
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
                <CardTitle>Notification Recipients</CardTitle>
                <CardDescription>Manage who receives notification emails</CardDescription>
              </div>
              <Button onClick={() => setIsRecipientDialogOpen(true)} data-testid="button-add-recipient">
                <Plus className="h-4 w-4 mr-2" />
                Add Recipient
              </Button>
            </CardHeader>
            <CardContent>
              <Table data-testid="recipients-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
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
                        No recipients found
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
                <CardTitle>Email API Keys</CardTitle>
                <CardDescription>Manage API keys for programmatic email access</CardDescription>
              </div>
              <Button onClick={() => setIsApiKeyDialogOpen(true)} data-testid="button-add-api-key">
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
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
                      <TableHead>Key Preview</TableHead>
                      <TableHead>Subdomain</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
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
                            : 'Never'}
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
                          No API keys found
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
            <SheetTitle>Submission Details</SheetTitle>
            <SheetDescription>
              View and manage this form submission
            </SheetDescription>
          </SheetHeader>
          {selectedSubmission && (
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={selectedSubmission.status} 
                  onValueChange={(value) => updateStatusMutation.mutate({ id: selectedSubmission.id, status: value })}
                  data-testid="select-submission-status"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label className="text-muted-foreground">Form Type</Label>
                  <p className="font-medium">{selectedSubmission.formType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedSubmission.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedSubmission.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Subject</Label>
                  <p className="font-medium">{selectedSubmission.subject}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Message</Label>
                  <p className="whitespace-pre-wrap bg-muted p-3 rounded-md text-sm">
                    {selectedSubmission.message}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted</Label>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
            <DialogDescription>
              {editingTemplate ? 'Update the email template' : 'Create a new email template'}
            </DialogDescription>
          </DialogHeader>
          <Form {...templateForm}>
            <form onSubmit={templateForm.handleSubmit((data) => saveTemplateMutation.mutate(data))} className="space-y-4">
              <FormField
                control={templateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
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
                    <FormLabel>Subject Line</FormLabel>
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
                    <FormLabel>Email Body</FormLabel>
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
                  Cancel
                </Button>
                <Button type="submit" disabled={saveTemplateMutation.isPending} data-testid="button-save-template">
                  {saveTemplateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingTemplate ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRecipientDialogOpen} onOpenChange={setIsRecipientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Recipient</DialogTitle>
            <DialogDescription>
              Add a new notification recipient
            </DialogDescription>
          </DialogHeader>
          <Form {...recipientForm}>
            <form onSubmit={recipientForm.handleSubmit((data) => saveRecipientMutation.mutate(data))} className="space-y-4">
              <FormField
                control={recipientForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} data-testid="input-recipient-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsRecipientDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveRecipientMutation.isPending} data-testid="button-save-recipient">
                  {saveRecipientMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Recipient
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Create a new API key for programmatic email access
            </DialogDescription>
          </DialogHeader>
          
          {generatedApiKey ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium">Save this API key now!</p>
                  <p>This is the only time you will see the full key. Copy it and store it securely.</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Your API Key</Label>
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
                  Done
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
                      <FormLabel>Subdomain Name</FormLabel>
                      <FormControl>
                        <Input placeholder="my-subdomain" {...field} data-testid="input-api-key-subdomain" />
                      </FormControl>
                      <FormDescription>
                        The subdomain this API key will be associated with
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
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="API key for production environment" {...field} data-testid="input-api-key-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsApiKeyDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createApiKeyMutation.isPending} data-testid="button-generate-api-key">
                    {createApiKeyMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Generate Key
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
