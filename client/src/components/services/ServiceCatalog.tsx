import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Grid, List, Filter } from 'lucide-react';
import { useState } from 'react';

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'active' | 'beta' | 'coming-soon' | 'deprecated';
  price: string;
  users: number;
}

interface ServiceCatalogProps {
  categories?: any[];
  services?: any[];
  onSelectService?: (service: any) => void;
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
}

export function ServiceCatalog({ 
  categories = [], 
  services: propServices = [], 
  onSelectService,
  selectedCategory,
  onSelectCategory 
}: ServiceCatalogProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const services: Service[] = [
    {
      id: '1',
      name: 'Air Freight',
      category: 'Transportation',
      description: 'Fast and reliable air cargo services worldwide',
      status: 'active',
      price: 'From $50/kg',
      users: 1250
    },
    {
      id: '2',
      name: 'Maritime Shipping',
      category: 'Transportation',
      description: 'Cost-effective ocean freight for large volumes',
      status: 'active',
      price: 'From $500/TEU',
      users: 890
    },
    {
      id: '3',
      name: 'Warehousing',
      category: 'Storage',
      description: 'Secure storage facilities with inventory management',
      status: 'active',
      price: 'From $5/sqft',
      users: 450
    },
    {
      id: '4',
      name: 'Customs Clearance',
      category: 'Documentation',
      description: 'Expert customs documentation and clearance services',
      status: 'active',
      price: 'From $150/shipment',
      users: 670
    },
    {
      id: '5',
      name: 'Supply Chain Analytics',
      category: 'Technology',
      description: 'AI-powered supply chain optimization and insights',
      status: 'beta',
      price: 'From $999/month',
      users: 120
    },
    {
      id: '6',
      name: 'Last Mile Delivery',
      category: 'Transportation',
      description: 'Efficient final delivery to end customers',
      status: 'active',
      price: 'From $8/package',
      users: 2100
    }
  ];

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: Service['status']) => {
    switch(status) {
      case 'active':
        return 'bg-green-500';
      case 'beta':
        return 'bg-blue-500';
      case 'coming-soon':
        return 'bg-yellow-500';
      case 'deprecated':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with search and view controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Services Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{service.category}</p>
                  </div>
                  <Badge className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {service.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium">{service.price}</span>
                  <span className="text-sm text-muted-foreground">
                    {service.users} users
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">View Details</Button>
                  <Button size="sm" variant="outline" className="flex-1">Configure</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium">{service.name}</h3>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {service.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 ml-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{service.price}</div>
                      <div className="text-xs text-muted-foreground">
                        {service.users} users
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">View</Button>
                      <Button size="sm" variant="outline">Configure</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredServices.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No services found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}