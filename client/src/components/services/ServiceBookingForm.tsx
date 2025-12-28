import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const contactReasons = [
  { value: "general_inquiry", label: "General Inquiry" },
  { value: "pricing_question", label: "Pricing Question" },
  { value: "partnership", label: "Partnership Opportunity" },
  { value: "support", label: "Customer Support" },
  { value: "feedback", label: "Feedback" },
  { value: "other", label: "Other" },
] as const;

const consultationTopics = [
  { value: "logistics_strategy", label: "Logistics Strategy" },
  { value: "supply_chain_optimization", label: "Supply Chain Optimization" },
  { value: "cost_reduction", label: "Cost Reduction" },
  { value: "technology_integration", label: "Technology Integration" },
  { value: "compliance_regulations", label: "Compliance & Regulations" },
  { value: "custom_solutions", label: "Custom Solutions" },
] as const;

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00"
];

const baseContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
});

const bookingFormSchema = z.object({
  requestType: z.literal("booking"),
  requestedDate: z.date({
    required_error: "Please select a date for the service",
  }),
  cargoDetails: z.object({
    type: z.string().min(1, "Please specify cargo type"),
    category: z.string().min(1, "Please select cargo category"),
    weight: z.string().min(1, "Please specify weight"),
    weightUnit: z.string().min(1, "Please select weight unit"),
    dimensions: z.string().min(1, "Please specify dimensions"),
    quantity: z.string().min(1, "Please specify quantity"),
    value: z.string().min(1, "Please specify cargo value"),
    currency: z.string().min(1, "Please select currency"),
    dangerousGoods: z.boolean().default(false),
    temperature: z.string().optional(),
    packaging: z.string().min(1, "Please specify packaging type"),
  }),
  specialRequirements: z.string().optional(),
  loadingRequirements: z.string().optional(),
  insurance: z.boolean().default(false),
  originAddress: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State/Province is required"),
    country: z.string().min(1, "Country is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    contactName: z.string().min(1, "Contact name is required"),
    contactPhone: z.string().min(1, "Contact phone is required"),
  }),
  destinationAddress: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State/Province is required"),
    country: z.string().min(1, "Country is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    contactName: z.string().min(1, "Contact name is required"),
    contactPhone: z.string().min(1, "Contact phone is required"),
  }),
  regionCode: z.string().min(1, "Please select a region"),
});

const consultationFormSchema = z.object({
  requestType: z.literal("consultation"),
  contact: baseContactSchema,
  consultationDate: z.date({
    required_error: "Please select a preferred date",
  }),
  consultationTime: z.string().min(1, "Please select a preferred time"),
  topic: z.string().min(1, "Please select a consultation topic"),
  message: z.string().optional(),
});

const contactFormSchema = z.object({
  requestType: z.literal("contact"),
  contact: baseContactSchema,
  subject: z.string().min(1, "Please select a reason for contact"),
  message: z.string().min(10, "Please provide a detailed message (at least 10 characters)"),
});

const formSchema = z.discriminatedUnion("requestType", [
  bookingFormSchema,
  consultationFormSchema,
  contactFormSchema,
]);

type FormData = z.infer<typeof formSchema>;

interface ServiceBookingFormProps {
  serviceCode: string;
  serviceName: string;
  onSuccess?: () => void;
}

