import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, PieChart, Calculator } from 'lucide-react';

export const FinancialIntelligence = () => {
  return (
    <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
            <DollarSign className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <CardTitle className="text-xl text-gray-900 dark:text-white">AI Financial Intelligence</CardTitle>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              Enhanced Accounting
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-gray-900 dark:text-white font-medium">Revenue Forecasting</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">AI-powered predictions</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <PieChart className="h-5 w-5 text-purple-400" />
              <div>
                <div className="text-gray-900 dark:text-white font-medium">Expense Analytics</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Smart categorization</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <Calculator className="h-5 w-5 text-yellow-400" />
              <div>
                <div className="text-gray-900 dark:text-white font-medium">Risk Assessment</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Financial health</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};