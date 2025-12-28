import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { MoloChainSpinner, MoloChainLoadingCard } from '@/components/ui/molochain-loader';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Globe, 
  DollarSign, 
  Handshake, 
  Briefcase, 
  Cpu, 
  Scale,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Network,
  Users,
  ExternalLink
} from "lucide-react";

// Import micro-interactions
import { HoverCard } from "@/components/ui/micro-interactions/hover-card";
import { FadeIn } from "@/components/ui/micro-interactions/fade-in";
import { Pulse } from "@/components/ui/micro-interactions/pulse";
import { Ripple } from "@/components/ui/micro-interactions/ripple";
import { Float } from "@/components/ui/micro-interactions/float";
import { Attention } from "@/components/ui/micro-interactions/attention";
import { Scale as ScaleEffect } from "@/components/ui/micro-interactions/scale";
import { Shimmer } from "@/components/ui/micro-interactions/shimmer";

// Define partner types
interface Partner {
  id: number;
  name: string;
  logo: string;
  country: string;
  tags: string[];
  description: string;
  contribution: string;
  industry: string;
  collaborationType: string;
  website?: string;
}

// Define form type for partnership request
interface PartnershipRequestForm {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  industry: string;
  collaborationType: string;
  message: string;
}

export default function Partners() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Setup form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PartnershipRequestForm>({
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      industry: "",
      collaborationType: "",
      message: ""
    }
  });
  
  // Handle form submission
  const onSubmit = (data: PartnershipRequestForm) => {
    setIsSubmitting(true);
    
    // Simulate API call for partnership request
    setTimeout(() => {
      // Partnership request submitted
      setIsSubmitting(false);
      
      // Show success toast
      toast({
        title: "Partnership Request Submitted",
        description: "Thank you for your interest. Our team will contact you shortly.",
        variant: "default"
      });
      
      // Reset form
      reset();
    }, 1500);
  };
  
  // Fetch partners data
  const { data: partners = [], isLoading, error } = useQuery<Partner[]>({
    queryKey: ['/api/partners'],
    queryFn: async () => {
      const response = await fetch('/api/partners');
      if (!response.ok) {
        throw new Error('Failed to fetch partners');
      }
      return response.json();
    }
  });
  
  // Extract unique industries and regions for filters
  const uniqueIndustries = useMemo(() => {
    if (!partners.length) return [];
    const industries = partners.map(partner => partner.industry);
    return Array.from(new Set(industries)).sort();
  }, [partners]);
  
  const uniqueRegions = useMemo(() => {
    if (!partners.length) return [];
    const regions = partners.map(partner => partner.country);
    return Array.from(new Set(regions)).sort();
  }, [partners]);
  
  // Filter partners based on selected filters
  const filteredPartners = useMemo(() => {
    if (!partners.length) return [];
    
    return partners.filter(partner => {
      const matchesIndustry = !selectedIndustry || selectedIndustry === "all" || partner.industry === selectedIndustry;
      const matchesRegion = !selectedRegion || selectedRegion === "all" || partner.country === selectedRegion;
      return matchesIndustry && matchesRegion;
    });
  }, [partners, selectedIndustry, selectedRegion]);
  
  // Get icon based on collaboration type
  const getCollaborationIcon = (type: string) => {
    switch(type) {
      case "Technical Integration":
        return <Cpu className="h-4 w-4" />;
      case "Strategic Alliance":
        return <Handshake className="h-4 w-4" />;
      case "Service Provider":
        return <Briefcase className="h-4 w-4" />;
      case "Financial Investor":
        return <DollarSign className="h-4 w-4" />;
      case "Local Operator":
        return <Building2 className="h-4 w-4" />;
      case "Research Partner":
        return <Scale className="h-4 w-4" />;
      default:
        return <Handshake className="h-4 w-4" />;
    }
  };

  // Group partners by industry
  const partnersByIndustry = partners.reduce((acc, partner) => {
    if (!acc[partner.industry]) {
      acc[partner.industry] = [];
    }
    acc[partner.industry].push(partner);
    return acc;
  }, {} as Record<string, Partner[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Hero section with light gradient background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 z-0"></div>
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-5 z-0"></div>
        
        <FadeIn 
          direction="up" 
          duration="normal" 
          staggered={true} 
          staggerDelay={100}
        >
          <div className="container relative z-10 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto text-center">
              <Attention 
                effect="pulse" 
                duration={800} 
                intensity="medium"
                trigger="initial"
              >
                <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  Global Network
                </span>
              </Attention>
              
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
                Our Global <Shimmer className="inline-block" color="rgba(var(--primary), 0.1)" gradientColor="rgba(var(--primary), 0.3)"><span className="text-primary">Strategic Partners</span></Shimmer>
              </h1>
              
              <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Join the world's leading organizations in our mission to revolutionize global logistics 
                and commodities through innovation, sustainability, and collaboration.
              </p>
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <HoverCard 
                  hoverEffect="lift" 
                  intensity="medium"
                  className="bg-card border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20"
                >
                  <Float amplitude={5} frequency={4} random={true}>
                    <TrendingUp className="h-10 w-10 text-primary mb-4" />
                  </Float>
                  <h3 className="text-xl font-semibold mb-2">Strategic Growth</h3>
                  <p className="text-muted-foreground">Access to global markets and strategic expansion opportunities for your business.</p>
                </HoverCard>
                
                <HoverCard 
                  hoverEffect="lift" 
                  intensity="medium"
                  className="bg-card border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20"
                >
                  <Float amplitude={5} frequency={4} random={true}>
                    <Network className="h-10 w-10 text-primary mb-4" />
                  </Float>
                  <h3 className="text-xl font-semibold mb-2">Network Access</h3>
                  <p className="text-muted-foreground">Connect with industry leaders and decision-makers across continents.</p>
                </HoverCard>
                
                <HoverCard 
                  hoverEffect="lift" 
                  intensity="medium"
                  className="bg-card border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20"
                >
                  <Float amplitude={5} frequency={4} random={true}>
                    <Users className="h-10 w-10 text-primary mb-4" />
                  </Float>
                  <h3 className="text-xl font-semibold mb-2">Collaborative Innovation</h3>
                  <p className="text-muted-foreground">Co-develop cutting-edge solutions to solve global logistics challenges.</p>
                </HoverCard>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
      
      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Filter Controls */}
        {!isLoading && !error && partners.length > 0 && (
          <FadeIn
            direction="up"
            delay={100}
          >
            <div className="bg-card border border-border/50 rounded-lg p-6 mb-12 shadow-sm">
              <h3 className="text-lg font-medium mb-4">Filter Partners</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="industry-filter" className="text-sm font-medium text-muted-foreground">
                    Filter by Industry
                  </label>
                  <Select
                    value={selectedIndustry}
                    onValueChange={setSelectedIndustry}
                  >
                    <SelectTrigger id="industry-filter" className="w-full">
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      {uniqueIndustries.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="region-filter" className="text-sm font-medium text-muted-foreground">
                    Filter by Region
                  </label>
                  <Select
                    value={selectedRegion}
                    onValueChange={setSelectedRegion}
                  >
                    <SelectTrigger id="region-filter" className="w-full">
                      <SelectValue placeholder="All Regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {uniqueRegions.map(region => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {(selectedIndustry !== "all" || selectedRegion !== "all") && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredPartners.length} {filteredPartners.length === 1 ? 'partner' : 'partners'}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedIndustry("all");
                      setSelectedRegion("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </FadeIn>
        )}
        
        {/* Partners sections by industry */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Error loading partners data. Please try again later.</p>
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No partners found. Use the filters above to search for partners or add new partnerships.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {Object.entries(partnersByIndustry).map(([industry, industryPartners], industryIndex) => (
              <FadeIn
                key={industry}
                direction="up"
                delay={industryIndex * 200}
                className="space-y-6"
              >
                <div className="flex items-center space-x-2 mb-8">
                  <Pulse color="primary" size="small">
                    <div className="h-10 w-1 bg-primary rounded"></div>
                  </Pulse>
                  <h2 className="text-3xl font-bold">{industry} Partners</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {industryPartners.map((partner, partnerIndex) => (
                    <FadeIn
                      key={partner.id}
                      direction="up"
                      delay={partnerIndex * 100 + 100}
                    >
                      <HoverCard
                        hoverEffect="glow"
                        intensity="medium"
                        className="h-full"
                      >
                        <Card className="h-full flex flex-col overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/60 hover:border-primary/30">
                          <CardHeader className="relative pb-0">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-4">
                                {partner.logo ? (
                                  <div className="w-16 h-16 rounded-md overflow-hidden bg-background flex items-center justify-center border">
                                    <img 
                                      src={partner.logo} 
                                      alt={partner.name} 
                                      className="h-full w-full object-contain p-1" 
                                    />
                                  </div>
                                ) : (
                                  <div className="w-16 h-16 rounded-md bg-primary/5 flex items-center justify-center">
                                    <Float amplitude={3} frequency={5}>
                                      <Building2 className="h-8 w-8 text-primary" />
                                    </Float>
                                  </div>
                                )}
                                <div>
                                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                    {partner.name}
                                  </CardTitle>
                                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                    <Globe className="h-4 w-4 mr-1" />
                                    {partner.country}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Badge className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
                                  {getCollaborationIcon(partner.collaborationType)}
                                  <span className="text-xs">{partner.collaborationType}</span>
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="flex-grow pt-4">
                            <div className="mb-3 flex flex-wrap gap-1.5">
                              {partner.tags.map((tag) => (
                                <ScaleEffect
                                  key={tag}
                                  scaleFactor={0.05}
                                  duration="fast"
                                  direction="up"
                                >
                                  <Badge variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                </ScaleEffect>
                              ))}
                            </div>
                            <CardDescription className="text-sm mb-4 text-foreground/80">
                              {partner.description}
                            </CardDescription>
                            <div className="text-sm">
                              <strong className="text-foreground">Partnership Value:</strong>
                              <p className="text-muted-foreground">{partner.contribution}</p>
                            </div>
                          </CardContent>
                          {partner.website && (
                            <CardFooter className="border-t pt-4 pb-3">
                              <Ripple color="rgba(var(--primary), 0.1)" duration={600}>
                                <div className="flex justify-between items-center w-full">
                                  <Button 
                                    variant="ghost" 
                                    className="p-0 h-auto text-primary transition-colors" 
                                    onClick={() => setLocation(`/partners/${partner.id}`)}
                                  >
                                    <span className="text-sm font-medium inline-flex items-center">
                                      View Details
                                      <ChevronRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                                    </span>
                                  </Button>
                                  
                                  {partner.website && (
                                    <Button 
                                      variant="ghost" 
                                      className="p-0 h-auto group-hover:text-primary transition-colors" 
                                      onClick={() => window.open(partner.website, '_blank')}
                                    >
                                      <span className="text-sm font-medium inline-flex items-center">
                                        Website
                                        <ExternalLink className="h-3 w-3 ml-1" />
                                      </span>
                                    </Button>
                                  )}
                                </div>
                              </Ripple>
                            </CardFooter>
                          )}
                        </Card>
                      </HoverCard>
                    </FadeIn>
                  ))}
                </div>
              </FadeIn>
            ))}
          </div>
        )}
        
        {/* Call-to-action section */}
        <FadeIn
          direction="up"
          delay={400}
          className="mt-24"
        >
          <div className="rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 z-0"></div>
            <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10 z-0"></div>
            
            <div className="relative z-10 p-12 text-center text-white">
              <Shimmer 
                color="rgba(255, 255, 255, 0.05)" 
                gradientColor="rgba(255, 255, 255, 0.2)"
                duration="slow"
                className="inline-block"
              >
                <h2 className="text-4xl font-bold mb-6">Join the MOLOCHAIN Ecosystem</h2>
              </Shimmer>
              
              <p className="text-lg text-white/80 mb-8 max-w-3xl mx-auto">
                Be part of our expanding global network of partners shaping the future of logistics and trade. 
                We're seeking visionary investors, innovative service providers, experienced local operators, 
                and forward-thinking technology contributors.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <HoverCard 
                  hoverEffect="glow" 
                  intensity="medium"
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <Float amplitude={5} random={true} pause={false}>
                    <DollarSign className="h-8 w-8 mx-auto mb-4" />
                  </Float>
                  <h3 className="text-xl font-semibold mb-2">Investment</h3>
                  <p className="text-white/70 text-sm">Strategic investments in global logistics innovation</p>
                </HoverCard>
                
                <HoverCard 
                  hoverEffect="glow" 
                  intensity="medium"
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <Float amplitude={5} random={true} pause={false}>
                    <Briefcase className="h-8 w-8 mx-auto mb-4" />
                  </Float>
                  <h3 className="text-xl font-semibold mb-2">Service</h3>
                  <p className="text-white/70 text-sm">Value-added services enhancing our ecosystem</p>
                </HoverCard>
                
                <HoverCard 
                  hoverEffect="glow" 
                  intensity="medium"
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <Float amplitude={5} random={true} pause={false}>
                    <Building2 className="h-8 w-8 mx-auto mb-4" />
                  </Float>
                  <h3 className="text-xl font-semibold mb-2">Local Operations</h3>
                  <p className="text-white/70 text-sm">On-the-ground expertise in key markets</p>
                </HoverCard>
                
                <HoverCard 
                  hoverEffect="glow" 
                  intensity="medium"
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <Float amplitude={5} random={true} pause={false}>
                    <Cpu className="h-8 w-8 mx-auto mb-4" />
                  </Float>
                  <h3 className="text-xl font-semibold mb-2">Technology</h3>
                  <p className="text-white/70 text-sm">Cutting-edge tech solutions and integrations</p>
                </HoverCard>
              </div>
              
              <Ripple color="rgba(255, 255, 255, 0.3)" opacity={0.6} disabled={false}>
                <ScaleEffect
                  scaleFactor={0.03}
                  duration="fast"
                  direction="up"
                >
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-white/90 gap-2 text-lg px-8 py-6 h-auto"
                  >
                    Become a Partner
                    <ArrowRight className="h-5 w-5 ml-1" />
                  </Button>
                </ScaleEffect>
              </Ripple>
            </div>
          </div>
        </FadeIn>
        
        {/* Partnership Request Form */}
        <FadeIn
          direction="up"
          delay={500}
          className="mt-16 mb-20"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border border-border/50 rounded-xl p-8 shadow-md">
              <h3 className="text-2xl font-bold mb-6">Partnership Request Form</h3>
              <p className="text-muted-foreground mb-8">
                Complete the form below to express your interest in partnering with MOLOCHAIN. 
                Our team will review your request and contact you to discuss potential collaboration opportunities.
              </p>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input 
                      id="companyName"
                      placeholder="Your company name"
                      {...register("companyName", { required: "Company name is required" })}
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-sm">{errors.companyName.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Person</Label>
                    <Input 
                      id="contactName"
                      placeholder="Full name"
                      {...register("contactName", { required: "Contact name is required" })}
                    />
                    {errors.contactName && (
                      <p className="text-red-500 text-sm">{errors.contactName.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      {...register("email", { 
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                      })}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone"
                      placeholder="+1 (123) 456-7890"
                      {...register("phone", { required: "Phone number is required" })}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm">{errors.phone.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      onValueChange={(value) => {
                        const event = { target: { name: "industry", value } };
                        register("industry").onChange(event);
                      }}
                      defaultValue="select"
                    >
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="select">Select your industry</SelectItem>
                        <SelectItem value="Logistics">Logistics</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Maritime">Maritime</SelectItem>
                        <SelectItem value="Aviation">Aviation</SelectItem>
                        <SelectItem value="Commodities">Commodities</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Financial Services">Financial Services</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.industry && (
                      <p className="text-red-500 text-sm">{errors.industry.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="collaborationType">Collaboration Type</Label>
                    <Select
                      onValueChange={(value) => {
                        const event = { target: { name: "collaborationType", value } };
                        register("collaborationType").onChange(event);
                      }}
                      defaultValue="select"
                    >
                      <SelectTrigger id="collaborationType">
                        <SelectValue placeholder="Select collaboration type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="select">Select collaboration type</SelectItem>
                        <SelectItem value="Strategic Alliance">Strategic Alliance</SelectItem>
                        <SelectItem value="Technical Integration">Technical Integration</SelectItem>
                        <SelectItem value="Financial Investor">Financial Investor</SelectItem>
                        <SelectItem value="Service Provider">Service Provider</SelectItem>
                        <SelectItem value="Local Operator">Local Operator</SelectItem>
                        <SelectItem value="Research Partner">Research Partner</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.collaborationType && (
                      <p className="text-red-500 text-sm">{errors.collaborationType.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Partnership Proposal</Label>
                  <Textarea 
                    id="message"
                    placeholder="Tell us about your organization and how you envision a partnership with MOLOCHAIN..."
                    className="min-h-[120px]"
                    {...register("message", { required: "Message is required" })}
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm">{errors.message.message}</p>
                  )}
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Submit Partnership Request
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}