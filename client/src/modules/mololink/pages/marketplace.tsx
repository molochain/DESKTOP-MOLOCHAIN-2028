import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { useAuth } from "../lib/auth";
import Header from "../components/header";
import MobileNav from "../components/mobile-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { 
  ShoppingBag, 
  Gavel, 
  Briefcase, 
  Plus, 
  Eye, 
  Clock, 
  DollarSign,
  MapPin,
  Star,
  TrendingUp,
  Package,
  AlertCircle,
  Search,
  Filter
} from "lucide-react";
import type { 
  MarketplaceListing, 
  MarketplaceAuction, 
  MarketplaceServicePost,
  MarketplaceBid 
} from "../lib/schema";

// Form schemas
const createListingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  condition: z.string().optional(),
  location: z.string().optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

const createAuctionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  startingPrice: z.number().min(0.01, "Starting price must be greater than 0"),
  reservePrice: z.number().optional(),
  buyNowPrice: z.number().optional(),
  startTime: z.date(),
  endTime: z.date(),
  autoExtendMinutes: z.number().min(0).max(30).optional(),
  autoExtendEnabled: z.boolean().optional(),
  condition: z.string().optional(),
  location: z.string().optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

const createServiceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  serviceType: z.enum(["one-time", "recurring", "project-based", "retainer"]),
  priceModel: z.enum(["fixed", "hourly", "quote-based", "negotiable"]),
  basePrice: z.number().optional(),
  deliveryTime: z.string().optional(),
  location: z.string().optional(),
  serviceArea: z.array(z.string()).optional(),
  requirements: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

const placeBidSchema = z.object({
  amount: z.number().min(0.01, "Bid amount must be greater than 0"),
  maxAmount: z.number().optional(),
});

function formatPrice(price: number | string): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numericPrice);
}

