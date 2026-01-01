import { useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe, Users, Award, Target, Shield, Zap, Heart, Lightbulb,
  Building2, MapPin, Mail, ArrowRight, CheckCircle,
  TrendingUp, Clock, Handshake, Truck, Plane, Ship, Container
} from "lucide-react";

const statsConfig = [
  { key: "countries", icon: Globe },
  { key: "services", icon: Container },
  { key: "yearsExperience", icon: Award },
  { key: "activeCustomers", icon: Users }
];

const valuesConfig = [
  { key: "reliability", icon: Shield },
  { key: "innovation", icon: Zap },
  { key: "customerFocus", icon: Heart },
  { key: "transparency", icon: Lightbulb },
  { key: "excellence", icon: TrendingUp },
  { key: "integrity", icon: Handshake }
];

const officesConfig = ["istanbul", "dubai", "hamburg", "singapore"];

const leadershipConfig = ["executive", "operations", "technology", "commercial"];

export default function About() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('about.seo.title');
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('about.seo.description'));
    }
  }, [t]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-10 animate-pulse" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge className="mb-4 bg-white/10 text-white border-white/20" data-testid="badge-about-hero">
              {t('about.badge')}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              {t('about.heroTitle')}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              {t('about.heroSubtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/services">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-900 hover:bg-blue-50"
                  data-testid="button-explore-services"
                >
                  {t('about.exploreServices')}
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
                  {t('nav.contactUs')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 -mt-24 relative z-10">
          {statsConfig.map((stat, index) => {
            const Icon = stat.icon;
            const label = t(`about.stats.${stat.key}.label`);
            const value = t(`about.stats.${stat.key}.value`);
            const description = t(`about.stats.${stat.key}.description`);
            return (
              <Card 
                key={index} 
                className="bg-white dark:bg-gray-800 shadow-xl border-0"
                data-testid={`card-stat-${label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-4" data-testid="badge-our-mission">{t('about.mission.badge')}</Badge>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {t('about.mission.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {t('about.mission.description1')}
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {t('about.mission.description2')}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-500" />
                {t('about.certifications.iso')}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-500" />
                {t('about.certifications.aeo')}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-500" />
                {t('about.certifications.iata')}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <Truck className="w-8 h-8 mb-3" />
                <div className="text-2xl font-bold">{t('about.transport.land.title')}</div>
                <div className="text-sm text-blue-100">{t('about.transport.land.description')}</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white">
                <Ship className="w-8 h-8 mb-3" />
                <div className="text-2xl font-bold">{t('about.transport.sea.title')}</div>
                <div className="text-sm text-indigo-100">{t('about.transport.sea.description')}</div>
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                <Plane className="w-8 h-8 mb-3" />
                <div className="text-2xl font-bold">{t('about.transport.air.title')}</div>
                <div className="text-sm text-purple-100">{t('about.transport.air.description')}</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-6 text-white">
                <Container className="w-8 h-8 mb-3" />
                <div className="text-2xl font-bold">{t('about.transport.multimodal.title')}</div>
                <div className="text-sm text-cyan-100">{t('about.transport.multimodal.description')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4" data-testid="badge-our-values">{t('about.values.title')}</Badge>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('about.values.heading')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('about.values.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {valuesConfig.map((value, index) => {
              const Icon = value.icon;
              const title = t(`about.values.${value.key}.title`);
              const description = t(`about.values.${value.key}.description`);
              return (
                <Card 
                  key={index} 
                  className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow"
                  data-testid={`card-value-${title.toLowerCase()}`}
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <Badge className="mb-4" data-testid="badge-leadership">{t('about.leadership.title')}</Badge>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('about.leadership.heading')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('about.leadership.subtitle')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {leadershipConfig.map((leader, index) => (
            <Card 
              key={index} 
              className="text-center hover:shadow-lg transition-shadow"
              data-testid={`card-leadership-${index}`}
            >
              <CardContent className="p-6">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {t(`about.leadership.${leader}.name`)}
                </h3>
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                  {t(`about.leadership.${leader}.role`)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t(`about.leadership.${leader}.description`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4" data-testid="badge-global-presence">{t('about.globalPresence.title')}</Badge>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('about.globalPresence.heading')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('about.globalPresence.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {officesConfig.map((office, index) => {
              const services = t(`about.offices.${office}.services`, { returnObjects: true }) as string[];
              return (
                <Card 
                  key={index} 
                  className="bg-white dark:bg-gray-800 border-0 shadow-lg"
                  data-testid={`card-office-${office}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <Badge variant="secondary" className="text-xs">
                        {t(`about.offices.${office}.type`)}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{t(`about.offices.${office}.city`)}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t(`about.offices.${office}.country`)}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                      <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                      {t(`about.offices.${office}.address`)}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(services) && services.map((service, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{service}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('about.cta.title')}</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
            {t('about.cta.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100"
                data-testid="button-get-in-touch"
              >
                <Mail className="w-4 h-4 mr-2" />
                {t('about.cta.getInTouch')}
              </Button>
            </Link>
            <Link href="/services">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                data-testid="button-view-services"
              >
                {t('about.cta.viewServices')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mt-8 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t('about.cta.support247')}
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t('about.cta.countriesCount')}
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {t('about.cta.secureReliable')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
