import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { 
  Package2, 
  Building2, 
  Cog, 
  SunMedium, 
  Apple, 
  Car, 
  Boxes, 
  Wine,
  Droplet,
  Shirt,
  Pill
} from "lucide-react";
import SeasonalTrends from "@/components/analytics/SeasonalTrends";
import NewsFeeds from "@/components/commodities/NewsFeeds";

interface CommodityInfo {
  name: string;
  description: string;
  icon: JSX.Element;
  transportationModes: string[];
  businessCycle: {
    date: string;
    volume: number;
  }[];
  marketTrends: string[];
  primaryRoutes: {
    from: string;
    to: string;
    volume: string;
  }[];
}

const commodityData: Record<string, CommodityInfo> = {
  electronics: {
    name: "Electronics",
    description: "Consumer and industrial electronic components, devices, and equipment.",
    icon: <Package2 className="w-6 h-6" />,
    transportationModes: ["Air Freight", "Sea Container", "Express Courier"],
    businessCycle: [
      { date: "2024-01", volume: 1200 },
      { date: "2024-02", volume: 1350 },
      { date: "2024-03", volume: 1100 },
      { date: "2024-04", volume: 1450 },
      { date: "2024-05", volume: 1600 }
    ],
    marketTrends: [
      "Growing demand in emerging markets",
      "Seasonal peaks during holiday seasons",
      "Increasing focus on semiconductor shipments"
    ],
    primaryRoutes: [
      { from: "Shanghai", to: "Rotterdam", volume: "2000 TEU/month" },
      { from: "Shenzhen", to: "Los Angeles", volume: "1500 TEU/month" },
      { from: "Singapore", to: "Dubai", volume: "1000 TEU/month" }
    ]
  },
  pharmaceuticals: {
    name: "Pharmaceuticals",
    description: "Medical supplies, medicines, and healthcare products.",
    icon: <Pill className="w-6 h-6" />,
    transportationModes: ["Temperature Controlled Air", "Reefer Container", "Secure Ground"],
    businessCycle: [
      { date: "2024-01", volume: 800 },
      { date: "2024-02", volume: 850 },
      { date: "2024-03", volume: 900 },
      { date: "2024-04", volume: 750 },
      { date: "2024-05", volume: 950 }
    ],
    marketTrends: [
      "Increased vaccine transportation",
      "Growing cold chain logistics demand",
      "Stricter regulatory compliance"
    ],
    primaryRoutes: [
      { from: "Basel", to: "New York", volume: "500 TEU/month" },
      { from: "Mumbai", to: "Lagos", volume: "300 TEU/month" },
      { from: "Brussels", to: "Singapore", volume: "400 TEU/month" }
    ]
  },
  // Add other commodities following the same pattern
};

export default function CommodityDetail({ type }: { type: string }) {
  const commodityInfo = commodityData[type.toLowerCase()];

  if (!commodityInfo) {
    return (
      <div className="p-4">
        <h1>Commodity type not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          {commodityInfo.icon}
        </div>
        <h1 className="text-3xl font-bold">{commodityInfo.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{commodityInfo.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {commodityInfo.transportationModes.map((mode) => (
              <Badge key={mode} variant="secondary">
                {mode}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <SeasonalTrends
        historicalData={commodityInfo.businessCycle}
        commodityType={type}
      />

      <NewsFeeds commodityType={type} />

      <Card>
        <CardHeader>
          <CardTitle>Business Cycle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={commodityInfo.businessCycle}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="volume" stroke="#2563eb" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {commodityInfo.marketTrends.map((trend, index) => (
                <li key={index} className="text-gray-600">{trend}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Primary Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commodityInfo.primaryRoutes.map((route, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <span className="font-medium">{route.from}</span>
                    <span className="mx-2">→</span>
                    <span className="font-medium">{route.to}</span>
                  </div>
                  <Badge variant="outline">{route.volume}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}