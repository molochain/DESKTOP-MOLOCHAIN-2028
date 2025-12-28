import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Building2, 
  ChevronLeft,
  Globe,
  DollarSign, 
  Handshake, 
  Briefcase, 
  Cpu, 
  Scale,
  ExternalLink,
  Calendar,
  BarChart4,
  Ship,
  AlertCircle,
  FileText,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  MoveRight
} from "lucide-react";

// Import micro-interactions
import { FadeIn } from "@/components/ui/micro-interactions/fade-in";
import { Float } from "@/components/ui/micro-interactions/float";
import { Pulse } from "@/components/ui/micro-interactions/pulse";
import { Shimmer } from "@/components/ui/micro-interactions/shimmer";

// Define timeline item interface
interface TimelineItem {
  year: number;
  event: string;
}

// Define case study interface
interface CaseStudy {
  title: string;
  description: string;
  url: string;
}

// Define related partner interface
interface RelatedPartner {
  id: number;
  name: string;
  logo: string;
  country: string;
  tags: string[];
  description: string;
  industry: string;
  collaborationType: string;
}

// Define partner interface
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
  headquarters?: string;
  foundedYear?: number;
  keyStrengths?: string[];
  collaborationAreas?: string[];
  achievements?: string[];
  timeline?: TimelineItem[];
  caseStudies?: CaseStudy[];
}

