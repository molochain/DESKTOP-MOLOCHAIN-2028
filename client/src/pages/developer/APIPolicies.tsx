import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Link } from "wouter";
import { Clock, AlertTriangle, Info, Shield, Copy, Check, RefreshCw, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getDocumentationApiUrl } from '@/lib/apiConfig';

export default function APIPolicies() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("rate-limiting");
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const headerExample = `// Example of handling rate limit headers in JavaScript
fetch('/api/shipments', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your-token'
  }
})
.then(response => {
  // Check and log rate limit information
  const rateLimit = {
    limit: parseInt(response.headers.get('X-RateLimit-Limit') || '0'),
    remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0'),
    reset: parseInt(response.headers.get('X-RateLimit-Reset') || '0')
  };
  
  console.log(\`Rate limit: \${rateLimit.remaining}/\${rateLimit.limit} requests remaining\`);
  console.log(\`Rate limit resets in \${Math.ceil((rateLimit.reset * 1000 - Date.now()) / 1000)} seconds\`);
  
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
    console.error(\`Rate limit exceeded. Retry after \${retryAfter} seconds\`);
    
    // Implement retry logic here
    setTimeout(() => {
      // Retry the request
    }, retryAfter * 1000);
    
    return null;
  }
  
  return response.json();
})
.then(data => {
  if (data) {
    console.log('Data:', data);
  }
})
.catch(error => console.error('Error:', error));`;

  const backoffExample = `// Exponential backoff implementation in JavaScript
async function fetchWithBackoff(url, options = {}, maxRetries = 5) {
  let retries = 0;
  let delay = 1000; // Start with a 1 second delay
  
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      
      // If not rate limited, return the response
      if (response.status !== 429) {
        return response;
      }
      
      // Handle rate limiting
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
      
      // Use the server's retry-after or exponential backoff
      const waitTime = retryAfter ? retryAfter * 1000 : delay;
      
      console.warn(\`Rate limited. Retrying in \${waitTime / 1000} seconds (retry \${retries + 1}/\${maxRetries})\`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Exponential backoff with jitter
      delay = Math.min(delay * 2, 60000) * (0.8 + Math.random() * 0.4);
      retries++;
    } catch (error) {
      console.error('Request failed:', error);
      
      // For network errors, also implement backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, 60000);
      retries++;
    }
  }
  
  throw new Error(\`Maximum retries (\${maxRetries}) exceeded\`);
}

// Example usage
fetchWithBackoff('/api/shipments', {
  headers: {
    'Authorization': 'Bearer your-token'
  }
})
.then(response => response.json())
.then(data => console.log('Data:', data))
.catch(error => console.error('Error:', error));`;

  const versioningExample = `// API versioning in headers
fetch('/api/shipments', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your-token',
    'Accept': 'application/json',
    'X-API-Version': '2023-10-15'  // Date-based version
  }
})
.then(response => response.json())
.then(data => console.log('Data:', data))
.catch(error => console.error('Error:', error));

// API versioning in URL
fetch('/api/v2/shipments', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your-token',
    'Accept': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log('Data:', data))
.catch(error => console.error('Error:', error));`;

  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">{t('developer.apiPolicies.title')}</h1>
          <p className="text-xl text-muted-foreground">
            {t('developer.apiPolicies.subtitle')}
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-10">
          <TabsList className="grid grid-cols-2 w-[400px] mb-6">
            <TabsTrigger value="rate-limiting">{t('developer.apiPolicies.tabs.rateLimiting')}</TabsTrigger>
            <TabsTrigger value="versioning">{t('developer.apiPolicies.tabs.versioning')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rate-limiting">
            <div className="space-y-8">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('developer.apiPolicies.alerts.rateLimitsApply')}</AlertTitle>
                <AlertDescription>
                  {t('developer.apiPolicies.alerts.rateLimitsDescription')}
                </AlertDescription>
              </Alert>
              
              <div className="prose max-w-none dark:prose-invert">
                <h2>{t('developer.apiPolicies.rateLimiting.title')}</h2>
                <p>
                  {t('developer.apiPolicies.rateLimiting.description')}
                </p>
                
                <h3>{t('developer.apiPolicies.rateLimiting.tiersTitle')}</h3>
                <p>
                  {t('developer.apiPolicies.rateLimiting.tiersDescription')}
                </p>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('developer.apiPolicies.table.tier')}</TableHead>
                    <TableHead>{t('developer.apiPolicies.table.rateLimit')}</TableHead>
                    <TableHead>{t('developer.apiPolicies.table.burstLimit')}</TableHead>
                    <TableHead>{t('developer.apiPolicies.table.notes')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{t('developer.apiPolicies.tiers.developer')}</TableCell>
                    <TableCell>{t('developer.apiPolicies.tiers.developerRate')}</TableCell>
                    <TableCell>{t('developer.apiPolicies.tiers.developerBurst')}</TableCell>
                    <TableCell>{t('developer.apiPolicies.tiers.developerNotes')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{t('developer.apiPolicies.tiers.basic')}</TableCell>
                    <TableCell>{t('developer.apiPolicies.tiers.basicRate')}</TableCell>
                    <TableCell>{t('developer.apiPolicies.tiers.basicBurst')}</TableCell>
                    <TableCell>{t('developer.apiPolicies.tiers.basicNotes')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{t('developer.apiPolicies.tiers.professional')}</TableCell>
                    <TableCell>{t('developer.apiPolicies.tiers.professionalRate')}</TableCell>
                    <TableCell>{t('developer.apiPolicies.tiers.professionalBurst')}</TableCell>
                    <TableCell>{t('developer.apiPolicies.tiers.professionalNotes')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{t('developer.apiPolicies.tiers.enterprise')}</TableCell>
                    <TableCell>{t('developer.apiPolicies.tiers.enterpriseRate')}</TableCell>
                    <TableCell>{t('developer.apiPolicies.tiers.enterpriseBurst')}</TableCell>
                    <TableCell>{t('developer.apiPolicies.tiers.enterpriseNotes')}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <div className="prose max-w-none dark:prose-invert">
                <h3>{t('developer.apiPolicies.rateLimiting.headersTitle')}</h3>
                <p>
                  {t('developer.apiPolicies.rateLimiting.headersDescription')}
                </p>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('developer.apiPolicies.table.header')}</TableHead>
                    <TableHead>{t('developer.apiPolicies.table.description')}</TableHead>
                    <TableHead>{t('developer.apiPolicies.table.example')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs">X-RateLimit-Limit</TableCell>
                    <TableCell>{t('developer.apiPolicies.headers.rateLimitLimit')}</TableCell>
                    <TableCell className="font-mono text-xs">1000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">X-RateLimit-Remaining</TableCell>
                    <TableCell>{t('developer.apiPolicies.headers.rateLimitRemaining')}</TableCell>
                    <TableCell className="font-mono text-xs">985</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">X-RateLimit-Reset</TableCell>
                    <TableCell>{t('developer.apiPolicies.headers.rateLimitReset')}</TableCell>
                    <TableCell className="font-mono text-xs">1635789654</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">Retry-After</TableCell>
                    <TableCell>{t('developer.apiPolicies.headers.retryAfter')}</TableCell>
                    <TableCell className="font-mono text-xs">30</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <div className="prose max-w-none dark:prose-invert">
                <h3>{t('developer.apiPolicies.rateLimiting.handlingTitle')}</h3>
                <p>
                  {t('developer.apiPolicies.rateLimiting.handlingDescription')}
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <CardTitle>{t('developer.apiPolicies.rateLimiting.bestPractices')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">{t('developer.apiPolicies.bestPractices.do')}</h4>
                      <ul className="space-y-1 list-disc list-inside text-sm">
                        <li>{t('developer.apiPolicies.bestPractices.doList.monitor')}</li>
                        <li>{t('developer.apiPolicies.bestPractices.doList.backoff')}</li>
                        <li>{t('developer.apiPolicies.bestPractices.doList.cache')}</li>
                        <li>{t('developer.apiPolicies.bestPractices.doList.batch')}</li>
                        <li>{t('developer.apiPolicies.bestPractices.doList.optimize')}</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">{t('developer.apiPolicies.bestPractices.dont')}</h4>
                      <ul className="space-y-1 list-disc list-inside text-sm">
                        <li>{t('developer.apiPolicies.bestPractices.dontList.retry')}</li>
                        <li>{t('developer.apiPolicies.bestPractices.dontList.ignore')}</li>
                        <li>{t('developer.apiPolicies.bestPractices.dontList.duplicate')}</li>
                        <li>{t('developer.apiPolicies.bestPractices.dontList.share')}</li>
                        <li>{t('developer.apiPolicies.bestPractices.dontList.scrape')}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <h3 className="text-xl font-bold">{t('developer.apiPolicies.codeExamples.title')}</h3>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t('developer.apiPolicies.codeExamples.handlingHeaders')}</CardTitle>
                    <CardDescription>
                      {t('developer.apiPolicies.codeExamples.handlingHeadersDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                        <code className="text-sm">{headerExample}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(headerExample, "header-example")}
                      >
                        {copied === "header-example" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="sr-only">{t('developer.apiPolicies.codeExamples.copyCode')}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t('developer.apiPolicies.codeExamples.exponentialBackoff')}</CardTitle>
                    <CardDescription>
                      {t('developer.apiPolicies.codeExamples.exponentialBackoffDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                        <code className="text-sm">{backoffExample}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(backoffExample, "backoff-example")}
                      >
                        {copied === "backoff-example" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="sr-only">{t('developer.apiPolicies.codeExamples.copyCode')}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>{t('developer.apiPolicies.alerts.needHigherLimits')}</AlertTitle>
                <AlertDescription>
                  {t('developer.apiPolicies.alerts.needHigherLimitsDescription')}
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
          
          <TabsContent value="versioning">
            <div className="space-y-8">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>{t('developer.apiPolicies.alerts.apiVersioningStrategy')}</AlertTitle>
                <AlertDescription>
                  {t('developer.apiPolicies.alerts.apiVersioningDescription')}
                </AlertDescription>
              </Alert>
              
              <div className="prose max-w-none dark:prose-invert">
                <h2>{t('developer.apiPolicies.versioning.title')}</h2>
                <p>
                  {t('developer.apiPolicies.versioning.description')}
                </p>
                
                <h3>{t('developer.apiPolicies.versioning.dateBasedTitle')}</h3>
                <p>
                  {t('developer.apiPolicies.versioning.dateBasedDescription')}
                </p>
                <ul>
                  <li>{t('developer.apiPolicies.versioning.dateBasedBenefits.release')}</li>
                  <li>{t('developer.apiPolicies.versioning.dateBasedBenefits.timeline')}</li>
                  <li>{t('developer.apiPolicies.versioning.dateBasedBenefits.select')}</li>
                  <li>{t('developer.apiPolicies.versioning.dateBasedBenefits.support')}</li>
                </ul>
              </div>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <CardTitle>{t('developer.apiPolicies.versioning.specifyingVersion')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    {t('developer.apiPolicies.versioning.specifyDescription')}
                  </p>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="header">
                      <AccordionTrigger>{t('developer.apiPolicies.versioning.headerRecommended')}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm mb-2">
                          {t('developer.apiPolicies.versioning.accordion.headerInstruction')}
                        </p>
                        <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                          <code className="text-sm">X-API-Version: 2023-10-15</code>
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="url">
                      <AccordionTrigger>{t('developer.apiPolicies.versioning.urlPath')}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm mb-2">
                          {t('developer.apiPolicies.versioning.accordion.urlInstruction')}
                        </p>
                        <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                          <code className="text-sm">{getDocumentationApiUrl()}/v2/shipments</code>
                        </pre>
                        <p className="text-sm mt-2 text-muted-foreground">
                          {t('developer.apiPolicies.versioning.accordion.urlNote')}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="accept">
                      <AccordionTrigger>{t('developer.apiPolicies.versioning.acceptHeader')}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm mb-2">
                          {t('developer.apiPolicies.versioning.accordion.acceptInstruction')}
                        </p>
                        <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                          <code className="text-sm">Accept: application/json; version=2023-10-15</code>
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <div className="bg-muted rounded-md p-4 mt-4">
                    <p className="text-sm font-medium mb-1">{t('developer.apiPolicies.versioning.defaultVersion')}</p>
                    <p className="text-sm">
                      {t('developer.apiPolicies.versioning.defaultVersionDescription')}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <h3 className="text-xl font-bold">{t('developer.apiPolicies.versioning.timelineTitle')}</h3>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('developer.apiPolicies.table.version')}</TableHead>
                      <TableHead>{t('developer.apiPolicies.table.releaseDate')}</TableHead>
                      <TableHead>{t('developer.apiPolicies.table.status')}</TableHead>
                      <TableHead>{t('developer.apiPolicies.table.endOfLife')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>2023-10-15</TableCell>
                      <TableCell>Oct 15, 2023</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500">{t('developer.apiPolicies.versioning.statuses.current')}</Badge>
                      </TableCell>
                      <TableCell>Oct 15, 2025</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2023-04-20</TableCell>
                      <TableCell>Apr 20, 2023</TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-500">{t('developer.apiPolicies.versioning.statuses.maintained')}</Badge>
                      </TableCell>
                      <TableCell>Apr 20, 2025</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2022-11-30</TableCell>
                      <TableCell>Nov 30, 2022</TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-500">{t('developer.apiPolicies.versioning.statuses.maintained')}</Badge>
                      </TableCell>
                      <TableCell>Nov 30, 2024</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2022-05-15</TableCell>
                      <TableCell>May 15, 2022</TableCell>
                      <TableCell>
                        <Badge className="bg-orange-500">{t('developer.apiPolicies.versioning.statuses.deprecated')}</Badge>
                      </TableCell>
                      <TableCell>May 15, 2024</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2021-12-01</TableCell>
                      <TableCell>Dec 1, 2021</TableCell>
                      <TableCell>
                        <Badge className="bg-red-500">{t('developer.apiPolicies.versioning.statuses.endOfLife')}</Badge>
                      </TableCell>
                      <TableCell>Dec 1, 2023</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                <div className="bg-muted rounded-md p-4">
                  <h4 className="font-medium mb-2">{t('developer.apiPolicies.versioning.statusDefinitions')}</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Badge className="bg-green-500">{t('developer.apiPolicies.versioning.statuses.current')}</Badge>
                      <span>{t('developer.apiPolicies.versioning.statuses.currentDesc')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-yellow-500">{t('developer.apiPolicies.versioning.statuses.maintained')}</Badge>
                      <span>{t('developer.apiPolicies.versioning.statuses.maintainedDesc')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-orange-500">{t('developer.apiPolicies.versioning.statuses.deprecated')}</Badge>
                      <span>{t('developer.apiPolicies.versioning.statuses.deprecatedDesc')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-red-500">{t('developer.apiPolicies.versioning.statuses.endOfLife')}</Badge>
                      <span>{t('developer.apiPolicies.versioning.statuses.endOfLifeDesc')}</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="prose max-w-none dark:prose-invert">
                <h3>{t('developer.apiPolicies.versioning.supportPolicy')}</h3>
                <ul>
                  <li>{t('developer.apiPolicies.versioning.supportPolicyList.support24')}</li>
                  <li>{t('developer.apiPolicies.versioning.supportPolicyList.deprecated')}</li>
                  <li>{t('developer.apiPolicies.versioning.supportPolicyList.notice')}</li>
                  <li>{t('developer.apiPolicies.versioning.supportPolicyList.breaking')}</li>
                </ul>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-xl font-bold">{t('developer.apiPolicies.codeExamples.title')}</h3>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t('developer.apiPolicies.codeExamples.specifyVersion')}</CardTitle>
                    <CardDescription>
                      {t('developer.apiPolicies.codeExamples.specifyVersionDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                        <code className="text-sm">{versioningExample}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(versioningExample, "versioning-example")}
                      >
                        {copied === "versioning-example" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="sr-only">{t('developer.apiPolicies.codeExamples.copyCode')}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('developer.apiPolicies.alerts.breakingChanges')}</AlertTitle>
                <AlertDescription>
                  {t('developer.apiPolicies.alerts.breakingChangesDescription')}
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-8" />
        
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{t('developer.apiPolicies.resources.title')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>{t('developer.apiPolicies.resources.securityTitle')}</CardTitle>
                </div>
                <CardDescription>
                  {t('developer.apiPolicies.resources.securityDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>{t('developer.apiPolicies.resources.securityList.https')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>{t('developer.apiPolicies.resources.securityList.store')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>{t('developer.apiPolicies.resources.securityList.errorHandling')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 font-bold">•</span>
                    <span>{t('developer.apiPolicies.resources.securityList.rotate')}</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href="/developer/security">
                    {t('developer.apiPolicies.resources.viewSecurityGuide')}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  <CardTitle>{t('developer.apiPolicies.resources.statusTitle')}</CardTitle>
                </div>
                <CardDescription>
                  {t('developer.apiPolicies.resources.statusDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">{t('developer.apiPolicies.resources.allSystemsOperational')}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('developer.apiPolicies.resources.statusPageDesc')}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <a href="https://status.molochain.com" target="_blank" rel="noopener noreferrer">
                    {t('developer.apiPolicies.resources.viewStatusPage')}
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/developer">
              {t('developer.apiPolicies.backToPortal')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}