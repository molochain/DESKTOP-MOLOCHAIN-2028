import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DataPoint {
  date: string;
  actual: number;
  predicted: number;
  confidence_upper: number;
  confidence_lower: number;
}

interface SeasonalTrendsProps {
  historicalData: Array<{
    date: string;
    volume: number;
  }>;
  commodityType: string;
}

export default function SeasonalTrends({ historicalData, commodityType }: SeasonalTrendsProps) {
  const processedData = useMemo(() => {
    // Sort data chronologically
    const sortedData = [...historicalData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate moving averages and seasonal factors
    const movingAverageWindow = 3;
    const seasonalityPeriod = 12; // Monthly seasonality

    // Calculate moving average
    const movingAverages = sortedData.map((_, index) => {
      if (index < movingAverageWindow - 1) return null;
      
      const windowSum = sortedData
        .slice(index - movingAverageWindow + 1, index + 1)
        .reduce((sum, item) => sum + item.volume, 0);
      
      return windowSum / movingAverageWindow;
    });

    // Calculate seasonal indices
    const seasonalIndices = Array(seasonalityPeriod).fill(0);
    const seasonCounts = Array(seasonalityPeriod).fill(0);

    sortedData.forEach((item, index) => {
      if (movingAverages[index]) {
        const month = new Date(item.date).getMonth();
        seasonalIndices[month] += item.volume / movingAverages[index]!;
        seasonCounts[month]++;
      }
    });

    // Normalize seasonal indices
    const normalizedIndices = seasonalIndices.map((sum, i) => 
      sum / seasonCounts[i] || 1
    );

    // Generate predictions
    const predictions: DataPoint[] = sortedData.map((item, index) => {
      const date = new Date(item.date);
      const month = date.getMonth();
      const seasonalFactor = normalizedIndices[month];
      const trend = movingAverages[index] || item.volume;
      const predicted = trend * seasonalFactor;
      
      // Calculate confidence intervals (±15%)
      const confidence = predicted * 0.15;

      return {
        date: item.date,
        actual: item.volume,
        predicted: Math.round(predicted),
        confidence_upper: Math.round(predicted + confidence),
        confidence_lower: Math.round(predicted - confidence)
      };
    });

    return predictions;
  }, [historicalData]);

  // Predict next 6 months
  const futurePredictions = useMemo(() => {
    if (processedData.length === 0) return [];

    const lastDate = new Date(processedData[processedData.length - 1].date);
    const futureData: DataPoint[] = [];

    for (let i = 1; i <= 6; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setMonth(lastDate.getMonth() + i);
      
      const lastActual = processedData[processedData.length - 1].actual;
      const predictedValue = lastActual * (1 + (Math.random() * 0.2 - 0.1)); // Simple random walk with ±10% variation
      const confidence = predictedValue * 0.15;

      futureData.push({
        date: futureDate.toISOString().slice(0, 7),
        actual: 0, // No actual data for future dates
        predicted: Math.round(predictedValue),
        confidence_upper: Math.round(predictedValue + confidence),
        confidence_lower: Math.round(predictedValue - confidence)
      });
    }

    return [...processedData, ...futureData];
  }, [processedData]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Seasonal Trends Analysis</span>
          <Badge variant="outline">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={futurePredictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-2 shadow-lg">
                        <p className="font-medium">{label}</p>
                        {payload.map((entry: any) => (
                          <p key={entry.name} className="text-sm">
                            {entry.name}: {entry.value}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#2563eb" 
                name="Actual Volume"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#16a34a" 
                name="Predicted Volume"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="confidence_upper" 
                stroke="#9ca3af" 
                strokeDasharray="3 3"
                name="Confidence Interval"
              />
              <Line 
                type="monotone" 
                dataKey="confidence_lower" 
                stroke="#9ca3af" 
                strokeDasharray="3 3"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
