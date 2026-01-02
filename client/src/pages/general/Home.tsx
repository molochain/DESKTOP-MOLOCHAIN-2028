import Hero from "@/components/layout/Hero";
import { Button } from "@/components/ui/button";
import { RippleButton } from "@/components/ui/ripple-button";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Reveal } from "@/components/ui/reveal";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { MoloChainSkeleton, MoloChainLoadingCard } from '@/components/ui/molochain-loader';
import { useEffect, useState } from 'react';
import { useCMSHomeSections, useCMSServices } from '@/hooks/use-cms';
import {
  Plane,
  Truck,
  Container,
  Workflow,
  Users,
  Briefcase,
  Building2,
  Globe2,
  Timer,
  BarChart3,
  BrainCircuit,
  Clock,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Shield,
  Sparkles,
  Package,
  Activity,
  MapPin,
  DollarSign,
  AlertCircle,
  Ship,
  Zap,
  Target,
  Eye,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MiniLatestProjects from "@/components/latest-projects/MiniLatestProjects";

const Home = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [platformStats, setPlatformStats] = useState({
    shipments: 186542,
    partners: 48293,
    integrations: 1286,
    value: 142.5
  });

  const { data: homeSections, isLoading: sectionsLoading } = useCMSHomeSections();
  const { data: cmsServices } = useCMSServices();

  const getSection = (key: string) => homeSections?.find(s => s.key === key);
  const heroSection = getSection('hero');
  const servicesSection = getSection('services');
  const ecosystemSection = getSection('ecosystem');
  const ctaSection = getSection('cta');

  useEffect(() => {
    // Simulate loading state for demonstration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Simulate real-time platform updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPlatformStats(prev => ({
        shipments: prev.shipments + Math.floor(Math.random() * 5) + 1,
        partners: prev.partners + (Math.random() > 0.7 ? 1 : 0),
        integrations: prev.integrations + (Math.random() > 0.9 ? 1 : 0),
        value: +(prev.value + (Math.random() * 0.1 - 0.05)).toFixed(2)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const services = [
    {
      id: "container",
      title: t('home.services.container.title', 'Container Services'),
      description: t('home.services.container.description', 'Comprehensive container handling and management solutions'),
      icon: <Container className="w-8 h-8" />,
    },
    {
      id: "trucking",
      title: t('home.services.trucking.title', 'Trucking Services'),
      description: t('home.services.trucking.description', 'Reliable road transportation solutions'),
      icon: <Truck className="w-8 h-8" />,
    },
    {
      id: "airfreight",
      title: t('home.services.airfreight.title', 'Air Freight Services'),
      description: t('home.services.airfreight.description', 'Fast and reliable worldwide air cargo transportation solutions'),
      icon: <Plane className="w-8 h-8" />,
    },
    {
      id: "transit",
      title: t('home.services.transit.title', 'Transit Services'),
      description: t('home.services.transit.description', 'Efficient cargo movement and transit management solutions'),
      icon: <Workflow className="w-8 h-8" />,
    },
    {
      id: "crossstaffing",
      title: t('home.services.crossstaffing.title', 'Cross-Staffing Services'),
      description: t('home.services.crossstaffing.description', 'Flexible workforce solutions for logistics'),
      icon: <Users className="w-8 h-8" />,
    },
    {
      id: "agency",
      title: t('home.services.agency.title', 'Agency Services'),
      description: t('home.services.agency.description', 'Professional logistics recruitment solutions'),
      icon: <Briefcase className="w-8 h-8" />,
    }
  ];

  const displayServices = cmsServices && cmsServices.length > 0 ? cmsServices.map(s => ({
    id: s.slug,
    title: s.name,
    description: s.short_description || 'Explore our professional logistics services',
    icon: <Package className="w-8 h-8" />
  })) : services;

  const featuredProjects = [
    {
      id: 1,
      title: t('home.projects.ecommerce.title', 'Global E-commerce Distribution Network'),
      description: t('home.projects.ecommerce.description', 'Implemented an integrated logistics solution for a major e-commerce platform, reducing delivery times by 40%'),
      image: "attached_assets/generated_images/global_logistics_connecting_continents.png",
      category: t('home.projects.ecommerce.category', 'E-commerce'),
      stats: {
        deliveryTime: "-40%",
        efficiency: "+35%",
        coverage: "25 countries"
      }
    },
    {
      id: 4,
      title: t('home.projects.ai.title', 'Advanced AI for Logistics Innovation'),
      description: t('home.projects.ai.description', 'Pioneering the development of artificial intelligence solutions to transform logistics planning'),
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
      category: t('home.projects.ai.category', 'Innovation'),
      stats: {
        accuracy: "99.9%",
        automation: "85%",
        efficiency: "+200%"
      }
    },
    {
      id: 8,
      title: t('home.projects.future.title', 'Future of Logistics Initiative'),
      description: t('home.projects.future.description', 'Transforming the global logistics landscape through breakthrough technologies and sustainable innovations'),
      image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3",
      category: t('home.projects.future.category', 'Innovation'),
      stats: {
        innovation: "150+ patents",
        impact: "Global Scale",
        adoption: "50+ partners"
      }
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden"
    >
      <Hero />

      {/* Real-time Dashboard Metrics */}
      <section className="py-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* KPI Cards */}
            {[
              {
                label: t('stats.partners', 'Global Partners'),
                value: platformStats.partners.toLocaleString(),
                change: "+32.4%",
                trend: "up",
                icon: <Shield className="w-5 h-5" />,
                color: "blue",
                live: true
              },
              {
                label: t('stats.shipments', 'Shipments Processed'),
                value: platformStats.shipments.toLocaleString(),
                change: "+48.7%",
                trend: "up",
                icon: <DollarSign className="w-5 h-5" />,
                color: "green",
                live: true
              },
              {
                label: t('stats.networkValue', 'Network Value'),
                value: `$${platformStats.value}M`,
                change: "+67.3%",
                trend: "up",
                icon: <TrendingUp className="w-5 h-5" />,
                color: "purple",
                live: true
              },
              {
                label: t('stats.integrations', 'Active Integrations'),
                value: platformStats.integrations.toLocaleString(),
                change: "+28.9%",
                trend: "up",
                icon: <Globe2 className="w-5 h-5" />,
                color: "orange",
                live: true
              }
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                <Card className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/20`}>
                        {metric.icon}
                      </div>
                      <Badge 
                        variant={metric.trend === "up" ? "default" : "secondary"}
                        className="flex items-center gap-1"
                      >
                        {metric.trend === "up" ? 
                          <ChevronUp className="w-3 h-3" /> : 
                          <ChevronDown className="w-3 h-3" />
                        }
                        {metric.change}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">{metric.value}</p>
                        {metric.live && (
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-green-600 dark:text-green-400 ml-1">LIVE</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                    </div>
                  </CardContent>
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-600`} />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* Performance Analytics */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <Badge className="mb-4" variant="outline">
                <Target className="w-3 h-3 mr-1" /> {t('home.analytics.badge', 'Analytics')}
              </Badge>
              <h2 className="text-3xl font-bold mb-2">{t('home.analytics.title', 'Performance Overview')}</h2>
              <p className="text-muted-foreground">{t('home.analytics.subtitle', 'Real-time insights into your logistics operations')}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: t('home.analytics.delivery.title', 'Delivery Performance'),
                  metrics: [
                    { label: t('home.analytics.delivery.onTimeRate', 'On-Time Rate'), value: "98.5%", color: "green" },
                    { label: t('home.analytics.delivery.avgDelay', 'Average Delay'), value: "12 min", color: "yellow" },
                    { label: t('home.analytics.delivery.successRate', 'Success Rate'), value: "99.8%", color: "blue" }
                  ]
                },
                {
                  title: t('home.analytics.cost.title', 'Cost Efficiency'),
                  metrics: [
                    { label: t('home.analytics.cost.costPerMile', 'Cost per Mile'), value: "$2.34", color: "purple" },
                    { label: t('home.analytics.cost.fuelSavings', 'Fuel Savings'), value: "18%", color: "green" },
                    { label: t('home.analytics.cost.routeOptimization', 'Route Optimization'), value: "94%", color: "blue" }
                  ]
                },
                {
                  title: t('home.analytics.satisfaction.title', 'Customer Satisfaction'),
                  metrics: [
                    { label: t('home.analytics.satisfaction.npsScore', 'NPS Score'), value: "87", color: "green" },
                    { label: t('home.analytics.satisfaction.resolutionTime', 'Resolution Time'), value: "2.4h", color: "blue" },
                    { label: t('home.analytics.satisfaction.reviews', '5-Star Reviews'), value: "4.8/5", color: "yellow" }
                  ]
                }
              ].map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {category.metrics.map((metric, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{metric.label}</span>
                            <span className="font-semibold">{metric.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Badge className="mb-4 px-4 py-1.5 bg-gradient-to-r from-green-500 to-teal-500 text-white border-0">
              <Sparkles className="w-4 h-4 mr-1" /> Premium Services
            </Badge>
            <h2 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              {servicesSection?.title || t('services.title', 'Our Services')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {servicesSection?.subtitle || t('services.subtitle', 'Comprehensive logistics solutions for your business needs')}
            </p>
          </motion.div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              // Show loading cards while loading
              Array.from({ length: 6 }).map((_, index) => (
                <MoloChainLoadingCard key={index} showImage={false} />
              ))
            ) : (
              displayServices.map((service) => (
              <Link key={service.id} href={`/services/${service.id}`}>
                <motion.div
                  className="relative flex flex-col h-full overflow-hidden rounded-lg border bg-white shadow-sm cursor-pointer"
                  whileHover={{
                    scale: 1.02,
                    y: -4,
                    transition: { duration: 0.2 }
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: displayServices.findIndex(s => s.id === service.id) * 0.1
                  }}
                >
                  <div className="p-6">
                    <motion.div
                      className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary"
                      whileHover={{
                        rotate: 10,
                        scale: 1.1,
                        transition: { duration: 0.2 }
                      }}
                    >
                      {service.icon}
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-gray-600">
                      {service.description}
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))
            )}
          </div>
          <div className="mt-12 text-center">
            <Link href="/services">
              <RippleButton size="lg" effect="scale">
                {t('services.viewAll', 'View All Services')}
              </RippleButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal animation="fadeIn" className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('projects.title', 'Featured Projects')}
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {t('projects.subtitle', 'Delve into our future projects, relentless efforts, and ambitious goals, which we draw closer to each day!')}
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {featuredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="relative h-48">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d";
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
                      {project.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {project.description}
                  </p>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {Object.entries(project.stats).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-lg font-bold text-primary">{value}</div>
                        <div className="text-sm text-gray-500">{key}</div>
                      </div>
                    ))}
                  </div>
                  <Link href={`/projects/${project.id}`}>
                    <RippleButton variant="outline" className="w-full" effect="glow">
                      View Details
                    </RippleButton>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/projects">
              <RippleButton size="lg" className="gap-2" effect="ripple">
                {t('projects.viewAll', 'View All Projects')}
                <Globe2 className="w-4 h-4" />
              </RippleButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Projects Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal animation="fadeIn" delay="short" className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('latestProjects.title', 'Our Latest Project')}
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {t('latestProjects.subtitle', 'The kilometers we have covered, the tonnages we have transported, and we will continue stronger')}
            </p>
          </Reveal>
          <MiniLatestProjects />
          <div className="mt-12 text-center">
            <Link href="/latest-projects">
              <RippleButton size="lg" className="gap-2" effect="scale">
                {t('latestProjects.viewAll', 'View All Projects')}
                <Globe2 className="w-4 h-4" />
              </RippleButton>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal animation="fadeIn" delay="medium" className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t("news.title", "Latest News")}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t("news.subtitle", "Stay updated with our latest developments")}
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedCard effect="lift" className="overflow-hidden">
              <img
                className="h-48 w-full object-cover"
                src="attached_assets/generated_images/global_logistics_connecting_continents.png"
                alt="News 1"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d";
                }}
              />
              <div className="p-6">
                <span className="text-sm text-primary">March 15, 2024</span>
                <h3 className="mt-2 text-xl font-semibold">
                  {t("news.article1.title", "Expanding Global Operations")}
                </h3>
                <p className="mt-2 text-gray-600">
                  {t("news.article1.description", "Our company is expanding operations to new regions, enhancing our global reach.")}
                </p>
              </div>
            </AnimatedCard>
            <AnimatedCard effect="glow" className="overflow-hidden">
              <img
                className="h-48 w-full object-cover"
                src="attached_assets/generated_images/global_logistics_connecting_continents.png"
                alt="News 2"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55";
                }}
              />
              <div className="p-6">
                <span className="text-sm text-primary">March 10, 2024</span>
                <h3 className="mt-2 text-xl font-semibold">
                  {t("news.article2.title", "Sustainable Logistics")}
                </h3>
                <p className="mt-2 text-gray-600">
                  {t("news.article2.description", "Launching new eco-friendly shipping solutions for sustainable logistics.")}
                </p>
              </div>
            </AnimatedCard>
            <AnimatedCard effect="scale" className="overflow-hidden">
              <img
                className="h-48 w-full object-cover"
                src="attached_assets/generated_images/global_logistics_connecting_continents.png"
                alt="News 3"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1544984243-ec57ea16fe25";
                }}
              />
              <div className="p-6">
                <span className="text-sm text-primary">March 5, 2024</span>
                <h3 className="mt-2 text-xl font-semibold">
                  {t("news.article3.title", "AI-Powered Tracking")}
                </h3>
                <p className="mt-2 text-gray-600">
                  {t("news.article3.description", "Implementing advanced AI technology for better shipment tracking.")}
                </p>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Strategic Partnerships */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="outline">
              <Users className="w-3 h-3 mr-1" /> Ecosystem Partners
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Strategic Partners</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Building the future of logistics with leading Logistic and technology partners
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { name: "Enterprise Systems", type: "Infrastructure", value: "Global Scale" },
              { name: "Smart Logistics", type: "AI Automation", value: "Automated Execution" },
              { name: "Global Trade Network", type: "Trade Finance", value: "Cross-border Payments" },
              { name: "AI Cargo Systems", type: "AI Integration", value: "Predictive Analytics" }
            ].map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center hover:shadow-lg transition-all">
                  <CardHeader>
                    <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                    <CardTitle className="text-lg">{partner.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="mb-2">{partner.type}</Badge>
                    <p className="text-sm text-muted-foreground">{partner.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Join Our Enterprise Ecosystem</h3>
                  <p className="text-muted-foreground">
                    Partner with MoloChain to revolutionize global logistics through enterprise technology
                  </p>
                </div>
                <Link href="/partners">
                  <Button className="gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Become a Partner
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <Reveal animation="fadeIn" delay="short">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {t("whyUs.title", "Why Choose Molo Logistics?")}
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                {t("whyUs.description", "We combine cutting-edge technology with decades of logistics expertise to deliver unparalleled service quality and reliability.")}
              </p>
              <div className="mt-8">
                <Link href="/quote">
                  <RippleButton size="lg" effect="ripple">
                    {t("whyUs.cta", "Get Started Today")}
                  </RippleButton>
                </Link>
              </div>
            </Reveal>
            <div className="mt-10 lg:mt-0">
              <Reveal animation="scaleUp" delay="medium">
                <img
                  className="rounded-lg shadow-lg"
                  src="attached_assets/generated_images/global_logistics_connecting_continents.png"
                  alt={t("whyUs.imageAlt", "Modern Logistics Hub")}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1617938568125-b55e59775632";
                  }}
                />
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;