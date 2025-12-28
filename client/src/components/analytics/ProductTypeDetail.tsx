import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function ProductTypeDetail() {
  const { id } = useParams();
  const { data, error, isLoading } = useQuery({
    queryKey: [`/api/analytics/product-types/${id}`],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading product type details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading product type details
        </AlertDescription>
      </Alert>
    );
  }

  const shipmentData = [
    {
      name: "Total",
      value: data.totalShipments,
      fill: "#4f46e5",
    },
    {
      name: "Completed",
      value: data.completedShipments,
      fill: "#84cc16",
    },
    {
      name: "Delayed",
      value: data.delayedShipments,
      fill: "#f97316",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/analytics/product-types">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{data.name}</h1>
      </div>

      {/* Product Details */}
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Detailed product type specifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Description</h3>
              <p className="text-gray-600">{data.description}</p>
            </div>
            <div>
              <h3 className="font-medium">Handling Requirements</h3>
              <p className="text-gray-600">{data.handlingRequirements}</p>
            </div>
            <div>
              <h3 className="font-medium">Compatible Transport Modes</h3>
              <div className="flex gap-2 flex-wrap">
                {data.compatibleTransportModes?.map((mode: string) => (
                  <span
                    key={mode}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {mode}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shipment Distribution</CardTitle>
            <CardDescription>Overview of shipment statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="30%"
                  outerRadius="100%"
                  data={shipmentData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    minAngle={15}
                    label={{ fill: "#666", position: "insideStart" }}
                    background
                    dataKey="value"
                  />
                  <Legend
                    iconSize={10}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                  />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Route Optimization Impact</CardTitle>
            <CardDescription>Savings from route optimization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Average Distance Saved</p>
                <p className="text-2xl font-bold">
                  {data.optimizationStats.averageDistanceSaved?.toFixed(2)} km
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Time Saved</p>
                <p className="text-2xl font-bold">
                  {data.optimizationStats.averageTimeSaved?.toFixed(2)} hours
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Fuel Saved</p>
                <p className="text-2xl font-bold">
                  {data.optimizationStats.averageFuelSaved?.toFixed(2)} L
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Analytics Accuracy */}
      <Card>
        <CardHeader>
          <CardTitle>Predictive Analytics Performance</CardTitle>
          <CardDescription>Accuracy of delivery time predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Predictions</p>
              <p className="text-2xl font-bold">{data.analyticsAccuracy.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Accurate Predictions</p>
              <p className="text-2xl font-bold">
                {data.analyticsAccuracy.accurate}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Accuracy Rate</p>
              <p className="text-2xl font-bold">
                {(data.analyticsAccuracy.accuracyRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sustainability Metrics */}
      {data.sustainabilityMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Sustainability Metrics</CardTitle>
            <CardDescription>Environmental impact measurements</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto">
              {JSON.stringify(data.sustainabilityMetrics, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
