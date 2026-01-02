import { motion } from "framer-motion";
import { Link } from "wouter";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Users,
  Shield,
  BarChart3,
  Lock,
  Server,
  Settings,
  Zap,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export default function AdminLandingPage() {
  const { t } = useTranslation();
  
  const features = [
    {
      titleKey: "admin.landing.features.systemMonitoring.title",
      descriptionKey: "admin.landing.features.systemMonitoring.description",
      icon: Activity,
      color: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      titleKey: "admin.landing.features.userManagement.title",
      descriptionKey: "admin.landing.features.userManagement.description",
      icon: Users,
      color: "text-green-500 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      titleKey: "admin.landing.features.securityControls.title",
      descriptionKey: "admin.landing.features.securityControls.description",
      icon: Shield,
      color: "text-red-500 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20"
    },
    {
      titleKey: "admin.landing.features.analyticsDashboard.title",
      descriptionKey: "admin.landing.features.analyticsDashboard.description",
      icon: BarChart3,
      color: "text-purple-500 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    }
  ];

  const capabilities = [
    "admin.landing.capabilities.healthMonitoring",
    "admin.landing.capabilities.rbac",
    "admin.landing.capabilities.auditLogging",
    "admin.landing.capabilities.performanceAnalytics",
    "admin.landing.capabilities.configManagement",
    "admin.landing.capabilities.integrationControls"
  ];

  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge 
              variant="outline" 
              className="mb-4 px-4 py-1 text-sm bg-primary/10 dark:bg-primary/20 border-primary/30"
              data-testid="badge-admin-portal"
            >
              <Lock className="w-3 h-3 mr-2" />
              {t('admin.landing.badge')}
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t('admin.landing.title')}{" "}
              <span className="text-primary">{t('admin.landing.titleHighlight')}</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              {t('admin.landing.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleLogin}
                className="text-lg px-8 py-6"
                data-testid="button-login-sso"
              >
                <Lock className="w-5 h-5 mr-2" />
                {t('admin.landing.buttons.signInSSO')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('admin.landing.features.sectionTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('admin.landing.features.sectionSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.titleKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Card 
                  className="h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                  data-testid={`card-feature-${t(feature.titleKey).toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">
                      {t(feature.titleKey)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {t(feature.descriptionKey)}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {t('admin.landing.capabilities.sectionTitle')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                {t('admin.landing.capabilities.sectionDescription')}
              </p>
              
              <ul className="space-y-4">
                {capabilities.map((capabilityKey, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{t(capabilityKey)}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-2 gap-4"
            >
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white border-0">
                <CardContent className="p-6 text-center">
                  <Server className="w-10 h-10 mx-auto mb-3 opacity-90" />
                  <div className="text-3xl font-bold mb-1">99.9%</div>
                  <div className="text-sm opacity-90">{t('admin.landing.metrics.uptime')}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white border-0">
                <CardContent className="p-6 text-center">
                  <Zap className="w-10 h-10 mx-auto mb-3 opacity-90" />
                  <div className="text-3xl font-bold mb-1">&lt;50ms</div>
                  <div className="text-sm opacity-90">{t('admin.landing.metrics.responseTime')}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white border-0">
                <CardContent className="p-6 text-center">
                  <Shield className="w-10 h-10 mx-auto mb-3 opacity-90" />
                  <div className="text-3xl font-bold mb-1">24/7</div>
                  <div className="text-sm opacity-90">{t('admin.landing.metrics.securityMonitoring')}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white border-0">
                <CardContent className="p-6 text-center">
                  <Settings className="w-10 h-10 mx-auto mb-3 opacity-90" />
                  <div className="text-3xl font-bold mb-1">100+</div>
                  <div className="text-sm opacity-90">{t('admin.landing.metrics.configOptions')}</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/5 dark:bg-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('admin.landing.cta.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              {t('admin.landing.cta.description')}
            </p>
            <Button 
              size="lg" 
              onClick={handleLogin}
              className="text-lg px-8 py-6"
              data-testid="button-login-cta"
            >
              <Lock className="w-5 h-5 mr-2" />
              {t('admin.landing.buttons.accessPortal')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
