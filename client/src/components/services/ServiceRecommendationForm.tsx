import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export interface ServiceRecommendation {
  serviceId: string;
  serviceName: string;
  matchScore: number;
  reason: string;
}

interface ServiceRecommendationFormProps {
  onRecommendationsReceived: (recommendations: ServiceRecommendation[]) => void;
}

const formSchema = z.object({
  businessType: z.string().min(1, { message: 'Please select your business type' }),
  cargoType: z.string().min(1, { message: 'Please select your cargo type' }),
  requirementsDescription: z.string().min(20, { message: 'Please provide a more detailed description (at least 20 characters)' }),
  specificRequirements: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ServiceRecommendationForm({ onRecommendationsReceived }: ServiceRecommendationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessType: '',
      cargoType: '',
      requirementsDescription: '',
      specificRequirements: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/service-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations. Please try again.');
      }
      
      const recommendations = await response.json();
      onRecommendationsReceived(recommendations);
    } catch (error) {
      // Error getting recommendations - handled by error state
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Tell us about your logistics needs</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="businessType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your business type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="e-commerce">E-Commerce</SelectItem>
                      <SelectItem value="wholesale">Wholesale</SelectItem>
                      <SelectItem value="agriculture">Agriculture</SelectItem>
                      <SelectItem value="mining">Mining & Resources</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cargoType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Cargo Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your cargo type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">General Cargo</SelectItem>
                      <SelectItem value="container">Containerized</SelectItem>
                      <SelectItem value="bulk-dry">Bulk Dry Goods</SelectItem>
                      <SelectItem value="bulk-liquid">Bulk Liquid</SelectItem>
                      <SelectItem value="refrigerated">Refrigerated/Temperature-Controlled</SelectItem>
                      <SelectItem value="hazardous">Hazardous Materials</SelectItem>
                      <SelectItem value="oversized">Oversized/Heavy Lift</SelectItem>
                      <SelectItem value="fragile">Fragile Goods</SelectItem>
                      <SelectItem value="livestock">Livestock/Living Organisms</SelectItem>
                      <SelectItem value="vehicles">Vehicles/Equipment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="requirementsDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Describe your logistics requirements</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us about your logistics needs, challenges, and goals. For example: frequent shipments, international routes, special handling requirements, etc."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="specificRequirements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Any specific requirements or priorities? <span className="text-sm text-muted-foreground">(Optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="E.g., Cost efficiency, speed, sustainability, tracking capabilities, etc."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting recommendations...
              </>
            ) : (
              'Get Personalized Recommendations'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}