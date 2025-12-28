import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Calendar, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  relevance: number;
  tags: string[];
}

interface NewsFeedsProps {
  commodityType: string;
}

export default function NewsFeeds({ commodityType }: NewsFeedsProps) {
  const { data: newsItems, isLoading } = useQuery<NewsItem[]>({
    queryKey: [`/api/news-feeds/${commodityType}`],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            <span>Latest News & Updates</span>
          </div>
          <Badge variant="outline">
            {format(new Date(), 'MMMM yyyy')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {newsItems?.map((news) => (
            <Card key={news.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {news.source}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(news.publishedAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <a 
                      href={news.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {news.title}
                      </h3>
                    </a>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {news.summary}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {news.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <a 
                    href={news.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ArrowUpRight className="w-5 h-5" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
