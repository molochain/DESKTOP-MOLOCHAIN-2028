import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('notFound.title')}</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {t('notFound.description')}
          </p>

          <div className="mt-6">
            <Link href="/">
              <Button className="w-full gap-2" data-testid="button-go-home">
                <Home className="w-4 h-4" />
                {t('notFound.goHome')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
