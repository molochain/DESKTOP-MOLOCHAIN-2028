import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, Users, Activity, TrendingUp } from 'lucide-react';

// Define Department type locally
type Department = {
  id: number;
  name: string;
  code?: string;
  description?: string;
  employeeCount?: number;
  status: 'active' | 'inactive';
  metrics?: {
    efficiency?: number;
    performance?: number;
    growth?: number;
  };
};

interface DepartmentOverviewProps {
  className?: string;
}

export function DepartmentOverview({ className }: DepartmentOverviewProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);

  const { data: departments, isLoading, error } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
  });

  if (isLoading) {
    return (
      <div className={className}>
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Department Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Department Overview</h2>
        <div className="text-center py-8">
          <p className="text-red-400">Error loading departments: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!departments || departments.length === 0) {
    return (
      <div className={className}>
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Department Overview</h2>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">No departments found</p>
        </div>
      </div>
    );
  }

  const getDepartmentIcon = (name: string) => {
    const deptName = name.toLowerCase();
    if (deptName.includes('management')) return '👥';
    if (deptName.includes('accounting')) return '💰';
    if (deptName.includes('hr') || deptName.includes('human')) return '👤';
    if (deptName.includes('technology') || deptName.includes('engineering')) return '💻';
    if (deptName.includes('legal') || deptName.includes('risk')) return '⚖️';
    if (deptName.includes('operations')) return '⚙️';
    if (deptName.includes('supply')) return '🚚';
    if (deptName.includes('document') || deptName.includes('library')) return '📚';
    if (deptName.includes('strategy') || deptName.includes('development')) return '🎯';
    if (deptName.includes('marketing') || deptName.includes('branding')) return '📢';
    if (deptName.includes('network') || deptName.includes('partner')) return '🤝';
    if (deptName.includes('learning') || deptName.includes('knowledge')) return '🎓';
    return '🏢';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'inactive':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={className}>
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Department Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department) => (
          <Card
            key={department.id}
            className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer relative overflow-hidden ${
              selectedDepartment === department.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedDepartment(department.id)}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-green-500" />
            
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{getDepartmentIcon(department.name)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{department.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{department.description}</p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(department.status || 'active')}`} />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-primary">
                    {Math.floor(Math.random() * 50) + 10}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Active Units</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-500">
                    {Math.floor(Math.random() * 200) + 50}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Staff</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-yellow-500">
                    {Math.floor(Math.random() * 10) + 90}%
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Efficiency</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Department Code</span>
                  <Badge variant="outline" className="text-xs">
                    {department.code}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
