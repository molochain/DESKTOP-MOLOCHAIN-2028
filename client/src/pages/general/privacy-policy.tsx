import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <Card>
          <CardContent className="prose dark:prose-invert max-w-none p-6">
            <h1>Privacy Policy</h1>
            <p>Last updated: January 19, 2025</p>

            <h2>1. Information We Collect</h2>
            <p>We collect various types of information to provide and improve our logistics services:</p>
            <h3>1.1 Personal Information</h3>
            <ul>
              <li>Name and contact details (email, phone number, address)</li>
              <li>Company information for business accounts</li>
              <li>Shipping and delivery information</li>
              <li>Payment and billing information</li>
              <li>Account credentials and preferences</li>
            </ul>

            <h3>1.2 Automatically Collected Information</h3>
            <ul>
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Usage patterns and preferences</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul>
              <li>Providing and managing logistics and transportation services</li>
              <li>Processing transactions and payments</li>
              <li>Sending service updates and notifications</li>
              <li>Improving our services and user experience</li>
              <li>Analyzing usage patterns and trends</li>
              <li>Complying with legal obligations</li>
              <li>Preventing fraud and ensuring security</li>
            </ul>

            <h2>3. Data Security</h2>
            <p>We implement comprehensive security measures to protect your information:</p>
            <ul>
              <li>End-to-end encryption for sensitive data</li>
              <li>Regular security audits and updates</li>
              <li>Secure data storage and transmission</li>
              <li>Access controls and authentication</li>
              <li>Employee training on data protection</li>
            </ul>

            <h2>4. User Rights</h2>
            <p>You have the following rights regarding your personal data:</p>
            <ul>
              <li>Access to your personal information</li>
              <li>Correction of inaccurate data</li>
              <li>Deletion of personal data (right to be forgotten)</li>
              <li>Data portability</li>
              <li>Withdrawal of consent</li>
              <li>Objection to processing</li>
            </ul>

            <h2>5. Cookie Policy</h2>
            <p>We use cookies and similar technologies to enhance your experience:</p>
            <ul>
              <li>Essential cookies for website functionality</li>
              <li>Analytics cookies to improve our services</li>
              <li>Preference cookies to remember your settings</li>
              <li>Third-party cookies for additional features</li>
            </ul>

            <h2>6. Third-party Services</h2>
            <p>We may share information with trusted third parties:</p>
            <ul>
              <li>Payment processors for secure transactions</li>
              <li>Shipping partners for delivery services</li>
              <li>Analytics providers for service improvement</li>
              <li>Cloud service providers for data storage</li>
            </ul>

            <h2>7. Changes to Privacy Policy</h2>
            <p>We may update this Privacy Policy periodically. Major changes will be notified via:</p>
            <ul>
              <li>Email notifications to registered users</li>
              <li>Website announcements</li>
              <li>Application notifications</li>
            </ul>

            <h2>8. Data Retention</h2>
            <p>We retain your information for as long as necessary to:</p>
            <ul>
              <li>Provide our services</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes</li>
              <li>Enforce agreements</li>
            </ul>

            <h2>9. International Data Transfers</h2>
            <p>For international operations, data may be processed in different countries with:</p>
            <ul>
              <li>Appropriate data protection safeguards</li>
              <li>Compliance with international regulations</li>
              <li>Standard contractual clauses</li>
            </ul>

            <h2>10. Contact Us</h2>
            <p>For any privacy-related questions or concerns:</p>
            <ul>
              <li>Email: privacy@molochain.com</li>
              <li>Phone: Contact via email</li>
              <li>Address: Maslak Mah. Eski Büyükdere Cad. Ayazağa Yolu, Giz2000 Plaza No:7 Şişli / İstanbul TÜRKİYE</li>
            </ul>

            <p className="mt-8 text-sm text-gray-600">
              This privacy policy is designed to help you understand how we collect, use, and protect your personal information while using our logistics services.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}