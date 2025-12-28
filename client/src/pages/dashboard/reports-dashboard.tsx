import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Download, Upload, FileText, BarChart3, Building2, Layers, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
// Type definitions for Department and Division
type Department = {
  id: string;
  name: string;
  code: string;
  active: boolean;
};

type Division = {
  id: string;
  name: string;
  departmentId: string;
  active: boolean;
};

export default function ReportsDashboard() {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importType, setImportType] = useState<string>('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Fetch organization report
  const { data: orgReport, isLoading: orgLoading } = useQuery({
    queryKey: ['/api/reports/organization'],
  });

  // Fetch departments for selection
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
  });

  // Fetch divisions for selection
  const { data: divisions = [] } = useQuery<Division[]>({
    queryKey: ['/api/divisions'],
  });

  // Fetch department report when selected
  const { data: deptReport } = useQuery({
    queryKey: ['/api/reports/department', selectedDepartmentId],
    queryFn: () => fetch(`/api/reports/department/${selectedDepartmentId}`).then(r => r.json()),
    enabled: !!selectedDepartmentId,
  });

  // Fetch division report when selected
  const { data: divReport } = useQuery({
    queryKey: ['/api/reports/division', selectedDivisionId],
    queryFn: () => fetch(`/api/reports/division/${selectedDivisionId}`).then(r => r.json()),
    enabled: !!selectedDivisionId,
  });

  // Export data mutation
  const exportMutation = useMutation({
    mutationFn: () => fetch('/api/bulk/export', { method: 'GET', credentials: 'include' }).then(r => r.json()),
    onSuccess: (data) => {
      // Convert to JSON and download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `molochain-export-${new Date().toISOString().split('T')[0]}.json`;
      a.style.display = 'none';
      
      if (document.body) {
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Fallback if document.body is not available
        a.click();
      }
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    },
  });

  // Import data mutation
  const importMutation = useMutation({
    mutationFn: ({ type, data }: { type: string; data: any[] }) => 
      fetch(`/api/bulk/import/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      }).then(r => r.json()),
    onSuccess: (result) => {
      setIsImportDialogOpen(false);
      setImportFile(null);
      setImportType('');
      toast({
        title: "Success",
        description: (result as any).message || "Data imported successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to import data",
        variant: "destructive",
      });
    },
  });

  const handleImport = async () => {
    if (!importFile || !importType) return;

    try {
      const text = await importFile.text();
      const data = JSON.parse(text);
      
      // Determine the correct data array based on import type
      let importData;
      switch (importType) {
        case 'departments':
          importData = data.departments || data;
          break;
        case 'divisions':
          importData = data.divisions || data;
          break;
        case 'sub-divisions':
          importData = data.subDivisions || data;
          break;
        case 'domains':
          importData = data.domains || data;
          break;
        default:
          throw new Error('Invalid import type');
      }

      if (!Array.isArray(importData)) {
        throw new Error('Import data must be an array');
      }

      importMutation.mutate({ type: importType, data: importData });
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid file format. Please upload a valid JSON file.",
        variant: "destructive",
      });
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600';
      case 'partial':
        return 'text-yellow-600';
      case 'non-compliant':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Comprehensive reporting and data management
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsImportDialogOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Data
                </Button>
                <Button 
                  onClick={() => exportMutation.mutate()}
                  disabled={exportMutation.isPending}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {exportMutation.isPending ? "Exporting..." : "Export All Data"}
                </Button>
              </div>
            </div>

            <Tabs defaultValue="organization" className="space-y-4">
              <TabsList className="bg-white dark:bg-gray-800">
                <TabsTrigger value="organization">Organization Report</TabsTrigger>
                <TabsTrigger value="department">Department Report</TabsTrigger>
                <TabsTrigger value="division">Division Report</TabsTrigger>
              </TabsList>

              <TabsContent value="organization" className="space-y-4">
                {orgLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <CardHeader>
                          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-32 bg-gray-700 rounded"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : orgReport && (
                  <>
                    {/* Department Statistics */}
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-primary" />
                          Department Statistics
                        </CardTitle>
                        <CardDescription>Division and module counts by department</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {(orgReport as any).departmentStats?.map((dept: any) => (
                            <div key={dept.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <div>
                                <h4 className="font-medium">{dept.name}</h4>
                                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  <span>{dept.divisionCount} Divisions</span>
                                  <span>{dept.moduleCount} Modules</span>
                                </div>
                              </div>
                              <TrendingUp className="h-5 w-5 text-green-500" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Health Overview */}
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-primary" />
                          System Health Overview
                        </CardTitle>
                        <CardDescription>Module health distribution</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold">{(orgReport as any).healthOverview?.total || 0}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Modules</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-500">{(orgReport as any).healthOverview?.healthy || 0}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Healthy</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-500">{(orgReport as any).healthOverview?.warning || 0}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Warning</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-500">{(orgReport as any).healthOverview?.critical || 0}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Compliance Overview */}
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>Compliance Status</CardTitle>
                        <CardDescription>Standards compliance across the organization</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {(orgReport as any).complianceOverview?.map((compliance: any, index: number) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{compliance.standard}</span>
                                <span className={getComplianceColor(compliance.status)}>
                                  {compliance.status}
                                </span>
                              </div>
                              <Progress value={compliance.score} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="department" className="space-y-4">
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle>Select Department</CardTitle>
                    <CardDescription>Choose a department to view detailed report</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {deptReport && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>{deptReport.department?.name}</CardTitle>
                        <CardDescription>{deptReport.department?.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Divisions</p>
                            <p className="text-2xl font-bold">{deptReport.divisions?.length || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Modules</p>
                            <p className="text-2xl font-bold">{deptReport.totalModules || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                            <Badge className="mt-1">{deptReport.department?.status}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>Health Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="text-center p-4 bg-green-500/10 rounded-lg">
                            <p className="text-2xl font-bold text-green-500">{deptReport.healthStats?.healthy || 0}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Healthy</p>
                          </div>
                          <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                            <p className="text-2xl font-bold text-yellow-500">{deptReport.healthStats?.warning || 0}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Warning</p>
                          </div>
                          <div className="text-center p-4 bg-red-500/10 rounded-lg">
                            <p className="text-2xl font-bold text-red-500">{deptReport.healthStats?.critical || 0}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="division" className="space-y-4">
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle>Select Division</CardTitle>
                    <CardDescription>Choose a division to view detailed report</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedDivisionId} onValueChange={setSelectedDivisionId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a division" />
                      </SelectTrigger>
                      <SelectContent>
                        {divisions.map((div) => (
                          <SelectItem key={div.id} value={div.id.toString()}>
                            {div.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {divReport && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>{divReport.division?.name}</CardTitle>
                        <CardDescription>{divReport.division?.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Sub-Divisions</p>
                            <p className="text-2xl font-bold">{divReport.subDivisions?.length || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Domains</p>
                            <p className="text-2xl font-bold">{divReport.domains?.length || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Modules</p>
                            <p className="text-2xl font-bold">{divReport.modules?.length || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                            <Badge className="mt-1">{divReport.division?.status}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>Module Health Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {divReport.modules?.map((module: any) => (
                            <div key={module.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                              <span className="text-sm">{module.name}</span>
                              <Badge className={getHealthColor(module.health)}>
                                {module.health}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>
            </Tabs>

      {/* Import Dialog */}
<Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>
              Upload a JSON file to bulk import data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="import-type">Data Type</Label>
              <Select value={importType} onValueChange={setImportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="departments">Departments</SelectItem>
                  <SelectItem value="divisions">Divisions</SelectItem>
                  <SelectItem value="sub-divisions">Sub-Divisions</SelectItem>
                  <SelectItem value="domains">Domains</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="import-file">JSON File</Label>
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!importFile || !importType || importMutation.isPending}
            >
              {importMutation.isPending ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}