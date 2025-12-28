import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useDebounce } from "../hooks/use-debounce";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  MapPin, 
  Building2, 
  User, 
  FileText, 
  Package,
  Clock,
  Heart,
  MessageCircle
} from "lucide-react";

interface SearchResult {
  type: string;
  label: string;
  items: any[];
  total: number;
}

interface SearchResponse {
  results: SearchResult[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
  filters: {
    type: string;
    industry?: string;
    location?: string;
    specialization?: string;
    sortBy: string;
  };
}

interface SearchSuggestions {
  popular: string[];
  categories: string[];
  locations: string[];
}

interface TrendingTopics {
  hashtags: Array<{ hashtag: string; count: number }>;
  topics: Array<{ name: string; mentions: number }>;
}

export default function AdvancedSearch() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [industry, setIndustry] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);

  // Parse URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const queryParam = urlParams.get('q');
    if (queryParam) {
      setSearchQuery(decodeURIComponent(queryParam));
    }
  }, [location]);

  // Debounce search query for performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Debounced search query
  const debouncedQuery = useMemo(() => {
    const timer = setTimeout(() => searchQuery, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search API call with debounced query
  const { data: searchResults, isLoading: searchLoading, error: searchError } = useQuery<SearchResponse>({
    queryKey: ["/api/search", {
      q: debouncedSearchQuery,
      type: searchType,
      industry: industry || undefined,
      location: locationFilter || undefined,
      specialization: specialization || undefined,
      sortBy,
      limit: 20,
      offset: 0
    }],
    enabled: debouncedSearchQuery.trim().length > 0,
    staleTime: 30000, // Cache results for 30 seconds
  });

  // Search suggestions
  const { data: suggestions } = useQuery<SearchSuggestions>({
    queryKey: ["/api/search/suggestions"],
  });

  // Trending topics
  const { data: trending } = useQuery<TrendingTopics>({
    queryKey: ["/api/search/trending"],
  });

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled automatically by the query
  }, []);

  const clearFilters = () => {
    setIndustry("");
    setLocationFilter("");
    setSpecialization("");
    setSortBy("relevance");
  };

  const activeFiltersCount = [industry, locationFilter, specialization].filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Discover & Connect</h1>
        <p className="text-muted-foreground">
          Find professionals, companies, content, and opportunities in the logistics industry
        </p>
      </div>

      {/* Main Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for people, companies, posts, marketplace items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
                data-testid="input-advanced-search"
              />
            </div>

            {/* Search Type Tabs */}
            <Tabs value={searchType} onValueChange={setSearchType}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  All
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  People
                </TabsTrigger>
                <TabsTrigger value="companies" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Companies
                </TabsTrigger>
                <TabsTrigger value="posts" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Posts
                </TabsTrigger>
                <TabsTrigger value="marketplace" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Marketplace
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-3 items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
                data-testid="button-toggle-filters"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]" data-testid="select-sort-by">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="connections">Most Connected</SelectItem>
                </SelectContent>
              </Select>

              {activeFiltersCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-sm"
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/10 rounded-lg">
                <div>
                  <label className="text-sm font-medium mb-2 block">Industry</label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger data-testid="select-industry">
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Industries</SelectItem>
                      <SelectItem value="Transportation & Logistics">Transportation & Logistics</SelectItem>
                      <SelectItem value="Warehousing & Distribution">Warehousing & Distribution</SelectItem>
                      <SelectItem value="Supply Chain Management">Supply Chain Management</SelectItem>
                      <SelectItem value="Freight & Shipping">Freight & Shipping</SelectItem>
                      <SelectItem value="E-commerce Logistics">E-commerce Logistics</SelectItem>
                      <SelectItem value="Cold Chain">Cold Chain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Input
                    placeholder="Enter city, state, or region"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    data-testid="input-location-filter"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Specialization</label>
                  <Select value={specialization} onValueChange={setSpecialization}>
                    <SelectTrigger data-testid="select-specialization">
                      <SelectValue placeholder="All Specializations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Specializations</SelectItem>
                      <SelectItem value="Operations Management">Operations Management</SelectItem>
                      <SelectItem value="Fleet Management">Fleet Management</SelectItem>
                      <SelectItem value="Inventory Management">Inventory Management</SelectItem>
                      <SelectItem value="Customs & Trade">Customs & Trade</SelectItem>
                      <SelectItem value="Logistics Technology">Logistics Technology</SelectItem>
                      <SelectItem value="Procurement">Procurement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Search Results or Suggestions */}
      {searchQuery ? (
        <SearchResults results={searchResults} loading={searchLoading} error={searchError} />
      ) : (
        <SearchSuggestionsComponent suggestions={suggestions} trending={trending} />
      )}
    </div>
  );
}

