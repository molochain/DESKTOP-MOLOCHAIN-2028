import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <Card>
          <CardContent className="prose dark:prose-invert max-w-none p-6">
            <h1>Terms of Service</h1>
            <p>Last updated: January 19, 2025</p>

            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using MoLogistics services, you agree to be bound by these Terms of Service.</p>

            <h2>2. Service Description</h2>
            <p>MoLogistics provides logistics and transportation services, including but not limited to:</p>
            <ul>
              <li>Freight Shipping</li>
              <li>Warehousing</li>
              <li>Distribution</li>
            </ul>

            <h2>3. User Responsibilities</h2>
            <p>Users of our services agree to:</p>
            <ul>
              <li>Provide accurate shipping information</li>
              <li>Comply with applicable laws and regulations</li>
              <li>Maintain account security</li>
              <li>Pay for services as agreed</li>
            </ul>

            <h2>4. Limitation of Liability</h2>
            <p>MoLogistics shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.</p>

            <h2>5. Contact Information</h2>
            <p>For questions about these Terms of Service, please contact legal@molochain.com</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
