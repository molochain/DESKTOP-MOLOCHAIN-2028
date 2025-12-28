import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckCircle, Home, Mail, ArrowLeft } from "lucide-react";

const Success = () => {
  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="text-center shadow-lg border-green-200 dark:border-green-900">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-700 dark:text-green-400">
              Thank You!
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Your message has been successfully submitted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400 mb-3">
                <Mail className="w-5 h-5" />
                <span className="font-medium">What happens next?</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Our team will review your message and get back to you as soon as possible. 
                You should expect to hear from us within 1-2 business days.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/">
                <Button variant="default" className="w-full sm:w-auto" data-testid="button-go-home">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="w-full sm:w-auto" data-testid="button-send-another">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Send Another Message
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Success;
