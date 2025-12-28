import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Phone,
  Mail,
  Clock,
  Globe,
  DollarSign,
  Star,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Award,
  MessageSquare,
  FileText,
  Download,
  Calendar,
  MapPin,
  BarChart3,
  Package,
  Truck,
  ChevronRight,
  ExternalLink,
  Info,
  Target,
} from "lucide-react";
import { ServiceBookingForm } from "./ServiceBookingForm";
import { ServiceAvailabilityChecker } from "./ServiceAvailabilityChecker";
import { ServiceTracking } from "./ServiceTracking";
import MarketplaceListing from "./MarketplaceListing";
import RelatedJobs from "./RelatedJobs";
import { getServiceImage } from "@/config/serviceImages";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  author: string;
  company: string;
  rating: number;
  content: string;
  date: string;
}

interface CaseStudy {
  id: string;
  title: string;
  client: string;
  challenge: string;
  solution: string;
  results: string[];
  metrics?: {
    label: string;
    value: string;
    change?: string;
  }[];
}

interface FAQ {
  question: string;
  answer: string;
}

interface ServiceDetailEnhancedProps {
  id: string;
  title: string;
  description: string;
  features: string[];
  benefits: string[];
  icon: React.ReactNode;
  imageUrl?: string;
  additionalInfo?: string;
  relatedServices?: string[];
  pricing?: string;
  deliveryTime?: string;
  coverage?: string;
  tags?: string[];
  testimonials?: Testimonial[];
  caseStudies?: CaseStudy[];
  faqs?: FAQ[];
  certifications?: string[];
  serviceStats?: {
    label: string;
    value: string;
    icon: React.ReactNode;
  }[];
}