export function ServiceBookingForm({ serviceCode, serviceName, onSuccess }: ServiceBookingFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [requestType, setRequestType] = useState<"booking" | "consultation" | "contact">("booking");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requestType: "booking",
      cargoDetails: {
        dangerousGoods: false,
        type: "",
        category: "",
        weight: "",
        weightUnit: "",
        dimensions: "",
        quantity: "",
        value: "",
        currency: "",
        packaging: "",
      },
      insurance: false,
      specialRequirements: "",
      loadingRequirements: "",
      originAddress: {
        street: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        contactName: "",
        contactPhone: "",
      },
      destinationAddress: {
        street: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        contactName: "",
        contactPhone: "",
      },
      regionCode: "",
    } as FormData,
  });

  const handleRequestTypeChange = (value: "booking" | "consultation" | "contact") => {
    setRequestType(value);
    
    if (value === "booking") {
      form.reset({
        requestType: "booking",
        cargoDetails: {
          dangerousGoods: false,
          type: "",
          category: "",
          weight: "",
          weightUnit: "",
          dimensions: "",
          quantity: "",
          value: "",
          currency: "",
          packaging: "",
        },
        insurance: false,
        specialRequirements: "",
        loadingRequirements: "",
        originAddress: {
          street: "",
          city: "",
          state: "",
          country: "",
          postalCode: "",
          contactName: "",
          contactPhone: "",
        },
        destinationAddress: {
          street: "",
          city: "",
          state: "",
          country: "",
          postalCode: "",
          contactName: "",
          contactPhone: "",
        },
        regionCode: "",
      } as FormData);
    } else if (value === "consultation") {
      form.reset({
        requestType: "consultation",
        contact: {
          name: "",
          email: "",
          phone: "",
        },
        consultationTime: "",
        topic: "",
        message: "",
      } as FormData);
    } else {
      form.reset({
        requestType: "contact",
        contact: {
          name: "",
          email: "",
          phone: "",
        },
        subject: "",
        message: "",
      } as FormData);
    }
  };

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const endpoint = data.requestType === "booking" 
        ? "/api/bookings" 
        : data.requestType === "consultation"
        ? "/api/consultations"
        : "/api/contact";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          serviceCode,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        const errorText = await response.text();
        throw new Error(errorText);
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      const messages = {
        booking: "Your service booking request has been submitted successfully.",
        consultation: "Your consultation request has been submitted. We will contact you shortly.",
        contact: "Your message has been sent successfully. We will get back to you soon.",
      };
      
      toast({
        title: variables.requestType === "booking" ? "Booking Submitted" : 
               variables.requestType === "consultation" ? "Consultation Requested" : "Message Sent",
        description: messages[variables.requestType],
      });
      
      handleRequestTypeChange(requestType);
      onSuccess?.();
    },
    onError: (error: Error) => {
      if (error.message === "Unauthorized") {
        toast({
          title: "Authentication Required",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        setLocation("/login");
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    submitMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" data-testid="service-booking-form">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">What would you like to do?</h3>
            <FormField
              control={form.control}
              name="requestType"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      value={requestType}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleRequestTypeChange(value as "booking" | "consultation" | "contact");
                      }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      data-testid="request-type-group"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="booking" id="booking" data-testid="request-type-booking" />
                        <Label htmlFor="booking" className="cursor-pointer">
                          <div>
                            <p className="font-medium">Book Service</p>
                            <p className="text-sm text-muted-foreground">Request a service booking</p>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="consultation" id="consultation" data-testid="request-type-consultation" />
                        <Label htmlFor="consultation" className="cursor-pointer">
                          <div>
                            <p className="font-medium">Request Consultation</p>
                            <p className="text-sm text-muted-foreground">Schedule a consultation call</p>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="contact" id="contact" data-testid="request-type-contact" />
                        <Label htmlFor="contact" className="cursor-pointer">
                          <div>
                            <p className="font-medium">Contact Us</p>
                            <p className="text-sm text-muted-foreground">Send us a message</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {requestType === "booking" && (
          <div className="grid gap-8">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Service Details</h3>
                <FormField
                  control={form.control}
                  name="requestedDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Requested Service Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="input-booking-date"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            data-testid="calendar-booking-date"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Cargo Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="cargoDetails.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo Type</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Electronics, Machinery..." 
                            {...field} 
                            data-testid="input-cargo-type"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cargoDetails.category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-cargo-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general">General Cargo</SelectItem>
                            <SelectItem value="hazardous">Hazardous Materials</SelectItem>
                            <SelectItem value="perishable">Perishable Goods</SelectItem>
                            <SelectItem value="fragile">Fragile Items</SelectItem>
                            <SelectItem value="valuable">High-Value Items</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cargoDetails.weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            placeholder="Enter weight" 
                            {...field} 
                            data-testid="input-cargo-weight"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cargoDetails.weightUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-weight-unit">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                            <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                            <SelectItem value="tons">Metric Tons</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cargoDetails.dimensions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dimensions (L x W x H)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 100 x 50 x 75 cm" 
                            {...field} 
                            data-testid="input-cargo-dimensions"
                          />
                        </FormControl>
                        <FormDescription>Length x Width x Height in centimeters</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cargoDetails.quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 10 pallets, 100 boxes" 
                            {...field} 
                            data-testid="input-cargo-quantity"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cargoDetails.value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo Value</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            placeholder="Enter value" 
                            {...field} 
                            data-testid="input-cargo-value"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cargoDetails.currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-currency">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cargoDetails.packaging"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Packaging Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-packaging">
                              <SelectValue placeholder="Select packaging" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pallets">Pallets</SelectItem>
                            <SelectItem value="boxes">Boxes</SelectItem>
                            <SelectItem value="crates">Crates</SelectItem>
                            <SelectItem value="containers">Containers</SelectItem>
                            <SelectItem value="drums">Drums</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cargoDetails.dangerousGoods"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-dangerous-goods"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Contains Dangerous Goods</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Origin Address</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="originAddress.street"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-origin-street" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originAddress.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-origin-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originAddress.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-origin-state" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originAddress.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-origin-country" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originAddress.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-origin-postal" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originAddress.contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-origin-contact-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originAddress.contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-origin-contact-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Destination Address</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="destinationAddress.street"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-destination-street" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="destinationAddress.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-destination-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="destinationAddress.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-destination-state" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="destinationAddress.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-destination-country" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="destinationAddress.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-destination-postal" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="destinationAddress.contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-destination-contact-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="destinationAddress.contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-destination-contact-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Additional Requirements</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="specialRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requirements</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special handling instructions or requirements..."
                            className="resize-none"
                            {...field}
                            data-testid="textarea-special-requirements"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="loadingRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loading/Unloading Requirements</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Specific loading or unloading instructions..."
                            className="resize-none"
                            {...field}
                            data-testid="textarea-loading-requirements"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="insurance"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-insurance"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Include Cargo Insurance</FormLabel>
                          <FormDescription>
                            Add insurance coverage for your shipment
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Service Region</h3>
                <FormField
                  control={form.control}
                  name="regionCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-region">
                            <SelectValue placeholder="Select service region" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NA">North America</SelectItem>
                          <SelectItem value="EU">Europe</SelectItem>
                          <SelectItem value="APAC">Asia Pacific</SelectItem>
                          <SelectItem value="ME">Middle East</SelectItem>
                          <SelectItem value="AF">Africa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {requestType === "consultation" && (
          <div className="grid gap-8">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Your Contact Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contact.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            {...field} 
                            data-testid="input-consultation-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="your@email.com" 
                            {...field} 
                            data-testid="input-consultation-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact.phone"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder="+1 (555) 000-0000" 
                            {...field} 
                            data-testid="input-consultation-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Consultation Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="consultationDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Preferred Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="input-consultation-date"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Select date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                              data-testid="calendar-consultation-date"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consultationTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-consultation-time">
                              <SelectValue placeholder="Select time slot">
                                {field.value && (
                                  <span className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {field.value}
                                  </span>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Consultation Topic</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-consultation-topic">
                              <SelectValue placeholder="Select a topic" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {consultationTopics.map((topic) => (
                              <SelectItem key={topic.value} value={topic.value}>
                                {topic.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Additional Information (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us more about what you'd like to discuss..."
                            className="resize-none min-h-[100px]"
                            {...field}
                            data-testid="textarea-consultation-message"
                          />
                        </FormControl>
                        <FormDescription>
                          Provide any details that will help us prepare for your consultation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {requestType === "contact" && (
          <div className="grid gap-8">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Your Contact Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contact.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            {...field} 
                            data-testid="input-contact-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="your@email.com" 
                            {...field} 
                            data-testid="input-contact-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact.phone"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder="+1 (555) 000-0000" 
                            {...field} 
                            data-testid="input-contact-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Your Message</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Contact</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-contact-subject">
                              <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {contactReasons.map((reason) => (
                              <SelectItem key={reason.value} value={reason.value}>
                                {reason.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="How can we help you?"
                            className="resize-none min-h-[150px]"
                            {...field}
                            data-testid="textarea-contact-message"
                          />
                        </FormControl>
                        <FormDescription>
                          Please provide as much detail as possible
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={submitMutation.isPending}
          data-testid="button-submit"
        >
          {submitMutation.isPending 
            ? "Submitting..." 
            : requestType === "booking" 
              ? "Book Service" 
              : requestType === "consultation"
                ? "Request Consultation"
                : "Send Message"
          }
        </Button>
      </form>
    </Form>
  );
}
