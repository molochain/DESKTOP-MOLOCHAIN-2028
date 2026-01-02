import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <Card>
          <CardContent className="prose dark:prose-invert max-w-none p-6">
            <h1>{t("privacy.title")}</h1>
            <p>{t("privacy.lastUpdated")}</p>

            <h2>{t("privacy.sections.informationWeCollect.title")}</h2>
            <p>{t("privacy.sections.informationWeCollect.description")}</p>
            <h3>{t("privacy.sections.informationWeCollect.personalInfo.title")}</h3>
            <ul>
              <li>{t("privacy.sections.informationWeCollect.personalInfo.items.nameContact")}</li>
              <li>{t("privacy.sections.informationWeCollect.personalInfo.items.companyInfo")}</li>
              <li>{t("privacy.sections.informationWeCollect.personalInfo.items.shippingInfo")}</li>
              <li>{t("privacy.sections.informationWeCollect.personalInfo.items.paymentInfo")}</li>
              <li>{t("privacy.sections.informationWeCollect.personalInfo.items.accountCredentials")}</li>
            </ul>

            <h3>{t("privacy.sections.informationWeCollect.automaticInfo.title")}</h3>
            <ul>
              <li>{t("privacy.sections.informationWeCollect.automaticInfo.items.deviceBrowser")}</li>
              <li>{t("privacy.sections.informationWeCollect.automaticInfo.items.ipLocation")}</li>
              <li>{t("privacy.sections.informationWeCollect.automaticInfo.items.usagePatterns")}</li>
              <li>{t("privacy.sections.informationWeCollect.automaticInfo.items.cookies")}</li>
            </ul>

            <h2>{t("privacy.sections.howWeUse.title")}</h2>
            <p>{t("privacy.sections.howWeUse.description")}</p>
            <ul>
              <li>{t("privacy.sections.howWeUse.items.providingServices")}</li>
              <li>{t("privacy.sections.howWeUse.items.processingTransactions")}</li>
              <li>{t("privacy.sections.howWeUse.items.sendingUpdates")}</li>
              <li>{t("privacy.sections.howWeUse.items.improvingServices")}</li>
              <li>{t("privacy.sections.howWeUse.items.analyzingUsage")}</li>
              <li>{t("privacy.sections.howWeUse.items.legalCompliance")}</li>
              <li>{t("privacy.sections.howWeUse.items.preventingFraud")}</li>
            </ul>

            <h2>{t("privacy.sections.dataSecurity.title")}</h2>
            <p>{t("privacy.sections.dataSecurity.description")}</p>
            <ul>
              <li>{t("privacy.sections.dataSecurity.items.encryption")}</li>
              <li>{t("privacy.sections.dataSecurity.items.securityAudits")}</li>
              <li>{t("privacy.sections.dataSecurity.items.secureStorage")}</li>
              <li>{t("privacy.sections.dataSecurity.items.accessControls")}</li>
              <li>{t("privacy.sections.dataSecurity.items.employeeTraining")}</li>
            </ul>

            <h2>{t("privacy.sections.userRights.title")}</h2>
            <p>{t("privacy.sections.userRights.description")}</p>
            <ul>
              <li>{t("privacy.sections.userRights.items.access")}</li>
              <li>{t("privacy.sections.userRights.items.correction")}</li>
              <li>{t("privacy.sections.userRights.items.deletion")}</li>
              <li>{t("privacy.sections.userRights.items.portability")}</li>
              <li>{t("privacy.sections.userRights.items.withdrawConsent")}</li>
              <li>{t("privacy.sections.userRights.items.objection")}</li>
            </ul>

            <h2>{t("privacy.sections.cookiePolicy.title")}</h2>
            <p>{t("privacy.sections.cookiePolicy.description")}</p>
            <ul>
              <li>{t("privacy.sections.cookiePolicy.items.essential")}</li>
              <li>{t("privacy.sections.cookiePolicy.items.analytics")}</li>
              <li>{t("privacy.sections.cookiePolicy.items.preference")}</li>
              <li>{t("privacy.sections.cookiePolicy.items.thirdParty")}</li>
            </ul>

            <h2>{t("privacy.sections.thirdPartyServices.title")}</h2>
            <p>{t("privacy.sections.thirdPartyServices.description")}</p>
            <ul>
              <li>{t("privacy.sections.thirdPartyServices.items.paymentProcessors")}</li>
              <li>{t("privacy.sections.thirdPartyServices.items.shippingPartners")}</li>
              <li>{t("privacy.sections.thirdPartyServices.items.analyticsProviders")}</li>
              <li>{t("privacy.sections.thirdPartyServices.items.cloudProviders")}</li>
            </ul>

            <h2>{t("privacy.sections.changes.title")}</h2>
            <p>{t("privacy.sections.changes.description")}</p>
            <ul>
              <li>{t("privacy.sections.changes.items.emailNotifications")}</li>
              <li>{t("privacy.sections.changes.items.websiteAnnouncements")}</li>
              <li>{t("privacy.sections.changes.items.appNotifications")}</li>
            </ul>

            <h2>{t("privacy.sections.dataRetention.title")}</h2>
            <p>{t("privacy.sections.dataRetention.description")}</p>
            <ul>
              <li>{t("privacy.sections.dataRetention.items.provideServices")}</li>
              <li>{t("privacy.sections.dataRetention.items.legalObligations")}</li>
              <li>{t("privacy.sections.dataRetention.items.resolveDisputes")}</li>
              <li>{t("privacy.sections.dataRetention.items.enforceAgreements")}</li>
            </ul>

            <h2>{t("privacy.sections.internationalTransfers.title")}</h2>
            <p>{t("privacy.sections.internationalTransfers.description")}</p>
            <ul>
              <li>{t("privacy.sections.internationalTransfers.items.safeguards")}</li>
              <li>{t("privacy.sections.internationalTransfers.items.compliance")}</li>
              <li>{t("privacy.sections.internationalTransfers.items.contractualClauses")}</li>
            </ul>

            <h2>{t("privacy.sections.contactUs.title")}</h2>
            <p>{t("privacy.sections.contactUs.description")}</p>
            <ul>
              <li>{t("privacy.sections.contactUs.items.email")}</li>
              <li>{t("privacy.sections.contactUs.items.phone")}</li>
              <li>{t("privacy.sections.contactUs.items.address")}</li>
            </ul>

            <p className="mt-8 text-sm text-gray-600">
              {t("privacy.footer")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
