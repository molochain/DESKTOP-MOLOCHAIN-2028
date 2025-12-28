import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const COLORS = [
  "#4f46e5",
  "#0891b2",
  "#2dd4bf",
  "#84cc16",
  "#eab308",
  "#f97316",
  "#ec4899",
];

export default function ProductTypeAnalytics() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["/api/analytics/product-types"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading product type analytics
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Product Type Analytics</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Product Types</CardTitle>
            <CardDescription>All registered product categories</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{data.totalProductTypes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Special Handling Required</CardTitle>
            <CardDescription>Products needing special care</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{data.specialHandlingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transport Modes</CardTitle>
            <CardDescription>Available shipping methods</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {data.transportModeUsage.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Shipments by Product Type Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Shipments by Product Type</CardTitle>
          <CardDescription>Distribution of shipments across product categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.productTypeStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="shipments"
                  name="Total Shipments"
                  fill="#4f46e5"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Transport Mode Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Transport Mode Distribution</CardTitle>
          <CardDescription>Usage frequency of different transport modes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.transportModeUsage}
                  dataKey="count"
                  nameKey="mode"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  label
                >
                  {data.transportModeUsage.map((_entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Handling Requirements Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Handling Requirements</CardTitle>
          <CardDescription>Special handling needs by product type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.handlingStats.map((stat: any) => (
              <div
                key={stat.name}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <h3 className="font-semibold text-lg">{stat.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {stat.requirements}
                </p>
                {stat.sustainabilityMetrics && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-green-600">
                      Sustainability Metrics:
                    </p>
                    <pre className="text-xs bg-gray-50 p-2 rounded mt-1">
                      {JSON.stringify(stat.sustainabilityMetrics, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
