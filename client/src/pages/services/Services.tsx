import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import {
  Search, Filter, Globe, Shield, Clock, Users, TrendingUp, Award,
  Package, Truck, Plane, Ship, Train, Warehouse, FileCheck, Calculator,
  ChevronRight, Sparkles, BarChart3, Star, ArrowRight, Zap, Target,
  Briefcase, BrainCircuit, Network, Mail, PackageSearch, Code2, RefreshCw,
  GalleryHorizontalEnd, Store, Anchor, Box, Boxes, Map as MapIcon, Workflow, Container
} from "lucide-react";
import { ServiceComparison } from "@/components/services/ServiceComparison";
import { ServicePricingCalculator } from "@/components/services/ServicePricingCalculator";
import { useServicesCatalogWithMeta, type ServicePlatform } from "@/hooks/useServicesApi";
import { iconMap } from "@/config/servicesConfig";

interface Service {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  features?: string[];
  icon?: string;
  active?: boolean;
  pricing?: any;
  metadata?: any;
  title?: string;
}

const getIconFromName = (iconName: string | null | undefined): React.ReactNode => {
  if (!iconName) return <Package className="w-6 h-6" />;
  const Icon = iconMap[iconName];
  return Icon ? <Icon className="w-6 h-6" /> : <Package className="w-6 h-6" />;
};

// Icon mapping for CMS services based on slug
const serviceIconMap: Record<string, React.ReactNode> = {
  'trucking': <Truck className="w-6 h-6" />,
  'airfreight': <Plane className="w-6 h-6" />,
  'air-freight': <Plane className="w-6 h-6" />,
  'rail': <Train className="w-6 h-6" />,
  'container': <Container className="w-6 h-6" />,
  'ocean-freight': <Ship className="w-6 h-6" />,
  'sea-freight': <Ship className="w-6 h-6" />,
  'warehousing': <Warehouse className="w-6 h-6" />,
  'customs': <FileCheck className="w-6 h-6" />,
  'customs-clearance': <FileCheck className="w-6 h-6" />,
  'special-transport': <PackageSearch className="w-6 h-6" />,
  'project': <Briefcase className="w-6 h-6" />,
  'supply-chain': <RefreshCw className="w-6 h-6" />,
  'cross-staffing': <Users className="w-6 h-6" />,
  'agency': <Briefcase className="w-6 h-6" />,
  'bulk': <Package className="w-6 h-6" />,
  'groupage': <Boxes className="w-6 h-6" />,
  'consultation': <BrainCircuit className="w-6 h-6" />,
  'tranship': <Ship className="w-6 h-6" />,
  'post': <Mail className="w-6 h-6" />,
  'third-party': <Network className="w-6 h-6" />,
  'finance': <Calculator className="w-6 h-6" />,
  'auction': <GalleryHorizontalEnd className="w-6 h-6" />,
  'online-shopping': <Store className="w-6 h-6" />,
  'port-services': <Anchor className="w-6 h-6" />,
  'chartering': <Ship className="w-6 h-6" />,
  'drop-shipping': <Box className="w-6 h-6" />,
  'transit': <Workflow className="w-6 h-6" />,
  'help-develop': <Code2 className="w-6 h-6" />,
  'distribution': <MapIcon className="w-6 h-6" />,
  'technology': <Network className="w-6 h-6" />,
  'business': <Briefcase className="w-6 h-6" />,
  'certificates': <FileCheck className="w-6 h-6" />,
  'companies': <TrendingUp className="w-6 h-6" />,
  'cooperation': <Users className="w-6 h-6" />,
  'documentation': <FileCheck className="w-6 h-6" />,
  'ecosystem': <Globe className="w-6 h-6" />,
  'education': <BrainCircuit className="w-6 h-6" />,
  'events': <Globe className="w-6 h-6" />,
  'export': <Package className="w-6 h-6" />,
  'growth': <TrendingUp className="w-6 h-6" />,
  'investing': <Calculator className="w-6 h-6" />,
  'knowledge': <BrainCircuit className="w-6 h-6" />,
  'modernization': <Zap className="w-6 h-6" />,
  'network': <Network className="w-6 h-6" />,
  'organizations': <Users className="w-6 h-6" />,
  'partnership': <Users className="w-6 h-6" />,
  'shopping': <Store className="w-6 h-6" />,
  'trading': <TrendingUp className="w-6 h-6" />,
  'logistics-market': <Globe className="w-6 h-6" />,
};

// Helper to get icon for a service
const getServiceIcon = (slug: string): React.ReactNode => {
  return serviceIconMap[slug] || <Package className="w-6 h-6" />;
};

