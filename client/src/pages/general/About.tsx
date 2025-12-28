import { useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe, Users, Award, Target, Shield, Zap, Heart, Lightbulb,
  Building2, MapPin, Mail, ArrowRight, CheckCircle,
  TrendingUp, Clock, Handshake, Truck, Plane, Ship, Container
} from "lucide-react";

const stats = [
  { label: "Countries", value: "180+", icon: Globe, description: "Global presence across continents" },
  { label: "Services", value: "46+", icon: Container, description: "Comprehensive logistics solutions" },
  { label: "Years Experience", value: "25+", icon: Award, description: "Industry expertise since 1999" },
  { label: "Active Customers", value: "10K+", icon: Users, description: "Trusted by businesses worldwide" }
];

const values = [
  {
    icon: Shield,
    title: "Reliability",
    description: "We deliver on our promises with consistent, dependable service that you can count on."
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Leveraging cutting-edge technology to optimize logistics and drive efficiency."
  },
  {
    icon: Heart,
    title: "Customer Focus",
    description: "Your success is our priority. We build lasting partnerships through exceptional service."
  },
  {
    icon: Lightbulb,
    title: "Transparency",
    description: "Clear communication and real-time visibility throughout your supply chain."
  },
  {
    icon: TrendingUp,
    title: "Excellence",
    description: "Committed to continuous improvement and delivering best-in-class solutions."
  },
  {
    icon: Handshake,
    title: "Integrity",
    description: "Operating with honesty and ethical standards in every business relationship."
  }
];

const offices = [
  {
    city: "Istanbul",
    country: "Turkey",
    type: "Global Headquarters",
    address: "Maslak Business District",
    services: ["Operations", "Strategy", "Technology"]
  },
  {
    city: "Dubai",
    country: "UAE",
    type: "Regional Hub",
    address: "Business Bay",
    services: ["Middle East Operations", "Air Freight"]
  },
  {
    city: "Hamburg",
    country: "Germany",
    type: "European Office",
    address: "HafenCity",
    services: ["European Distribution", "Ocean Freight"]
  },
  {
    city: "Singapore",
    country: "Singapore",
    type: "Asia Pacific Hub",
    address: "Marina Bay",
    services: ["APAC Operations", "Transit Services"]
  }
];

const leadership = [
  { name: "Executive Team", role: "Strategic Leadership", description: "Guiding Molochain's global vision and growth strategy" },
  { name: "Operations Team", role: "Global Operations", description: "Managing worldwide logistics network and service delivery" },
  { name: "Technology Team", role: "Innovation & Tech", description: "Driving digital transformation and platform development" },
  { name: "Commercial Team", role: "Business Development", description: "Building partnerships and expanding market presence" }
];

export default function About() {
  useEffect(() => {
    document.title = "About Us - MoloChain | Global Logistics Solutions";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Learn about MoloChain - a global logistics leader operating in 180+ countries with 25+ years of experience. Discover our mission, values, and commitment to excellence in supply chain solutions.'
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-10 animate-pulse" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge className="mb-4 bg-white/10 text-white border-white/20" data-testid="badge-about-hero">
              About MoloChain
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              Connecting the World Through Logistics
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              For over 25 years, MoloChain has been at the forefront of global logistics, 
              delivering innovative solutions that keep businesses moving and economies growing.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/services">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-900 hover:bg-blue-50"
                  data-testid="button-explore-services"
                >
                  Explore Our Services
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10"
                  data-testid="button-contact-us"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 -mt-24 relative z-10">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index} 
                className="bg-white dark:bg-gray-800 shadow-xl border-0"
                data-testid={`card-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.description}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-4" data-testid="badge-our-mission">Our Mission</Badge>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Empowering Global Trade Through Innovation
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              At MoloChain, we believe that efficient logistics is the backbone of global commerce. 
              Our mission is to provide seamless, technology-driven supply chain solutions that 
              enable businesses of all sizes to compete on the world stage.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Founded with a vision to revolutionize logistics, we've grown from a regional 
              freight forwarder to a comprehensive global logistics provider. Today, we serve 
              over 10,000 customers across 180+ countries, offering 46+ specialized services.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-500" />
                ISO 9001:2015 Certified
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-500" />
                AEO Authorized
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-500" />
                IATA Member
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <Truck className="w-8 h-8 mb-3" />
                <div className="text-2xl font-bold">Land</div>
                <div className="text-sm text-blue-100">Global trucking network</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white">
                <Ship className="w-8 h-8 mb-3" />
                <div className="text-2xl font-bold">Sea</div>
                <div className="text-sm text-indigo-100">Ocean freight excellence</div>
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                <Plane className="w-8 h-8 mb-3" />
                <div className="text-2xl font-bold">Air</div>
                <div className="text-sm text-purple-100">Express air cargo</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-6 text-white">
                <Container className="w-8 h-8 mb-3" />
                <div className="text-2xl font-bold">Multimodal</div>
                <div className="text-sm text-cyan-100">Integrated solutions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4" data-testid="badge-our-values">Our Values</Badge>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Drives Us Forward
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our core values define who we are and guide every decision we make in serving our customers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card 
                  key={index} 
                  className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow"
                  data-testid={`card-value-${value.title.toLowerCase()}`}
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <Badge className="mb-4" data-testid="badge-leadership">Our Leadership</Badge>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Expert Team Driving Excellence
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our leadership team brings decades of combined experience in global logistics and supply chain management.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {leadership.map((leader, index) => (
            <Card 
              key={index} 
              className="text-center hover:shadow-lg transition-shadow"
              data-testid={`card-leadership-${index}`}
            >
              <CardContent className="p-6">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{leader.name}</h3>
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">{leader.role}</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{leader.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4" data-testid="badge-global-presence">Global Presence</Badge>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Strategically Located Worldwide
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our global network of offices ensures we're always close to where you need us.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {offices.map((office, index) => (
              <Card 
                key={index} 
                className="bg-white dark:bg-gray-800 border-0 shadow-lg"
                data-testid={`card-office-${office.city.toLowerCase()}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <Badge variant="secondary" className="text-xs">{office.type}</Badge>
                  </div>
                  <CardTitle className="text-lg">{office.city}</CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{office.country}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                    {office.address}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {office.services.map((service, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{service}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Partner with MoloChain?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
            Join thousands of businesses worldwide who trust MoloChain for their logistics needs. 
            Let's discuss how we can help optimize your supply chain.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100"
                data-testid="button-get-in-touch"
              >
                <Mail className="w-4 h-4 mr-2" />
                Get in Touch
              </Button>
            </Link>
            <Link href="/services">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                data-testid="button-view-services"
              >
                View All Services
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mt-8 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              24/7 Support
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              180+ Countries
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Secure & Reliable
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
