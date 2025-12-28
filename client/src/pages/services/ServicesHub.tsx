import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  Globe,
  Package,
  Truck,
  Plane,
  Ship,
  Building,
  Users,
  Shield,
  ChevronRight,
  Star,
  ArrowRight,
  BarChart3,
  Clock,
  DollarSign,
  Target,
  Zap,
  Award,
  CheckCircle,
  Info,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { services } from "@/data/services";

// Service categories with enhanced metadata
const serviceCategories = {
  transportation: {
    title: "Transportation & Logistics",
    description: "End-to-end freight and cargo solutions",
    icon: <Truck className="h-5 w-5" />,
    color: "blue",
    services: ["trucking", "airfreight", "rail", "container", "special-transport", "chartering"],
  },
  warehousing: {
    title: "Storage & Fulfillment",
    description: "Modern warehousing and distribution",
    icon: <Building className="h-5 w-5" />,
    color: "purple",
    services: ["warehousing", "port-services", "distribution", "drop-shipping"],
  },
  customs: {
    title: "Compliance & Documentation",
    description: "Regulatory and customs expertise",
    icon: <Shield className="h-5 w-5" />,
    color: "green",
    services: ["customs", "documentation", "certificates", "export"],
  },
  digital: {
    title: "Digital Solutions",
    description: "Technology-driven logistics",
    icon: <Globe className="h-5 w-5" />,
    color: "indigo",
    services: ["online-shopping", "technology", "help-develop", "supply-chain"],
  },
  business: {
    title: "Business Services",
    description: "Strategic partnerships and growth",
    icon: <Users className="h-5 w-5" />,
    color: "orange",
    services: ["consultation", "project", "finance", "partnership", "investing"],
  },
};

// Popular services with metrics
const popularServices = [
  { id: "trucking", bookings: "2.3K/mo", rating: 4.8, growth: "+15%" },
  { id: "airfreight", bookings: "1.8K/mo", rating: 4.9, growth: "+22%" },
  { id: "warehousing", bookings: "1.5K/mo", rating: 4.7, growth: "+8%" },
  { id: "customs", bookings: "3.1K/mo", rating: 4.6, growth: "+18%" },
];

// Industry solutions
const industrySolutions = [
  {
    industry: "E-commerce",
    icon: "🛒",
    services: ["warehousing", "drop-shipping", "online-shopping", "distribution"],
    benefits: ["Same-day delivery", "Returns management", "Multi-channel fulfillment"],
  },
  {
    industry: "Manufacturing",
    icon: "🏭",
    services: ["supply-chain", "trucking", "rail", "warehousing"],
    benefits: ["JIT delivery", "Raw material sourcing", "Production planning"],
  },
  {
    industry: "Retail",
    icon: "🏬",
    services: ["distribution", "warehousing", "trucking", "online-shopping"],
    benefits: ["Store replenishment", "Seasonal inventory", "Omnichannel logistics"],
  },
  {
    industry: "Healthcare",
    icon: "🏥",
    services: ["special-transport", "airfreight", "warehousing", "distribution"],
    benefits: ["Temperature control", "Regulatory compliance", "Emergency delivery"],
  },
];

