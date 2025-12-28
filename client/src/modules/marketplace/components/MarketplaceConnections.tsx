import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ShoppingBag, 
  Link2, 
  Globe, 
  Package, 
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Store
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MarketplaceConnections() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const marketplaces = [
    {
      id: 'amazon',
      name: 'Amazon Marketplace',
      description: 'Global e-commerce platform',
      status: 'connected',
      logo: '🛒',
      metrics: {
        orders: '12,456',
        revenue: '$1.2M',
        products: '8,200'
      }
    },
    {
      id: 'alibaba',
      name: 'Alibaba',
      description: 'B2B trading platform',
      status: 'connected',
      logo: '🏭',
      metrics: {
        orders: '3,892',
        revenue: '$4.5M',
        products: '2,100'
      }
    },
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'E-commerce platform',
      status: 'pending',
      logo: '🛍️',
      metrics: {
        orders: '-',
        revenue: '-',
        products: '-'
      }
    },
    {
      id: 'ebay',
      name: 'eBay',
      description: 'Online auction and marketplace',
      status: 'available',
      logo: '🏪',
      metrics: {
        orders: '-',
        revenue: '-',
        products: '-'
      }
    }
  ];

  const partners = [
    {
      name: 'DHL Express',
      type: 'Logistics Partner',
      status: 'active',
      integration: '100%'
    },
    {
      name: 'FedEx',
      type: 'Shipping Partner',
      status: 'active',
      integration: '95%'
    },
    {
      name: 'Stripe',
      type: 'Payment Gateway',
      status: 'active',
      integration: '100%'
    },
    {
      name: 'SAP',
      type: 'ERP System',
      status: 'configuring',
      integration: '60%'
    }
  ];

  const handleConnect = (marketplaceId: string) => {
    toast({
      title: "Connection Initiated",
      description: `Connecting to ${marketplaceId}...`,
    });
  };

  const filteredMarketplaces = marketplaces.filter(mp =>
    mp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ShoppingBag className="w-10 h-10 text-primary" />
            Marketplace Connections
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Connect and manage your marketplace integrations
          </p>
        </div>
        <Button>
          <Link2 className="w-4 h-4 mr-2" />
          Add Connection
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Label htmlFor="search">Search Marketplaces</Label>
        <Input
          id="search"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Marketplaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMarketplaces.map((marketplace) => (
          <Card key={marketplace.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{marketplace.logo}</span>
                  <div>
                    <CardTitle>{marketplace.name}</CardTitle>
                    <CardDescription>{marketplace.description}</CardDescription>
                  </div>
                </div>
                <Badge 
                  variant={
                    marketplace.status === 'connected' ? 'default' :
                    marketplace.status === 'pending' ? 'secondary' : 'outline'
                  }
                >
                  {marketplace.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {marketplace.status === 'connected' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Orders</p>
                      <p className="font-bold">{marketplace.metrics.orders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="font-bold">{marketplace.metrics.revenue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Products</p>
                      <p className="font-bold">{marketplace.metrics.products}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Manage Integration
                  </Button>
                </div>
              ) : marketplace.status === 'pending' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Configuration in progress...</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    Complete Setup
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full"
                  onClick={() => handleConnect(marketplace.id)}
                >
                  Connect Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Partner Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Partner Integrations</CardTitle>
          <CardDescription>Third-party services and platform connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {partners.map((partner, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Users className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium">{partner.name}</p>
                    <p className="text-sm text-gray-600">{partner.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Integration</p>
                    <p className="font-medium">{partner.integration}</p>
                  </div>
                  <Badge 
                    variant={partner.status === 'active' ? 'default' : 'secondary'}
                  >
                    {partner.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Connections</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Link2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold">16,348</p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold">$5.7M</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">99.2%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto flex-col py-4">
              <Store className="w-6 h-6 mb-2" />
              <span className="text-xs">Browse Marketplaces</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4">
              <Globe className="w-6 h-6 mb-2" />
              <span className="text-xs">API Settings</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4">
              <Package className="w-6 h-6 mb-2" />
              <span className="text-xs">Sync Products</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4">
              <TrendingUp className="w-6 h-6 mb-2" />
              <span className="text-xs">View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}