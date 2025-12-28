import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FinancialIntelligence } from '../components/FinancialIntelligence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, PieChart, CreditCard, Calculator } from 'lucide-react';

export default function AccountingDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
            <DollarSign className="h-8 w-8 text-gray-900 dark:text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Accounting & Financial Control
            </h1>
            <p className="text-gray-600 dark:text-gray-400">AI-powered financial intelligence and comprehensive accounting management</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="governance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="core">Core Systems</TabsTrigger>
          <TabsTrigger value="application">Applications</TabsTrigger>
          <TabsTrigger value="presentation">Presentation</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="governance">
          <div className="space-y-6">
            <FinancialIntelligence />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">$127.5M</div>
                  <p className="text-gray-600 dark:text-gray-400">+12% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                    Profit Margin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">23.8%</div>
                  <p className="text-gray-600 dark:text-gray-400">Above target</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-purple-400" />
                    Operating Costs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">$34.5M</div>
                  <p className="text-gray-600 dark:text-gray-400">-3.2% optimization</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-yellow-400" />
                    Cash Flow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-400">$18.3M</div>
                  <p className="text-gray-600 dark:text-gray-400">Healthy reserves</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="core">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-blue-400">General Ledger</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">Core accounting system with real-time transaction processing</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Daily Transactions</span>
                    <span className="font-bold">12,847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Accounts Active</span>
                    <span className="font-bold">3,256</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400">Budget Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">Real-time budget tracking and variance analysis</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Budget Utilization</span>
                    <span className="font-bold">78.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Variance</span>
                    <span className="font-bold text-green-400">-2.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="application">
          <div className="space-y-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Financial Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <Calculator className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm">Tax Calculator</p>
                  </button>
                  <button className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <PieChart className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm">Cost Analysis</p>
                  </button>
                  <button className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm">Forecasting</p>
                  </button>
                  <button className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <DollarSign className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-sm">Invoicing</p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="presentation">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Financial Reports & Dashboards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Interactive financial reports and real-time dashboards for stakeholders
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Monthly Financial Report</span>
                    <button className="text-blue-400 hover:text-blue-300">View →</button>
                  </div>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Quarterly Earnings Dashboard</span>
                    <button className="text-blue-400 hover:text-blue-300">View →</button>
                  </div>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Annual Budget Overview</span>
                    <button className="text-blue-400 hover:text-blue-300">View →</button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>System Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-semibold mb-2">Banking Systems</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Direct integration with 50+ banking partners</p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-semibold mb-2">ERP Systems</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">SAP, Oracle, Microsoft Dynamics integration</p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-semibold mb-2">Payment Gateways</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Stripe, PayPal, Square connected</p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-semibold mb-2">Tax Systems</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Automated tax filing and compliance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}