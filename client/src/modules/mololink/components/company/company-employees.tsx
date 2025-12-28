import { Users, UserPlus, Search, Filter } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User, Post, Comment, Connection, Company, CompanyEmployee, CompanyPost, Skill, MarketplaceListing, MarketplaceAuction, MarketplaceBid, MarketplaceServicePost } from "../lib/schema";

interface CompanyEmployeeWithUser extends CompanyEmployee {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    title: string | null;
    profileImage: string | null;
  } | null;
}

interface CompanyEmployeesProps {
  employees: CompanyEmployeeWithUser[];
  isLoading?: boolean;
  onConnect?: (userId: string) => void;
}

export function CompanyEmployees({ 
  employees, 
  isLoading,
  onConnect
}: CompanyEmployeesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  // Get unique departments
  const departments = Array.from(
    new Set(employees?.map(emp => emp.department).filter(Boolean))
  );

  // Filter employees
  const filteredEmployees = employees?.filter(emp => {
    const matchesSearch = 
      emp.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = 
      departmentFilter === "all" || emp.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employees ({filteredEmployees?.length || 0})
          </CardTitle>
        </div>
        
        {/* Search and Filter */}
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-employees"
            />
          </div>
          {departments.length > 0 && (
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-department-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept || ""}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {!filteredEmployees || filteredEmployees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No employees found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try adjusting your search filters" : "No employees have been added yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEmployees.map((employee) => (
              <div 
                key={employee.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                data-testid={`card-employee-${employee.id}`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={employee.user?.profileImage || undefined} />
                    <AvatarFallback>
                      {employee.user?.firstName?.charAt(0)}
                      {employee.user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {employee.user?.firstName} {employee.user?.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {employee.title || employee.user?.title}
                    </div>
                    {employee.department && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {employee.department}
                      </Badge>
                    )}
                  </div>
                </div>
                {onConnect && employee.user && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onConnect(employee.user!.id)}
                    data-testid={`button-connect-${employee.user.id}`}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}