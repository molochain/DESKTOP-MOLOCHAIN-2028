import { useState, useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AnimatedCard } from "@/components/ui/animated-card";
import { 
  MapPin, Phone, Mail, Clock, Globe, Building, Users, Briefcase, 
  Container, Truck, Plane, Workflow, Handshake, Building2, User, 
  CheckCircle, Flag, HeartHandshake, ShieldCheck, AlertCircle,
  UserPlus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RippleButton } from "@/components/ui/ripple-button";
import { iconAnimation } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import ContactMap from "@/components/contact/ContactMap";
import OfficeSearch from "@/components/contact/OfficeSearch";
import AgentSearch from "@/components/contact/AgentSearch";
import AgentCard from "@/components/contact/AgentCard";
import AgentStatusVisualization from "@/components/contact/AgentStatusVisualization";
import AgentProfileWidget from "@/components/contact/AgentProfileWidget";
import AgentProfileModal from "@/components/contact/AgentProfileModal";
import AgentCalendar from "@/components/contact/AgentCalendar";
import AgentPerformanceMetrics from "@/components/contact/AgentPerformanceMetrics";
import { useAgentStatus } from "@/hooks/useAgentStatus";
import { exportPerformanceAsCSV, exportPerformanceAsPDF, AgentPerformanceData } from "@/utils/exportUtils";

// Agent Status interface
interface AgentStatus {
  id: string;
  name: string;
  email: string;
  country: string;
  role: string;
  status: 'online' | 'busy' | 'offline';
  connectionQuality?: string;
  networkAvailability?: string;
  responseTime?: string;
  lastUpdated?: string;
  region?: string;
  specialty?: string[];
  lastActive: string;
}

const createFormSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(2, t('contact.form.errors.nameMinLength')),
  email: z.string().email(t('contact.form.errors.invalidEmail')),
  subject: z.string().min(2, t('contact.form.errors.subjectRequired')),
  message: z.string().min(10, t('contact.form.errors.messageMinLength')),
});

// Define Office interface
interface Office {
  id: string;
  name: string;
  country: string;
  address: string;
  phone: string;
  fax?: string;
  email: string;
  coordinates: number[];
  type: string;
  services: string[];
  image: string;
  timezone: string;
  operatingHours: string;
}

