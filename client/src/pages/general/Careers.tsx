import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import {
  Briefcase, MapPin, Clock, Users, TrendingUp, Globe, Heart, 
  GraduationCap, Award, Building2, ChevronRight, Send, Search
} from "lucide-react";

const benefits = [
  { icon: <Globe className="h-6 w-6" />, title: "Global Opportunities", description: "Work with teams across 150+ countries" },
  { icon: <TrendingUp className="h-6 w-6" />, title: "Career Growth", description: "Clear paths for advancement and development" },
  { icon: <Heart className="h-6 w-6" />, title: "Health & Wellness", description: "Comprehensive healthcare and wellness programs" },
  { icon: <GraduationCap className="h-6 w-6" />, title: "Learning & Development", description: "Continuous training and skill development" },
  { icon: <Users className="h-6 w-6" />, title: "Team Culture", description: "Collaborative and inclusive work environment" },
  { icon: <Award className="h-6 w-6" />, title: "Recognition", description: "Performance-based rewards and recognition" }
];

const openPositions = [
  {
    id: 1,
    title: "Senior Logistics Coordinator",
    department: "Operations",
    location: "Istanbul, Turkey",
    type: "Full-time",
    description: "Lead logistics operations and coordinate global shipments for major clients."
  },
  {
    id: 2,
    title: "Full Stack Developer",
    department: "Technology",
    location: "Remote",
    type: "Full-time",
    description: "Build and maintain our cutting-edge logistics platform and APIs."
  },
  {
    id: 3,
    title: "Business Development Manager",
    department: "Sales",
    location: "Dubai, UAE",
    type: "Full-time",
    description: "Expand our client base and develop strategic partnerships."
  },
  {
    id: 4,
    title: "Supply Chain Analyst",
    department: "Analytics",
    location: "London, UK",
    type: "Full-time",
    description: "Analyze supply chain data and optimize logistics operations."
  },
  {
    id: 5,
    title: "Customer Success Manager",
    department: "Customer Service",
    location: "Rotterdam, Netherlands",
    type: "Full-time",
    description: "Ensure client satisfaction and manage key accounts."
  },
  {
    id: 6,
    title: "Customs Specialist",
    department: "Compliance",
    location: "Shanghai, China",
    type: "Full-time",
    description: "Handle customs documentation and ensure regulatory compliance."
  }
];

export default function Careers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const departments = ["all", ...new Set(openPositions.map(p => p.department))];

  const filteredPositions = openPositions.filter(position => {
    const matchesSearch = position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || position.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-background dark:from-blue-950/20 dark:to-background">
      <section className="relative py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20" data-testid="badge-careers">
              <Briefcase className="h-3 w-3 mr-1" />
              Careers
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-careers-title">
              Join Our <span className="text-primary">Global Team</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8" data-testid="text-careers-subtitle">
              Build your career with a company that's revolutionizing global logistics. 
              We're always looking for talented individuals to join our mission.
            </p>
            <Button size="lg" className="gap-2" data-testid="button-view-positions">
              View Open Positions
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-benefits-title">Why Work With Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We offer more than just a job. Join a team that values innovation, growth, and work-life balance.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow" data-testid={`card-benefit-${index}`}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-positions-title">Open Positions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our current openings and find the perfect role for your skills and aspirations.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-positions"
              />
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {departments.map(dept => (
                <Button
                  key={dept}
                  variant={selectedDepartment === dept ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDepartment(dept)}
                  data-testid={`button-filter-${dept}`}
                >
                  {dept === "all" ? "All Departments" : dept}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 max-w-4xl mx-auto">
            {filteredPositions.map(position => (
              <Card key={position.id} className="hover:shadow-md transition-shadow" data-testid={`card-position-${position.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{position.title}</h3>
                        <Badge variant="secondary">{position.department}</Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{position.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {position.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {position.type}
                        </span>
                      </div>
                    </div>
                    <Button className="gap-2" data-testid={`button-apply-${position.id}`}>
                      Apply Now
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPositions.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No positions found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-cta-title">Don't See the Right Role?</h2>
            <p className="text-lg opacity-90 mb-8">
              We're always looking for exceptional talent. Send us your resume and we'll keep you in mind for future opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" variant="secondary" className="gap-2" data-testid="button-contact-us">
                  Contact Us
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