function formatTimeLeft(endTime: Date): string {
  const now = new Date();
  const end = new Date(endTime);
  const diffMs = end.getTime() - now.getTime();
  
  if (diffMs <= 0) return "Ended";
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function Marketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("listings");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<MarketplaceAuction | null>(null);
  const [showBidDialog, setShowBidDialog] = useState(false);

  // Queries
  const { data: listings = [] } = useQuery<MarketplaceListing[]>({
    queryKey: ["/api/mololink/marketplace/listings", { status: "active" }],
    queryFn: async () => {
      const response = await fetch("/api/mololink/marketplace/listings");
      if (!response.ok) throw new Error("Failed to fetch listings");
      return response.json();
    },
  });

  const { data: auctions = [] } = useQuery<MarketplaceAuction[]>({
    queryKey: ["/api/mololink/marketplace/auctions", { status: "active" }],
    queryFn: async () => {
      const response = await fetch("/api/mololink/marketplace/auctions");
      if (!response.ok) throw new Error("Failed to fetch auctions");
      return response.json();
    },
  });

  const { data: services = [] } = useQuery<MarketplaceServicePost[]>({
    queryKey: ["/api/mololink/marketplace/services", { status: "active" }],
    queryFn: async () => {
      // Note: Backend doesn't have service posts endpoint yet, return empty for now
      return [];
    },
  });

  const { data: auctionBids = [] } = useQuery<MarketplaceBid[]>({
    queryKey: ["/api/mololink/marketplace/auctions", selectedAuction?.id, "bids"],
    queryFn: async () => {
      if (!selectedAuction) return [];
      // For now, return empty array as bids are included with auction data
      return [];
    },
    enabled: !!selectedAuction,
  });

  // Create Listing Form
  const listingForm = useForm<z.infer<typeof createListingSchema>>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price: 0,
      condition: "new",
      location: "",
      images: [],
      tags: [],
    },
  });

  // Create Auction Form
  const auctionForm = useForm<z.infer<typeof createAuctionSchema>>({
    resolver: zodResolver(createAuctionSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      startingPrice: 0,
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      autoExtendMinutes: 5,
      autoExtendEnabled: true,
      condition: "new",
      location: "",
      images: [],
      tags: [],
    },
  });

  // Create Service Form
  const serviceForm = useForm<z.infer<typeof createServiceSchema>>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      serviceType: "one-time",
      priceModel: "fixed",
      deliveryTime: "",
      location: "",
      serviceArea: [],
      requirements: "",
      certifications: [],
      tags: [],
    },
  });

  // Bid Form
  const bidForm = useForm<z.infer<typeof placeBidSchema>>({
    resolver: zodResolver(placeBidSchema),
    defaultValues: {
      amount: 0,
    },
  });

  // Mutations
  const createListingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createListingSchema>) => {
      const response = await fetch("/api/mololink/marketplace/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          price: data.price.toString(), // Keep as number for backend
        }),
      });
      if (!response.ok) throw new Error("Failed to create listing");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mololink/marketplace/listings"] });
      toast({ title: "Listing created successfully" });
      setShowCreateDialog(false);
      listingForm.reset();
    },
    onError: () => {
      toast({ 
        title: "Failed to create listing", 
        variant: "destructive" 
      });
    },
  });

  const createAuctionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createAuctionSchema>) => {
      const response = await fetch("/api/mololink/marketplace/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          startingPrice: data.startingPrice.toString(),
          reservePrice: data.reservePrice?.toString(),
          buyNowPrice: data.buyNowPrice?.toString(),
        }),
      });
      if (!response.ok) throw new Error("Failed to create auction");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mololink/marketplace/auctions"] });
      toast({ title: "Auction created successfully" });
      setShowCreateDialog(false);
      auctionForm.reset();
    },
    onError: () => {
      toast({ 
        title: "Failed to create auction", 
        variant: "destructive" 
      });
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createServiceSchema>) => {
      // Service posts not yet implemented in backend
      throw new Error("Service creation not yet implemented");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mololink/marketplace/services"] });
      toast({ title: "Service created successfully" });
      setShowCreateDialog(false);
      serviceForm.reset();
    },
    onError: () => {
      toast({ 
        title: "Failed to create service", 
        variant: "destructive" 
      });
    },
  });

  const placeBidMutation = useMutation({
    mutationFn: async (data: z.infer<typeof placeBidSchema>) => {
      if (!selectedAuction) throw new Error("No auction selected");
      
      const response = await fetch(`/api/mololink/marketplace/auctions/${selectedAuction.id}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: data.amount.toString(),
          maxAmount: data.maxAmount?.toString(),
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to place bid");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mololink/marketplace/auctions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mololink/marketplace/auctions", selectedAuction?.id, "bids"] });
      toast({ title: "Bid placed successfully" });
      setShowBidDialog(false);
      bidForm.reset();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to place bid",
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "product", label: "Products" },
    { value: "service", label: "Services" },
    { value: "equipment", label: "Equipment" },
    { value: "software", label: "Software" },
    { value: "logistics", label: "Logistics" },
    { value: "warehousing", label: "Warehousing" },
    { value: "transportation", label: "Transportation" },
    { value: "consulting", label: "Consulting" },
  ];

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || listing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         auction.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || auction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-molochain-bg">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Marketplace</h1>
          <p className="text-muted-foreground">
            Buy, sell, and bid on logistics and supply chain products and services
          </p>
        </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search marketplace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-marketplace-search"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]" data-testid="select-category">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-listing">
          <Plus className="h-4 w-4 mr-2" />
          Create Listing
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="listings" data-testid="tab-listings">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Listings ({filteredListings.length})
          </TabsTrigger>
          <TabsTrigger value="auctions" data-testid="tab-auctions">
            <Gavel className="h-4 w-4 mr-2" />
            Auctions ({filteredAuctions.length})
          </TabsTrigger>
          <TabsTrigger value="services" data-testid="tab-services">
            <Briefcase className="h-4 w-4 mr-2" />
            Services ({filteredServices.length})
          </TabsTrigger>
        </TabsList>

        {/* Listings Tab */}
        <TabsContent value="listings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map(listing => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow" data-testid={`card-listing-${listing.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{listing.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3" />
                        {listing.location || "No location"}
                      </CardDescription>
                    </div>
                    <Badge variant={listing.featured ? "default" : "secondary"}>
                      {listing.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {listing.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(listing.price)}
                    </span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">{listing.views}</span>
                    </div>
                  </div>
                  {listing.condition && (
                    <Badge variant="outline" className="mt-2">
                      {listing.condition}
                    </Badge>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" data-testid={`button-view-listing-${listing.id}`}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No listings found</p>
            </div>
          )}
        </TabsContent>

        {/* Auctions Tab */}
        <TabsContent value="auctions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAuctions.map(auction => (
              <Card key={auction.id} className="hover:shadow-lg transition-shadow" data-testid={`card-auction-${auction.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{auction.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeLeft(auction.endTime)}
                      </CardDescription>
                    </div>
                    <Badge variant={auction.featured ? "default" : "secondary"}>
                      {auction.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {auction.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current Bid:</span>
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(auction.currentPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Bids:</span>
                      <span>{auction.bidCount}</span>
                    </div>
                    {auction.buyNowPrice && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Buy Now:</span>
                        <span className="font-semibold">{formatPrice(auction.buyNowPrice)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{auction.views}</span>
                    </div>
                    {auction.autoExtendEnabled && (
                      <Badge variant="outline" className="text-xs">
                        Auto-extend
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => {
                      setSelectedAuction(auction);
                      setShowBidDialog(true);
                    }}
                    data-testid={`button-place-bid-${auction.id}`}
                  >
                    Place Bid
                  </Button>
                  {auction.buyNowPrice && (
                    <Button variant="outline" className="flex-1" data-testid={`button-buy-now-${auction.id}`}>
                      Buy Now
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
          {filteredAuctions.length === 0 && (
            <div className="text-center py-12">
              <Gavel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active auctions found</p>
            </div>
          )}
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map(service => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow" data-testid={`card-service-${service.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3" />
                        {service.location || "Remote"}
                      </CardDescription>
                    </div>
                    <Badge variant={service.featured ? "default" : "secondary"}>
                      {service.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {service.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pricing:</span>
                      <span className="font-semibold">
                        {service.priceModel === "fixed" && service.basePrice
                          ? formatPrice(service.basePrice)
                          : service.priceModel === "hourly" && service.basePrice
                          ? `${formatPrice(service.basePrice)}/hr`
                          : service.priceModel}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline">{service.serviceType}</Badge>
                    </div>
                    {service.deliveryTime && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Delivery:</span>
                        <span>{service.deliveryTime}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    {service.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        <span>{(service.rating / 100).toFixed(1)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span>{service.views}</span>
                    </div>
                    {service.completedCount ? (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>{service.completedCount} sold</span>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" data-testid={`button-request-quote-${service.id}`}>
                    Request Quote
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No services found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Listing Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Listing</DialogTitle>
            <DialogDescription>
              Choose what type of listing you want to create
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="listing" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="listing">Product/Item</TabsTrigger>
              <TabsTrigger value="auction">Auction</TabsTrigger>
              <TabsTrigger value="service">Service</TabsTrigger>
            </TabsList>

            {/* Create Product Listing */}
            <TabsContent value="listing">
              <Form {...listingForm}>
                <form onSubmit={listingForm.handleSubmit((data) => createListingMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={listingForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter listing title" {...field} data-testid="input-listing-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={listingForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your item..." 
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-listing-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={listingForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-listing-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.slice(1).map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={listingForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (USD)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00" 
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                              data-testid="input-listing-price"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={listingForm.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-listing-condition">
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="like-new">Like New</SelectItem>
                              <SelectItem value="used">Used</SelectItem>
                              <SelectItem value="refurbished">Refurbished</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={listingForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="City, State" {...field} data-testid="input-listing-location" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createListingMutation.isPending} data-testid="button-submit-listing">
                      {createListingMutation.isPending ? "Creating..." : "Create Listing"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>

            {/* Create Auction */}
            <TabsContent value="auction">
              <Form {...auctionForm}>
                <form onSubmit={auctionForm.handleSubmit((data) => createAuctionMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={auctionForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter auction title" {...field} data-testid="input-auction-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={auctionForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your item..." 
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-auction-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={auctionForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-auction-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.slice(1).map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={auctionForm.control}
                      name="startingPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Starting Price (USD)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00" 
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                              data-testid="input-auction-starting-price"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createAuctionMutation.isPending} data-testid="button-submit-auction">
                      {createAuctionMutation.isPending ? "Creating..." : "Create Auction"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>

            {/* Create Service */}
            <TabsContent value="service">
              <Form {...serviceForm}>
                <form onSubmit={serviceForm.handleSubmit((data) => createServiceMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={serviceForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter service title" {...field} data-testid="input-service-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={serviceForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your service..." 
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-service-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={serviceForm.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-service-type">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="one-time">One-time</SelectItem>
                              <SelectItem value="recurring">Recurring</SelectItem>
                              <SelectItem value="project-based">Project-based</SelectItem>
                              <SelectItem value="retainer">Retainer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={serviceForm.control}
                      name="priceModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price Model</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-price-model">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="fixed">Fixed Price</SelectItem>
                              <SelectItem value="hourly">Hourly Rate</SelectItem>
                              <SelectItem value="quote-based">Quote-based</SelectItem>
                              <SelectItem value="negotiable">Negotiable</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createServiceMutation.isPending} data-testid="button-submit-service">
                      {createServiceMutation.isPending ? "Creating..." : "Create Service"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Place Bid Dialog */}
      <Dialog open={showBidDialog} onOpenChange={setShowBidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Bid</DialogTitle>
            <DialogDescription>
              {selectedAuction && (
                <div className="space-y-2 mt-2">
                  <p className="font-semibold">{selectedAuction.title}</p>
                  <p>Current bid: {formatPrice(selectedAuction.currentPrice)}</p>
                  <p className="text-sm">Time left: {formatTimeLeft(selectedAuction.endTime)}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <Form {...bidForm}>
            <form onSubmit={bidForm.handleSubmit((data) => placeBidMutation.mutate(data))} className="space-y-4">
              <FormField
                control={bidForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Bid (USD)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="Enter bid amount" 
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                        data-testid="input-bid-amount"
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum bid: {selectedAuction && formatPrice(selectedAuction.currentPrice + 100)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowBidDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={placeBidMutation.isPending} data-testid="button-submit-bid">
                  {placeBidMutation.isPending ? "Placing bid..." : "Place Bid"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      </div>
      <MobileNav />
      <div className="md:hidden h-20"></div> {/* Spacer for mobile nav */}
    </div>
  );
}