// Transform CMS service to the local Service interface
const transformCMSService = (cmsService: CMSService): Service => ({
  id: cmsService.slug,
  name: cmsService.name,
  code: cmsService.slug.toUpperCase(),
  description: cmsService.short_description || `Professional ${cmsService.name} logistics service`,
  category: cmsService.category || 'general',
  title: cmsService.name,
  active: true,
});

// CMS slug to local config slug mapping (comprehensive mapping for all CMS variants)
const cmsSlugAliases: Record<string, string> = {
  'air-freight': 'airfreight',
  'ocean-freight': 'container',
  'customs-clearance': 'customs',
  'sea-freight': 'container',
  'road-freight': 'trucking',
  'land-transport': 'trucking',
  'distribution-services': 'distribution',
  'logistics-solutions': 'supply-chain',
  'warehouse-services': 'warehousing',
  'finance-services': 'finance',
  'documentation-services': 'documentation',
  'consultation-services': 'consultation',
  'technology-services': 'technology',
  'e-commerce': 'online-shopping',
  '3pl-services': 'third-party',
  'project-cargo': 'project',
  'special-cargo': 'special-transport',
  'bulk-cargo': 'bulk',
  'groupage-services': 'groupage',
  'port-operations': 'port-services',
  'transit-services': 'transit',
  'agency-services': 'agency',
  'chartering-services': 'chartering',
  'auction-services': 'auction',
  'staffing-services': 'cross-staffing',
};

// Category derivation for services that lack category data
const deriveCategory = (serviceId: string): string => {
  const categoryMap: Record<string, string> = {
    'airfreight': 'transport', 'trucking': 'transport', 'rail': 'transport',
    'container': 'transport', 'special-transport': 'transport',
    'warehousing': 'warehouse', 'distribution': 'warehouse',
    'customs': 'customs', 'documentation': 'customs', 'certificates': 'customs',
    'finance': 'financial', 'investing': 'financial', 'auction': 'financial',
    'supply-chain': 'general', 'consultation': 'general', 'business': 'general',
    'technology': 'general', 'third-party': 'general', 'groupage': 'general',
    'port-services': 'general', 'tranship': 'general', 'project': 'general',
    'bulk': 'general', 'drop-shipping': 'general', 'online-shopping': 'general',
    'agency': 'general', 'post': 'general', 'transit': 'general',
    'chartering': 'general', 'cross-staffing': 'general', 'education': 'general',
    'events': 'general', 'export': 'general', 'growth': 'general',
    'help-develop': 'general', 'knowledge': 'general', 'logistics-market': 'general',
    'modernization': 'general', 'network': 'general', 'organizations': 'general',
    'partnership': 'general', 'shopping': 'general', 'trading': 'general',
    'companies': 'general', 'cooperation': 'general', 'ecosystem': 'general',
  };
  return categoryMap[serviceId] || 'general';
};

