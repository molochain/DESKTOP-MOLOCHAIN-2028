import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import {
  Search,
  Filter,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  Layout,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActivityLogEntry {
  id: number;
  admin_id: number | null;
  action_type: string;
  target_type: string;
  target_id: number | null;
  changes: Record<string, any>;
  status: string;
  created_at: string;
  admin_username?: string;
  admin_email?: string;
}

interface ActivityLogResponse {
  data: ActivityLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ViewTemplate {
  id: string;
  name: string;
  columns: string[];
  groupBy?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface FilterTemplate {
  id: string;
  name: string;
  filters: {
    field: string;
    operator: string;
    value: string;
  }[];
}

const severityColors = {
  info: "bg-blue-100 text-blue-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  success: "bg-green-100 text-green-800"
};

const actionIcons = {
  create: CheckCircle,
  update: Activity,
  delete: XCircle,
  error: AlertCircle,
};

const defaultViewTemplates: ViewTemplate[] = [
  {
    id: 'detailed',
    name: 'Detailed View',
    columns: ['timestamp', 'action', 'resourceType', 'userId', 'details'],
    sortBy: 'timestamp',
    sortOrder: 'desc'
  },
  {
    id: 'compact',
    name: 'Compact View',
    columns: ['timestamp', 'action', 'resourceType'],
    sortBy: 'timestamp',
    sortOrder: 'desc'
  },
  {
    id: 'grouped',
    name: 'Grouped by Type',
    columns: ['timestamp', 'action', 'details'],
    groupBy: 'resourceType',
    sortBy: 'timestamp',
    sortOrder: 'desc'
  }
];

const defaultFilterTemplates: FilterTemplate[] = [
  {
    id: 'errors',
    name: 'Error Events',
    filters: [{ field: 'action', operator: 'equals', value: 'error' }]
  },
  {
    id: 'user-actions',
    name: 'User Actions',
    filters: [{ field: 'userId', operator: 'exists', value: 'true' }]
  },
  {
    id: 'system-events',
    name: 'System Events',
    filters: [{ field: 'userId', operator: 'exists', value: 'false' }]
  }
];

const testActions = [
  { id: 'user-action', name: 'Test User Action', description: 'Creates a test user creation log' },
  { id: 'system-event', name: 'Test System Event', description: 'Creates a test system backup event log' },
  { id: 'error-event', name: 'Test Error Event', description: 'Creates a test error event log' }
];

export default function ActivityLog() {
  const [filter, setFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [activeViewTemplate, setActiveViewTemplate] = useState<string>(defaultViewTemplates[0].id);
  const [activeFilterTemplate, setActiveFilterTemplate] = useState<string>("");

  const { data: response, isLoading } = useQuery<ActivityLogResponse>({
    queryKey: ["/api/admin/activity"],
  });

  useEffect(() => {
    if (response?.data) {
      setLogs(response.data);
    }
  }, [response]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/activity-logs`);

    ws.addEventListener('open', () => {
      // Connected to activity logs websocket
    });

    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'activity_log') {
          setLogs(prev => [data.log, ...prev]);
        }
      } catch (error) {
        // Failed to parse activity log - ignored
      }
    });

    ws.addEventListener('close', () => {
      // Activity logs websocket closed
    });

    return () => {
      ws.close();
    };
  }, []);

  const applyViewTemplate = (templateId: string) => {
    setActiveViewTemplate(templateId);
  };

  const applyFilterTemplate = (templateId: string) => {
    setActiveFilterTemplate(templateId);
    const template = defaultFilterTemplates.find(t => t.id === templateId);
    if (template) {
      const filterValue = template.filters[0].field === 'resourceType' 
        ? template.filters[0].value 
        : '';
      setFilter(filterValue);
    }
  };

  const currentViewTemplate = defaultViewTemplates.find(t => t.id === activeViewTemplate);

  const filteredLogs = logs
    .filter(log => {
      if (!filter) return true;
      return log.target_type === filter;
    })
    .filter(log => {
      if (!searchTerm) return true;
      return (
        log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.admin_username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  const getSeverity = (action: string): keyof typeof severityColors => {
    switch (action.toLowerCase()) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'create':
        return 'success';
      default:
        return 'info';
    }
  };

  const getIcon = (action: string) => {
    const Icon = actionIcons[action as keyof typeof actionIcons] || Activity;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Activity Log</CardTitle>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={activeViewTemplate} onValueChange={applyViewTemplate}>
                <SelectTrigger>
                  <Layout className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select view template" />
                </SelectTrigger>
                <SelectContent>
                  {defaultViewTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={activeFilterTemplate} onValueChange={applyFilterTemplate}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select filter template" />
                </SelectTrigger>
                <SelectContent>
                  {defaultFilterTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setFilter("")}
              className={!filter ? "bg-primary text-primary-foreground" : ""}
            >
              <Filter className="mr-2 h-4 w-4" />
              All
            </Button>
            {["user", "shipment", "chat", "booking"].map((type) => (
              <Button
                key={type}
                variant="outline"
                onClick={() => setFilter(type)}
                className={filter === type ? "bg-primary text-primary-foreground" : ""}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading activity logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Activity className="h-12 w-12 mb-4" />
              <p>No activity logs found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start p-4 rounded-lg border bg-card text-card-foreground"
                >
                  <div className="mr-4">
                    {getIcon(log.action_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">
                        {log.action_type.charAt(0).toUpperCase() + log.action_type.slice(1).replace(/_/g, ' ')}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={severityColors[getSeverity(log.action_type)]}
                        >
                          {log.target_type}
                        </Badge>
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                          {log.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground break-words">
                      {log.changes?.message || `${log.action_type.replace(/_/g, ' ')} on ${log.target_type}`}
                    </p>
                    {log.admin_username && (
                      <div className="mt-2 flex items-center text-xs text-muted-foreground">
                        <User className="w-3 h-3 mr-1" />
                        Admin: {log.admin_username}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="mt-6 p-4 border rounded-lg bg-slate-50">
          <h3 className="text-sm font-medium mb-3">Test Actions</h3>
          <div className="flex gap-2">
            {testActions.map(action => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await fetch(`/api/admin/test-actions/${action.id}`, {
                      method: 'POST',
                      credentials: 'include',
                    });
                  } catch (error) {
                    // Failed to create action - error handled
                  }
                }}
                title={action.description}
              >
                {action.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}