export default function ServiceDetailEnhanced({
  id,
  title,
  description,
  features,
  benefits,
  icon,
  imageUrl,
  additionalInfo,
  relatedServices = [],
  pricing,
  deliveryTime,
  coverage,
  tags = [],
  testimonials = [],
  caseStudies = [],
  faqs = [],
  certifications = [],
  serviceStats = [],
}: ServiceDetailEnhancedProps) {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const serviceImage = getServiceImage(id);

  // Default stats if not provided
  const defaultStats = [
    { label: "Response Time", value: "< 2 hours", icon: <Clock className="h-5 w-5" /> },
    { label: "Coverage", value: coverage || "Global", icon: <Globe className="h-5 w-5" /> },
    { label: "Success Rate", value: "99.8%", icon: <TrendingUp className="h-5 w-5" /> },
    { label: "Active Clients", value: "500+", icon: <Users className="h-5 w-5" /> },
  ];

  const stats = serviceStats.length > 0 ? serviceStats : defaultStats;

  // Mock testimonials if not provided
  const defaultTestimonials: Testimonial[] = [
    {
      id: "1",
      author: "Sarah Johnson",
      company: "Global Retail Corp",
      rating: 5,
      content: `Outstanding ${title.toLowerCase()} service! The team went above and beyond to ensure our shipments arrived on time and in perfect condition.`,
      date: "2 weeks ago",
    },
    {
      id: "2",
      author: "Michael Chen",
      company: "TechStart Industries",
      rating: 5,
      content: "The level of professionalism and attention to detail is unmatched. Highly recommend their services for any logistics needs.",
      date: "1 month ago",
    },
    {
      id: "3",
      author: "Emma Williams",
      company: "Fresh Foods Ltd",
      rating: 4,
      content: "Reliable and efficient service. The real-time tracking and communication made the entire process smooth and transparent.",
      date: "2 months ago",
    },
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;

  // Mock case study if not provided
  const defaultCaseStudy: CaseStudy = {
    id: "1",
    title: "Streamlining Global Supply Chain",
    client: "Fortune 500 Manufacturer",
    challenge: "Complex international logistics requiring coordination across 15 countries with varying regulations and time-sensitive deliveries.",
    solution: `Implemented comprehensive ${title.toLowerCase()} solution with dedicated account management, custom tracking systems, and strategic partnership network.`,
    results: [
      "35% reduction in transit times",
      "28% cost savings on logistics",
      "99.5% on-time delivery rate",
      "50% improvement in inventory turnover",
    ],
    metrics: [
      { label: "Cost Reduction", value: "28%", change: "+28%" },
      { label: "Time Saved", value: "35%", change: "+35%" },
      { label: "Efficiency Gain", value: "50%", change: "+50%" },
    ],
  };

  const displayCaseStudies = caseStudies.length > 0 ? caseStudies : [defaultCaseStudy];

  // Default FAQs if not provided
  const defaultFaqs: FAQ[] = [
    {
      question: `What makes your ${title.toLowerCase()} different from competitors?`,
      answer: "We combine cutting-edge technology with decades of industry expertise to deliver customized solutions. Our global network, real-time tracking, and dedicated support team ensure superior service quality.",
    },
    {
      question: "How quickly can I get started?",
      answer: `Most clients can begin using our ${title.toLowerCase()} within 24-48 hours. We provide rapid onboarding with dedicated support to ensure smooth integration with your existing operations.`,
    },
    {
      question: "What are the pricing options?",
      answer: `We offer flexible pricing models including volume-based discounts, contract rates, and pay-per-use options. Contact our team for a customized quote based on your specific requirements.`,
    },
    {
      question: "Do you provide insurance coverage?",
      answer: "Yes, comprehensive insurance coverage is available for all shipments. We offer various coverage levels to match your cargo value and risk tolerance.",
    },
  ];

  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <Link href="/services">
            <Button variant="ghost" className="mb-6 text-white hover:bg-white/20">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
            </Button>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  {icon}
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold">{title}</h1>
                  <p className="text-xl text-blue-100 mt-2">{description}</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
                  >
                    <div className="flex justify-center mb-2 text-blue-200">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mt-8">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  onClick={() => setShowBookingForm(true)}
                >
                  Book Service Now
                </Button>
                <Link href="/quote">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Get Instant Quote
                  </Button>
                </Link>
                <Button size="lg" variant="ghost" className="text-white hover:bg-white/20">
                  <Phone className="mr-2 h-5 w-5" />
                  Contact Sales
                </Button>
              </div>
            </div>

            {/* Hero Image */}
            {serviceImage && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <div className="rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src={serviceImage}
                    alt={title}
                    className="w-full h-[400px] object-cover"
                  />
                </div>
                {certifications.length > 0 && (
                  <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {certifications.length} Certifications
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Quick Info Bar */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm">
              {pricing && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Starting from {pricing}</span>
                </div>
              )}
              {deliveryTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{deliveryTime}</span>
                </div>
              )}
              {coverage && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">{coverage} coverage</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="testimonials">
              Testimonials
              <Badge className="ml-2" variant="secondary">
                {displayTestimonials.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Features & Benefits */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Key Features & Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-semibold mb-4 text-gray-900">Features</h4>
                        <ul className="space-y-3">
                          {features.slice(0, 6).map((feature, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-2"
                            >
                              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                              <span className="text-gray-700">{feature}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-4 text-gray-900">Benefits</h4>
                        <ul className="space-y-3">
                          {benefits.slice(0, 6).map((benefit, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-2"
                            >
                              <Award className="h-5 w-5 text-blue-500 mt-0.5" />
                              <span className="text-gray-700">{benefit}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information */}
                {additionalInfo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-500" />
                        Service Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed">{additionalInfo}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Availability Checker */}
                <ServiceAvailabilityChecker serviceCode={id.toUpperCase()} serviceName={title} />

                {/* Order Tracking Widget */}
                <ServiceTracking 
                  showSearch={true}
                  compact={false}
                  data-testid="service-detail-tracking-widget"
                />

                {/* Related Jobs/Careers */}
                <RelatedJobs 
                  serviceId={id} 
                  serviceName={title}
                  limit={3}
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Marketplace Listing Widget */}
                <MarketplaceListing serviceId={id} serviceName={title} />

                {/* Quick Actions */}
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => setShowBookingForm(true)}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Service
                    </Button>
                    <Link href="/quote" className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Request Quote
                      </Button>
                    </Link>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download Brochure
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Live Chat Support
                    </Button>
                  </CardContent>
                </Card>

                {/* Related Services */}
                {relatedServices.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Related Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {relatedServices.map(service => (
                          <Link key={service} href={`/services/${service}`}>
                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                              <div className="flex items-center gap-3">
                                <Package className="h-5 w-5 text-blue-600" />
                                <span className="font-medium capitalize">
                                  {service.replace(/-/g, ' ')}
                                </span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Contact Card */}
                <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
                    <p className="text-gray-300 mb-6">
                      Our experts are ready to assist you with your logistics needs.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5" />
                        <span>+90 212 547 92 47</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5" />
                        <span>support@molochain.com</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Target className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">{feature}</h3>
                      <p className="text-sm text-gray-600">
                        Comprehensive implementation ensuring maximum efficiency and reliability.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="pt-6">
                      <div className="flex mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-5 w-5",
                              i < testimonial.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                      <div className="border-t pt-4">
                        <p className="font-semibold">{testimonial.author}</p>
                        <p className="text-sm text-gray-600">{testimonial.company}</p>
                        <p className="text-xs text-gray-500 mt-1">{testimonial.date}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="text-center">
              <Button variant="outline">
                Load More Reviews
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Case Studies Tab */}
          <TabsContent value="case-studies" className="space-y-8">
            {displayCaseStudies.map((study, index) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                    <Badge className="bg-white/20 text-white mb-4">Case Study</Badge>
                    <h3 className="text-2xl font-bold mb-2">{study.title}</h3>
                    <p className="text-blue-100">Client: {study.client}</p>
                  </div>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-semibold mb-3 text-gray-900">Challenge</h4>
                        <p className="text-gray-600 mb-6">{study.challenge}</p>
                        
                        <h4 className="font-semibold mb-3 text-gray-900">Solution</h4>
                        <p className="text-gray-600">{study.solution}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-gray-900">Results</h4>
                        <ul className="space-y-2 mb-6">
                          {study.results.map((result, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                              <span className="text-gray-700">{result}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {study.metrics && (
                          <div className="grid grid-cols-3 gap-4">
                            {study.metrics.map((metric, idx) => (
                              <div key={idx} className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                  {metric.value}
                                </div>
                                <div className="text-xs text-gray-600">{metric.label}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            <div className="text-center">
              <Link href="/case-studies">
                <Button>
                  View All Case Studies
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-4">
            {displayFaqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    "cursor-pointer transition-all",
                    expandedFaq === index && "shadow-lg"
                  )}
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                      <ChevronRight
                        className={cn(
                          "h-5 w-5 text-gray-400 transition-transform",
                          expandedFaq === index && "rotate-90"
                        )}
                      />
                    </div>
                    {expandedFaq === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                      >
                        <Separator className="mb-4" />
                        <p className="text-gray-600">{faq.answer}</p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">Still have questions?</p>
              <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Booking Form Modal */}
        {showBookingForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Book {title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBookingForm(false)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ServiceBookingForm
                  serviceCode={id.toUpperCase()}
                  serviceName={title}
                  onSuccess={() => setShowBookingForm(false)}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}