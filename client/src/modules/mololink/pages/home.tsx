import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Award,
  Building2,
  ShoppingBag,
  Globe,
  Shield,
  Zap,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Star,
  Network,
  Truck,
  Ship,
  Plane,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/layout/Navigation";
import Header from "../components/header";
import MobileNav from "../components/mobile-nav";
import CreatePost from "../components/create-post";
import PostCard from "../components/post-card";
import ProfileSidebar from "../components/profile-sidebar";
import SuggestionsSidebar from "../components/suggestions-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "../lib/auth";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface PostWithUser {
  id: string;
  content: string;
  imageUrl?: string;
  hashtags?: string[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    title?: string;
    company?: string;
    profileImage?: string;
  } | null;
}

const features = [
  {
    icon: Network,
    title: "Build Professional Networks",
    description: "Connect with logistics professionals worldwide and expand your industry network",
    color: "text-blue-600 bg-blue-100"
  },
  {
    icon: TrendingUp,
    title: "Share Industry Insights",
    description: "Exchange knowledge, best practices, and stay updated with industry trends",
    color: "text-green-600 bg-green-100"
  },
  {
    icon: Briefcase,
    title: "Discover Opportunities",
    description: "Find your next career move or recruit top talent in logistics",
    color: "text-purple-600 bg-purple-100"
  },
  {
    icon: Award,
    title: "Showcase Skills",
    description: "Display your expertise and receive endorsements from industry peers",
    color: "text-orange-600 bg-orange-100"
  },
  {
    icon: Building2,
    title: "Connect with Companies",
    description: "Follow leading logistics companies and stay informed about their updates",
    color: "text-indigo-600 bg-indigo-100"
  },
  {
    icon: ShoppingBag,
    title: "Access Marketplace",
    description: "Explore logistics services, solutions, and business opportunities",
    color: "text-red-600 bg-red-100"
  }
];

const stats = [
  { value: "50K+", label: "Professionals", icon: Users },
  { value: "10K+", label: "Companies", icon: Building2 },
  { value: "25K+", label: "Job Listings", icon: Briefcase },
  { value: "100K+", label: "Connections", icon: Network }
];

const testimonials = [
  {
    quote: "MOLOLINK transformed how I network in the logistics industry. The platform's focus on our sector makes every connection valuable.",
    author: "Sarah Chen",
    title: "Supply Chain Director",
    company: "Global Logistics Corp",
    rating: 5
  },
  {
    quote: "Finally, a professional network that understands logistics! I've found amazing talent and business partners through MOLOLINK.",
    author: "Michael Rodriguez",
    title: "CEO",
    company: "FastTrack Shipping",
    rating: 5
  },
  {
    quote: "The marketplace feature has been a game-changer for discovering new logistics solutions and service providers.",
    author: "Emma Thompson",
    title: "Operations Manager",
    company: "Continental Freight",
    rating: 5
  }
];

export default function Home() {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { data: posts, isLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/posts"],
    enabled: !!user
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // If user is logged in, show the feed view
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Main MoloChain Navigation */}
        <Navigation />
        {/* MOLOLINK Secondary Navigation */}
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <ProfileSidebar />
            </div>
            <div className="lg:col-span-2">
              <CreatePost />
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-start space-x-3 mb-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-3 w-[300px]" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <Skeleton className="h-40 w-full mt-4 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4" data-testid="posts-container">
                  {posts?.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                  {(!posts || posts.length === 0) && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No posts yet. Be the first to share something!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="lg:col-span-1">
              <SuggestionsSidebar />
            </div>
          </div>
        </div>
        <MobileNav />
        <div className="md:hidden h-20"></div>
      </div>
    );
  }

  // Landing page for non-logged in users
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Main MoloChain Navigation */}
      <Navigation />
      
      {/* MOLOLINK Header Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm border-b border-blue-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <Network className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  MOLOLINK
                </h1>
                <p className="text-xs text-gray-600">Professional Logistics Network</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/mololink/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/mololink/register">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - adjusted padding for both navbars */}
      <section className="pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge className="mb-4" variant="outline">
              <Zap className="h-3 w-3 mr-1" />
              Exclusively for Logistics Professionals
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              Connect. Collaborate. Grow.
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              MOLOLINK is the specialized professional networking platform designed exclusively for the logistics and supply chain industry. Build meaningful connections that drive your career forward.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                <MessageSquare className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </div>

            {/* Floating Icons Animation */}
            <div className="relative h-64 overflow-hidden">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute left-1/4 top-10"
              >
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Truck className="h-8 w-8 text-blue-600" />
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute right-1/4 top-20"
              >
                <div className="p-3 bg-green-100 rounded-lg">
                  <Ship className="h-8 w-8 text-green-600" />
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3.5, repeat: Infinity }}
                className="absolute left-1/3 bottom-20"
              >
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Plane className="h-8 w-8 text-purple-600" />
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 4.5, repeat: Infinity }}
                className="absolute right-1/3 bottom-10"
              >
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Package className="h-8 w-8 text-orange-600" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg mb-4">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">Features</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              MOLOLINK provides all the tools and connections you need to thrive in the logistics industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-0 bg-white">
                  <CardHeader>
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.color} mb-4`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">How It Works</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Your Profile",
                description: "Sign up and build your professional profile showcasing your logistics expertise"
              },
              {
                step: "2",
                title: "Connect & Network",
                description: "Find and connect with industry professionals, companies, and potential partners"
              },
              {
                step: "3",
                title: "Grow Your Career",
                description: "Access opportunities, share insights, and advance your logistics career"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <ArrowRight className="h-8 w-8 text-blue-300 mx-auto" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">Testimonials</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Strategic Partners
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                    <div className="border-t pt-4">
                      <p className="font-semibold text-gray-900">{testimonial.author}</p>
                      <p className="text-sm text-gray-600">{testimonial.title}</p>
                      <p className="text-sm text-blue-600">{testimonial.company}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Logistics Network?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of logistics professionals already using MOLOLINK to advance their careers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg">
                  Start Free Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                Schedule Demo
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-6 text-white/90">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                <span>Enterprise security</span>
              </div>
              <div className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                <span>Global network</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/security">Security</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Solutions</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/recruiting">Recruiting</Link></li>
                <li><Link href="/marketing">Marketing</Link></li>
                <li><Link href="/sales">Sales</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/api">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/careers">Careers</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <Network className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold">MOLOLINK</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 MOLOLINK. Part of MoloChain Global Logistics Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}