// Office data factory with translation support
const getGlobalOffices = (t: (key: string) => string): Office[] => [
  {
    id: "istanbul",
    name: t('contact.globalOffices.istanbul.name'),
    country: t('contact.globalOffices.istanbul.country'),
    address: t('contact.globalOffices.istanbul.address'),
    phone: "",
    fax: "",
    email: "istanbul@molochain.com",
    coordinates: [41.1087024, 29.014969],
    type: t('contact.globalOffices.types.headquarter'),
    services: ["Container", "Trucking", "Air Freight", "Transit", "Agency"],
    image: "/offices/istanbul.jpg",
    timezone: "GMT+3",
    operatingHours: t('contact.globalOffices.istanbul.operatingHours')
  },
  {
    id: "dubai",
    name: t('contact.globalOffices.dubai.name'),
    country: t('contact.globalOffices.dubai.country'),
    address: t('contact.globalOffices.dubai.address'),
    phone: "",
    email: "dubai@molochain.com",
    coordinates: [25.2048, 55.2708],
    type: t('contact.globalOffices.types.regional'),
    services: ["Container", "Air Freight", "Transit"],
    image: "/offices/dubai.jpg",
    timezone: "GMT+4",
    operatingHours: t('contact.globalOffices.dubai.operatingHours')
  },
  {
    id: "london",
    name: t('contact.globalOffices.london.name'),
    country: t('contact.globalOffices.london.country'),
    address: t('contact.globalOffices.london.address'),
    phone: "",
    email: "london@molochain.com",
    coordinates: [51.5074, -0.1278],
    type: t('contact.globalOffices.types.regional'),
    services: ["Container", "Transit", "Agency"],
    image: "/offices/london.jpg",
    timezone: "GMT+0",
    operatingHours: t('contact.globalOffices.london.operatingHours')
  },
  {
    id: "shanghai",
    name: t('contact.globalOffices.shanghai.name'),
    country: t('contact.globalOffices.shanghai.country'),
    address: t('contact.globalOffices.shanghai.address'),
    phone: "",
    email: "shanghai@molochain.com",
    coordinates: [31.2304, 121.4737],
    type: t('contact.globalOffices.types.regional'),
    services: ["Container", "Air Freight", "Transit"],
    image: "/offices/shanghai.jpg",
    timezone: "GMT+8",
    operatingHours: t('contact.globalOffices.shanghai.operatingHours')
  },
  {
    id: "rotterdam",
    name: t('contact.globalOffices.rotterdam.name'),
    country: t('contact.globalOffices.rotterdam.country'),
    address: t('contact.globalOffices.rotterdam.address'),
    phone: "",
    email: "rotterdam@molochain.com",
    coordinates: [51.9225, 4.4792],
    type: t('contact.globalOffices.types.port'),
    services: ["Container", "Transit"],
    image: "/offices/rotterdam.jpg",
    timezone: "GMT+1",
    operatingHours: t('contact.globalOffices.rotterdam.operatingHours')
  },
  {
    id: "newyork",
    name: t('contact.globalOffices.newyork.name'),
    country: t('contact.globalOffices.newyork.country'),
    address: t('contact.globalOffices.newyork.address'),
    phone: "",
    email: "newyork@molochain.com",
    coordinates: [40.7128, -74.006],
    type: t('contact.globalOffices.types.regional'),
    services: ["Container", "Air Freight", "Transit", "Agency"],
    image: "/offices/newyork.jpg",
    timezone: "GMT-5",
    operatingHours: t('contact.globalOffices.newyork.operatingHours')
  },
  {
    id: "casablanca",
    name: t('contact.globalOffices.casablanca.name'),
    country: t('contact.globalOffices.casablanca.country'),
    address: t('contact.globalOffices.casablanca.address'),
    phone: "",
    email: "casablanca@molochain.com",
    coordinates: [33.5731, -7.5898],
    type: t('contact.globalOffices.types.port'),
    services: ["Container", "Transit"],
    image: "/offices/casablanca.jpg",
    timezone: "GMT+0",
    operatingHours: t('contact.globalOffices.casablanca.operatingHours')
  },
  {
    id: "durban",
    name: t('contact.globalOffices.durban.name'),
    country: t('contact.globalOffices.durban.country'),
    address: t('contact.globalOffices.durban.address'),
    phone: "",
    email: "durban@molochain.com",
    coordinates: [-29.8587, 31.0218],
    type: t('contact.globalOffices.types.port'),
    services: ["Container", "Transit"],
    image: "/offices/durban.jpg",
    timezone: "GMT+2",
    operatingHours: t('contact.globalOffices.durban.operatingHours')
  }
];

// Professional Services Teams
const professionalTeams = [
  {
    id: "customs",
    title: "Customs Clearance Team",
    description: "Expert customs documentation and compliance specialists",
    icon: <ShieldCheck className="w-8 h-8" />,
    contactEmail: "customs@molochain.com",
    contactPhone: "",
    skills: ["Import/Export declarations", "Customs documentation", "Tariff classification", "Compliance consulting"],
    availability: "24/7",
    responseTime: "Within 2 hours"
  },
  {
    id: "logistics",
    title: "Logistics Solutions Team",
    description: "Specialized logistics planners for complex shipping needs",
    icon: <Workflow className="w-8 h-8" />,
    contactEmail: "logistics@molochain.com",
    contactPhone: "",
    skills: ["Route optimization", "Multi-modal shipping", "Supply chain planning", "Cost optimization"],
    availability: "Monday-Friday, 8AM-8PM",
    responseTime: "Same day"
  },
  {
    id: "special-cargo",
    title: "Special Cargo Handling",
    description: "Specialists in oversized, hazardous, and sensitive shipments",
    icon: <CheckCircle className="w-8 h-8" />,
    contactEmail: "special@molochain.com",
    contactPhone: "",
    skills: ["Oversized cargo", "Hazardous materials", "Temperature-controlled", "High-value items"],
    availability: "24/7",
    responseTime: "Within 4 hours"
  },
  {
    id: "client-relations",
    title: "Client Relations Team",
    description: "Dedicated account managers for personalized service",
    icon: <HeartHandshake className="w-8 h-8" />,
    contactEmail: "clients@molochain.com",
    contactPhone: "",
    skills: ["Account management", "Service customization", "Business consulting", "Relationship building"],
    availability: "Monday-Friday, 9AM-6PM",
    responseTime: "Within 24 hours"
  }
];