export default function ServicesHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [showComparison, setShowComparison] = useState(false);
  const [compareServices, setCompareServices] = useState<string[]>([]);

  // Filter and sort services
  const filteredServices = useMemo(() => {
    let filtered = services;

    // Category filter
    if (selectedCategory !== "all") {
      const categoryServices = serviceCategories[selectedCategory as keyof typeof serviceCategories]?.services || [];
      filtered = filtered.filter(s => categoryServices.includes(s.id));
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        s =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort
    switch (sortBy) {
      case "popularity":
        filtered = [...filtered].sort((a, b) => {
          const aPopular = popularServices.find(p => p.id === a.id);
          const bPopular = popularServices.find(p => p.id === b.id);
          if (aPopular && !bPopular) return -1;
          if (!aPopular && bPopular) return 1;
          return 0;
        });
        break;
      case "alphabetical":
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "newest":
        filtered = [...filtered].reverse();
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  const handleCompareToggle = (serviceId: string) => {
    setCompareServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, serviceId];
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-4">Global Logistics Solutions</h1>
            <p className="text-xl mb-8 text-blue-100">
              Comprehensive services tailored to your business needs
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Services", value: "40+", icon: <Package /> },
                { label: "Countries", value: "180+", icon: <Globe /> },
                { label: "Deliveries/Year", value: "2.5M+", icon: <Truck /> },
                { label: "Satisfaction", value: "98%", icon: <Star /> },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
                >
                  <div className="flex items-center justify-center mb-2 text-blue-200">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* AI Recommender CTA */}
            <Link href="/services/recommender">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Get AI-Powered Recommendations
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search services by name, category, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(serviceCategories).map(([key, cat]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      {cat.icon}
                      <span>{cat.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Most Popular</SelectItem>
                <SelectItem value="alphabetical">A to Z</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={compareServices.length > 0 ? "default" : "outline"}
              onClick={() => setShowComparison(!showComparison)}
              disabled={compareServices.length < 2}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Compare ({compareServices.length})
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="all">All Services</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="industries">Industries</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          {/* All Services Tab */}
          <TabsContent value="all" className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredServices.map((service, index) => {
                  const popular = popularServices.find(p => p.id === service.id);
                  const isComparing = compareServices.includes(service.id);

                  return (
                    <motion.div
                      key={service.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={cn(
                          "relative hover:shadow-lg transition-all duration-300 group cursor-pointer",
                          isComparing && "ring-2 ring-blue-500"
                        )}
                      >
                        {popular && (
                          <div className="absolute -top-2 -right-2 z-10">
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                              <TrendingUp className="mr-1 h-3 w-3" />
                              Popular
                            </Badge>
                          </div>
                        )}
                        
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                              {service.icon}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompareToggle(service.id);
                                }}
                              >
                                {isComparing ? (
                                  <CheckCircle className="h-4 w-4 text-blue-500" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <CardTitle className="mt-4">{service.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {service.description}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent>
                          {/* Quick Stats */}
                          {popular && (
                            <div className="flex items-center gap-4 mb-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-medium">{popular.rating}</span>
                              </div>
                              <div className="flex items-center gap-1 text-green-600">
                                <TrendingUp className="h-4 w-4" />
                                <span className="font-medium">{popular.growth}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>{popular.bookings}</span>
                              </div>
                            </div>
                          )}

                          {/* Features Preview */}
                          <div className="space-y-2 mb-4">
                            {service.features.slice(0, 3).map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {service.tags?.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Link href={`/services/${service.id}`} className="flex-1">
                              <Button variant="default" className="w-full group">
                                View Details
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </Link>
                            <Link href="/quote">
                              <Button variant="outline" size="icon">
                                <DollarSign className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Popular Services Tab */}
          <TabsContent value="popular" className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              {popularServices.map((popular) => {
                const service = services.find(s => s.id === popular.id);
                if (!service) return null;

                return (
                  <Card key={service.id} className="overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          {service.icon}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <span className="text-2xl font-bold">{popular.rating}</span>
                          </div>
                          <div className="text-sm opacity-90">Customer Rating</div>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                      <p className="opacity-90">{service.description}</p>
                    </div>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{popular.growth}</div>
                          <div className="text-sm text-gray-600">Growth</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{popular.bookings}</div>
                          <div className="text-sm text-gray-600">Bookings</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">24/7</div>
                          <div className="text-sm text-gray-600">Support</div>
                        </div>
                      </div>
                      <Link href={`/services/${service.id}`}>
                        <Button className="w-full" size="lg">
                          Explore {service.title}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Industries Tab */}
          <TabsContent value="industries" className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              {industrySolutions.map((industry, index) => (
                <motion.div
                  key={industry.industry}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{industry.icon}</div>
                          <div>
                            <CardTitle className="text-xl">{industry.industry}</CardTitle>
                            <CardDescription>Tailored logistics solutions</CardDescription>
                          </div>
                        </div>
                        <Award className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          Key Benefits
                        </h4>
                        <ul className="space-y-2">
                          {industry.benefits.map((benefit) => (
                            <li key={benefit} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          Recommended Services
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {industry.services.map((serviceId) => (
                            <Link key={serviceId} href={`/services/${serviceId}`}>
                              <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                                {services.find(s => s.id === serviceId)?.title || serviceId}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      </div>
                      <Link href={`/industries/${industry.industry.toLowerCase()}`}>
                        <Button className="w-full" variant="outline">
                          View {industry.industry} Solutions
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(serviceCategories).map(([key, category], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader>
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                        `bg-${category.color}-100 text-${category.color}-600`
                      )}>
                        {category.icon}
                      </div>
                      <CardTitle>{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {category.services.slice(0, 4).map((serviceId) => {
                          const service = services.find(s => s.id === serviceId);
                          return (
                            <Link key={serviceId} href={`/services/${serviceId}`}>
                              <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors">
                                <span className="text-sm font-medium">
                                  {service?.title || serviceId}
                                </span>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-4"
                        onClick={() => setSelectedCategory(key)}
                      >
                        View All {category.services.length} Services
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Service Comparison Modal */}
        {showComparison && compareServices.length >= 2 && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="max-w-6xl w-full max-h-[90vh] overflow-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Service Comparison</CardTitle>
                  <Button variant="ghost" onClick={() => setShowComparison(false)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-4">Feature</th>
                        {compareServices.map(id => {
                          const service = services.find(s => s.id === id);
                          return (
                            <th key={id} className="text-left p-4">
                              <div className="font-semibold">{service?.title}</div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-4 font-medium">Description</td>
                        {compareServices.map(id => {
                          const service = services.find(s => s.id === id);
                          return (
                            <td key={id} className="p-4 text-sm text-gray-600">
                              {service?.description}
                            </td>
                          );
                        })}
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="p-4 font-medium">Key Features</td>
                        {compareServices.map(id => {
                          const service = services.find(s => s.id === id);
                          return (
                            <td key={id} className="p-4">
                              <ul className="space-y-1">
                                {service?.features.slice(0, 5).map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="h-3 w-3 text-green-500 mt-1" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setCompareServices([])}>
                    Clear Comparison
                  </Button>
                  <Link href="/quote">
                    <Button>
                      Get Quote for Selected Services
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}