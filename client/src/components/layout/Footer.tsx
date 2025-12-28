import { Link } from "wouter";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Globe,
  Truck,
  Package,
  Users,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  Shield,
  DollarSign,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useCMSSettings } from '@/hooks/use-cms';

const Footer = () => {
  const [email, setEmail] = useState("");
  const { data: settings } = useCMSSettings();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
  };

  const currentYear = new Date().getFullYear();
  const footerSections = {
    services: {
      title: "Services",
      links: [
        { href: "/services#freight", label: "Freight Shipping" },
        { href: "/services#warehouse", label: "Warehousing" },
        { href: "/services#distribution", label: "Distribution" },
        { href: "/tracking", label: "Track Shipment" }
      ]
    },
    solutions: {
      title: "Solutions",
      links: [
        { href: "https://mololink.molochain.com", label: "MOLOLINK Platform" },
        { href: "/ecosystem", label: "Ecosystem" },
        { href: "/partners", label: "Our Partners" },
        { href: "/services", label: "All Services" }
      ]
    },
    company: {
      title: "Company",
      links: [
        { href: "/about", label: "About Us" },
        { href: "/investor", label: "Investor Relations" },
        { href: "/contact", label: "Contact" },
        { href: "/careers", label: "Careers" }
      ]
    },
    support: {
      title: "Support",
      links: [
        { href: "/contact", label: "Help & Support" },
        { href: "/quote", label: "Get Quote" },
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" }
      ]
    }
  };

  const socialLinks = [
    { icon: Facebook, href: settings?.facebook_url || "https://facebook.com/MOLOCHAIN", label: "Facebook" },
    { icon: Twitter, href: settings?.twitter_url || "https://twitter.com/MOLOCHAIN", label: "Twitter" },
    { icon: Linkedin, href: settings?.linkedin_url || "https://linkedin.com/company/molochain", label: "LinkedIn" },
    { icon: Instagram, href: settings?.instagram_url || "https://instagram.com/MOLOCHAIN", label: "Instagram" }
  ];

  return (
    <footer className="relative bg-gradient-to-b from-background to-primary/5 border-t">
      {/* Newsletter Section */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold flex items-center gap-2 justify-center md:justify-start">
                <Sparkles className="h-6 w-6 text-primary" />
                Stay Connected
              </h3>
              <p className="mt-2 text-muted-foreground">
                Get the latest updates on logistics innovations and exclusive offers
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full md:w-64"
                required
              />
              <Button type="submit" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Link href="/">
                <div className="flex items-center gap-3 group cursor-pointer">
                  <img 
                    src="/molochain-logo.png" 
                    alt="MOLOCHAIN" 
                    className="h-10 w-auto transition-transform group-hover:scale-105"
                  />
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      MOLOCHAIN
                    </h3>
                    <p className="text-xs text-muted-foreground">Enterprise Logistics Ecosystem</p>
                  </div>
                </div>
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              Revolutionizing the $9.1 trillion logistics industry with enterprise technology, AI-powered automation, and advanced analytics. Building the future of transparent, efficient global trade.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{settings?.contact_address || 'Maslak Mah. Eski Büyükdere Cad. Ayazağa Yolu, Giz2000 Plaza No:7 Şişli / İstanbul TÜRKİYE'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>{settings?.contact_phone || '+90 212 547 92 47'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>{settings?.contact_email || 'support@molochain.com'}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors duration-200"
                >
                  <social.icon className="h-4 w-4 text-primary" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith('http://') || link.href.startsWith('https://') ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer group"
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform">
                          {link.label}
                        </span>
                      </a>
                    ) : (
                      <Link href={link.href}>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer group">
                          <span className="group-hover:translate-x-0.5 transition-transform">
                            {link.label}
                          </span>
                        </div>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Statistics & Trust Badges */}
        <div className="mt-12 pt-8 border-t">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">Enterprise Global Logistics</h3>
            <p className="text-sm text-muted-foreground">Transforming the $9.1 Trillion Industry</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">1,286</div>
              <div className="text-xs text-muted-foreground">Global Partners</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">48K+</div>
              <div className="text-xs text-muted-foreground">Active Integrations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">186K</div>
              <div className="text-xs text-muted-foreground">Shipments Processed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">$142M</div>
              <div className="text-xs text-muted-foreground">Network Value</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-5 w-5 text-primary" />
              <span>Enterprise Secured</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="h-5 w-5 text-primary" />
              <span>Fortune 500 Trusted</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-5 w-5 text-primary" />
              <span>150+ Countries</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-5 w-5 text-primary" />
              <span>10,000+ Partners</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} MOLOCHAIN. All rights reserved. Built with excellence and innovation.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy">
                <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  Privacy
                </span>
              </Link>
              <Link href="/terms">
                <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  Terms
                </span>
              </Link>
              <Link href="/cookies">
                <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  Cookies
                </span>
              </Link>
              <Link href="/sitemap">
                <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  Sitemap
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
    </footer>
  );
};

export default Footer;