// Define Agent interface
interface Agent {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  languages: string[];
  specialty: string[];
  photo?: string;
}

// Define RegionalAgent interface
interface RegionalAgent {
  country: string;
  flag: string;
  agents: Agent[];
}

// Regional agents by country
const regionalAgents: RegionalAgent[] = [
  {
    country: "Turkey",
    flag: "🇹🇷",
    agents: [
      { 
        id: "agent-1", 
        name: "Mehmet Yilmaz", 
        role: "Regional Director", 
        email: "myilmaz@molochain.com", 
        phone: "",
        country: "Turkey",
        region: "Europe/Asia",
        languages: ["Turkish", "English", "Arabic"],
        specialty: ["Customs", "International Transit", "Container Shipping"],
        photo: "/client/public/container-logo.jpg"
      },
      { 
        id: "agent-4", 
        name: "Ayşe Kaya", 
        role: "Customs Specialist", 
        email: "akaya@molochain.com", 
        phone: "",
        country: "Turkey",
        region: "Europe/Asia",
        languages: ["Turkish", "English", "Russian"],
        specialty: ["Customs Clearance", "Documentation", "Import/Export"],
        photo: "/client/public/container-logo.jpg"
      }
    ]
  },
  {
    country: "United Arab Emirates",
    flag: "🇦🇪",
    agents: [
      { 
        id: "agent-2", 
        name: "Ahmed Al-Maktoum", 
        role: "Regional Manager", 
        email: "aalmaktoum@molochain.com", 
        phone: "",
        country: "United Arab Emirates",
        region: "Middle East",
        languages: ["Arabic", "English", "French"],
        specialty: ["Port Operations", "Logistics Management", "Air Freight"],
        photo: "/client/public/container-logo.jpg"
      },
      { 
        id: "agent-5", 
        name: "Sara Al-Fahim", 
        role: "Logistics Coordinator", 
        email: "salfahim@molochain.com", 
        phone: "",
        country: "United Arab Emirates",
        region: "Middle East",
        languages: ["Arabic", "English"],
        specialty: ["Supply Chain", "Project Logistics", "Freight Forwarding"],
        photo: "/client/public/container-logo.jpg"
      }
    ]
  },
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    agents: [
      { 
        id: "agent-3", 
        name: "James Wilson", 
        role: "Regional Director", 
        email: "jwilson@molochain.com", 
        phone: "",
        country: "United Kingdom",
        region: "Europe",
        languages: ["English", "French", "German"],
        specialty: ["European Transport", "Brexit Regulations", "Customs"],
        photo: "/client/public/container-logo.jpg"
      },
      { 
        id: "agent-6", 
        name: "Emily Taylor", 
        role: "Operations Manager", 
        email: "etaylor@molochain.com", 
        phone: "",
        country: "United Kingdom",
        region: "Europe",
        languages: ["English", "Spanish"],
        specialty: ["Warehousing", "Distribution", "Road Transport"],
        photo: "/client/public/container-logo.jpg"
      }
    ]
  },
  {
    country: "China",
    flag: "🇨🇳",
    agents: [
      { 
        id: "agent-7", 
        name: "Li Wei", 
        role: "Regional Director", 
        email: "lwei@molochain.com", 
        phone: "",
        country: "China",
        region: "East Asia",
        languages: ["Mandarin", "English", "Cantonese"],
        specialty: ["Asian Markets", "Ocean Freight", "E-commerce Logistics"],
        photo: "/client/public/container-logo.jpg"
      },
      { 
        id: "agent-8", 
        name: "Zhang Min", 
        role: "Customs Relations", 
        email: "zmin@molochain.com", 
        phone: "",
        country: "China",
        region: "East Asia",
        languages: ["Mandarin", "English"],
        specialty: ["Chinese Customs", "Documentation", "Trade Compliance"],
        photo: "/client/public/container-logo.jpg"
      }
    ]
  },
  {
    country: "United States",
    flag: "🇺🇸",
    agents: [
      { 
        id: "agent-9", 
        name: "Michael Johnson", 
        role: "Regional Director", 
        email: "mjohnson@molochain.com", 
        phone: "",
        country: "United States",
        region: "North America",
        languages: ["English", "Spanish"],
        specialty: ["Trans-Atlantic Trade", "Intermodal Transport", "USMCA Regulations"],
        photo: "/client/public/container-logo.jpg"
      },
      { 
        id: "agent-10", 
        name: "Jennifer Smith", 
        role: "Client Relations", 
        email: "jsmith@molochain.com", 
        phone: "",
        country: "United States",
        region: "North America",
        languages: ["English", "Portuguese"],
        specialty: ["Customer Service", "Account Management", "Logistics Consulting"],
        photo: "/client/public/container-logo.jpg"
      }
    ]
  },
  {
    country: "Morocco",
    flag: "🇲🇦",
    agents: [
      { 
        id: "agent-11", 
        name: "Hassan Benali", 
        role: "Port Operations Manager", 
        email: "hbenali@molochain.com", 
        phone: "",
        country: "Morocco",
        region: "North Africa",
        languages: ["Arabic", "French", "English"],
        specialty: ["Port Operations", "Mediterranean Shipping", "African Trade"],
        photo: "/client/public/container-logo.jpg"
      }
    ]
  },
  {
    country: "South Africa",
    flag: "🇿🇦",
    agents: [
      { 
        id: "agent-12", 
        name: "Thabo Motsepe", 
        role: "Regional Manager", 
        email: "tmotsepe@molochain.com", 
        phone: "",
        country: "South Africa",
        region: "Southern Africa",
        languages: ["English", "Zulu", "Afrikaans"],
        specialty: ["African Logistics", "Project Cargo", "Mining Industry"],
        photo: "/client/public/container-logo.jpg"
      }
    ]
  },
  {
    country: "Netherlands",
    flag: "🇳🇱",
    agents: [
      { 
        id: "agent-13", 
        name: "Jan de Vries", 
        role: "Port Operations Manager", 
        email: "jdevries@molochain.com", 
        phone: "",
        country: "Netherlands",
        region: "Europe",
        languages: ["Dutch", "English", "German"],
        specialty: ["Rotterdam Port Operations", "European Distribution", "Inland Navigation"],
        photo: "/client/public/container-logo.jpg"
      }
    ]
  }
];

