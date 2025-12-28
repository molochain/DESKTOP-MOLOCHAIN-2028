import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";

interface Region {
  id: number;
  name: string;
  code: string;
  timezone: string;
}

interface ServiceAvailability {
  available: boolean;
  restrictions?: {
    max_weight?: number;
    dangerous_goods?: boolean;
    min_volume?: number;
    hazmat_certified?: boolean;
  };
  leadTime?: number;
  region: {
    name: string;
    code: string;
    timezone: string;
  };
}

interface ServiceAvailabilityCheckerProps {
  serviceCode: string;
  serviceName: string;
}

export function ServiceAvailabilityChecker({ serviceCode, serviceName }: ServiceAvailabilityCheckerProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  const { data: regions } = useQuery<Region[]>({
    queryKey: ["/api/regions"],
  });

  const { data: availability, isLoading } = useQuery<ServiceAvailability>({
    queryKey: [`/api/services/${serviceCode}/availability/${selectedRegion}`],
    enabled: !!selectedRegion,
  });

  const getRestrictionText = (restrictions: ServiceAvailability["restrictions"]) => {
    if (!restrictions) return null;
    const items = [];
    if (restrictions.max_weight) {
      items.push(`Maximum weight: ${restrictions.max_weight}kg`);
    }
    if (restrictions.min_volume) {
      items.push(`Minimum volume: ${restrictions.min_volume}m³`);
    }
    if (restrictions.dangerous_goods === false) {
      items.push("No dangerous goods allowed");
    }
    if (restrictions.hazmat_certified) {
      items.push("Hazmat certification required");
    }
    return items;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Check {serviceName} Availability</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Region</label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a region" />
              </SelectTrigger>
              <SelectContent>
                {regions?.map((region) => (
                  <SelectItem key={region.code} value={region.code}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRegion && availability && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {availability.available ? (
                  <>
                    <CheckCircle2 className="text-green-500 h-5 w-5" />
                    <span className="text-green-700 font-medium">
                      Service is available in {availability.region.name}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="text-red-500 h-5 w-5" />
                    <span className="text-red-700 font-medium">
                      Service is not available in {availability.region.name}
                    </span>
                  </>
                )}
              </div>

              {availability.available && (
                <>
                  {availability.leadTime && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>Expected lead time: {availability.leadTime} hours</span>
                    </div>
                  )}

                  {availability.restrictions && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span>Service Restrictions:</span>
                      </div>
                      <ul className="list-disc list-inside text-sm text-gray-600 pl-6 space-y-1">
                        {getRestrictionText(availability.restrictions)?.map((restriction) => (
                          <li key={restriction}>{restriction}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
