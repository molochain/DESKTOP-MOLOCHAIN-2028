import { useState } from 'react';
import { SparklesIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ServiceRecommendationForm, { ServiceRecommendation } from '@/components/services/ServiceRecommendationForm';
import ServiceRecommendationResults from '@/components/services/ServiceRecommendationResults';
import PageHeader from '@/components/ui/page-header';
import { PageTransition } from '@/components/ui/page-transition';

export default function ServiceRecommender() {
  const { t } = useTranslation();
  const [recommendations, setRecommendations] = useState<ServiceRecommendation[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleRecommendationsReceived = (newRecommendations: ServiceRecommendation[]) => {
    setRecommendations(newRecommendations);
    setShowResults(true);
  };

  const handleReset = () => {
    setShowResults(false);
    setRecommendations([]);
  };

  return (
    <PageTransition>
      <div className="container max-w-6xl px-4 py-8">
        <PageHeader
          title={t('services.recommender.title')}
          icon={<SparklesIcon className="h-6 w-6" />}
          description={t('services.recommender.description')}
        />

        <div className="mt-8">
          {!showResults ? (
            <ServiceRecommendationForm onRecommendationsReceived={handleRecommendationsReceived} />
          ) : (
            <ServiceRecommendationResults 
              recommendations={recommendations} 
              onReset={handleReset} 
            />
          )}
        </div>

        <div className="mt-16 bg-accent/30 rounded-lg p-6">
          <h3 className="text-xl font-medium mb-4 flex items-center">
            <LightbulbIcon className="h-5 w-5 mr-2 text-yellow-500" />
            {t('services.recommender.howItWorks')}
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-md p-4 shadow-sm">
              <div className="text-primary font-semibold mb-2">{t('services.recommender.step1.title')}</div>
              <p className="text-sm text-muted-foreground">
                {t('services.recommender.step1.description')}
              </p>
            </div>
            <div className="bg-card rounded-md p-4 shadow-sm">
              <div className="text-primary font-semibold mb-2">{t('services.recommender.step2.title')}</div>
              <p className="text-sm text-muted-foreground">
                {t('services.recommender.step2.description')}
              </p>
            </div>
            <div className="bg-card rounded-md p-4 shadow-sm">
              <div className="text-primary font-semibold mb-2">{t('services.recommender.step3.title')}</div>
              <p className="text-sm text-muted-foreground">
                {t('services.recommender.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function LightbulbIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}