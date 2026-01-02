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
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const [email, setEmail] = useState("");
  const { data: settings } = useCMSSettings();
  const { t } = useTranslation();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
  };

  const currentYear = new Date().getFullYear();
  const footerSections = {
    services: {
      title: t('footer.services.title'),
      links: [
        { href: "/services#freight", label: t('footer.services.freight') },
        { href: "/services#warehouse", label: t('footer.services.warehouse') },
        { href: "/services#distribution", label: t('footer.services.distribution') },
        { href: "/tracking", label: t('footer.services.tracking') }
      ]
    },
    solutions: {
      title: t('footer.solutions.title'),
      links: [
        { href: "https://mololink.molochain.com", label: t('footer.solutions.mololink') },
        { href: "/departments", label: t('footer.solutions.departments', 'Departments') },
        { href: "/partners", label: t('footer.solutions.partners') },
        { href: "/services", label: t('footer.solutions.allServices') }
      ]
    },
    company: {
      title: t('footer.company.title'),
      links: [
        { href: "/about", label: t('footer.company.aboutUs') },
        { href: "/investor", label: t('footer.company.investor') },
        { href: "/contact", label: t('footer.company.contact') },
        { href: "/careers", label: t('footer.company.careers') }
      ]
    },
    support: {
      title: t('footer.support.title'),
      links: [
        { href: "/contact", label: t('footer.support.helpSupport') },
        { href: "/quote", label: t('footer.support.getQuote') },
        { href: "/privacy", label: t('footer.support.privacy') },
        { href: "/terms", label: t('footer.support.terms') }
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
                {t('footer.newsletter.title')}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t('footer.newsletter.description')}
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder={t('footer.newsletter.placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full md:w-64"
                required
              />
              <Button type="submit" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                {t('footer.newsletter.subscribe')}
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
                    <p className="text-xs text-muted-foreground">{t('footer.brand.tagline')}</p>
                  </div>
                </div>
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer.brand.description')}
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
            <h3 className="text-lg font-semibold mb-2">{t('footer.stats.heading')}</h3>
            <p className="text-sm text-muted-foreground">{t('footer.stats.subheading')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">1,286</div>
              <div className="text-xs text-muted-foreground">{t('footer.stats.globalPartners')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">48K+</div>
              <div className="text-xs text-muted-foreground">{t('footer.stats.activeIntegrations')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">186K</div>
              <div className="text-xs text-muted-foreground">{t('footer.stats.shipmentsProcessed')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">$142M</div>
              <div className="text-xs text-muted-foreground">{t('footer.stats.networkValue')}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-5 w-5 text-primary" />
              <span>{t('footer.trust.secured')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="h-5 w-5 text-primary" />
              <span>{t('footer.trust.fortune500')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-5 w-5 text-primary" />
              <span>{t('footer.trust.countries')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-5 w-5 text-primary" />
              <span>{t('footer.trust.partners')}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              {t('footer.copyright', { year: currentYear })}
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy">
                <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  {t('footer.links.privacy')}
                </span>
              </Link>
              <Link href="/terms">
                <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  {t('footer.links.terms')}
                </span>
              </Link>
              <Link href="/cookies">
                <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  {t('footer.links.cookies')}
                </span>
              </Link>
              <Link href="/sitemap">
                <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  {t('footer.links.sitemap')}
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