function SearchResults({ results, loading, error }: { results?: SearchResponse; loading: boolean; error: any }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-6 w-3/4 mb-3" />
              <div className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Search failed. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  if (!results || results.results.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {results.results.map((category) => (
        <Card key={category.type}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              {getCategoryIcon(category.type)}
              {category.label}
              <Badge variant="secondary">{category.total}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {category.items.map((item) => (
                <SearchResultItem key={item.id} item={item} type={category.type} />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SearchResultItem({ item, type }: { item: any; type: string }) {
  switch (type) {
    case "users":
      return (
        <Link href={`/profile/${item.id}`}>
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" data-testid={`result-user-${item.id}`}>
            <Avatar>
              <AvatarImage src={item.profileImage} />
              <AvatarFallback>{item.firstName?.[0]}{item.lastName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold">{item.firstName} {item.lastName}</h4>
              <p className="text-sm text-muted-foreground">{item.title}</p>
              {item.company && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Building2 className="h-3 w-3" />
                  {item.company}
                </div>
              )}
              {item.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {item.location}
                </div>
              )}
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>{item.connections || 0} connections</div>
            </div>
          </div>
        </Link>
      );

    case "companies":
      return (
        <Link href={`/companies/${item.slug}`}>
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" data-testid={`result-company-${item.id}`}>
            <Avatar className="h-12 w-12">
              <AvatarImage src={item.logoUrl} />
              <AvatarFallback>{item.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold">{item.name}</h4>
              <p className="text-sm text-muted-foreground">{item.industry}</p>
              {item.headquarters && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  {item.headquarters}
                </div>
              )}
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>{item.followerCount || 0} followers</div>
              <div>{item.employeeCount || 0} employees</div>
            </div>
          </div>
        </Link>
      );

    case "posts":
      return (
        <div className="p-3 rounded-lg border" data-testid={`result-post-${item.id}`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm mb-3 line-clamp-3">{item.content}</p>
          {item.hashtags && (
            <div className="flex flex-wrap gap-1 mb-2">
              {item.hashtags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {item.likes || 0}
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {item.comments || 0}
            </div>
          </div>
        </div>
      );

    case "marketplace":
      return (
        <div className="p-3 rounded-lg border" data-testid={`result-marketplace-${item.id}`}>
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold">{item.title}</h4>
            <Badge variant="outline">{item._itemType}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
          {item.category && (
            <Badge variant="secondary" className="text-xs mb-2">
              {item.category}
            </Badge>
          )}
          {item.price && (
            <div className="text-lg font-bold text-green-600">
              ${typeof item.price === 'number' ? item.price.toLocaleString() : item.price}
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}

function SearchSuggestionsComponent({ suggestions, trending }: { suggestions?: SearchSuggestions; trending?: TrendingTopics }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Popular Searches */}
      {suggestions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Popular Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">Job Titles</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestions.popular.map((term) => (
                    <Badge
                      key={term}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      data-testid={`popular-search-${term.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Industries</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestions.categories.map((category) => (
                    <Badge
                      key={category}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      data-testid={`category-${category.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trending Topics */}
      {trending && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trending Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trending.hashtags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Hashtags</h4>
                  <div className="space-y-2">
                    {trending.hashtags.slice(0, 5).map((hashtag) => (
                      <div key={hashtag.hashtag} className="flex justify-between items-center" data-testid={`trending-hashtag-${hashtag.hashtag}`}>
                        <Badge variant="outline">#{hashtag.hashtag}</Badge>
                        <span className="text-xs text-muted-foreground">{hashtag.count} posts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h4 className="font-medium mb-2">Hot Topics</h4>
                <div className="space-y-2">
                  {trending.topics.map((topic) => (
                    <div key={topic.name} className="flex justify-between items-center" data-testid={`trending-topic-${topic.name.replace(/\s+/g, '-').toLowerCase()}`}>
                      <span className="text-sm">{topic.name}</span>
                      <span className="text-xs text-muted-foreground">{topic.mentions} mentions</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getCategoryIcon(type: string) {
  switch (type) {
    case "users":
      return <User className="h-4 w-4" />;
    case "companies":
      return <Building2 className="h-4 w-4" />;
    case "posts":
      return <FileText className="h-4 w-4" />;
    case "marketplace":
      return <Package className="h-4 w-4" />;
    default:
      return <Search className="h-4 w-4" />;
  }
}