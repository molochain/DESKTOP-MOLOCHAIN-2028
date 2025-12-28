import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, DollarSign, Users, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Revenue projection data
const revenueProjections = [
  { year: '2025', revenue: 1.2, profit: 0.2, users: 0.5 },
  { year: '2026', revenue: 5.8, profit: 1.5, users: 2.1 },
  { year: '2027', revenue: 18.5, profit: 6.2, users: 5.8 },
  { year: '2028', revenue: 45.0, profit: 18.0, users: 12.3 },
  { year: '2029', revenue: 95.0, profit: 42.0, users: 25.0 },
  { year: '2030', revenue: 180.0, profit: 90.0, users: 50.0 },
];

// Token distribution data
const tokenDistribution = [
  { name: 'Public Sale', value: 30, amount: 300000000, color: '#FF6B6B' },
  { name: 'Ecosystem Fund', value: 25, amount: 250000000, color: '#4ECDC4' },
  { name: 'Team & Advisors', value: 20, amount: 200000000, color: '#45B7D1' },
  { name: 'Strategic Partners', value: 15, amount: 150000000, color: '#FFA07A' },
  { name: 'Treasury', value: 10, amount: 100000000, color: '#98D8C8' },
];

// Market growth data
const marketGrowth = [
  { quarter: 'Q1 2025', logistics: 2300, blockchain: 450, combined: 2750 },
  { quarter: 'Q2 2025', logistics: 2400, blockchain: 520, combined: 2920 },
  { quarter: 'Q3 2025', logistics: 2550, blockchain: 600, combined: 3150 },
  { quarter: 'Q4 2025', logistics: 2700, blockchain: 700, combined: 3400 },
  { quarter: 'Q1 2026', logistics: 2850, blockchain: 850, combined: 3700 },
  { quarter: 'Q2 2026', logistics: 3000, blockchain: 1000, combined: 4000 },
];

// Investment tiers ROI
const investmentROI = [
  { tier: 'Bronze', investment: 10, roi2025: 12, roi2026: 25, roi2027: 45, roi2028: 80 },
  { tier: 'Silver', investment: 50, roi2025: 65, roi2026: 140, roi2027: 260, roi2028: 450 },
  { tier: 'Gold', investment: 100, roi2025: 135, roi2026: 290, roi2027: 540, roi2028: 950 },
  { tier: 'Platinum', investment: 500, roi2025: 700, roi2026: 1500, roi2027: 2800, roi2028: 5000 },
];

// Format currency
const formatCurrency = (value: number) => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}B`;
  }
  return `$${value}M`;
};

// Format percentage
const formatPercent = (value: number) => `${value}%`;

// Custom tooltip for revenue chart
const RevenueTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
        <p className="font-semibold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function InvestorCharts() {
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Market Opportunity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$9.1T</div>
            <p className="text-xs text-muted-foreground mt-1">Global Logistics Market</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Supply</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1B</div>
            <p className="text-xs text-muted-foreground mt-1">MOLOCHAIN Tokens</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">2030 Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$180M</div>
            <p className="text-xs text-muted-foreground mt-1">Projected Revenue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expected Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">50M</div>
            <p className="text-xs text-muted-foreground mt-1">By 2030</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Projections Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Revenue & Growth Projections (2025-2030)
          </CardTitle>
          <CardDescription>
            Projected revenue, profit margins, and user growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={revenueProjections}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip content={<RevenueTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8B5CF6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={2}
                name="Revenue (M)"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorProfit)"
                strokeWidth={2}
                name="Profit (M)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Token Distribution & Market Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>MOLOCHAIN Token Distribution</CardTitle>
            <CardDescription>
              Total Supply: 1 Billion Tokens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tokenDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tokenDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value}%`, 'Allocation']} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Token Distribution Legend */}
            <div className="mt-4 space-y-2">
              {tokenDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-mono text-muted-foreground">
                    {(item.amount / 1000000).toFixed(0)}M
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Market Growth Trajectory</CardTitle>
            <CardDescription>
              Combined logistics & blockchain market (in Billions)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marketGrowth}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(1)}T`} />
                <Tooltip formatter={(value: any) => [`$${value}B`, '']} />
                <Legend />
                <Bar dataKey="logistics" fill="#FF6B6B" name="Logistics Market" />
                <Bar dataKey="blockchain" fill="#4ECDC4" name="Blockchain Market" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Investment ROI Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Investment Tier ROI Projections
          </CardTitle>
          <CardDescription>
            Expected returns by investment tier (in thousands USD)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={investmentROI}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="tier" />
              <YAxis tickFormatter={(value) => `$${value}K`} />
              <Tooltip formatter={(value: any) => [`$${value}K`, 'Returns']} />
              <Legend />
              <Line type="monotone" dataKey="investment" stroke="#8B5CF6" strokeWidth={2} name="Initial Investment" />
              <Line type="monotone" dataKey="roi2025" stroke="#FF6B6B" strokeWidth={2} name="2025 Returns" />
              <Line type="monotone" dataKey="roi2026" stroke="#4ECDC4" strokeWidth={2} name="2026 Returns" />
              <Line type="monotone" dataKey="roi2027" stroke="#45B7D1" strokeWidth={2} name="2027 Returns" />
              <Line type="monotone" dataKey="roi2028" stroke="#10B981" strokeWidth={3} name="2028 Returns" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}