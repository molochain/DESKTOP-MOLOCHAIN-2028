import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Users, Globe, Award, MapPin, Calendar } from 'lucide-react';

export function CompanyCard({ company }: { company: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          {company?.name || 'Company'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{company?.employees || '0'} employees</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{company?.location || 'Global'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{company?.industry || 'Logistics'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CompanyProfile({ company }: { company: any }) {
  return <CompanyCard company={company} />;
}

export function CompanyListing({ companies = [] }: { companies?: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map((company, index) => (
        <CompanyCard key={company?.id || index} company={company} />
      ))}
    </div>
  );
}

export function CompanyHeader({ company }: { company?: any }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg">
      <h1 className="text-3xl font-bold mb-2">{company?.name || 'Company Name'}</h1>
      <p className="text-blue-100">{company?.tagline || 'Building the future of logistics'}</p>
      <div className="flex gap-4 mt-4">
        <Badge className="bg-white/20 text-white">
          <MapPin className="h-3 w-3 mr-1" />
          {company?.location || 'Global'}
        </Badge>
        <Badge className="bg-white/20 text-white">
          <Calendar className="h-3 w-3 mr-1" />
          Est. {company?.founded || '2020'}
        </Badge>
      </div>
    </div>
  );
}

export function CompanyAbout({ company }: { company?: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About {company?.name || 'Us'}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          {company?.description || 'Leading provider of innovative logistics and supply chain solutions worldwide.'}
        </p>
      </CardContent>
    </Card>
  );
}

export function CompanyMetrics({ company }: { company?: any }) {
  const metrics = [
    { label: 'Employees', value: company?.employees || '1000+' },
    { label: 'Countries', value: company?.countries || '50+' },
    { label: 'Clients', value: company?.clients || '500+' },
    { label: 'Projects', value: company?.projects || '2000+' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold">{metric.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CompanyJobs({ company }: { company?: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          {company?.openPositions || '0'} open positions available
        </p>
      </CardContent>
    </Card>
  );
}

export function CompanyContact({ company }: { company?: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">Email: {company?.email || 'contact@company.com'}</p>
          <p className="text-sm">Phone: {company?.phone || '+1 234 567 8900'}</p>
          <p className="text-sm">Website: {company?.website || 'www.company.com'}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function CompanyPosts({ company }: { company?: any }) {
  const posts = [
    { id: 1, title: 'New Partnership Announcement', date: '2024-01-15' },
    { id: 2, title: 'Quarterly Update', date: '2024-01-10' },
    { id: 3, title: 'Industry Insights', date: '2024-01-05' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="border-b pb-2 last:border-0">
              <p className="font-medium text-sm">{post.title}</p>
              <p className="text-xs text-muted-foreground">{post.date}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CompanyEmployees({ company }: { company?: any }) {
  const employees = company?.employees || [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        {employees.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {employees.map((employee: any, index: number) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">{employee.name}</p>
                <p className="text-xs text-muted-foreground">{employee.role}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center">No team members to display</p>
        )}
      </CardContent>
    </Card>
  );
}

export function CompanyProfileEditor({ company, onSave }: { company?: any; onSave?: (data: any) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Company Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Profile editor functionality coming soon</p>
      </CardContent>
    </Card>
  );
}