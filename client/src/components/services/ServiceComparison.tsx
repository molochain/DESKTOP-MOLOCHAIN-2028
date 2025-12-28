import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Check, X, Plus, Minus, ArrowRight, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  features: string[];
  benefits: string[];
  tags: string[];
  basePrice?: number;
  rating?: number;
  reviewCount?: number;
  deliveryTime?: string;
  availability?: string[];
}

interface ServiceComparisonProps {
  services?: Service[];
  maxServices?: number;
}

export function ServiceComparison({ 
  services: initialServices = [], 
  maxServices = 4 
}: ServiceComparisonProps) {
  const { toast } = useToast();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [comparisonCriteria, setComparisonCriteria] = useState<string[]>([
    'features',
    'pricing',
    'delivery',
    'availability'
  ]);

  // Fetch all available services
  const { data: servicesData } = useQuery({
    queryKey: ['/api/services'],
    enabled: !initialServices.length,
  });

  const allServices = (servicesData as { data?: Service[] })?.data || [];
  const services = initialServices.length > 0 ? initialServices : allServices;

  // Track comparison in analytics
  const trackComparisonMutation = useMutation({
    mutationFn: async (data: { services: string[]; criteria: string[]; selectedService?: string }) => {
      const response = await fetch('/api/services/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to track comparison');
      }
      return response.json();
    },
    onSuccess: () => {
      if (import.meta.env.DEV) {
        console.log('Comparison tracked successfully');
      }
    },
  });

  const toggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else if (selectedServices.length < maxServices) {
      const newSelection = [...selectedServices, serviceId];
      setSelectedServices(newSelection);
      
      // Track comparison when 2+ services are selected
      if (newSelection.length >= 2) {
        trackComparisonMutation.mutate({
          services: newSelection,
          criteria: comparisonCriteria,
        });
      }
    } else {
      toast({
        title: 'Maximum services reached',
        description: `You can compare up to ${maxServices} services at once`,
        variant: 'destructive',
      });
    }
  };

  const getSelectedServiceData = (): Service[] => {
    return selectedServices
      .map(id => services.find((s: Service) => s.id === id))
      .filter(Boolean) as Service[];
  };

  const compareFeature = (service: Service, feature: string): boolean => {
    return service.features?.includes(feature) || false;
  };

  const getAllFeatures = (): string[] => {
    const featuresSet = new Set<string>();
    getSelectedServiceData().forEach(service => {
      service.features?.forEach(feature => featuresSet.add(feature));
    });
    return Array.from(featuresSet);
  };

  const selectedServiceData = getSelectedServiceData();
  const allFeatures = getAllFeatures();

  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Loading services...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Services to Compare</CardTitle>
          <CardDescription>
            Choose up to {maxServices} services to compare side by side
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {services.map((service: Service) => (
              <Button
                key={service.id}
                variant={selectedServices.includes(service.id) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleService(service.id)}
                data-testid={`button-select-service-${service.id}`}
              >
                {selectedServices.includes(service.id) ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {service.title}
              </Button>
            ))}
          </div>
          
          {selectedServices.length > 0 && (
            <div className="mt-4">
              <Badge variant="secondary">
                {selectedServices.length} of {maxServices} services selected
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selectedServiceData.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Service Comparison</CardTitle>
            <CardDescription>
              Side-by-side comparison of selected services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="min-w-[600px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Criteria</th>
                      {selectedServiceData.map((service) => (
                        <th key={service.id} className="text-center p-4 font-medium">
                          <div className="space-y-2">
                            <div>{service.title}</div>
                            <Badge variant="outline" className="text-xs">
                              {service.category}
                            </Badge>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Basic Information */}
                    <tr className="border-b">
                      <td className="p-4 font-medium">Description</td>
                      {selectedServiceData.map((service) => (
                        <td key={service.id} className="p-4 text-center text-sm">
                          {service.description}
                        </td>
                      ))}
                    </tr>

                    {/* Pricing */}
                    <tr className="border-b bg-muted/50">
                      <td className="p-4 font-medium">Base Price</td>
                      {selectedServiceData.map((service) => (
                        <td key={service.id} className="p-4 text-center">
                          {service.basePrice ? (
                            <div className="text-lg font-semibold">
                              ${service.basePrice}
                            </div>
                          ) : (
                            <Badge variant="secondary">Quote on Request</Badge>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Rating */}
                    <tr className="border-b">
                      <td className="p-4 font-medium">Customer Rating</td>
                      {selectedServiceData.map((service) => (
                        <td key={service.id} className="p-4 text-center">
                          {service.rating ? (
                            <div className="flex items-center justify-center gap-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{service.rating.toFixed(1)}</span>
                              <span className="text-sm text-muted-foreground">
                                ({service.reviewCount || 0})
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No reviews yet</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Delivery Time */}
                    <tr className="border-b bg-muted/50">
                      <td className="p-4 font-medium">Delivery Time</td>
                      {selectedServiceData.map((service) => (
                        <td key={service.id} className="p-4 text-center">
                          {service.deliveryTime || 'Varies'}
                        </td>
                      ))}
                    </tr>

                    {/* Features Comparison */}
                    <tr className="border-b">
                      <td colSpan={selectedServiceData.length + 1} className="p-4 bg-muted/30">
                        <div className="font-semibold">Features</div>
                      </td>
                    </tr>
                    {allFeatures.map((feature, index) => (
                      <tr key={feature} className={index % 2 === 0 ? 'bg-muted/10' : ''}>
                        <td className="p-4 text-sm">{feature}</td>
                        {selectedServiceData.map((service) => (
                          <td key={service.id} className="p-4 text-center">
                            {compareFeature(service, feature) ? (
                              <Check className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-gray-300 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Benefits */}
                    <tr className="border-b">
                      <td colSpan={selectedServiceData.length + 1} className="p-4 bg-muted/30">
                        <div className="font-semibold">Key Benefits</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Benefits</td>
                      {selectedServiceData.map((service) => (
                        <td key={service.id} className="p-4">
                          <ul className="text-sm space-y-1">
                            {service.benefits?.slice(0, 3).map((benefit, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <ArrowRight className="w-3 h-3 mt-0.5 text-green-600 flex-shrink-0" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>

                    {/* Availability */}
                    <tr className="border-b bg-muted/50">
                      <td className="p-4 font-medium">Availability</td>
                      {selectedServiceData.map((service) => (
                        <td key={service.id} className="p-4 text-center">
                          {service.availability ? (
                            <div className="flex flex-wrap gap-1 justify-center">
                              {service.availability.slice(0, 3).map((region) => (
                                <Badge key={region} variant="outline" className="text-xs">
                                  {region}
                                </Badge>
                              ))}
                              {service.availability.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{service.availability.length - 3} more
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Global</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Action Row */}
                    <tr>
                      <td className="p-4"></td>
                      {selectedServiceData.map((service) => (
                        <td key={service.id} className="p-4 text-center">
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => {
                              trackComparisonMutation.mutate({
                                services: selectedServices,
                                criteria: comparisonCriteria,
                                selectedService: service.id,
                              });
                              toast({
                                title: 'Service Selected',
                                description: `You selected ${service.title}`,
                              });
                            }}
                            data-testid={`button-select-${service.id}`}
                          >
                            Select This Service
                          </Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Instructions when fewer than 2 services selected */}
      {selectedServiceData.length < 2 && selectedServices.length > 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Select at least 2 services to start comparing
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}