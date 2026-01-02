import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function TermsOfService() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <Card>
          <CardContent className="prose dark:prose-invert max-w-none p-6">
            <h1>{t("terms.title")}</h1>
            <p>{t("terms.lastUpdated")}</p>

            <h2>{t("terms.sections.acceptanceOfTerms.title")}</h2>
            <p>{t("terms.sections.acceptanceOfTerms.description")}</p>

            <h2>{t("terms.sections.serviceDescription.title")}</h2>
            <p>{t("terms.sections.serviceDescription.description")}</p>
            <ul>
              <li>{t("terms.sections.serviceDescription.items.freightShipping")}</li>
              <li>{t("terms.sections.serviceDescription.items.warehousing")}</li>
              <li>{t("terms.sections.serviceDescription.items.distribution")}</li>
            </ul>

            <h2>{t("terms.sections.userResponsibilities.title")}</h2>
            <p>{t("terms.sections.userResponsibilities.description")}</p>
            <ul>
              <li>{t("terms.sections.userResponsibilities.items.accurateInfo")}</li>
              <li>{t("terms.sections.userResponsibilities.items.lawsCompliance")}</li>
              <li>{t("terms.sections.userResponsibilities.items.accountSecurity")}</li>
              <li>{t("terms.sections.userResponsibilities.items.payForServices")}</li>
            </ul>

            <h2>{t("terms.sections.limitationOfLiability.title")}</h2>
            <p>{t("terms.sections.limitationOfLiability.description")}</p>

            <h2>{t("terms.sections.contactInfo.title")}</h2>
            <p>{t("terms.sections.contactInfo.description")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
