import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Package, Truck, Globe, Warehouse, FileCheck, Shield,
  BarChart3, Zap, Target, Users, ChevronRight, ArrowRight,
  Ship, Plane, Network, BrainCircuit
} from "lucide-react";

const solutions = [
  {
    id: "freight-forwarding",
    title: "Freight Forwarding",
    description: "End-to-end freight management across air, sea, and land transportation modes.",
    icon: <Package className="h-8 w-8" />,
    features: ["Multi-modal shipping", "Real-time tracking", "Customs clearance", "Documentation support"],
    color: "from-blue-500 to-blue-600"
  },
  {
    id: "supply-chain",
    title: "Supply Chain Management",
    description: "Comprehensive supply chain solutions to optimize your logistics operations.",
    icon: <Network className="h-8 w-8" />,
    features: ["Inventory management", "Demand forecasting", "Vendor management", "Route optimization"],
    color: "from-purple-500 to-purple-600"
  },
  {
    id: "warehousing",
    title: "Warehousing & Distribution",
    description: "Strategic warehouse locations with advanced inventory management systems.",
    icon: <Warehouse className="h-8 w-8" />,
    features: ["Global warehouse network", "Pick & pack services", "Cold storage", "Cross-docking"],
    color: "from-green-500 to-green-600"
  },
  {
    id: "customs",
    title: "Customs Brokerage",
    description: "Expert customs clearance and compliance services for smooth international trade.",
    icon: <FileCheck className="h-8 w-8" />,
    features: ["Import/export clearance", "Tariff classification", "Duty optimization", "Compliance audits"],
    color: "from-orange-500 to-orange-600"
  },
  {
    id: "ecommerce",
    title: "E-Commerce Logistics",
    description: "Tailored fulfillment solutions for online retailers of all sizes.",
    icon: <Globe className="h-8 w-8" />,
    features: ["Order fulfillment", "Returns management", "Last-mile delivery", "Integration APIs"],
    color: "from-pink-500 to-pink-600"
  },
  {
    id: "analytics",
    title: "Analytics & Insights",
    description: "Data-driven insights to optimize your logistics performance and costs.",
    icon: <BarChart3 className="h-8 w-8" />,
    features: ["Performance dashboards", "Cost analysis", "Predictive analytics", "Custom reports"],
    color: "from-cyan-500 to-cyan-600"
  }
];

const industries = [
  { name: "Retail & E-Commerce", icon: <Globe className="h-5 w-5" /> },
  { name: "Manufacturing", icon: <Package className="h-5 w-5" /> },
  { name: "Automotive", icon: <Truck className="h-5 w-5" /> },
  { name: "Healthcare", icon: <Shield className="h-5 w-5" /> },
  { name: "Technology", icon: <Zap className="h-5 w-5" /> },
  { name: "Food & Beverage", icon: <Warehouse className="h-5 w-5" /> }
];

export default function Solutions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-background dark:from-blue-950/20 dark:to-background">
      <section className="relative py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20" data-testid="badge-solutions">
              <Target className="h-3 w-3 mr-1" />
              Solutions
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-solutions-title">
              Logistics Solutions for <span className="text-primary">Every Business</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8" data-testid="text-solutions-subtitle">
              From freight forwarding to warehouse management, we provide comprehensive 
              logistics solutions tailored to your industry needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/mololink/marketplace">
                <Button size="lg" className="gap-2" data-testid="button-explore-marketplace">
                  Explore Marketplace
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="gap-2" data-testid="button-contact-sales">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-core-solutions">Our Core Solutions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive logistics solutions designed to streamline your supply chain and reduce costs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((solution) => (
              <Card key={solution.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden" data-testid={`card-solution-${solution.id}`}>
                <CardHeader className={`bg-gradient-to-br ${solution.color} text-white p-6`}>
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-white/20 rounded-lg">
                      {solution.icon}
                    </div>
                    <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <CardTitle className="text-xl mt-4">{solution.title}</CardTitle>
                  <CardDescription className="text-white/80">
                    {solution.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-2">
                    {solution.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full mt-4 gap-2" data-testid={`button-learn-more-${solution.id}`}>
                    Learn More
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-industries">Industries We Serve</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We have deep expertise across multiple industries, providing specialized solutions for each sector.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {industries.map((industry, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-6 py-3 text-base flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                data-testid={`badge-industry-${index}`}
              >
                {industry.icon}
                {industry.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-cta-title">Ready to Transform Your Logistics?</h2>
            <p className="text-lg opacity-90 mb-8">
              Connect with our team to discover how MOLOLINK can optimize your supply chain operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" variant="secondary" className="gap-2" data-testid="button-get-started">
                  Get Started Today
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