export default function PartnerDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  
  // Fetch partner details
  const { data: partner, isLoading, error } = useQuery<Partner>({
    queryKey: [`/api/partners/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/partners/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch partner details');
      }
      return response.json();
    }
  });
  
  // Fetch related partners
  const { data: relatedPartners } = useQuery<RelatedPartner[]>({
    queryKey: [`/api/partners/${id}/related`],
    queryFn: async () => {
      const response = await fetch(`/api/partners/${id}/related`);
      if (!response.ok) {
        return []; // Return empty array on error
      }
      return response.json();
    },
    enabled: !!partner // Only fetch when partner data is available
  });
  
  // Get icon based on collaboration type
  const getCollaborationIcon = (type?: string) => {
    if (!type) return <Handshake className="h-5 w-5" />;
    
    switch(type) {
      case "Technical Integration":
        return <Cpu className="h-5 w-5" />;
      case "Strategic Alliance":
        return <Handshake className="h-5 w-5" />;
      case "Service Provider":
        return <Briefcase className="h-5 w-5" />;
      case "Financial Investor":
        return <DollarSign className="h-5 w-5" />;
      case "Local Operator":
        return <Building2 className="h-5 w-5" />;
      case "Research Partner":
        return <Scale className="h-5 w-5" />;
      default:
        return <Handshake className="h-5 w-5" />;
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Error state
  if (error || !partner) {
    return (
      <div className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12 space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="text-3xl font-bold">Partner Not Found</h1>
            <p className="text-muted-foreground">The partner you're looking for might have been removed or is temporarily unavailable.</p>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/partners')}
              className="mt-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Partners
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Back button */}
      <div className="container mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/partners')}
          className="mb-8 hover:bg-background/80"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Partners
        </Button>
      </div>
      
      {/* Partner header */}
      <div className="relative mb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background z-0"></div>
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-5 z-0"></div>
        
        <FadeIn 
          direction="up" 
          duration="normal" 
          className="container relative z-10 py-12 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-primary/5 flex items-center justify-center">
                {partner.logo ? (
                  <img 
                    src={partner.logo} 
                    alt={partner.name} 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <Float amplitude={3} frequency={5}>
                    <Building2 className="h-12 w-12 md:h-16 md:w-16 text-primary" />
                  </Float>
                )}
              </div>
              
              <div className="flex-1">
                <Shimmer className="inline-block mb-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                    {partner.industry}
                  </Badge>
                </Shimmer>
                
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
                  {partner.name}
                </h1>
                
                <div className="flex flex-wrap gap-4 mt-4 text-muted-foreground">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    {partner.country}
                  </div>
                  
                  <div className="flex items-center">
                    {getCollaborationIcon(partner.collaborationType)}
                    <span className="ml-2">{partner.collaborationType}</span>
                  </div>
                  
                  {partner.foundedYear && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Founded: {partner.foundedYear}</span>
                    </div>
                  )}
                  
                  {partner.headquarters && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>HQ: {partner.headquarters}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
      
      {/* Partner content */}
      <div className="container mx-auto pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <FadeIn 
                direction="up" 
                delay={100}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      About {partner.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-foreground text-base whitespace-pre-line">
                      {partner.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </FadeIn>
              
              {/* Partnership Value */}
              <FadeIn 
                direction="up" 
                delay={200}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Handshake className="h-5 w-5 text-primary" />
                      Partnership Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-foreground text-base whitespace-pre-line">
                      {partner.contribution}
                    </CardDescription>
                  </CardContent>
                </Card>
              </FadeIn>
              
              {/* Partnership Timeline */}
              {partner.timeline && partner.timeline.length > 0 && (
                <FadeIn 
                  direction="up" 
                  delay={300}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Partnership Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative pl-7 space-y-6">
                        <div className="absolute left-3 top-1 bottom-2 w-px bg-primary/20"></div>
                        
                        {partner.timeline.sort((a, b) => a.year - b.year).map((item, index) => (
                          <FadeIn 
                            key={index}
                            direction="left"
                            delay={200 + (index * 100)}
                            staggered={false}
                            className="relative"
                          >
                            <div className="absolute left-[-29px] top-1 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-primary"></div>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <div className="text-sm font-medium text-primary">
                                {item.year}
                              </div>
                              <div className="text-base text-foreground">
                                {item.event}
                              </div>
                            </div>
                          </FadeIn>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              )}
              
              {/* Achievements */}
              {partner.achievements && partner.achievements.length > 0 && (
                <FadeIn 
                  direction="up" 
                  delay={350}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart4 className="h-5 w-5 text-primary" />
                        Key Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {partner.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                              <span className="text-xs font-medium">{index + 1}</span>
                            </div>
                            <span className="text-foreground/90">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </FadeIn>
              )}
            </div>
            
            <div className="space-y-8">
              {/* Tags */}
              <FadeIn 
                direction="up" 
                delay={150}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Areas of Expertise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {partner.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
              
              {/* Key Strengths */}
              {partner.keyStrengths && partner.keyStrengths.length > 0 && (
                <FadeIn 
                  direction="up" 
                  delay={250}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Key Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {partner.keyStrengths.map((strength, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                            <span className="text-sm text-foreground/80">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </FadeIn>
              )}
              
              {/* Collaboration Areas */}
              {partner.collaborationAreas && partner.collaborationAreas.length > 0 && (
                <FadeIn 
                  direction="up" 
                  delay={350}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Collaboration Areas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {partner.collaborationAreas.map((area, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                            <span className="text-sm text-foreground/80">{area}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </FadeIn>
              )}
              
              {/* Case Studies */}
              {partner.caseStudies && partner.caseStudies.length > 0 && (
                <FadeIn 
                  direction="up" 
                  delay={400}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Case Studies</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {partner.caseStudies.map((study, index) => (
                        <div 
                          key={index} 
                          className="group border border-border rounded-md p-3 hover:border-primary/50 transition-colors"
                        >
                          <h4 className="font-medium text-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            {study.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {study.description}
                          </p>
                          <div className="mt-3">
                            <Button
                              variant="link"
                              className="px-0 h-auto text-primary group-hover:underline"
                              onClick={() => window.open(study.url, '_blank')}
                            >
                              <span>Read case study</span>
                              <MoveRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </FadeIn>
              )}
              
              {/* Website Link */}
              {partner.website && (
                <FadeIn 
                  direction="up" 
                  delay={450}
                >
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => window.open(partner.website, '_blank')}
                  >
                    Visit Partner Website
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </FadeIn>
              )}
            </div>
          </div>
          
          {/* Related Partners Section */}
          {relatedPartners && relatedPartners.length > 0 && (
            <div>
              <FadeIn 
                direction="up" 
                delay={500}
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Related Partners
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    Other organizations in our global partner network that collaborate in similar areas.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedPartners.map((relatedPartner) => (
                    <FadeIn 
                      key={relatedPartner.id}
                      direction="up"
                      delay={600}
                      className="h-full"
                    >
                      <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-300">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <Badge variant="outline" className="mb-2">
                              {relatedPartner.industry}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl">
                            {relatedPartner.name}
                          </CardTitle>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Globe className="h-3.5 w-3.5 mr-1.5" />
                            {relatedPartner.country}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="flex-grow pb-2">
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                            {relatedPartner.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-1 mt-auto">
                            {relatedPartner.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs py-0 px-2">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                        
                        <CardContent className="pt-0">
                          <Button 
                            variant="outline" 
                            className="w-full flex items-center justify-between text-primary"
                            onClick={() => {
                              window.scrollTo(0, 0);
                              setLocation(`/partners/${relatedPartner.id}`);
                            }}
                          >
                            <span>View Details</span>
                            <MoveRight className="h-4 w-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    </FadeIn>
                  ))}
                </div>
              </FadeIn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}