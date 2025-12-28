import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Globe2, 
  Package, 
  TrendingUp, 
  Shield, 
  Users, 
  Zap,
  Target,
  Award,
  BarChart3,
  Network,
  Building2,
  Truck,
  Ship,
  Plane,
  ShoppingCart,
  BrainCircuit,
  Workflow,
  BookOpen,
  Eye,
  ArrowRight,
  CheckCircle,
  Star,
  Trophy,
  Map,
  Server,
  Database,
  Code2,
  Cloud,
  Lock,
  Sparkles,
  TrendingDown,
  Clock,
  Factory,
  Store,
  Briefcase,
  Layers,
  Settings,
  HelpCircle,
  DollarSign,
  HandshakeIcon,
  Cpu,
  Activity,
  Calendar,
  MessageSquare,
  Rocket,
  FileText,
  Gauge
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface PagePreview {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
  features: string[];
  link: string;
  category: 'Core' | 'Transport' | 'Business' | 'Integration' | 'Admin';
}

const About = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const pagesPreviews: PagePreview[] = [
    {
      id: 'home',
      title: 'Home Dashboard',
      description: 'Central hub for all logistics operations with real-time metrics and quick access to all modules',
      icon: <Globe2 className="w-6 h-6" />,
      features: ['Real-time tracking', 'Service overview', 'Latest projects', 'Quick stats'],
      link: '/',
      category: 'Core'
    },
    {
      id: 'transport',
      title: 'Transport Management',
      description: 'Comprehensive transport management across air, maritime, and land logistics',
      icon: <Truck className="w-6 h-6" />,
      features: ['Multi-modal transport', 'Route optimization', 'Fleet management', 'Live tracking'],
      link: '/modules/transport',
      category: 'Transport'
    },
    {
      id: 'maritime',
      title: 'Maritime Operations',
      description: 'Complete maritime shipping management with vessel tracking and port operations',
      icon: <Ship className="w-6 h-6" />,
      features: ['Vessel tracking', 'Container management', 'Port operations', 'Shipping documents'],
      link: '/modules/transport/maritime',
      category: 'Transport'
    },
    {
      id: 'air',
      title: 'Air Freight Services',
      description: 'Fast and reliable air cargo management with real-time flight tracking',
      icon: <Plane className="w-6 h-6" />,
      features: ['Flight tracking', 'Cargo handling', 'Airport operations', 'Express delivery'],
      link: '/modules/transport/air',
      category: 'Transport'
    },
    {
      id: 'mololink',
      title: 'MOLOLINK Marketplace',
      description: 'B2B marketplace connecting businesses with logistics providers and partners',
      icon: <ShoppingCart className="w-6 h-6" />,
      features: ['Partner network', 'Service marketplace', 'Auction system', 'Company directory'],
      link: '/mololink',
      category: 'Business'
    },
    {
      id: 'rayanavabrain',
      title: 'Rayanavabrain AI Hub',
      description: 'AI-powered analytics and optimization for intelligent logistics management',
      icon: <BrainCircuit className="w-6 h-6" />,
      features: ['Predictive analytics', 'Route optimization', 'Demand forecasting', 'Pattern recognition'],
      link: '/rayanavabrain',
      category: 'Integration'
    },
    {
      id: 'commodities',
      title: 'Commodity Management',
      description: 'Complete commodity trading and inventory management platform',
      icon: <Package className="w-6 h-6" />,
      features: ['Inventory tracking', 'Price monitoring', 'Trading platform', 'Supply chain visibility'],
      link: '/commodities',
      category: 'Business'
    },
    {
      id: 'projects',
      title: 'Project Management',
      description: 'Comprehensive project planning and execution for logistics operations',
      icon: <Workflow className="w-6 h-6" />,
      features: ['Task management', 'Resource allocation', 'Timeline tracking', 'Team collaboration'],
      link: '/projects',
      category: 'Core'
    },
    {
      id: 'admin',
      title: 'Admin Control Center',
      description: 'Complete administrative control over platform operations and settings',
      icon: <Shield className="w-6 h-6" />,
      features: ['User management', 'System settings', 'Security controls', 'Audit logs'],
      link: '/admin',
      category: 'Admin'
    },
    {
      id: 'departments',
      title: 'Department Dashboards',
      description: 'Specialized dashboards for different operational departments',
      icon: <Building2 className="w-6 h-6" />,
      features: ['HR management', 'Finance tracking', 'Operations monitoring', 'Marketing analytics'],
      link: '/departments',
      category: 'Admin'
    },
    {
      id: 'ecosystem',
      title: 'Ecosystem Control',
      description: 'Manage integrations, partnerships, and external connections',
      icon: <Network className="w-6 h-6" />,
      features: ['API management', 'Partner integration', 'Data synchronization', 'External services'],
      link: '/ecosystem',
      category: 'Integration'
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'Advanced analytics and reporting for data-driven decision making',
      icon: <BarChart3 className="w-6 h-6" />,
      features: ['Custom reports', 'Data visualization', 'KPI tracking', 'Business intelligence'],
      link: '/analytics',
      category: 'Core'
    }
  ];

  const filteredPages = selectedCategory === 'all' 
    ? pagesPreviews 
    : pagesPreviews.filter(page => page.category === selectedCategory);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % filteredPages.length);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + filteredPages.length) % filteredPages.length);
  };

  const visionPoints = [
    {
      icon: <Globe2 className="w-5 h-5" />,
      title: "Global Reach",
      description: "Connect with partners and manage operations across 150+ countries"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Real-time Operations",
      description: "Live tracking and instant updates across all logistics channels"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Enterprise Security",
      description: "Bank-grade security with 2FA, encryption, and compliance"
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Business Growth",
      description: "Scale operations efficiently with AI-powered optimization"
    }
  ];

  const benefits = [
    "Reduce operational costs by up to 40%",
    "Improve delivery times with route optimization",
    "Automate 85% of routine logistics tasks",
    "Real-time visibility across supply chain",
    "Seamless integration with existing systems",
    "24/7 monitoring and support"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Badge className="mb-4" variant="secondary">
                Enterprise Logistics Ecosystem
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            >
              Welcome to MoloChain
            </motion.h1>
            
            <motion.p 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-muted-foreground mb-8"
            >
              The complete global logistics and commodity management platform that transforms 
              how businesses manage their supply chain operations
            </motion.p>

            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4 justify-center"
            >
              <Button size="lg" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/services">
                  <Package className="w-4 h-4 mr-2" />
                  Explore Platform
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* What MoloChain Does Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">What MoloChain Does</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              A comprehensive suite of logistics solutions designed to streamline your entire supply chain
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              icon: <Truck className="w-6 h-6" />,
              title: "Multi-Modal Transport",
              description: "Seamlessly manage air, sea, land, and rail transportation in one unified platform"
            },
            {
              icon: <Package className="w-6 h-6" />,
              title: "Commodity Trading",
              description: "Complete commodity management with real-time pricing and inventory tracking"
            },
            {
              icon: <ShoppingCart className="w-6 h-6" />,
              title: "B2B Marketplace",
              description: "Connect with verified partners and expand your business network globally"
            },
            {
              icon: <BrainCircuit className="w-6 h-6" />,
              title: "AI-Powered Intelligence",
              description: "Leverage machine learning for predictive analytics and smart optimization"
            },
            {
              icon: <Shield className="w-6 h-6" />,
              title: "Enterprise Security",
              description: "Bank-grade security with encryption, 2FA, and compliance certifications"
            },
            {
              icon: <BarChart3 className="w-6 h-6" />,
              title: "Advanced Analytics",
              description: "Real-time dashboards and custom reports for data-driven decisions"
            }
          ].map((capability, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="h-full hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    {capability.icon}
                  </div>
                  <CardTitle className="text-lg">{capability.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{capability.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How MoloChain Helps Section */}
      <section className="bg-secondary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold mb-4">How MoloChain Helps Your Business</h2>
                <p className="text-muted-foreground mb-6">
                  Transform your logistics operations with proven solutions that deliver measurable results
                </p>
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3"
                      whileHover={{ x: 5 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardHeader>
                    <CardTitle>Proven Results</CardTitle>
                    <CardDescription>Average improvements across our client base</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { metric: "40%", label: "Cost Reduction" },
                        { metric: "85%", label: "Efficiency Gain" },
                        { metric: "60%", label: "Time Saved" },
                        { metric: "95%", label: "Error Reduction" }
                      ].map((stat, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ delay: index * 0.1, type: "spring" }}
                          viewport={{ once: true }}
                          className="text-center p-4 bg-background rounded-lg"
                        >
                          <div className="text-3xl font-bold text-primary">{stat.metric}</div>
                          <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Technology Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="outline">
              <Shield className="w-3 h-3 mr-1" /> Enterprise
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Enterprise-Powered Super-App</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Transforming the $9 trillion global logistics industry with enterprise technology, smart integrations, and AI automation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Secure Records",
                description: "Enterprise security ensures transparent and tamper-proof transaction records for complete trust"
              },
              {
                icon: <Workflow className="w-8 h-8" />,
                title: "Smart Integrations",
                description: "Automated settlements and reduced intermediaries through intelligent system integration"
              },
              {
                icon: <BrainCircuit className="w-8 h-8" />,
                title: "AI-Powered (Rayanava)",
                description: "Advanced AI integration for predictive analytics and intelligent optimization"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl text-center">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Opportunity Section */}
      <section className="py-16 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="outline">
              <BarChart3 className="w-3 h-3 mr-1" /> Opportunity
            </Badge>
            <h2 className="text-3xl font-bold mb-4">$9.1 Trillion Market Opportunity</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Capturing the massive global logistics market with enterprise innovation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { label: "Global Market", value: "$9.1T", desc: "2025 Logistics Industry", color: "blue" },
              { label: "Digital CAGR", value: "50%", desc: "2024-2030 Growth Rate", color: "green" },
              { label: "Digital TAM", value: "$200B", desc: "Addressable Market", color: "purple" },
              { label: "1% Share", value: "$2B", desc: "Revenue Potential", color: "orange" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center hover:shadow-xl transition-all">
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="font-semibold mb-1">{stat.label}</div>
                    <div className="text-sm text-muted-foreground">{stat.desc}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Vision & Goals Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Our Vision & Goals</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Building an enterprise-powered Super-App that revolutionizes global logistics through transparency, automation, and advanced technology
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
          {visionPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    {point.icon}
                  </div>
                  <CardTitle className="text-lg">{point.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{point.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8">
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                To build an enterprise-powered Super-App that eliminates inefficiencies in the $9T logistics industry, 
                reduces costs through smart integrations, ensures transparency with secure records, and creates a 
                unified global platform powered by our MOLOCHAIN ecosystem and Rayanava AI technology.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Market Target Section */}
      <section className="bg-gradient-to-r from-secondary/5 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="outline">
              <Target className="w-3 h-3 mr-1" /> Market Focus
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Our Target Markets</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Serving diverse industries with tailored logistics solutions for every scale
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: <Factory className="w-6 h-6" />,
                title: "Manufacturing & Industrial",
                segments: ["Automotive", "Electronics", "Textiles", "Heavy Machinery"],
                size: "$450B Market"
              },
              {
                icon: <Store className="w-6 h-6" />,
                title: "Retail & E-commerce",
                segments: ["Online Retail", "Omnichannel", "Dropshipping", "Marketplaces"],
                size: "$320B Market"
              },
              {
                icon: <Briefcase className="w-6 h-6" />,
                title: "Import/Export Trading",
                segments: ["Commodities", "Raw Materials", "Finished Goods", "Perishables"],
                size: "$280B Market"
              },
              {
                icon: <Plane className="w-6 h-6" />,
                title: "Freight Forwarders",
                segments: ["Air Freight", "Ocean Freight", "Cross-border", "Express"],
                size: "$190B Market"
              },
              {
                icon: <Building2 className="w-6 h-6" />,
                title: "3PL Providers",
                segments: ["Warehousing", "Distribution", "Last-mile", "Value-added"],
                size: "$210B Market"
              },
              {
                icon: <Globe2 className="w-6 h-6" />,
                title: "Global Enterprises",
                segments: ["Fortune 500", "Multinationals", "Conglomerates", "Supply Chain"],
                size: "$380B Market"
              }
            ].map((market, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        {market.icon}
                      </div>
                      <Badge variant="secondary">{market.size}</Badge>
                    </div>
                    <CardTitle className="text-lg">{market.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {market.segments.map((segment, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <span className="text-sm text-muted-foreground">{segment}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Solutions Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4" variant="outline">
            <Layers className="w-3 h-3 mr-1" /> Solutions
          </Badge>
          <h2 className="text-3xl font-bold mb-4">Industry-Specific Solutions</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Customized logistics solutions designed for your industry's unique challenges
          </p>
        </motion.div>

        <Tabs defaultValue="retail" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="retail">Retail</TabsTrigger>
            <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
            <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
            <TabsTrigger value="automotive">Automotive</TabsTrigger>
          </TabsList>
          
          <TabsContent value="retail" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Retail & E-commerce Solutions</CardTitle>
                <CardDescription>
                  End-to-end logistics for modern retail operations
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Key Capabilities</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Omnichannel fulfillment across all sales channels</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Same-day and next-day delivery options</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Returns management and reverse logistics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Peak season capacity planning</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Benefits</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-primary">45%</div>
                      <div className="text-sm text-muted-foreground">Faster order fulfillment</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-primary">30%</div>
                      <div className="text-sm text-muted-foreground">Reduction in shipping costs</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-primary">98%</div>
                      <div className="text-sm text-muted-foreground">On-time delivery rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="manufacturing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Manufacturing & Industrial Solutions</CardTitle>
                <CardDescription>
                  Streamlined supply chain for manufacturing excellence
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Key Capabilities</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Just-in-time (JIT) delivery coordination</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Raw material sourcing and procurement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Production line feeding systems</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Finished goods distribution</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Benefits</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-primary">35%</div>
                      <div className="text-sm text-muted-foreground">Inventory reduction</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-primary">50%</div>
                      <div className="text-sm text-muted-foreground">Faster time-to-market</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-primary">99.5%</div>
                      <div className="text-sm text-muted-foreground">Production uptime</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="healthcare" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Healthcare & Pharmaceutical Solutions</CardTitle>
                <CardDescription>
                  Compliant and secure logistics for healthcare providers
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Key Capabilities</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Cold chain management and monitoring</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">FDA/EMA compliance tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Medical device handling and distribution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Pharmaceutical serialization</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Benefits</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-primary">100%</div>
                      <div className="text-sm text-muted-foreground">Regulatory compliance</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-primary">0.01%</div>
                      <div className="text-sm text-muted-foreground">Product loss rate</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-primary">24/7</div>
                      <div className="text-sm text-muted-foreground">Temperature monitoring</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="automotive" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Automotive Industry Solutions</CardTitle>
                <CardDescription>
                  Precision logistics for automotive supply chains
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Key Capabilities</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Sequenced parts delivery to assembly lines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Aftermarket parts distribution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Vehicle logistics and transportation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Supplier network management</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Benefits</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-primary">60%</div>
                      <div className="text-sm text-muted-foreground">Reduced lead times</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-primary">40%</div>
                      <div className="text-sm text-muted-foreground">Lower inventory costs</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-primary">99.9%</div>
                      <div className="text-sm text-muted-foreground">Parts availability</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* MOL Tokenomics Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <Badge className="mb-4" variant="outline">
                <DollarSign className="w-3 h-3 mr-1" /> MOLOCHAIN Token
              </Badge>
              <h2 className="text-3xl font-bold mb-4">MOLOCHAIN Token Economics</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                Powering the MoloChain ecosystem with our native utility token
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Token Distribution</CardTitle>
                  <CardDescription>Total Supply: 1 Billion MOLOCHAIN</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { allocation: "Ecosystem Development", percentage: "40%", tokens: "400M MOLOCHAIN", color: "bg-blue-500" },
                      { allocation: "Investors", percentage: "20%", tokens: "200M MOLOCHAIN", color: "bg-green-500" },
                      { allocation: "Team & Advisors", percentage: "20%", tokens: "200M MOLOCHAIN", color: "bg-purple-500" },
                      { allocation: "Reserve Fund", percentage: "20%", tokens: "200M MOLOCHAIN", color: "bg-orange-500" }
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.allocation}</span>
                          <span className="text-muted-foreground">{item.tokens}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`${item.color} h-2 rounded-full`}
                            style={{ width: item.percentage }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Token Utility</CardTitle>
                  <CardDescription>MOLOCHAIN Token Use Cases</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Payments:</span> Transaction fees and service payments
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Staking:</span> Earn rewards and secure the network
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Governance:</span> Vote on platform decisions and DAO governance
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Rewards:</span> Loyalty programs and user incentives
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Deflationary:</span> Burn mechanism on every transaction
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Financial Projections Section */}
      <section className="py-16 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="outline">
              <TrendingUp className="w-3 h-3 mr-1" /> Growth
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Financial Projections</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Clear path to profitability with exponential growth trajectory
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { year: "Year 1 (2025)", clients: "100 Clients", revenue: "$0.5M", status: "MVP Launch", color: "blue" },
              { year: "Year 2 (2026)", clients: "300 Clients", revenue: "$2M", status: "Break-even", color: "green" },
              { year: "Year 3 (2027)", clients: "1,000+ Clients", revenue: "$10M+", status: "Profitable", color: "purple" }
            ].map((projection, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center hover:shadow-xl transition-all">
                  <CardHeader>
                    <Badge className="mx-auto mb-2" variant="outline">{projection.year}</Badge>
                    <CardTitle className="text-3xl font-bold text-primary">{projection.revenue}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold mb-2">{projection.clients}</p>
                    <Badge variant="secondary">{projection.status}</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Strategic Roadmap Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <Badge className="mb-4" variant="outline">
                <Rocket className="w-3 h-3 mr-1" /> Roadmap
              </Badge>
              <h2 className="text-3xl font-bold mb-4">Strategic Roadmap 2025-2028</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                Our journey to becoming the global leader in enterprise logistics
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { 
                    year: "2025", 
                    quarter: "Q1-Q4",
                    title: "Foundation", 
                    items: ["MVP Launch", "Pilot Clients Onboarding", "Core Features Development", "Initial Partnerships"],
                    icon: <Rocket className="w-6 h-6" />,
                    color: "blue"
                  },
                  { 
                    year: "2026", 
                    quarter: "Q1-Q4",
                    title: "Token Launch", 
                    items: ["MOLOCHAIN Token Launch", "Strategic Partnerships", "Market Expansion", "Platform Enhancement"],
                    icon: <DollarSign className="w-6 h-6" />,
                    color: "green"
                  },
                  { 
                    year: "2027", 
                    quarter: "Q1-Q4",
                    title: "Global Scale", 
                    items: ["Global Expansion", "DAO Governance", "Enterprise Solutions", "B2B Marketplace Growth"],
                    icon: <Globe2 className="w-6 h-6" />,
                    color: "purple"
                  },
                  { 
                    year: "2028", 
                    quarter: "Q1-Q4",
                    title: "Market Leader", 
                    items: ["AI Full Integration", "Marketplace Dominance", "Ecosystem Maturity", "IPO Preparation"],
                    icon: <Trophy className="w-6 h-6" />,
                    color: "orange"
                  }
                ].map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full hover:shadow-xl transition-all">
                      <CardHeader>
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 mx-auto">
                          {milestone.icon}
                        </div>
                        <Badge className="mx-auto mb-2">{milestone.year}</Badge>
                        <CardTitle className="text-center">{milestone.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {milestone.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
                              <span className="text-sm text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4" variant="outline">
            <Star className="w-3 h-3 mr-1" /> Success Stories
          </Badge>
          <h2 className="text-3xl font-bold mb-4">Proven Results Across Industries</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            See how businesses worldwide are transforming their logistics with MoloChain
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              company: "Global Manufacturing Corp",
              industry: "Manufacturing",
              metric: "40% Cost Reduction",
              result: "Saved $2.5M annually through optimized routing and automated documentation",
              icon: <TrendingDown className="w-5 h-5" />
            },
            {
              company: "FastCommerce Ltd",
              industry: "E-commerce",
              metric: "85% Faster Delivery",
              result: "Reduced average delivery time from 7 days to 2 days with real-time tracking",
              icon: <Clock className="w-5 h-5" />
            },
            {
              company: "Ocean Traders Inc",
              industry: "Import/Export",
              metric: "95% Error Reduction",
              result: "Near-zero documentation errors with AI-powered validation systems",
              icon: <CheckCircle className="w-5 h-5" />
            }
          ].map((story, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{story.industry}</Badge>
                    <div className="text-primary">{story.icon}</div>
                  </div>
                  <CardTitle className="text-lg">{story.company}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-2">{story.metric}</div>
                  <p className="text-sm text-muted-foreground">{story.result}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="bg-secondary/10 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="outline">
              <Code2 className="w-3 h-3 mr-1" /> Technology
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Built with Cutting-Edge Technology</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Enterprise-grade infrastructure powering seamless global operations
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: <Server className="w-6 h-6" />, title: "Cloud Infrastructure", desc: "AWS, Azure, GCP multi-cloud" },
              { icon: <Database className="w-6 h-6" />, title: "Real-time Database", desc: "PostgreSQL, Redis, MongoDB" },
              { icon: <Lock className="w-6 h-6" />, title: "Security First", desc: "End-to-end encryption, 2FA" },
              { icon: <BrainCircuit className="w-6 h-6" />, title: "AI & ML", desc: "Predictive analytics, automation" },
              { icon: <Cloud className="w-6 h-6" />, title: "API Integration", desc: "RESTful, GraphQL, WebSocket" },
              { icon: <Shield className="w-6 h-6" />, title: "Compliance", desc: "GDPR, SOC2, ISO 27001" },
              { icon: <Zap className="w-6 h-6" />, title: "Performance", desc: "99.99% uptime SLA" },
              { icon: <Globe2 className="w-6 h-6" />, title: "Global CDN", desc: "200+ edge locations" }
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-background rounded-lg p-6 text-center hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  {tech.icon}
                </div>
                <h3 className="font-semibold mb-1">{tech.title}</h3>
                <p className="text-sm text-muted-foreground">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Platform Preview Book Section */}
      <section id="book-preview" className="bg-gradient-to-b from-background to-secondary/20 py-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge className="mb-4" variant="outline">
                <BookOpen className="w-3 h-3 mr-1" /> Interactive Preview
              </Badge>
              <h2 className="text-3xl font-bold mb-4">Platform Preview</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto mb-6">
                Explore the comprehensive features and modules of MoloChain through our interactive preview
              </p>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('all');
                    setCurrentPage(0);
                  }}
                >
                  All Modules
                </Button>
                {['Core', 'Transport', 'Business', 'Integration', 'Admin'].map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentPage(0);
                    }}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </motion.div>

            {/* 3D Book Preview Component */}
            <motion.div 
              className="relative perspective-1000"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="relative"
                whileHover={{ rotateY: 2, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="overflow-hidden shadow-2xl bg-gradient-to-br from-background to-secondary/5 border-primary/20">
                  <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 p-3">
                    <div className="flex items-center justify-between px-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Badge variant="outline" className="bg-background/50 backdrop-blur">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {filteredPages[currentPage]?.category}
                        </Badge>
                      </motion.div>
                      <motion.span 
                        className="text-sm text-muted-foreground font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        Page {currentPage + 1} of {filteredPages.length}
                      </motion.span>
                    </div>
                  </div>
                  
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Left Page - Info with enhanced animations */}
                      <AnimatePresence mode="wait">
                        <motion.div 
                          key={`left-${currentPage}`}
                          initial={{ opacity: 0, x: -50, rotateY: -90 }}
                          animate={{ opacity: 1, x: 0, rotateY: 0 }}
                          exit={{ opacity: 0, x: -50, rotateY: -90 }}
                          transition={{ 
                            duration: 0.5,
                            type: "spring",
                            stiffness: 100
                          }}
                          className="flex-1 p-8 border-r bg-gradient-to-br from-background via-background to-secondary/5"
                        >
                          <motion.div 
                            className="flex items-center gap-3 mb-4"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <motion.div 
                              className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center shadow-lg"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {filteredPages[currentPage]?.icon}
                            </motion.div>
                            <div>
                              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                {filteredPages[currentPage]?.title}
                              </h3>
                              <Badge variant="secondary" className="mt-1">
                                {filteredPages[currentPage]?.category}
                              </Badge>
                            </div>
                          </motion.div>
                          
                          <motion.p 
                            className="text-muted-foreground mb-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            {filteredPages[currentPage]?.description}
                          </motion.p>

                          <motion.div 
                            className="space-y-2 mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            <h4 className="font-semibold text-sm">Key Features:</h4>
                            {filteredPages[currentPage]?.features.map((feature, idx) => (
                              <motion.div 
                                key={idx} 
                                className="flex items-center gap-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + idx * 0.1 }}
                                whileHover={{ x: 5 }}
                              >
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm">{feature}</span>
                              </motion.div>
                            ))}
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button asChild className="w-full group">
                              <Link href={filteredPages[currentPage]?.link}>
                                <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                View Module
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </Button>
                          </motion.div>
                        </motion.div>
                      </AnimatePresence>

                      {/* Right Page - Enhanced Visual Preview */}
                      <AnimatePresence mode="wait">
                        <motion.div 
                          key={`right-${currentPage}`}
                          initial={{ opacity: 0, x: 50, rotateY: 90 }}
                          animate={{ opacity: 1, x: 0, rotateY: 0 }}
                          exit={{ opacity: 0, x: 50, rotateY: 90 }}
                          transition={{ 
                            duration: 0.5,
                            type: "spring",
                            stiffness: 100
                          }}
                          className="flex-1 p-8 bg-gradient-to-br from-secondary/10 via-secondary/5 to-background"
                        >
                          <div className="h-full flex flex-col items-center justify-center">
                            <motion.div 
                              className="w-full h-64 bg-gradient-to-br from-secondary/30 to-primary/10 rounded-xl flex items-center justify-center mb-4 shadow-inner"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.3, type: "spring" }}
                            >
                              <div className="text-center">
                                <motion.div 
                                  className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
                                  animate={{ 
                                    rotate: [0, 360],
                                    scale: [1, 1.1, 1]
                                  }}
                                  transition={{ 
                                    duration: 20,
                                    repeat: Infinity,
                                    ease: "linear"
                                  }}
                                >
                                  {filteredPages[currentPage]?.icon}
                                </motion.div>
                                <motion.p 
                                  className="text-sm text-muted-foreground font-medium"
                                  animate={{ opacity: [0.5, 1, 0.5] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  Interactive Preview
                                </motion.p>
                              </div>
                            </motion.div>
                            
                            <div className="grid grid-cols-2 gap-3 w-full">
                              {[0, 1, 2, 3].map((idx) => (
                                <motion.div
                                  key={idx}
                                  className="h-20 bg-gradient-to-br from-secondary/20 to-primary/10 rounded-lg shadow-lg"
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.5 + idx * 0.1 }}
                                  whileHover={{ 
                                    scale: 1.05,
                                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </CardContent>

                  {/* Enhanced Navigation with animations */}
                  <div className="bg-gradient-to-r from-secondary/10 via-background to-secondary/10 p-4 flex items-center justify-between">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prevPage}
                        disabled={filteredPages.length === 0}
                        className="group"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        Previous
                      </Button>
                    </motion.div>

                    <div className="flex gap-2 items-center">
                      {filteredPages.map((_, index) => (
                        <motion.button
                          key={index}
                          onClick={() => setCurrentPage(index)}
                          className={`transition-all rounded-full ${
                            index === currentPage 
                              ? 'w-8 h-3 bg-gradient-to-r from-primary to-primary/60' 
                              : 'w-3 h-3 bg-secondary hover:bg-secondary/80'
                          }`}
                          aria-label={`Go to page ${index + 1}`}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          animate={{
                            width: index === currentPage ? 32 : 12
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      ))}
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextPage}
                        disabled={filteredPages.length === 0}
                        className="group"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>

            {/* Quick Access Grid */}
            <div className="mt-12">
              <h3 className="text-xl font-bold mb-6 text-center">Quick Access to All Modules</h3>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pagesPreviews.map((page) => (
                  <Link key={page.id} href={page.link}>
                    <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            {page.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{page.title}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {page.category}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Network Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4" variant="outline">
            <Map className="w-3 h-3 mr-1" /> Global Reach
          </Badge>
          <h2 className="text-3xl font-bold mb-4">Worldwide Network</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Operating across continents with strategic partnerships and infrastructure
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { number: "150+", label: "Countries", icon: <Globe2 className="w-5 h-5" /> },
            { number: "500+", label: "Warehouses", icon: <Building2 className="w-5 h-5" /> },
            { number: "10K+", label: "Partners", icon: <Users className="w-5 h-5" /> },
            { number: "1M+", label: "Shipments/Month", icon: <Package className="w-5 h-5" /> }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, type: "spring" }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Card className="text-center p-6 hover:shadow-xl transition-all">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-primary mb-1">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Key Features Section */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="outline">
              <Sparkles className="w-3 h-3 mr-1" /> Features
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Comprehensive Platform Features</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Everything you need to manage global logistics in one integrated platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: <Gauge className="w-6 h-6" />,
                title: "Real-time Tracking",
                description: "Live GPS tracking for all shipments across air, sea, and land with minute-by-minute updates",
                features: ["GPS tracking", "ETA predictions", "Route optimization", "Alert notifications"]
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: "Document Management",
                description: "Digital documentation system for all shipping papers, customs forms, and compliance records",
                features: ["E-documents", "Auto-generation", "Digital signatures", "Cloud storage"]
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Analytics Dashboard",
                description: "Comprehensive analytics with KPI tracking, cost analysis, and performance metrics",
                features: ["Custom reports", "Data visualization", "Predictive analytics", "Export capabilities"]
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Security & Compliance",
                description: "Enterprise-grade security with full regulatory compliance across all jurisdictions",
                features: ["256-bit encryption", "GDPR compliant", "SOC 2 certified", "Regular audits"]
              },
              {
                icon: <Workflow className="w-6 h-6" />,
                title: "Automation Engine",
                description: "Intelligent workflow automation for repetitive tasks and process optimization",
                features: ["Rule engine", "Smart routing", "Auto-scheduling", "Task automation"]
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Collaboration Tools",
                description: "Built-in communication and collaboration features for teams and partners",
                features: ["Team chat", "File sharing", "Task management", "Partner portal"]
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all group">
                  <CardHeader>
                    <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Timeline Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4" variant="outline">
            <Calendar className="w-3 h-3 mr-1" /> History
          </Badge>
          <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            From startup to global logistics leader
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-border" />
            {[
              { year: "2015", title: "Foundation", description: "MoloChain founded with a vision to revolutionize global logistics", icon: <Rocket className="w-5 h-5" /> },
              { year: "2017", title: "First Million", description: "Reached 1 million shipments processed through our platform", icon: <Package className="w-5 h-5" /> },
              { year: "2019", title: "Global Expansion", description: "Expanded operations to 50+ countries across 6 continents", icon: <Globe2 className="w-5 h-5" /> },
              { year: "2021", title: "AI Integration", description: "Launched Rayanavabrain AI for intelligent logistics optimization", icon: <BrainCircuit className="w-5 h-5" /> },
              { year: "2023", title: "MOLOLINK Launch", description: "Introduced MOLOLINK marketplace connecting 10,000+ businesses", icon: <Network className="w-5 h-5" /> },
              { year: "2025", title: "Industry Leader", description: "Recognized as the #1 global logistics platform with 50K+ active customers", icon: <Trophy className="w-5 h-5" /> }
            ].map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative flex items-center mb-8 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                  <Card className="inline-block">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3 justify-end">
                        {index % 2 === 0 && (
                          <>
                            <CardTitle className="text-lg">{milestone.title}</CardTitle>
                            <Badge variant="outline">{milestone.year}</Badge>
                          </>
                        )}
                        {index % 2 !== 0 && (
                          <>
                            <Badge variant="outline">{milestone.year}</Badge>
                            <CardTitle className="text-lg">{milestone.title}</CardTitle>
                          </>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                  {milestone.icon}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Testimonials Section */}
      <section className="bg-secondary/5 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="outline">
              <MessageSquare className="w-3 h-3 mr-1" /> Testimonials
            </Badge>
            <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Trusted by thousands of businesses worldwide
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Sarah Johnson",
                role: "Supply Chain Director",
                company: "Global Retail Corp",
                content: "MoloChain has transformed our logistics operations. We've reduced shipping costs by 35% and improved delivery times by 2 days on average.",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "CEO",
                company: "TechParts International",
                content: "The real-time tracking and AI optimization features are game-changers. Our customers love the transparency, and we love the efficiency gains.",
                rating: 5
              },
              {
                name: "Emma Rodriguez",
                role: "Operations Manager",
                company: "FastShip Logistics",
                content: "MOLOLINK marketplace connected us with reliable partners globally. We've expanded to 20 new markets in just 6 months using MoloChain.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    <CardDescription className="text-base">
                      "{testimonial.content}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities & Infrastructure Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4" variant="outline">
            <Building2 className="w-3 h-3 mr-1" /> Infrastructure
          </Badge>
          <h2 className="text-3xl font-bold mb-4">World-Class Facilities</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            State-of-the-art infrastructure powering global logistics operations
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <CardTitle>Physical Infrastructure</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">500+</Badge>
                    <div>
                      <p className="font-semibold">Distribution Centers</p>
                      <p className="text-sm text-muted-foreground">Strategically located across 150 countries</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">10M+</Badge>
                    <div>
                      <p className="font-semibold">Sq Ft Warehouse Space</p>
                      <p className="text-sm text-muted-foreground">Climate-controlled and secure facilities</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">5000+</Badge>
                    <div>
                      <p className="font-semibold">Fleet Vehicles</p>
                      <p className="text-sm text-muted-foreground">Trucks, vans, and specialized transport</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">50+</Badge>
                    <div>
                      <p className="font-semibold">Air Cargo Hubs</p>
                      <p className="text-sm text-muted-foreground">Direct access to major airports</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <CardTitle>Digital Infrastructure</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">99.99%</Badge>
                    <div>
                      <p className="font-semibold">Platform Uptime</p>
                      <p className="text-sm text-muted-foreground">Enterprise SLA with redundancy</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">256-bit</Badge>
                    <div>
                      <p className="font-semibold">Encryption Standard</p>
                      <p className="text-sm text-muted-foreground">Military-grade data security</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">200+</Badge>
                    <div>
                      <p className="font-semibold">API Integrations</p>
                      <p className="text-sm text-muted-foreground">Seamless connectivity with carriers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">24/7</Badge>
                    <div>
                      <p className="font-semibold">Monitoring & Support</p>
                      <p className="text-sm text-muted-foreground">Round-the-clock operations center</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-8 max-w-6xl mx-auto"
        >
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-4 gap-6 text-center">
                {[
                  { icon: <Activity className="w-6 h-6" />, value: "1M+", label: "Daily Transactions" },
                  { icon: <Globe2 className="w-6 h-6" />, value: "150+", label: "Countries Served" },
                  { icon: <Users className="w-6 h-6" />, value: "50K+", label: "Active Customers" },
                  { icon: <Package className="w-6 h-6" />, value: "10M+", label: "Monthly Shipments" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Partnership Ecosystem Section */}
      <section className="bg-secondary/10 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="outline">
              <HandshakeIcon className="w-3 h-3 mr-1" /> Partners
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Partnership Ecosystem</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Collaborating with industry leaders to deliver exceptional value
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                category: "Shipping Lines",
                partners: ["Maersk", "MSC", "CMA CGM", "Hapag-Lloyd"],
                icon: <Ship className="w-5 h-5" />
              },
              {
                category: "Airlines",
                partners: ["Emirates", "DHL Aviation", "FedEx", "UPS Airlines"],
                icon: <Plane className="w-5 h-5" />
              },
              {
                category: "Technology",
                partners: ["Microsoft", "AWS", "Oracle", "SAP"],
                icon: <Cpu className="w-5 h-5" />
              },
              {
                category: "Last Mile",
                partners: ["DHL", "FedEx", "UPS", "Local Partners"],
                icon: <Truck className="w-5 h-5" />
              }
            ].map((ecosystem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        {ecosystem.icon}
                      </div>
                      <CardTitle className="text-base">{ecosystem.category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {ecosystem.partners.map((partner, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-sm">{partner}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans Preview Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4" variant="outline">
            <DollarSign className="w-3 h-3 mr-1" /> Pricing
          </Badge>
          <h2 className="text-3xl font-bold mb-4">Flexible Pricing Plans</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Scalable solutions that grow with your business needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              name: "Starter",
              price: "$999",
              period: "/month",
              description: "Perfect for small businesses",
              features: [
                "Up to 100 shipments/month",
                "Basic tracking & reporting",
                "Email support",
                "API access",
                "Mobile app"
              ],
              highlighted: false
            },
            {
              name: "Professional",
              price: "$2,999",
              period: "/month",
              description: "For growing companies",
              features: [
                "Up to 1,000 shipments/month",
                "Advanced analytics",
                "Priority support 24/7",
                "Custom integrations",
                "Dedicated account manager",
                "Multi-user access"
              ],
              highlighted: true
            },
            {
              name: "Enterprise",
              price: "Custom",
              period: "",
              description: "Unlimited scale",
              features: [
                "Unlimited shipments",
                "Custom solutions",
                "On-premise deployment",
                "SLA guarantees",
                "White-label options",
                "Strategic consulting"
              ],
              highlighted: false
            }
          ].map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className={`h-full ${plan.highlighted ? 'border-primary shadow-lg scale-105' : ''}`}>
                {plan.highlighted && (
                  <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" variant={plan.highlighted ? "default" : "outline"}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-secondary/5 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="outline">
              <HelpCircle className="w-3 h-3 mr-1" /> FAQ
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know about MoloChain
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What makes MoloChain different from other logistics platforms?</AccordionTrigger>
                <AccordionContent>
                  MoloChain combines AI-powered optimization, real-time tracking, and a comprehensive B2B marketplace 
                  in one integrated platform. Our unique MOLOLINK ecosystem connects all stakeholders, while our 
                  Rayanavabrain AI provides predictive analytics and intelligent routing that reduces costs by up to 40%.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How quickly can I get started with MoloChain?</AccordionTrigger>
                <AccordionContent>
                  You can start using MoloChain within 24 hours. Our onboarding team will help you set up your account, 
                  integrate your existing systems, and train your team. Most businesses are fully operational on the 
                  platform within 5-7 business days.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Does MoloChain integrate with my existing systems?</AccordionTrigger>
                <AccordionContent>
                  Yes! MoloChain offers 200+ pre-built integrations with popular ERP, WMS, and TMS systems. 
                  Our RESTful API and webhook support allow seamless integration with virtually any system. 
                  We also provide custom integration services for enterprise clients.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>What kind of support do you provide?</AccordionTrigger>
                <AccordionContent>
                  We offer 24/7 multilingual support through phone, email, and live chat. Professional and Enterprise 
                  plans include a dedicated account manager and priority support. We also provide comprehensive 
                  documentation, video tutorials, and regular training webinars.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Is my data secure on MoloChain?</AccordionTrigger>
                <AccordionContent>
                  Absolutely. We use military-grade 256-bit encryption, are SOC 2 Type II certified, and comply 
                  with GDPR, CCPA, and other international data protection regulations. Your data is stored in 
                  geo-redundant data centers with 99.99% uptime SLA.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger>Can MoloChain handle international shipments?</AccordionTrigger>
                <AccordionContent>
                  Yes! MoloChain operates in 150+ countries with support for multi-currency, multi-language, 
                  and customs documentation. We handle complex international regulations, duties, and taxes 
                  automatically, making cross-border shipping as easy as domestic.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Awards & Recognition Section */}
      <section className="bg-gradient-to-r from-primary/5 to-secondary/5 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="outline">
              <Trophy className="w-3 h-3 mr-1" /> Recognition
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Awards & Certifications</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Industry-leading standards and recognition for excellence in logistics
            </p>
          </motion.div>
          
          <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
            {[
              "Best Logistics Platform 2024",
              "ISO 27001 Certified",
              "SOC 2 Type II Compliant",
              "Gartner Magic Quadrant Leader",
              "Innovation Award 2024",
              "Customer Choice Award"
            ].map((award, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, rotate: 2 }}
              >
                <Card className="p-4 flex items-center gap-3 hover:shadow-lg transition-all">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">{award}</span>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-12 text-center">
            <Award className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Logistics?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              Join thousands of businesses already using MoloChain to optimize their 
              supply chain operations and drive growth.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default About;