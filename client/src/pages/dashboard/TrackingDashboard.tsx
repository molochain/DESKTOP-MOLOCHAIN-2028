import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TrackingStatusIndicator from '@/components/tracking/TrackingStatusIndicator';
import TrackingTimeline from '@/components/tracking/TrackingTimeline';
import ShipmentStatusAnimation from '@/components/tracking/ShipmentStatusAnimation';
import TrackingQRCode from '@/components/tracking/TrackingQRCode';
import TrackingResult from '@/components/tracking/TrackingResult';
import { useToast } from '@/hooks/use-toast';
import { Search, Package, MapPin, Truck, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { ContextualGuideHelp } from '@/components/guides/ContextualGuideHelp';
import { motion } from 'framer-motion';
import { MoloChainSkeleton, MoloChainLoadingCard } from '@/components/ui/molochain-loader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ShipmentData {
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  currentLocation: string | null;
  estimatedDelivery: string | null;
  createdAt?: string;
  updatedAt?: string;
  lastUpdated: string;
}

export default function TrackingDashboard() {
  const { t } = useTranslation();
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [activeTracking, setActiveTracking] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: shipmentData, isLoading, isError, error } = useQuery<ShipmentData>({
    queryKey: ['/api/tracking', activeTracking],
    queryFn: async () => {
      const response = await fetch(`/api/tracking/${activeTracking}`);
      if (!response.ok) {
        throw new Error('Tracking number not found');
      }
      return response.json();
    },
    enabled: !!activeTracking,
  });

  const handleTrackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber || trackingNumber.trim().length < 3) {
      toast({
        title: t('tracking.toast.invalidNumber'),
        description: t('tracking.toast.invalidNumberDescription'),
        variant: 'destructive',
      });
      return;
    }
    
    setActiveTracking(trackingNumber.trim());
    
    toast({
      title: t('tracking.toast.activated'),
      description: t('tracking.toast.activatedDescription', { number: trackingNumber }),
      variant: 'default',
    });
  };

  const exampleTrackingNumbers = [
    'MOLO-2024120901',
    'MOLO-2024120902',
    'MOLO-2024120904',
    'MOLO-2024120905',
  ];

  const handleExampleClick = (example: string) => {
    setTrackingNumber(example);
    setActiveTracking(example);
    
    toast({
      title: t('tracking.toast.activated'),
      description: t('tracking.toast.activatedDescription', { number: example }),
      variant: 'default',
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 container mx-auto px-4 py-16">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <Badge className="mb-4 px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white border-white/30">
              <MapPin className="w-4 h-4 mr-1" /> {t('tracking.badge')}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
              {t('tracking.title')}
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              {t('tracking.subtitle')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
              >
                <Package className="w-6 h-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{t('tracking.stats.packagesValue')}</p>
                <p className="text-sm opacity-75">{t('tracking.stats.packagesTracked')}</p>
              </motion.div>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
              >
                <Clock className="w-6 h-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{t('tracking.stats.updateTimeValue')}</p>
                <p className="text-sm opacity-75">{t('tracking.stats.updateTime')}</p>
              </motion.div>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
              >
                <Truck className="w-6 h-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{t('tracking.stats.countriesValue')}</p>
                <p className="text-sm opacity-75">{t('tracking.stats.countries')}</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-8 shadow-xl border-2 hover:border-primary/50 transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  {t('tracking.form.title')}
                </CardTitle>
                <CardDescription>
                  {t('tracking.form.description')}
                </CardDescription>
              </CardHeader>
            <CardContent>
              <form onSubmit={handleTrackingSubmit} className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder={t('tracking.form.placeholder')}
                    className="w-full"
                    data-testid="input-tracking-number"
                  />
                </div>
                <Button type="submit" disabled={isLoading} data-testid="button-track">
                  <Search className="mr-2 h-4 w-4" />
                  {isLoading ? t('tracking.form.tracking') : t('tracking.form.track')}
                </Button>
              </form>
              
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">{t('tracking.form.tryExamples')}</p>
                <div className="flex flex-wrap gap-2">
                  {exampleTrackingNumbers.map((example) => (
                    <Button
                      key={example}
                      variant="outline"
                      size="sm"
                      onClick={() => handleExampleClick(example)}
                      data-testid={`button-example-${example}`}
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          </motion.div>
          
          {isLoading && activeTracking && (
            <div className="space-y-4">
              <MoloChainSkeleton className="h-8 w-64" />
              <MoloChainLoadingCard className="h-64" />
            </div>
          )}

          {isError && activeTracking && (
            <Reveal animation="fadeUp">
              <Alert variant="destructive" className="mb-6" data-testid="alert-tracking-error">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('tracking.error.notFound')}</AlertTitle>
                <AlertDescription>
                  {t('tracking.error.notFoundDescription', { number: activeTracking })}
                </AlertDescription>
              </Alert>
            </Reveal>
          )}

          {shipmentData && !isLoading && !isError && (
            <Reveal animation="fadeUp">
              <div className="mb-6">
                <TrackingResult
                  trackingNumber={shipmentData.trackingNumber}
                  status={shipmentData.status}
                  origin={shipmentData.origin}
                  destination={shipmentData.destination}
                  currentLocation={shipmentData.currentLocation}
                  estimatedDelivery={shipmentData.estimatedDelivery}
                />
              </div>

              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">{t('tracking.sections.detailedTracking')}</h2>
                <TrackingStatusIndicator trackingNumber={activeTracking!} />
              </div>
              
              <Tabs defaultValue="timeline" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="timeline" data-testid="tab-timeline">{t('tracking.tabs.timeline')}</TabsTrigger>
                  <TabsTrigger value="visual" data-testid="tab-visual">{t('tracking.tabs.visualTracking')}</TabsTrigger>
                  <TabsTrigger value="details" data-testid="tab-details">{t('tracking.tabs.details')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="timeline" className="mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <TrackingTimeline trackingNumber={activeTracking!} />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="visual" className="mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <ShipmentStatusAnimation trackingNumber={activeTracking!} />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="details" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('tracking.sections.shipmentDetails')}</CardTitle>
                      <CardDescription>
                        {t('tracking.sections.shipmentDetailsDescription')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-5 gap-6">
                        <div className="md:col-span-3">
                          <TrackingTimeline trackingNumber={activeTracking!} />
                        </div>
                        <div className="md:col-span-2">
                          <div className="border rounded-lg p-4">
                            <h3 className="font-medium mb-4">{t('tracking.sections.shareTracking')}</h3>
                            <TrackingQRCode trackingNumber={activeTracking!} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </Reveal>
          )}
        </div>
      </div>
      <ContextualGuideHelp variant="floating" />
    </motion.div>
  );
}
