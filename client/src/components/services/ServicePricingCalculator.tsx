import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calculator, Package, Truck, Calendar, MapPin, DollarSign, Info, Percent } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PricingTier {
  id: number;
  tierName: string;
  description: string | null;
  basePrice: string;
  currency: string;
  billingPeriod: string | null;
  features: any;
  limitations: any;
  discounts: any;
  minOrder: string | null;
  maxOrder: string | null;
  setupFee: string | null;
  isActive: boolean;
}

interface ServicePricingCalculatorProps {
  serviceId: string;
  serviceName: string;
  category?: string;
}

interface CalculationFactors {
  tier: string;
  quantity: number;
  distance: number;
  weight: number;
  duration: number;
  insurance: boolean;
  expressDelivery: boolean;
  specialHandling: boolean;
  customsClearance: boolean;
}

export function ServicePricingCalculator({ 
  serviceId, 
  serviceName, 
  category = 'general' 
}: ServicePricingCalculatorProps) {
  const [factors, setFactors] = useState<CalculationFactors>({
    tier: 'standard',
    quantity: 1,
    distance: 100,
    weight: 50,
    duration: 1,
    insurance: false,
    expressDelivery: false,
    specialHandling: false,
    customsClearance: false,
  });

  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<Record<string, number>>({});

  // Fetch pricing tiers
  const { data: pricingData, isLoading } = useQuery({
    queryKey: [`/api/services/${serviceId}/pricing`],
    enabled: !!serviceId,
  });

  const pricingTiers = (pricingData as { data?: PricingTier[] })?.data || [];

  // Calculate price based on factors
  useEffect(() => {
    calculatePrice();
  }, [factors, pricingTiers]);

  const calculatePrice = () => {
    const selectedTier = pricingTiers.find(t => t.tierName.toLowerCase() === factors.tier) || pricingTiers[0];
    
    if (!selectedTier) {
      setCalculatedPrice(0);
      return;
    }

    const basePrice = parseFloat(selectedTier.basePrice);
    const newBreakdown: Record<string, number> = {
      'Base Price': basePrice,
    };

    let totalPrice = basePrice;

    // Quantity multiplier
    if (factors.quantity > 1) {
      const quantityMultiplier = factors.quantity;
      const quantityPrice = basePrice * (quantityMultiplier - 1) * 0.9; // 10% discount for bulk
      newBreakdown['Quantity Adjustment'] = quantityPrice;
      totalPrice += quantityPrice;
    }

    // Distance factor
    if (factors.distance > 100) {
      const distancePrice = (factors.distance - 100) * 0.5;
      newBreakdown['Distance Surcharge'] = distancePrice;
      totalPrice += distancePrice;
    }

    // Weight factor
    if (factors.weight > 50) {
      const weightPrice = Math.ceil((factors.weight - 50) / 10) * 15;
      newBreakdown['Weight Surcharge'] = weightPrice;
      totalPrice += weightPrice;
    }

    // Duration factor (for rental/time-based services)
    if (factors.duration > 1) {
      const durationPrice = basePrice * (factors.duration - 1) * 0.8;
      newBreakdown['Duration Adjustment'] = durationPrice;
      totalPrice += durationPrice;
    }

    // Additional services
    if (factors.insurance) {
      const insurancePrice = totalPrice * 0.05; // 5% of total
      newBreakdown['Insurance'] = insurancePrice;
      totalPrice += insurancePrice;
    }

    if (factors.expressDelivery) {
      const expressPrice = totalPrice * 0.25; // 25% surcharge
      newBreakdown['Express Delivery'] = expressPrice;
      totalPrice += expressPrice;
    }

    if (factors.specialHandling) {
      const handlingPrice = 50;
      newBreakdown['Special Handling'] = handlingPrice;
      totalPrice += handlingPrice;
    }

    if (factors.customsClearance) {
      const customsPrice = 150;
      newBreakdown['Customs Clearance'] = customsPrice;
      totalPrice += customsPrice;
    }

    // Apply volume discounts
    const volumeDiscount = calculateVolumeDiscount(totalPrice, factors.quantity);
    if (volumeDiscount > 0) {
      newBreakdown['Volume Discount'] = -volumeDiscount;
      totalPrice -= volumeDiscount;
    }

    // Apply setup fee if exists
    if (selectedTier.setupFee) {
      const setupFee = parseFloat(selectedTier.setupFee);
      newBreakdown['Setup Fee'] = setupFee;
      totalPrice += setupFee;
    }

    setBreakdown(newBreakdown);
    setCalculatedPrice(totalPrice);
  };

  const calculateVolumeDiscount = (price: number, quantity: number): number => {
    if (quantity >= 100) return price * 0.15;
    if (quantity >= 50) return price * 0.10;
    if (quantity >= 20) return price * 0.05;
    if (quantity >= 10) return price * 0.03;
    return 0;
  };

  const resetCalculator = () => {
    setFactors({
      tier: 'standard',
      quantity: 1,
      distance: 100,
      weight: 50,
      duration: 1,
      insurance: false,
      expressDelivery: false,
      specialHandling: false,
      customsClearance: false,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Loading pricing information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Pricing Calculator
          </CardTitle>
          <CardDescription>
            Calculate estimated pricing for {serviceName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Input Factors */}
            <div className="space-y-4">
              {/* Service Tier */}
              {pricingTiers.length > 0 && (
                <div>
                  <Label htmlFor="tier">Service Tier</Label>
                  <Select
                    value={factors.tier}
                    onValueChange={(value) => setFactors({ ...factors, tier: value })}
                  >
                    <SelectTrigger id="tier" data-testid="select-pricing-tier">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pricingTiers.map((tier) => (
                        <SelectItem 
                          key={tier.id} 
                          value={tier.tierName.toLowerCase()}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span>{tier.tierName}</span>
                            <Badge variant="secondary" className="ml-2">
                              ${tier.basePrice}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Quantity */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="quantity">
                    <Package className="w-4 h-4 inline mr-1" />
                    Quantity/Units
                  </Label>
                  <span className="text-sm font-medium">{factors.quantity}</span>
                </div>
                <Slider
                  id="quantity"
                  min={1}
                  max={500}
                  step={1}
                  value={[factors.quantity]}
                  onValueChange={([value]) => setFactors({ ...factors, quantity: value })}
                  data-testid="slider-quantity"
                />
              </div>

              {/* Distance */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="distance">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Distance (km)
                  </Label>
                  <span className="text-sm font-medium">{factors.distance} km</span>
                </div>
                <Slider
                  id="distance"
                  min={10}
                  max={5000}
                  step={10}
                  value={[factors.distance]}
                  onValueChange={([value]) => setFactors({ ...factors, distance: value })}
                  data-testid="slider-distance"
                />
              </div>

              {/* Weight */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="weight">
                    <Truck className="w-4 h-4 inline mr-1" />
                    Weight (kg)
                  </Label>
                  <span className="text-sm font-medium">{factors.weight} kg</span>
                </div>
                <Slider
                  id="weight"
                  min={1}
                  max={10000}
                  step={10}
                  value={[factors.weight]}
                  onValueChange={([value]) => setFactors({ ...factors, weight: value })}
                  data-testid="slider-weight"
                />
              </div>

              {/* Duration */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="duration">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Duration (days)
                  </Label>
                  <span className="text-sm font-medium">{factors.duration}</span>
                </div>
                <Slider
                  id="duration"
                  min={1}
                  max={365}
                  step={1}
                  value={[factors.duration]}
                  onValueChange={([value]) => setFactors({ ...factors, duration: value })}
                  data-testid="slider-duration"
                />
              </div>

              {/* Additional Services */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium text-sm">Additional Services</h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="insurance" className="flex items-center gap-2 cursor-pointer">
                    Insurance Coverage
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>5% of total value</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Switch
                    id="insurance"
                    checked={factors.insurance}
                    onCheckedChange={(checked) => setFactors({ ...factors, insurance: checked })}
                    data-testid="switch-insurance"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="express" className="flex items-center gap-2 cursor-pointer">
                    Express Delivery
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>25% surcharge</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Switch
                    id="express"
                    checked={factors.expressDelivery}
                    onCheckedChange={(checked) => setFactors({ ...factors, expressDelivery: checked })}
                    data-testid="switch-express"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="special" className="flex items-center gap-2 cursor-pointer">
                    Special Handling
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>$50 flat fee</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Switch
                    id="special"
                    checked={factors.specialHandling}
                    onCheckedChange={(checked) => setFactors({ ...factors, specialHandling: checked })}
                    data-testid="switch-special"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="customs" className="flex items-center gap-2 cursor-pointer">
                    Customs Clearance
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>$150 flat fee</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Switch
                    id="customs"
                    checked={factors.customsClearance}
                    onCheckedChange={(checked) => setFactors({ ...factors, customsClearance: checked })}
                    data-testid="switch-customs"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Price Breakdown */}
            <div className="space-y-4">
              {/* Price Breakdown */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Price Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(breakdown).map(([item, price]) => (
                    <div key={item} className="flex justify-between text-sm">
                      <span className={price < 0 ? 'text-green-600' : ''}>
                        {item}
                      </span>
                      <span className={`font-medium ${price < 0 ? 'text-green-600' : ''}`}>
                        {price < 0 ? '-' : ''}${Math.abs(price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  
                  {Object.keys(breakdown).length > 0 && (
                    <>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total Estimate</span>
                        <span className="text-2xl font-bold" data-testid="text-total-price">
                          ${calculatedPrice.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Volume Discount Notice */}
              {factors.quantity >= 10 && (
                <Card className="bg-green-50 dark:bg-green-950">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-2">
                      <Percent className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          Volume Discount Applied!
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                          You're saving ${calculateVolumeDiscount(calculatedPrice, factors.quantity).toFixed(2)} 
                          {' '}with your current quantity.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={resetCalculator}
                  className="flex-1"
                  data-testid="button-reset-calculator"
                >
                  Reset
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    // This would typically open the booking form with pre-filled data
                    if (import.meta.env.DEV) {
                      console.log('Proceed with booking:', { factors, calculatedPrice });
                    }
                  }}
                  data-testid="button-get-quote"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Get Quote
                </Button>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-muted-foreground text-center">
                * This is an estimate. Final pricing may vary based on specific requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}