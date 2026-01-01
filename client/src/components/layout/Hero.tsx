import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Globe, 
  Truck, 
  Shield, 
  Zap,
  Package,
  ChartBar,
  Sparkles,
  CheckCircle,
  DollarSign,
  Link2,
  Users,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCMSHomeSection } from "@/hooks/use-cms";
import { MoloChainSkeleton } from "@/components/ui/molochain-loader";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  DollarSign,
  Link2,
  Globe,
  Truck,
  Zap,
  Package,
  ChartBar,
  Sparkles,
  CheckCircle,
};

const HeroSkeleton = () => (
  <div className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-24">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="text-center lg:text-left space-y-6">
          <MoloChainSkeleton className="h-8 w-64 mx-auto lg:mx-0" />
          <MoloChainSkeleton className="h-16 w-full" />
          <MoloChainSkeleton className="h-12 w-3/4" />
          <MoloChainSkeleton variant="text" lines={3} className="mt-6" />
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start mt-8">
            {[1, 2, 3, 4].map((i) => (
              <MoloChainSkeleton key={i} className="h-6 w-32" />
            ))}
          </div>
          <div className="flex gap-4 justify-center lg:justify-start mt-10">
            <MoloChainSkeleton variant="button" className="w-40 h-12" />
            <MoloChainSkeleton variant="button" className="w-40 h-12" />
          </div>
        </div>
        <div className="relative">
          <MoloChainSkeleton variant="image" className="rounded-2xl h-[400px]" />
        </div>
      </div>
      <div className="mt-20 pt-12 border-t border-border/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center space-y-2">
              <MoloChainSkeleton className="h-10 w-24 mx-auto" />
              <MoloChainSkeleton className="h-4 w-32 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Hero = () => {
  const { t } = useTranslation();
  const { data: heroSection, isLoading } = useCMSHomeSection('hero');

  const defaultFeatures = [
    { icon: Shield, text: t('features.enterpriseSecured', 'Enterprise Secured') },
    { icon: Cpu, text: t('features.aiPowered', 'AI Powered') },
    { icon: Link2, text: t('features.smartIntegration', 'Smart Integration') },
    { icon: Globe, text: t('features.marketSize', '$9.1T Market') }
  ];

  const defaultStats = [
    { value: "1,286", label: t('stats.partners', 'Global Partners') },
    { value: "186K", label: t('stats.shipments', 'Shipments Processed') },
    { value: "$142M", label: t('stats.networkValue', 'Network Value') },
    { value: "48K+", label: t('stats.integrations', 'Active Integrations') }
  ];

  if (isLoading) {
    return <HeroSkeleton />;
  }

  const title = heroSection?.title || t('hero.title', 'Revolutionizing Global Logistics');
  const subtitle = heroSection?.subtitle || t('hero.subtitle', 'ENTERPRISE LOGISTICS POWER');
  const description = heroSection?.body || t('hero.description', 'Transform the $9.1 trillion logistics industry with our enterprise Super-App. AI-powered automation, smart integrations, and advanced analytics eliminate inefficiencies and reduce costs by 40%.');

  const features = heroSection?.items?.length 
    ? heroSection.items.slice(0, 4).map((item) => ({
        icon: iconMap[item.icon || 'Shield'] || Shield,
        text: item.title
      }))
    : defaultFeatures;

  const stats = heroSection?.items?.length && heroSection.items.length > 4
    ? heroSection.items.slice(4, 8).map((item) => ({
        value: item.title,
        label: item.description
      }))
    : defaultStats;

  return (
    <div className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 text-sm font-semibold mb-6"
            >
              <Shield className="w-4 h-4" />
              <span>{t('hero.badge', 'Enterprise Logistics Ecosystem')}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
            >
              <span className="text-gray-900">{title}</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mt-2">
                {subtitle}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <feature.icon className="w-4 h-4 text-blue-500" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <a href="https://mololink.molochain.com" target="_blank" rel="noopener noreferrer">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  MOLOLINK
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <a href="https://opt.molochain.com" target="_blank" rel="noopener noreferrer">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  MOLOPS
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 flex items-center gap-6 text-sm text-gray-600 font-medium justify-center lg:justify-start"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('hero.isoCertified', 'ISO 9001 Certified')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('hero.support247', '24/7 Support')}</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent z-10" />
              <img
                loading="lazy"
                width={600}
                height={600}
                className="w-full h-auto object-cover"
                src="/container-aerial.jpg"
                alt={t('hero.imageAlt', 'Modern logistics operations')}
              />
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-lg rounded-xl p-4 shadow-xl z-20"
              >
                <div className="grid grid-cols-2 gap-4">
                  {stats.slice(0, 2).map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-20 pt-12 border-t border-border/50"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ x: -100 }}
        animate={{ x: "100vw" }}
        transition={{ 
          duration: 20, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-10 opacity-10"
      >
        <Truck className="w-12 h-12 text-blue-500" />
      </motion.div>
    </div>
  );
};

export default Hero;
