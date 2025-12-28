import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Building2, 
  Users, 
  MessageSquare, 
  Bell,
  Network,
  Search,
  Briefcase,
  ShoppingBag,
  Globe,
  TrendingUp,
  Truck,
  Ship,
  Plane
} from 'lucide-react';
import { Link, useLocation } from 'wouter';

const MOLOLINKMain = () => {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  const modules = [
    {
      id: 'companies',
      title: 'Companies',
      description: 'Explore and connect with logistics companies worldwide',
      icon: Building2,
      path: '/mololink/companies',
      color: 'bg-blue-500',
      stats: { companies: '5,000+', employees: '50,000+' }
    },
    {
      id: 'network',
      title: 'Professional Network',
      description: 'Build your professional network in the cargo industry',
      icon: Network,
      path: '/mololink/network',
      color: 'bg-green-500',
      stats: { connections: '100K+', messages: '1M+' }
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      description: 'Buy, sell, and trade logistics services and equipment',
      icon: ShoppingBag,
      path: '/mololink/marketplace',
      color: 'bg-purple-500',
      stats: { listings: '10K+', transactions: '50K+' }
    },
    {
      id: 'jobs',
      title: 'Job Board',
      description: 'Find your next opportunity in logistics and cargo',
      icon: Briefcase,
      path: '/mololink/jobs',
      color: 'bg-orange-500',
      stats: { jobs: '2,500+', companies: '500+' }
    },
    {
      id: 'explorer',
      title: 'Route Explorer',
      description: 'Explore global shipping routes and connections',
      icon: Globe,
      path: '/mololink/explorer',
      color: 'bg-indigo-500',
      stats: { routes: '1,000+', ports: '500+' }
    },
    {
      id: 'messaging',
      title: 'Messaging',
      description: 'Real-time communication with industry professionals',
      icon: MessageSquare,
      path: '/mololink/messaging',
      color: 'bg-pink-500',
      stats: { active: '24/7', users: '10K+' }
    }
  ];

  const transportModes = [
    { name: 'Sea Freight', icon: Ship, count: '2,500+' },
    { name: 'Air Cargo', icon: Plane, count: '1,200+' },
    { name: 'Road Transport', icon: Truck, count: '3,800+' },
    { name: 'Multimodal', icon: Package, count: '950+' }
  ];

  const featuredCompanies = [
    { name: 'Global Logistics Co.', industry: 'Shipping', size: '10,000+' },
    { name: 'CargoTech Solutions', industry: 'Technology', size: '500-1000' },
    { name: 'Express Freight Ltd.', industry: 'Air Cargo', size: '1000-5000' },
    { name: 'Maritime Partners', industry: 'Sea Freight', size: '5000+' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Package className="h-10 w-10 text-blue-600" />
                MOLOLINK
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">
                Professional Network for the Global Cargo & Logistics Industry
              </p>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={() => setLocation('/login')}
                variant="outline"
                className="flex items-center gap-2"
                data-testid="button-cargo-login"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => setLocation('/register')}
                className="flex items-center gap-2"
                data-testid="button-cargo-register"
              >
                Join Network
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-blue-600 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-sm opacity-90">Professionals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">5K+</div>
              <div className="text-sm opacity-90">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">100+</div>
              <div className="text-sm opacity-90">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">10M+</div>
              <div className="text-sm opacity-90">Connections</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="transport">Transport</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome to MOLOLINK</CardTitle>
                    <CardDescription>
                      The premier professional network for cargo and logistics professionals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Network className="h-5 w-5 text-blue-600 mt-1" />
                        <div>
                          <h3 className="font-semibold">Build Your Network</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Connect with professionals, companies, and partners in the global logistics industry
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-green-600 mt-1" />
                        <div>
                          <h3 className="font-semibold">Grow Your Business</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Find new opportunities, partners, and clients through our marketplace and job board
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Globe className="h-5 w-5 text-purple-600 mt-1" />
                        <div>
                          <h3 className="font-semibold">Global Reach</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Access a worldwide network of cargo professionals and logistics companies
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => setLocation('/mololink/companies')}
                        data-testid="button-browse-companies"
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        Browse Companies
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => setLocation('/mololink/jobs')}
                        data-testid="button-find-jobs"
                      >
                        <Briefcase className="h-4 w-4 mr-2" />
                        Find Jobs
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => setLocation('/mololink/marketplace')}
                        data-testid="button-marketplace"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Marketplace
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => setLocation('/mololink/network')}
                        data-testid="button-network"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        My Network
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Industry News</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="border-l-2 border-blue-500 pl-3">
                        <h4 className="font-semibold text-sm">Global Shipping Rates Update</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">2 hours ago</p>
                      </div>
                      <div className="border-l-2 border-green-500 pl-3">
                        <h4 className="font-semibold text-sm">New Trade Routes Open</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">5 hours ago</p>
                      </div>
                      <div className="border-l-2 border-purple-500 pl-3">
                        <h4 className="font-semibold text-sm">Tech Innovation in Logistics</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">1 day ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trending Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">#sustainability</Badge>
                      <Badge variant="secondary">#digitalization</Badge>
                      <Badge variant="secondary">#supplychain</Badge>
                      <Badge variant="secondary">#lastmile</Badge>
                      <Badge variant="secondary">#technology</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="modules" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <Card 
                    key={module.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setLocation(module.path)}
                  >
                    <CardHeader>
                      <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center mb-3`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm">
                        {Object.entries(module.stats).map(([key, value]) => (
                          <div key={key}>
                            <div className="font-semibold">{value}</div>
                            <div className="text-slate-600 dark:text-slate-400 capitalize">{key}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="companies" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Featured Companies</CardTitle>
                <CardDescription>Leading companies in the cargo and logistics industry</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {featuredCompanies.map((company, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{company.name}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{company.industry}</p>
                        </div>
                        <Badge variant="outline">{company.size} employees</Badge>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" data-testid={`button-view-company-${index}`}>View Profile</Button>
                        <Button size="sm" variant="outline" data-testid={`button-follow-company-${index}`}>Follow</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transport" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Transport Modes</CardTitle>
                <CardDescription>Explore different transportation options and providers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {transportModes.map((mode, index) => {
                    const Icon = mode.icon;
                    return (
                      <div key={index} className="text-center p-6 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Icon className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                        <h3 className="font-semibold">{mode.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{mode.count} providers</p>
                        <Button size="sm" variant="outline" className="mt-3" data-testid={`button-explore-${mode.name.toLowerCase().replace(' ', '-')}`}>
                          Explore
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MOLOLINKMain;