import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  BookOpen, FileText, Video, Download, ExternalLink, ChevronRight,
  GraduationCap, Newspaper, HelpCircle, MessageSquare, Calendar,
  ArrowRight, Play, Clock
} from "lucide-react";

const resourceCategories = [
  {
    id: "guides",
    title: "Guides & Tutorials",
    description: "Step-by-step guides to help you get the most out of MOLOLINK.",
    icon: <BookOpen className="h-6 w-6" />,
    count: "15+ guides",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
  },
  {
    id: "whitepapers",
    title: "Whitepapers",
    description: "In-depth research and analysis on logistics industry trends.",
    icon: <FileText className="h-6 w-6" />,
    count: "8 papers",
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
  },
  {
    id: "webinars",
    title: "Webinars & Videos",
    description: "Watch recorded sessions from industry experts.",
    icon: <Video className="h-6 w-6" />,
    count: "20+ videos",
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
  },
  {
    id: "case-studies",
    title: "Case Studies",
    description: "Real success stories from our clients around the world.",
    icon: <GraduationCap className="h-6 w-6" />,
    count: "12 cases",
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
  }
];

const featuredResources = [
  {
    id: 1,
    title: "The Ultimate Guide to Freight Forwarding",
    description: "Everything you need to know about international freight forwarding and how to optimize your shipping operations.",
    type: "Guide",
    readTime: "15 min read",
    image: "/attached_assets/generated_images/freight-forwarding-guide.png"
  },
  {
    id: 2,
    title: "2025 Global Logistics Trends Report",
    description: "Key insights and predictions for the logistics industry in 2025 and beyond.",
    type: "Whitepaper",
    readTime: "25 min read",
    image: "/attached_assets/generated_images/logistics-trends.png"
  },
  {
    id: 3,
    title: "Optimizing Your Supply Chain with AI",
    description: "Learn how artificial intelligence is transforming supply chain management and logistics.",
    type: "Webinar",
    readTime: "45 min watch",
    image: "/attached_assets/generated_images/ai-supply-chain.png"
  }
];

const upcomingEvents = [
  {
    id: 1,
    title: "MOLOLINK Platform Deep Dive",
    date: "January 15, 2025",
    time: "2:00 PM UTC",
    type: "Webinar"
  },
  {
    id: 2,
    title: "Supply Chain Resilience Workshop",
    date: "January 22, 2025",
    time: "3:00 PM UTC",
    type: "Workshop"
  },
  {
    id: 3,
    title: "E-Commerce Logistics Masterclass",
    date: "February 5, 2025",
    time: "1:00 PM UTC",
    type: "Masterclass"
  }
];

export default function Resources() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-background dark:from-blue-950/20 dark:to-background">
      <section className="relative py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20" data-testid="badge-resources">
              <BookOpen className="h-3 w-3 mr-1" />
              Resources
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-resources-title">
              Learning <span className="text-primary">Resources</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8" data-testid="text-resources-subtitle">
              Access guides, whitepapers, webinars, and more to help you succeed 
              in the ever-evolving logistics landscape.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {resourceCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer group" data-testid={`card-category-${category.id}`}>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4`}>
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">{category.description}</p>
                  <Badge variant="secondary">{category.count}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold" data-testid="text-featured">Featured Resources</h2>
            <Button variant="outline" className="gap-2" data-testid="button-view-all">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredResources.map((resource) => (
              <Card key={resource.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden" data-testid={`card-resource-${resource.id}`}>
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {resource.type === "Webinar" ? (
                      <div className="w-14 h-14 bg-primary/90 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <Play className="h-6 w-6 ml-1" />
                      </div>
                    ) : (
                      <Download className="h-10 w-10 text-primary/60 group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{resource.type}</Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {resource.readTime}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {resource.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center" data-testid="text-upcoming-events">
              Upcoming Events
            </h2>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow" data-testid={`card-event-${event.id}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <Badge variant="secondary" className="mb-2">{event.type}</Badge>
                          <h3 className="font-semibold">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {event.date} at {event.time}
                          </p>
                        </div>
                      </div>
                      <Button className="gap-2" data-testid={`button-register-${event.id}`}>
                        Register
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-4" data-testid="text-cta-title">Need More Help?</h2>
            <p className="text-lg opacity-90 mb-8">
              Our support team is ready to assist you with any questions about our platform or services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" variant="secondary" className="gap-2" data-testid="button-contact-support">
                  Contact Support
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/faq">
                <Button size="lg" variant="outline" className="gap-2 bg-transparent border-white text-white hover:bg-white hover:text-primary" data-testid="button-faq">
                  View FAQ
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
