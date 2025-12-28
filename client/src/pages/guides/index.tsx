import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Search, BookOpen, Users, Globe, Building2, ChevronRight, FileText, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GuideCategory {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
}

interface Guide {
  id: number;
  categoryId: number;
  code: string;
  title: string;
  description: string;
  path: string;
  tags: string[];
  viewCount: number;
}

export default function GuidesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: categories, isLoading: categoriesLoading } = useQuery<GuideCategory[]>({
    queryKey: ['/api/guides/categories'],
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery<Guide[]>({
    queryKey: ['/api/guides/search', searchQuery, selectedCategory],
    enabled: searchQuery.length > 0,
    queryFn: async () => {
      const params = new URLSearchParams({ q: searchQuery });
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      const response = await fetch(`/api/guides/search?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to search guides: ${response.status}`);
      }
      return await response.json();
    },
    retry: 1,
    staleTime: 5000
  });

  const { data: allGuides, error: guidesError } = useQuery<Guide[]>({
    queryKey: ['/api/guides/category', selectedCategory],
    enabled: searchQuery.length === 0,
    queryFn: async () => {
      if (selectedCategory === 'all') {
        const response = await fetch('/api/guides/all');
        if (!response.ok) {
          // Try fallback approach
          if (categories && categories.length > 0) {
            const guides: Guide[] = [];
            const promises = categories.map(async (category) => {
              try {
                const catResponse = await fetch(`/api/guides/category/${category.id}`);
                if (catResponse.ok) {
                  return await catResponse.json();
                }
                return [];
              } catch {
                return [];
              }
            });
            const results = await Promise.all(promises);
            results.forEach(catGuides => guides.push(...catGuides));
            return guides;
          }
          throw new Error(`Failed to fetch guides: ${response.status}`);
        }
        return await response.json();
      } else {
        const response = await fetch(`/api/guides/category/${selectedCategory}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch guides by category: ${response.status}`);
        }
        return await response.json();
      }
    },
    retry: 1,
    staleTime: 5000
  });

  const categoryIcons: Record<string, React.ReactNode> = {
    ORG: <Users className="h-5 w-5" />,
    OPR: <Building2 className="h-5 w-5" />,
    GEO: <Globe className="h-5 w-5" />,
    BUS: <TrendingUp className="h-5 w-5" />,
  };

  const getCategoryIcon = (code: string) => {
    return categoryIcons[code] || <BookOpen className="h-5 w-5" />;
  };

  const guides = searchQuery ? searchResults : allGuides;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">MoloChain Knowledge Center</h1>
        <p className="text-lg text-muted-foreground">
          Comprehensive guides and documentation for organizational operations, business processes, and platform features
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search guides, documentation, and procedures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-6 text-lg"
          />
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Guides</TabsTrigger>
          {categories?.map((category) => (
            <TabsTrigger key={category.id} value={category.id.toString()}>
              <span className="flex items-center gap-2">
                {getCategoryIcon(category.code)}
                {category.name}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories?.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={`/guides/category/${category.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      {getCategoryIcon(category.code)}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Browse Guides
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </TabsContent>

        {categories?.map((category) => (
          <TabsContent key={category.id} value={category.id.toString()} className="mt-6">
            <CategoryGuides categoryId={category.id} categoryName={category.name} />
          </TabsContent>
        ))}
      </Tabs>

      {searchQuery && guides && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">
            Search Results {guides.length > 0 && `(${guides.length})`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </div>
      )}

      {!searchQuery && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Popular Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allGuides?.slice(0, 6).map((guide: Guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryGuides({ categoryId, categoryName }: { categoryId: number; categoryName: string }) {
  const { data: guides, isLoading } = useQuery<Guide[]>({
    queryKey: [`/api/guides/category/${categoryId}`],
  });

  if (isLoading) {
    return <div>Loading guides...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{categoryName} Guides</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {guides?.map((guide) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>
    </div>
  );
}

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <Link href={`/guides/${guide.id}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <FileText className="h-5 w-5 text-primary mt-1" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {guide.viewCount} views
            </div>
          </div>
          <CardTitle className="text-lg mt-2">{guide.title}</CardTitle>
          {guide.description && (
            <CardDescription className="line-clamp-2">
              {guide.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {guide.tags && guide.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {guide.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}