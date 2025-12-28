import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Package,
  Truck,
  FileText,
  Building,
  Ship,
  Plane,
  DollarSign,
  Clock,
  TrendingUp,
  Shield,
  CheckCircle,
  Star,
  Heart,
  Share2,
  Eye,
  Filter,
  Search,
  Grid,
  List,
  ArrowUpDown,
  ShoppingCart,
  Wallet,
  ExternalLink,
  Award,
  Hash,
  Calendar,
  MapPin,
  BarChart3,
  Zap,
  Info,
  Image as ImageIcon,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NFT {
  id: string;
  name: string;
  description: string;
  type: 'container' | 'warehouse' | 'document' | 'vehicle' | 'route' | 'contract';
  image: string;
  owner: string;
  creator: string;
  price: number;
  lastSale?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  attributes: Array<{ trait: string; value: string }>;
  likes: number;
  views: number;
  verified: boolean;
  mintDate: Date;
  tokenId: string;
  contractAddress: string;
  blockchain: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  creator: string;
  floorPrice: number;
  volume24h: number;
  items: number;
  owners: number;
  verified: boolean;
  banner: string;
}

const NFTMarketplace = () => {
  const { toast } = useToast();
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState('all');

  const nfts: NFT[] = [
    {
      id: 'NFT001',
      name: 'Premium Container #2847',
      description: 'High-capacity refrigerated container with IoT tracking and temperature control',
      type: 'container',
      image: '/api/placeholder/400/400',
      owner: '0x742d...bE8b',
      creator: 'MoloChain Logistics',
      price: 2500,
      lastSale: 2100,
      rarity: 'epic',
      attributes: [
        { trait: 'Capacity', value: '40ft' },
        { trait: 'Type', value: 'Refrigerated' },
        { trait: 'IoT Enabled', value: 'Yes' },
        { trait: 'Location', value: 'Singapore' }
      ],
      likes: 234,
      views: 1892,
      verified: true,
      mintDate: new Date('2024-11-15'),
      tokenId: '2847',
      contractAddress: '0x8B3c44Dd5634C0532925a3b844Bc9e7595f0bE9c',
      blockchain: 'BSC'
    },
    {
      id: 'NFT002',
      name: 'Warehouse Receipt Dubai #892',
      description: 'Digital ownership certificate for 10,000 sq ft warehouse space in Dubai Free Zone',
      type: 'warehouse',
      image: '/api/placeholder/400/400',
      owner: '0x9C4d...cF0d',
      creator: 'Dubai Logistics Hub',
      price: 8500,
      rarity: 'legendary',
      attributes: [
        { trait: 'Size', value: '10,000 sq ft' },
        { trait: 'Location', value: 'Dubai Free Zone' },
        { trait: 'Climate Control', value: 'Yes' },
        { trait: 'Security Level', value: 'Maximum' }
      ],
      likes: 567,
      views: 3421,
      verified: true,
      mintDate: new Date('2024-10-20'),
      tokenId: '892',
      contractAddress: '0xA5e655Ff8856E2643136c5b956Ce1g9817h2dG1e',
      blockchain: 'Ethereum'
    },
    {
      id: 'NFT003',
      name: 'Bill of Lading #45823',
      description: 'Transferable digital bill of lading for international shipment',
      type: 'document',
      image: '/api/placeholder/400/400',
      owner: '0xB6f7...eH2f',
      creator: 'Global Shipping Co',
      price: 450,
      lastSale: 380,
      rarity: 'common',
      attributes: [
        { trait: 'Origin', value: 'Shanghai' },
        { trait: 'Destination', value: 'Los Angeles' },
        { trait: 'Cargo Type', value: 'Electronics' },
        { trait: 'Weight', value: '25 Tons' }
      ],
      likes: 89,
      views: 652,
      verified: false,
      mintDate: new Date('2024-12-01'),
      tokenId: '45823',
      contractAddress: '0xC7g866Hh9078G3865247d7d178Df3i0A39j4fI3g',
      blockchain: 'Polygon'
    },
    {
      id: 'NFT004',
      name: 'Fleet Vehicle #1200',
      description: 'Commercial truck with full maintenance history and route optimization',
      type: 'vehicle',
      image: '/api/placeholder/400/400',
      owner: '0xD8h9...gJ4h',
      creator: 'Fleet Management Inc',
      price: 12000,
      rarity: 'rare',
      attributes: [
        { trait: 'Model', value: 'Volvo FH16' },
        { trait: 'Year', value: '2023' },
        { trait: 'Mileage', value: '45,000 km' },
        { trait: 'Fuel Type', value: 'Electric' }
      ],
      likes: 342,
      views: 2156,
      verified: true,
      mintDate: new Date('2024-09-10'),
      tokenId: '1200',
      contractAddress: '0xE9i077Jj0189H4976358e8e289Gk4j1B50k5gJ4i',
      blockchain: 'BSC'
    },
    {
      id: 'NFT005',
      name: 'Trade Route Asia-Europe #78',
      description: 'Exclusive shipping route NFT with priority access and reduced fees',
      type: 'route',
      image: '/api/placeholder/400/400',
      owner: '0xF0j1...hL5i',
      creator: 'Maritime Alliance',
      price: 35000,
      rarity: 'legendary',
      attributes: [
        { trait: 'Route', value: 'Asia-Europe' },
        { trait: 'Priority Level', value: 'Gold' },
        { trait: 'Fee Discount', value: '15%' },
        { trait: 'Validity', value: '2 Years' }
      ],
      likes: 892,
      views: 5234,
      verified: true,
      mintDate: new Date('2024-08-05'),
      tokenId: '78',
      contractAddress: '0xG1k288Kk1290I5087469f9f390Hl5k2C61l6hK5j',
      blockchain: 'Ethereum'
    },
    {
      id: 'NFT006',
      name: 'Smart Contract Template #234',
      description: 'Reusable smart contract for automated logistics payments and tracking',
      type: 'contract',
      image: '/api/placeholder/400/400',
      owner: '0xH2l3...iM6j',
      creator: 'DeFi Logistics Lab',
      price: 750,
      lastSale: 600,
      rarity: 'rare',
      attributes: [
        { trait: 'Type', value: 'Payment Automation' },
        { trait: 'Language', value: 'Solidity' },
        { trait: 'Audited', value: 'Yes' },
        { trait: 'Gas Optimized', value: 'Yes' }
      ],
      likes: 156,
      views: 982,
      verified: true,
      mintDate: new Date('2024-11-25'),
      tokenId: '234',
      contractAddress: '0xI3m499Ll2401J6198580g0g401Im6l3D72m7iL6k',
      blockchain: 'BSC'
    }
  ];

  const collections: Collection[] = [
    {
      id: 'COL001',
      name: 'Premium Containers',
      description: 'High-value shipping containers with IoT tracking',
      creator: 'MoloChain Logistics',
      floorPrice: 1800,
      volume24h: 125000,
      items: 342,
      owners: 89,
      verified: true,
      banner: '/api/placeholder/800/200'
    },
    {
      id: 'COL002',
      name: 'Global Warehouses',
      description: 'Digital ownership of warehouse spaces worldwide',
      creator: 'Warehouse Network',
      floorPrice: 5000,
      volume24h: 450000,
      items: 127,
      owners: 45,
      verified: true,
      banner: '/api/placeholder/800/200'
    },
    {
      id: 'COL003',
      name: 'Trade Documents',
      description: 'Digitized shipping and trade documents',
      creator: 'DocuTrade',
      floorPrice: 200,
      volume24h: 28000,
      items: 1893,
      owners: 234,
      verified: false,
      banner: '/api/placeholder/800/200'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'container': return <Package className="w-4 h-4" />;
      case 'warehouse': return <Building className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'vehicle': return <Truck className="w-4 h-4" />;
      case 'route': return <MapPin className="w-4 h-4" />;
      case 'contract': return <Shield className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'common': return 'bg-gray-500/10 text-gray-500';
      case 'rare': return 'bg-blue-500/10 text-blue-500';
      case 'epic': return 'bg-purple-500/10 text-purple-500';
      case 'legendary': return 'bg-yellow-500/10 text-yellow-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const handleBuyNFT = (nft: NFT) => {
    toast({
      title: "Purchase Initiated",
      description: `Buying ${nft.name} for ${nft.price} MOLOCHAIN`,
    });
  };

  const handleLikeNFT = (nftId: string) => {
    toast({
      title: "NFT Liked",
      description: "Added to your favorites",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <Badge className="mb-4" variant="outline">
              <Sparkles className="w-3 h-3 mr-1" /> NFT Marketplace
            </Badge>
            <h1 className="text-4xl font-bold mb-4">Tokenized Logistics Assets</h1>
            <p className="text-muted-foreground text-lg">
              Trade digital ownership of containers, warehouses, shipping documents, 
              and logistics infrastructure as NFTs on the blockchain.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Volume</p>
                  <p className="text-2xl font-bold">$8.2M</p>
                  <p className="text-xs text-green-500">+24.5% (24h)</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Listed NFTs</p>
                  <p className="text-2xl font-bold">3,847</p>
                  <p className="text-xs text-muted-foreground">6 categories</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Traders</p>
                  <p className="text-2xl font-bold">1,284</p>
                  <p className="text-xs text-green-500">+125 today</p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Floor Price</p>
                  <p className="text-2xl font-bold">200</p>
                  <p className="text-xs text-muted-foreground">MOLOCHAIN</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search NFTs, collections, or creators..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="container">Containers</SelectItem>
                  <SelectItem value="warehouse">Warehouses</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="vehicle">Vehicles</SelectItem>
                  <SelectItem value="route">Routes</SelectItem>
                  <SelectItem value="contract">Contracts</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-500">0 - 500</SelectItem>
                  <SelectItem value="500-2000">500 - 2,000</SelectItem>
                  <SelectItem value="2000-10000">2,000 - 10,000</SelectItem>
                  <SelectItem value="10000+">10,000+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="recent">Recently Listed</SelectItem>
                  <SelectItem value="most-liked">Most Liked</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant={selectedView === 'grid' ? 'default' : 'outline'}
                  onClick={() => setSelectedView('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant={selectedView === 'list' ? 'default' : 'outline'}
                  onClick={() => setSelectedView('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="marketplace" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="mt-6">
            <div className={`grid gap-6 ${
              selectedView === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {nfts.map((nft) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="overflow-hidden cursor-pointer">
                    <div className="relative aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-2">
                            {getTypeIcon(nft.type)}
                          </div>
                          <p className="text-xs text-muted-foreground">#{nft.tokenId}</p>
                        </div>
                      </div>
                      {nft.verified && (
                        <Badge className="absolute top-2 right-2 bg-blue-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <Badge className={`absolute top-2 left-2 ${getRarityColor(nft.rarity)}`} variant="secondary">
                        {nft.rarity}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <h3 className="font-semibold truncate">{nft.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          by {nft.creator}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Current Price</p>
                          <p className="font-bold">{nft.price.toLocaleString()} MOLOCHAIN</p>
                          {nft.lastSale && (
                            <p className="text-xs text-green-500">
                              +{((nft.price - nft.lastSale) / nft.lastSale * 100).toFixed(1)}%
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {nft.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {nft.likes}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleBuyNFT(nft)}
                        >
                          Buy Now
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleLikeNFT(nft.id)}
                        >
                          <Heart className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>

                      {nft.attributes.length > 0 && (
                        <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2">
                          {nft.attributes.slice(0, 2).map((attr, idx) => (
                            <div key={idx} className="text-xs">
                              <p className="text-muted-foreground">{attr.trait}</p>
                              <p className="font-medium truncate">{attr.value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="mt-6">
            <div className="grid gap-6">
              {collections.map((collection) => (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20" />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold">{collection.name}</h3>
                            {collection.verified && (
                              <Badge variant="outline" className="text-blue-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            by {collection.creator}
                          </p>
                          <p className="text-sm">{collection.description}</p>
                        </div>
                        <Button>View Collection</Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Floor Price</p>
                          <p className="font-bold">{collection.floorPrice.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">MOLOCHAIN</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
                          <p className="font-bold">${(collection.volume24h / 1000).toFixed(0)}K</p>
                          <p className="text-xs text-green-500">+15.2%</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Items</p>
                          <p className="font-bold">{collection.items.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">NFTs</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Owners</p>
                          <p className="font-bold">{collection.owners}</p>
                          <p className="text-xs text-muted-foreground">Unique</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Live feed of marketplace transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'sale', item: 'Premium Container #2847', price: 2500, from: '0x742d...bE8b', to: '0x9C4d...cF0d', time: '2 min ago' },
                    { type: 'listing', item: 'Warehouse Receipt Dubai #892', price: 8500, from: '0xB6f7...eH2f', time: '5 min ago' },
                    { type: 'bid', item: 'Trade Route Asia-Europe #78', price: 32000, from: '0xD8h9...gJ4h', time: '12 min ago' },
                    { type: 'sale', item: 'Bill of Lading #45823', price: 450, from: '0xF0j1...hL5i', to: '0xH2l3...iM6j', time: '18 min ago' },
                    { type: 'transfer', item: 'Fleet Vehicle #1200', from: '0x742d...bE8b', to: '0x9C4d...cF0d', time: '25 min ago' }
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          activity.type === 'sale' ? 'bg-green-500/10' :
                          activity.type === 'listing' ? 'bg-blue-500/10' :
                          activity.type === 'bid' ? 'bg-yellow-500/10' :
                          'bg-purple-500/10'
                        }`}>
                          {activity.type === 'sale' ? <DollarSign className="w-5 h-5 text-green-500" /> :
                           activity.type === 'listing' ? <Package className="w-5 h-5 text-blue-500" /> :
                           activity.type === 'bid' ? <TrendingUp className="w-5 h-5 text-yellow-500" /> :
                           <ArrowUpDown className="w-5 h-5 text-purple-500" />}
                        </div>
                        <div>
                          <p className="font-medium">{activity.item}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{activity.type === 'sale' ? 'Sold' : 
                                   activity.type === 'listing' ? 'Listed' :
                                   activity.type === 'bid' ? 'Bid placed' :
                                   'Transferred'}</span>
                            {activity.price && (
                              <>
                                <span>•</span>
                                <span>{activity.price.toLocaleString()} MOLOCHAIN</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{activity.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <p className="text-muted-foreground">From: {activity.from}</p>
                        {activity.to && (
                          <p className="text-muted-foreground">To: {activity.to}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NFTMarketplace;