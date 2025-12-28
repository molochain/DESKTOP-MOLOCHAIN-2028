import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useCMSPage } from '@/hooks/use-cms';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

function setMetaTag(property: string, content: string, isName = false): void {
  const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
  let meta = document.querySelector(selector) as HTMLMetaElement | null;
  
  if (!meta) {
    meta = document.createElement('meta');
    if (isName) {
      meta.name = property;
    } else {
      meta.setAttribute('property', property);
    }
    document.head.appendChild(meta);
  }
  
  meta.content = content;
}

function removeMetaTag(property: string, isName = false): void {
  const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
  const meta = document.querySelector(selector);
  if (meta) {
    meta.remove();
  }
}

interface CMSPageProps {
  slug: string;
}

function CMSPageSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

function CMSPageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-12 pb-8 px-8">
          <div className="mb-6 flex justify-center">
            <div className="p-4 rounded-full bg-muted">
              <FileQuestion className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or may have been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button asChild>
              <Link href="/contact">
                Contact Support
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CMSPage({ slug }: CMSPageProps) {
  const { data: page, isLoading, isError } = useCMSPage(slug);
  const [location] = useLocation();

  useEffect(() => {
    if (page) {
      const title = page.meta_title || `${page.title} | MOLOCHAIN`;
      const description = page.meta_description || '';
      const currentUrl = window.location.href;
      
      document.title = title;
      
      setMetaTag('description', description, true);
      
      setMetaTag('og:title', title);
      setMetaTag('og:description', description);
      setMetaTag('og:type', 'article');
      setMetaTag('og:url', currentUrl);
      setMetaTag('og:site_name', 'MOLOCHAIN');
      
      setMetaTag('twitter:card', 'summary_large_image', true);
      setMetaTag('twitter:title', title, true);
      setMetaTag('twitter:description', description, true);
    }
    
    return () => {
      document.title = 'MOLOCHAIN';
      
      removeMetaTag('og:title');
      removeMetaTag('og:description');
      removeMetaTag('og:type');
      removeMetaTag('og:url');
      removeMetaTag('og:site_name');
      
      removeMetaTag('twitter:card', true);
      removeMetaTag('twitter:title', true);
      removeMetaTag('twitter:description', true);
    };
  }, [page, location]);

  if (isLoading) {
    return <CMSPageSkeleton />;
  }

  if (isError || !page) {
    return <CMSPageNotFound />;
  }

  return (
    <div className="min-h-screen" data-testid="cms-page">
      <div className="bg-gradient-to-b from-primary/10 via-primary/5 to-background py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
            data-testid="cms-page-title"
          >
            {page.title}
          </h1>
          {page.meta_description && (
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              {page.meta_description}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {page.body && (
          <article 
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg"
            data-testid="cms-page-body"
            dangerouslySetInnerHTML={{ __html: page.body }}
          />
        )}
      </div>
    </div>
  );
}