// Helper function to convert service title to URL slug
const getServiceSlug = (service: Service): string => {
  // First, check if the CMS slug has an alias mapping
  if (service.id && cmsSlugAliases[service.id]) {
    return cmsSlugAliases[service.id];
  }
  
  // Check if the service ID is already a valid slug (matches servicesConfig format)
  const validSlugs = [
    'airfreight', 'trucking', 'rail', 'container', 'warehousing', 'customs',
    'special-transport', 'project', 'supply-chain', 'cross-staffing', 'agency',
    'bulk', 'groupage', 'consultation', 'tranship', 'post', 'third-party',
    'finance', 'auction', 'online-shopping', 'port-services', 'chartering',
    'drop-shipping', 'transit', 'help-develop', 'distribution', 'technology',
    'business', 'certificates', 'companies', 'cooperation', 'documentation',
    'ecosystem', 'education', 'events', 'export', 'growth', 'investing',
    'knowledge', 'modernization', 'network', 'organizations', 'partnership',
    'shopping', 'trading', 'logistics-market'
  ];
  
  // If service.id already matches a valid slug, use it directly
  if (service.id && validSlugs.includes(service.id)) {
    return service.id;
  }
  
  const title = service.title || service.name || service.code || '';
  const slugMap: Record<string, string> = {
    // Standard titles
    'Container Services': 'container',
    'Trucking': 'trucking',
    'Air Freight': 'airfreight',
    'Rail Transport': 'rail',
    'Warehousing': 'warehousing',
    'Bulk Cargo': 'bulk',
    'Special Transport': 'special-transport',
    'Customs Clearance': 'customs',
    'Drop Shipping': 'drop-shipping',
    'Port Services': 'port-services',
    'Supply Chain Management': 'supply-chain',
    'Groupage': 'groupage',
    'Financial Services': 'finance',
    'Documentation': 'documentation',
    'Consultation': 'consultation',
    'E-commerce Integration': 'online-shopping',
    'Transit Services': 'transit',
    'Cross Staffing': 'cross-staffing',
    'Agency Services': 'agency',
    'Transhipment': 'tranship',
    'Post Services': 'post',
    'Third Party Logistics': 'third-party',
    'Auction Services': 'auction',
    'Technology Solutions': 'technology',
    'Business Services': 'business',
    'Certificates': 'certificates',
    'Chartering': 'chartering',
    'Companies': 'companies',
    'Cooperation': 'cooperation',
    'Distribution': 'distribution',
    'Ecosystem': 'ecosystem',
    'Education': 'education',
    'Events': 'events',
    'Export Services': 'export',
    'Growth Solutions': 'growth',
    'Investing': 'investing',
    'Knowledge Hub': 'knowledge',
    'Modernization': 'modernization',
    'Network': 'network',
    'Organizations': 'organizations',
    'Partnership': 'partnership',
    'Shopping': 'shopping',
    'Trading': 'trading',
    'Logistics Market': 'logistics-market',
    'Project Services': 'project',
    'Help & Development': 'help-develop',
    // Additional title variations with "Services" suffix
    'Trucking Services': 'trucking',
    'Air Freight Services': 'airfreight',
    'Rail Services': 'rail',
    'Warehousing Services': 'warehousing',
    'Bulk Services': 'bulk',
    'Customs Services': 'customs',
    'Supply Chain Services': 'supply-chain',
    'Groupage Services': 'groupage',
    'Finance Services': 'finance',
    'Transhipment Services': 'tranship',
    'Chartering Services': 'chartering',
    'Distribution Services': 'distribution',
    'Technology Services': 'technology',
    'Container Shipping': 'container',
    'Ocean Freight': 'container',
    'Sea Freight': 'container',
    'Road Freight': 'trucking',
    'Land Transport': 'trucking',
    'Air Cargo': 'airfreight',
    // Consultation variations
    'Logistics Consultation': 'consultation',
    'Consulting Services': 'consultation',
    // Project variations
    'Project Logistics': 'project',
    'Project Cargo': 'project',
    // Special transport variations
    'Special Cargo': 'special-transport',
    'Specialized Transport': 'special-transport',
    // Cross staffing variations
    'Cross-Staffing Services': 'cross-staffing',
    'Staffing Services': 'cross-staffing',
    // Online shopping variations
    'E-commerce': 'online-shopping',
    'Online Shopping Integration': 'online-shopping',
    // Third party variations
    'Third Party Services': 'third-party',
    '3PL Services': 'third-party',
    // Help develop variations
    'Help to Develop': 'help-develop',
    'Developer Services': 'help-develop',
  };
  
  return slugMap[title] || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

const categoryIcons: Record<string, React.ReactNode> = {
  'transport': <Truck className="w-5 h-5" />,
  'air': <Plane className="w-5 h-5" />,
  'maritime': <Ship className="w-5 h-5" />,
  'rail': <Train className="w-5 h-5" />,
  'warehouse': <Warehouse className="w-5 h-5" />,
  'customs': <FileCheck className="w-5 h-5" />,
  'financial': <Calculator className="w-5 h-5" />,
  'general': <Package className="w-5 h-5" />
};

const Services = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showComparison, setShowComparison] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  // Fetch services from the new Platform v1 API
  const { 
    data: catalogResponse, 
    isLoading: isAPILoading, 
    isError: isAPIError 
  } = useServicesCatalogWithMeta();

  // Determine loading state
  const isLoading = isAPILoading;

  // Transform ServicePlatform data to the local Service interface
  const services = useMemo((): Service[] => {
    if (!catalogResponse?.data) {
      return [];
    }
    
    return catalogResponse.data.map((service: ServicePlatform) => ({
      id: service.id,
      name: service.title,
      code: service.id.toUpperCase(),
      description: service.description,
      category: service.category || 'general',
      features: service.features || [],
      icon: service.icon || undefined,
      active: service.isActive,
      pricing: service.pricing,
      title: service.title,
    }));
  }, [catalogResponse]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add("all");
    services.forEach(service => {
      if (service.category) {
        cats.add(service.category.toLowerCase());
      }
    });
    return Array.from(cats);
  }, [services]);

  // Filter services
  const filteredServices = useMemo(() => {
    let filtered = services;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(service => 
        service.category?.toLowerCase() === selectedCategory
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(service =>
        service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.code?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [services, selectedCategory, searchQuery]);

  // Service stats
  const stats = [
    { label: "Countries", value: "180+", icon: <Globe className="w-5 h-5" /> },
    { label: "Services", value: "46+", icon: <Package className="w-5 h-5" /> },
    { label: "Years Experience", value: "25+", icon: <Award className="w-5 h-5" /> },
    { label: "Active Users", value: "10K+", icon: <Users className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section with MoloChain World Map Background */}
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        {/* MoloChain World Map Background Image */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url('attached_assets/1_1756580279313.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/80 to-indigo-900/80" />
        
        {/* Animated effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-10 animate-pulse" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-full">
                <Globe className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              MoloChain Global Services
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Comprehensive logistics solutions powered by innovation. From air freight to warehousing, 
              we deliver excellence across 180+ countries.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-6 text-lg bg-white/95 backdrop-blur-sm text-gray-900 rounded-full border-0 shadow-xl"
                  data-testid="input-search-services"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => setShowComparison(true)}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20"
                data-testid="button-compare-services"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Compare Services
              </Button>
              <Button 
                onClick={() => setShowCalculator(true)}
                className="bg-white text-blue-900 hover:bg-blue-50"
                data-testid="button-pricing-calculator"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Pricing Calculator
              </Button>
              <Link href="/services/recommender">
                <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 border-0">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Recommendations
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold">Filter by Category</h2>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]" data-testid="select-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category} data-testid={`option-category-${category}`}>
                    <div className="flex items-center gap-2 capitalize">
                      {categoryIcons[category] || <Package className="w-4 h-4" />}
                      {category === "all" ? "All Services" : category}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary">
              {filteredServices.length} services
            </Badge>
          </div>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isAPIError ? (
          <div className="text-center py-16">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Package className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Unable to Load Services</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">We're having trouble loading our services. Please try again later.</p>
            <Button onClick={() => window.location.reload()} variant="outline" data-testid="button-retry-services">
              Try Again
            </Button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Services Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search or filter to find what you're looking for.</p>
            <Button onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }} variant="outline" data-testid="button-clear-filters">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service) => {
              const serviceSlug = getServiceSlug(service);
              return (
                <Link key={service.id} href={`/services/${serviceSlug}`}>
                  <Card 
                    className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden h-full"
                    data-testid={`card-service-${service.id}`}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full" />
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg">
                          {service.icon ? getIconFromName(service.icon) : (getServiceIcon(service.id) || categoryIcons[service.category?.toLowerCase()] || <Package className="w-6 h-6" />)}
                        </div>
                        {service.active !== false && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Active
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {service.title || service.name || service.code}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-gray-600 dark:text-gray-300">
                        {service.description || "Professional logistics service"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {service.features && service.features.length > 0 ? (
                          service.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                              <ChevronRight className="w-3 h-3 text-blue-500 mr-2 flex-shrink-0" />
                              <span className="line-clamp-1">{feature}</span>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                              <Shield className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                              Secure & Reliable
                            </div>
                            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                              <Clock className="w-3 h-3 text-blue-500 mr-2 flex-shrink-0" />
                              24/7 Support
                            </div>
                            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                              <Globe className="w-3 h-3 text-purple-500 mr-2 flex-shrink-0" />
                              Global Coverage
                            </div>
                          </>
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">4.8</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">(245)</span>
                        </div>
                        <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                          View Details
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 py-12 border-t">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose MoloChain?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Industry-leading logistics solutions with cutting-edge technology and global reach
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast & Efficient</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Optimized routes and real-time tracking for fastest delivery times
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced security protocols and insurance coverage for all shipments
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Custom Solutions</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tailored logistics strategies to meet your specific business needs
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Logistics?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of businesses worldwide who trust MoloChain for their logistics needs
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Service Comparison Modal */}
      {showComparison && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Compare Services</h2>
              <Button 
                variant="ghost" 
                onClick={() => setShowComparison(false)}
                data-testid="button-close-comparison"
              >
                ✕
              </Button>
            </div>
            <ServiceComparison services={services.slice(0, 4)} />
          </div>
        </div>
      )}

      {/* Pricing Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Pricing Calculator</h2>
              <Button 
                variant="ghost" 
                onClick={() => setShowCalculator(false)}
                data-testid="button-close-calculator"
              >
                ✕
              </Button>
            </div>
            <ServicePricingCalculator 
              serviceId="general" 
              serviceName="General Service" 
              category="general"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;