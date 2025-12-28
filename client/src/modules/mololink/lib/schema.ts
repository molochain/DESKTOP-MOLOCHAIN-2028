// Schema types for MOLOLINK module

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  title?: string;
  company?: string;
  location?: string;
  industry?: string;
  specialization?: string;
  bio?: string;
  profileImage?: string;
  backgroundImage?: string;
  connections?: number;
  profileViews?: number;
  postImpressions?: number;
  createdAt?: Date;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  hashtags?: string[];
  likes?: number;
  comments?: number;
  shares?: number;
  createdAt?: Date;
  user?: User;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt?: Date;
  user?: User;
}

export interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: string;
  createdAt?: Date;
  requester?: User;
  receiver?: User;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  industry?: string;
  size?: string;
  type?: string;
  founded?: number;
  website?: string;
  headquarters?: string;
  locations?: string[];
  specialties?: string[];
  logoUrl?: string;
  coverImageUrl?: string;
  employeeCount?: number;
  followerCount?: number;
  verified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Insert types for API operations
export interface InsertPost {
  content: string;
  hashtags?: string[];
  imageUrl?: string;
}

export interface CompanyEmployee {
  id: string;
  companyId: string;
  userId: string;
  title?: string;
  department?: string;
  startDate?: Date;
  endDate?: Date;
  isCurrent?: boolean;
  isPrimary?: boolean;
  createdAt?: Date;
  user?: User;
  company?: Company;
}

export interface CompanyPost {
  id: string;
  companyId: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  hashtags?: string[];
  postType?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  createdAt?: Date;
  company?: Company;
  author?: User;
}

export interface Skill {
  id: string;
  userId: string;
  skillName: string;
  category?: string;
  endorsementCount?: number;
  createdAt?: Date;
}

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  currency: string;
  images?: string[];
  condition?: string;
  location?: string;
  shippingOptions?: string;
  status: string;
  views?: number;
  tags?: string[];
  featured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  seller?: User;
}

export interface MarketplaceAuction {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  startingPrice: number;
  currentPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  currency: string;
  images?: string[];
  condition?: string;
  location?: string;
  shippingOptions?: string;
  startTime: Date;
  endTime: Date;
  autoExtendMinutes?: number;
  autoExtendEnabled?: boolean;
  status: string;
  winnerId?: string;
  views?: number;
  bidCount?: number;
  tags?: string[];
  featured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  seller?: User;
  winner?: User;
}

export interface MarketplaceBid {
  id: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  maxAmount?: number;
  status: string;
  isAutoBid?: boolean;
  createdAt?: Date;
  bidder?: User;
  auction?: MarketplaceAuction;
}

export interface MarketplaceServicePost {
  id: string;
  providerId: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  serviceType: string;
  priceModel: string;
  basePrice?: number;
  currency: string;
  deliveryTime?: string;
  location?: string;
  serviceArea?: string[];
  status?: string;
  views?: number;
  featured?: boolean;
  rating?: number;
  completedCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  provider?: User;
}