const Contact = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("general");
  
  // Create form schema with translated error messages
  const formSchema = useMemo(() => createFormSchema(t), [t]);
  
  // Get global offices with translated content
  const globalOffices = useMemo(() => getGlobalOffices(t), [t]);
  
  // Get agent status from reliable HTTP system
  const { agents: agentStatuses, connectionStatus, error: wsError, isHttpMode, refresh } = useAgentStatus();
  const [showStatusDashboard, setShowStatusDashboard] = useState(true);
  
  // State for agent profile modal
  const [selectedAgent, setSelectedAgent] = useState<AgentStatus | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // State for calendar/scheduling modal
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  
  // State for performance metrics modal
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  
  // Sample performance data for the agent
  const [agentPerformanceData, setAgentPerformanceData] = useState<AgentPerformanceData>({
    responseTime: 15,
    satisfaction: 92,
    projectsCompleted: 5,
    avgResponseTime: 18.5,
    totalProjects: 32,
    rating: 4.7,
    onTimeDelivery: 98,
    clientRetention: 94,
    projectTypes: [
      { name: 'Container', value: 35 },
      { name: 'Trucking', value: 25 },
      { name: 'Air Freight', value: 15 },
      { name: 'Transit', value: 15 },
      { name: 'Agency', value: 10 },
    ]
  });
  
  // Handle message agent action
  const handleMessageAgent = (agent: AgentStatus) => {
    toast({
      title: "Messaging " + agent.name,
      description: "Opening direct messaging channel...",
    });
    // In a real application, this would open a chat interface or redirect to a messaging page
    // Messaging agent
  };
  
  // Handle scheduling a meeting with an agent
  const handleScheduleMeeting = (agent: AgentStatus) => {
    setSelectedAgent(agent);
    setIsCalendarModalOpen(true);
  };
  
  // Handle viewing agent performance metrics
  const handleViewPerformance = (agent: AgentStatus) => {
    setSelectedAgent(agent);
    setIsPerformanceModalOpen(true);
  };
  
  // Handle exporting agent performance metrics
  const handleExportPerformanceMetrics = (agent: AgentStatus, format: 'pdf' | 'csv') => {
    if (!agent) return;
    
    // Update performance data with agent-specific values
    const exportData: AgentPerformanceData = {
      ...agentPerformanceData,
      responseTime: agent.responseTime ? Number(agent.responseTime) : agentPerformanceData.responseTime,
      satisfaction: agent.connectionQuality ? Number(agent.connectionQuality) : agentPerformanceData.satisfaction,
      avgResponseTime: agent.responseTime ? Number(agent.responseTime) : agentPerformanceData.avgResponseTime,
    };
    
    if (format === 'csv') {
      exportPerformanceAsCSV(agent, exportData);
      toast({
        title: "Export Successful",
        description: `Performance metrics for ${agent.name} exported as CSV.`,
        variant: "default",
      });
    } else {
      exportPerformanceAsPDF(agent, exportData);
      toast({
        title: "Export Successful",
        description: `Performance metrics for ${agent.name} exported as PDF.`,
        variant: "default",
      });
    }
  };
  
  // State for filtered offices and agents
  const [filteredOffices, setFilteredOffices] = useState<Office[]>([]);
  const [filteredAgents, setFilteredAgents] = useState(regionalAgents);
  
  // Initialize filtered offices when globalOffices is available
  useEffect(() => {
    setFilteredOffices(globalOffices);
  }, [globalOffices]);
  
  // Reset filters when tab changes
  useEffect(() => {
    if (activeTab === "offices") {
      setFilteredOffices(globalOffices);
    } else if (activeTab === "agents") {
      setFilteredAgents(regionalAgents);
    }
  }, [activeTab, globalOffices]);
  
  // Note: Connection errors are shown inline in the UI banner, not as toasts
  // This provides a less intrusive user experience for non-critical status updates
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest('POST', '/api/contact/submit', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "We'll get back to you as soon as possible!",
      });
      form.reset();
      setLocation('/success');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    contactMutation.mutate(values);
  };

  const formatPhoneForTel = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  interface PhoneContactContent {
    phone: string;
    fax: string;
    note: string;
    whatsapp: string;
  }
  
  type ContactContentType = string | PhoneContactContent;
  
  interface ContactInfoItem {
    icon: React.ReactNode;
    title: string;
    content: ContactContentType;
    coordinates?: string;
  }
  
  const contactInfo: ContactInfoItem[] = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: t('contact.info.centerOffice'),
      content: t('contact.info.address'),
      coordinates: t('contact.info.coordinates'),
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: t('contact.info.phoneAndFax'),
      content: {
        phone: "",
        fax: "",
        note: "",
        whatsapp: ""
      },
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: t('contact.info.email'),
      content: "molochain@molochain.com",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: t('contact.info.hours'),
      content: t('contact.info.operatingHours'),
    },
  ];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">{t('contact.title')}</h1>
          <p className="mt-4 text-lg text-gray-600">
            {t('contact.subtitle')}
          </p>
          {connectionStatus === 'disconnected' && wsError && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                {t('contact.status.unavailable')}
              </p>
            </div>
          )}
        </div>

        <Tabs 
          defaultValue="general" 
          className="mb-12"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="general">{t('contact.tabs.generalInquiries')}</TabsTrigger>
            <TabsTrigger value="offices">{t('contact.tabs.globalOffices')}</TabsTrigger>
            <TabsTrigger value="agents">{t('contact.tabs.regionalAgents')}</TabsTrigger>
            <TabsTrigger value="services">{t('contact.tabs.professionalServices')}</TabsTrigger>
          </TabsList>
          
          {/* General Contact Information Tab */}
          <TabsContent value="general">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold mb-6">{t('contact.form.title')}</h2>
                <Card className="p-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contact.form.name')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('contact.form.placeholders.name')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contact.form.email')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('contact.form.placeholders.email')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contact.form.subject')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('contact.form.placeholders.subject')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contact.form.message')}</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t('contact.form.messagePlaceholder')}
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full">
                        {t('contact.form.submit')}
                      </Button>
                    </form>
                  </Form>
                </Card>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6">{t('contact.info.title')}</h2>
                <div className="grid gap-6">
                  {contactInfo.map((info) => (
                    <Card key={info.title} className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {info.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{info.title}</h3>
                          {info.title === t('contact.info.phoneAndFax') && typeof info.content !== 'string' ? (
                            <div className="space-y-1">
                              <p className="text-gray-600">
                                {t('contact.info.phone')}:{' '}
                                <a 
                                  href={`tel:${formatPhoneForTel((info.content as PhoneContactContent).phone)}`}
                                  className="text-primary hover:underline hover:text-primary/80 transition-colors"
                                >
                                  {(info.content as PhoneContactContent).phone}
                                </a>{' '}
                                {(info.content as PhoneContactContent).note}
                              </p>
                              <p className="text-gray-600">
                                {t('contact.info.fax')}: {(info.content as PhoneContactContent).fax}
                              </p>
                              <p className="text-gray-600">
                                {t('contact.info.whatsapp')}:{' '}
                                <a 
                                  href={`https://wa.me/${formatPhoneForTel((info.content as PhoneContactContent).whatsapp)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex px-3 py-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                                >
                                  {(info.content as PhoneContactContent).whatsapp}
                                </a>
                              </p>
                            </div>
                          ) : info.title === t('contact.info.email') && typeof info.content === 'string' ? (
                            <a 
                              href={`mailto:${info.content}`}
                              className="text-primary hover:underline hover:text-primary/80 transition-colors"
                            >
                              {info.content}
                            </a>
                          ) : (
                            <>
                              <p className="text-gray-600 whitespace-pre-line">
                                {typeof info.content === 'string' ? info.content : ''}
                              </p>
                              {info.coordinates && (
                                <p className="text-sm text-gray-500 mt-1">{info.coordinates}</p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-6">{t('contact.info.headquartersLocation')}</h2>
                  <Card className="p-4">
                    <div className="aspect-video bg-gray-100 rounded-lg">
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        {t('contact.info.mapPlaceholder')}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Global Offices Tab */}
          <TabsContent value="offices">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{t('contact.offices.title')}</h2>
              <p className="text-gray-600">
                {t('contact.offices.subtitle')}
              </p>
            </div>
            
            {/* Office search and filter component */}
            <OfficeSearch 
              offices={globalOffices} 
              onFilter={(filteredOffices) => setFilteredOffices(filteredOffices)} 
            />
            
            {filteredOffices.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mb-4 text-gray-400">
                  <Building className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{t('contact.offices.noOffices')}</h3>
                <p className="text-gray-600">{t('contact.offices.noOfficesHint')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOffices.map((office) => (
                  <AnimatedCard 
                    key={office.id}
                    effect="lift"
                    className="overflow-hidden border"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                          <div className={cn(iconAnimation({ effect: 'scale' }))}>
                            <Building className="w-6 h-6" />
                          </div>
                        </div>
                        <Badge 
                          variant={office.type === "headquarter" ? "default" : office.type === "regional" ? "outline" : "secondary"}
                          className="mt-1"
                        >
                          {office.type === "headquarter" ? t('contact.offices.headquarters') : office.type === "regional" ? t('contact.offices.regional') : t('contact.offices.port')}
                        </Badge>
                      </div>
                      <CardTitle className="flex items-center">
                        {office.name}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Flag className="w-4 h-4 mr-1" /> {office.country}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                          <MapPin className="inline-block w-4 h-4 mr-1" /> 
                          <span className="align-middle">{office.address}</span>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <Phone className="inline-block w-4 h-4 mr-1" />
                          <a 
                            href={`tel:${formatPhoneForTel(office.phone)}`}
                            className="align-middle text-primary hover:underline"
                          >
                            {office.phone}
                          </a>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <Mail className="inline-block w-4 h-4 mr-1" />
                          <a 
                            href={`mailto:${office.email}`}
                            className="align-middle text-primary hover:underline"
                          >
                            {office.email}
                          </a>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <Clock className="inline-block w-4 h-4 mr-1" />
                          <span className="align-middle">{office.timezone} | {office.operatingHours}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">{t('contact.offices.services')}</p>
                        <div className="flex flex-wrap gap-2">
                          {office.services.map((service) => (
                            <Badge key={service} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </AnimatedCard>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Regional Agents Tab */}
          <TabsContent value="agents">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{t('contact.agents.title')}</h2>
              <p className="text-gray-600">
                {t('contact.agents.subtitle')}
              </p>
            </div>
            
            {/* WebSocket connection status indicator */}
            {connectionStatus === 'connected' ? (
              <div className="flex items-center mb-4 text-sm text-green-600">
                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-600 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  {t('contact.agents.liveEnabled')}
                </Badge>
              </div>
            ) : (
              <div className="flex items-center mb-4 text-sm text-gray-500">
                <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-500 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {t('contact.agents.liveDisabled')}
                </Badge>
              </div>
            )}
            
            {/* Agent Status Dashboard */}
            {showStatusDashboard && (
              <div className="mb-6">
                <AgentStatusVisualization 
                  agentStatuses={agentStatuses}
                  isConnected={connectionStatus === 'connected'}
                  error={wsError}
                  onAgentClick={(agent) => {
                    setSelectedAgent(agent);
                    setIsProfileModalOpen(true);
                  }}
                />
                <div className="flex justify-end mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowStatusDashboard(false)}
                    className="text-xs"
                  >
                    {t('contact.agents.hideDashboard')}
                  </Button>
                </div>
              </div>
            )}
            
            {!showStatusDashboard && (
              <div className="mb-6 text-right">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowStatusDashboard(true)}
                  className="text-xs"
                >
                  {t('contact.agents.showDashboard')}
                </Button>
              </div>
            )}
            
            {/* Agent search and filter component */}
            <AgentSearch 
              regionalAgents={regionalAgents} 
              onFilter={(filteredAgents) => setFilteredAgents(filteredAgents)}
              agentStatuses={agentStatuses}
            />
            
            {filteredAgents.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mb-4 text-gray-400">
                  <Users className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{t('contact.agents.noAgents')}</h3>
                <p className="text-gray-600">{t('contact.offices.noOfficesHint')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAgents.map((region) => (
                  <div key={region.country} className="space-y-6">
                    <Card className="overflow-hidden">
                      <CardHeader className="bg-primary/5 pb-3">
                        <CardTitle className="flex items-center text-xl">
                          <span className="mr-2 text-2xl">{region.flag}</span> {region.country}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-4">
                          {region.agents.map((agent) => {
                            // Find agent status from WebSocket if available
                            const agentStatus = agentStatuses.find(
                              status => status.id === agent.id
                            );
                            
                            return (
                              <AgentCard 
                                key={agent.id} 
                                agent={agent}
                                agentStatus={agentStatus}
                              />
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Professional Services Tab */}
          <TabsContent value="services">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{t('contact.services.title')}</h2>
              <p className="text-gray-600">
                {t('contact.services.subtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {professionalTeams.map((team) => (
                <AnimatedCard 
                  key={team.id}
                  effect="lift"
                  className="overflow-hidden border"
                >
                  <CardHeader>
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                      <div className={cn(iconAnimation({ effect: 'scale' }))}>
                        {team.icon}
                      </div>
                    </div>
                    <CardTitle>{team.title}</CardTitle>
                    <CardDescription className="mt-2">{team.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex gap-3">
                          <Mail className="w-5 h-5 text-primary" />
                          <a 
                            href={`mailto:${team.contactEmail}`}
                            className="text-primary hover:underline"
                          >
                            {team.contactEmail}
                          </a>
                        </div>
                        <div className="flex gap-3">
                          <Phone className="w-5 h-5 text-primary" />
                          <a 
                            href={`tel:${formatPhoneForTel(team.contactPhone)}`}
                            className="text-primary hover:underline"
                          >
                            {team.contactPhone}
                          </a>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">{t('contact.services.expertise')}</p>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {team.skills.map((skill, index) => (
                            <li 
                              key={index} 
                              className="flex items-center opacity-0 animate-fadeIn group"
                              style={{ 
                                animationDelay: `${index * 100 + 300}ms`, 
                                animationFillMode: 'forwards' 
                              }}
                            >
                              <span 
                                className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2 group-hover:bg-primary group-hover:scale-125 transition-all duration-300" 
                              />
                              <span className="group-hover:text-gray-900 transition-colors">
                                {skill}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md mt-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">{t('contact.services.availability')}</p>
                            <p className="text-gray-600">{team.availability}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">{t('contact.services.responseTime')}</p>
                            <p className="text-gray-600">{team.responseTime}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </AnimatedCard>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Global presence map */}
        <div className="mt-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">{t('contact.network.title')}</h2>
            <p className="mt-2 text-gray-600">
              {t('contact.network.subtitle')}
            </p>
          </div>
          <Card className="p-4">
            <ContactMap offices={globalOffices.map(office => ({
              id: office.id,
              name: office.name,
              country: office.country,
              coordinates: office.coordinates,
              type: office.type,
              services: office.services, 
              email: office.email,
              phone: office.phone
            }))} />
          </Card>
        </div>
        
        {/* Agent Profile Modal - displayed when an agent is clicked */}
        <AgentProfileModal
          agent={selectedAgent}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onMessageAgent={handleMessageAgent}
          onScheduleMeeting={handleScheduleMeeting}
          onViewPerformance={handleViewPerformance}
        />
        
        {/* Calendar modal for scheduling meetings */}
        {selectedAgent && (
          <Dialog open={isCalendarModalOpen} onOpenChange={setIsCalendarModalOpen}>
            <DialogContent className="sm:max-w-[500px] p-0">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle>Schedule a Meeting</DialogTitle>
                <DialogDescription>
                  Select a date and time to meet with {selectedAgent.name}
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 pt-0">
                <AgentCalendar 
                  agent={selectedAgent} 
                  onClose={() => setIsCalendarModalOpen(false)} 
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Performance Metrics modal */}
        {selectedAgent && (
          <Dialog open={isPerformanceModalOpen} onOpenChange={setIsPerformanceModalOpen}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle>Performance Metrics</DialogTitle>
                <DialogDescription>
                  Detailed performance analytics for {selectedAgent.name}
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 pt-0">
                <AgentPerformanceMetrics 
                  agent={selectedAgent}
                  onExportMetrics={handleExportPerformanceMetrics}
                />
              </div>
              <DialogFooter className="p-6 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsPerformanceModalOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Contact;