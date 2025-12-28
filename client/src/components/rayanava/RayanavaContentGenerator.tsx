import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, TrendingUp, FileText, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function RayanavaContentGenerator() {
  const { toast } = useToast();
  
  // Content Generation State
  const [contentType, setContentType] = useState<'blog' | 'social' | 'email'>('blog');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState<'professional' | 'casual' | 'technical' | 'inspiring'>('professional');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  
  // Sales Automation State
  const [salesTask, setSalesTask] = useState<'qualify_lead' | 'follow_up' | 'score_lead'>('qualify_lead');
  const [companyName, setCompanyName] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [industry, setIndustry] = useState('');
  const [salesResult, setSalesResult] = useState<any>(null);

  // Content Generation Mutation
  const generateContentMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/rayanava/generate-content', data);
    },
    onSuccess: (response) => {
      setGeneratedContent(response.data);
      toast({
        title: 'Content Generated!',
        description: 'Your content has been generated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate content. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Sales Task Mutation
  const handleSalesTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/rayanava/sales', data);
    },
    onSuccess: (response) => {
      setSalesResult(response.data);
      toast({
        title: 'Sales Task Completed!',
        description: 'The sales automation task has been processed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Task Failed',
        description: 'Failed to process sales task. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleGenerateContent = () => {
    const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
    generateContentMutation.mutate({
      type: contentType,
      topic,
      keywords: keywordArray,
      tone,
      length,
    });
  };

  const handleSalesTask = () => {
    const leadData = {
      company: companyName,
      company_size: parseInt(companySize) || 0,
      industry,
      engagement: {
        website_visits: Math.floor(Math.random() * 20) + 1,
        content_downloads: Math.floor(Math.random() * 5),
        demo_requested: Math.random() > 0.5,
      },
    };
    
    handleSalesTaskMutation.mutate({
      task: salesTask,
      leadData,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Rayanava AI Assistant
          </CardTitle>
          <CardDescription>
            AI-powered content generation and sales automation for MoloChain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Content Marketing
              </TabsTrigger>
              <TabsTrigger value="sales" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Sales Automation
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="content-type">Content Type</Label>
                  <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
                    <SelectTrigger id="content-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Blog Post</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="email">Email Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Supply Chain Optimization with AI"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    placeholder="e.g., logistics, AI, automation, MoloChain"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tone">Tone</Label>
                    <Select value={tone} onValueChange={(value: any) => setTone(value)}>
                      <SelectTrigger id="tone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="inspiring">Inspiring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="length">Length</Label>
                    <Select value={length} onValueChange={(value: any) => setLength(value)}>
                      <SelectTrigger id="length">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="long">Long</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  onClick={handleGenerateContent}
                  disabled={generateContentMutation.isPending || !topic}
                  className="w-full"
                >
                  {generateContentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Content
                    </>
                  )}
                </Button>
                
                {generatedContent && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-lg">Generated Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {generatedContent.type === 'blog' && (
                        <div className="space-y-3">
                          <h3 className="font-bold">{generatedContent.content.title}</h3>
                          <p className="text-sm text-muted-foreground">{generatedContent.content.introduction}</p>
                          <div className="space-y-2">
                            {generatedContent.content.body?.map((paragraph: string, idx: number) => (
                              <p key={idx} className="text-sm">{paragraph}</p>
                            ))}
                          </div>
                          <p className="text-sm font-medium">{generatedContent.content.conclusion}</p>
                          <Button variant="outline" size="sm">{generatedContent.content.cta}</Button>
                        </div>
                      )}
                      {generatedContent.type === 'social' && (
                        <div className="space-y-3">
                          <div>
                            <Badge className="mb-2">LinkedIn</Badge>
                            <p className="text-sm">{generatedContent.content.linkedin}</p>
                          </div>
                          <div>
                            <Badge className="mb-2">Twitter</Badge>
                            <p className="text-sm">{generatedContent.content.twitter}</p>
                          </div>
                        </div>
                      )}
                      {generatedContent.type === 'email' && (
                        <div className="space-y-3">
                          <div>
                            <Label>Subject:</Label>
                            <p className="text-sm font-medium">{generatedContent.content.subject}</p>
                          </div>
                          <div>
                            <Label>Body:</Label>
                            <pre className="text-sm whitespace-pre-wrap">{generatedContent.content.body}</pre>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="sales" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sales-task">Sales Task</Label>
                  <Select value={salesTask} onValueChange={(value: any) => setSalesTask(value)}>
                    <SelectTrigger id="sales-task">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qualify_lead">Qualify Lead</SelectItem>
                      <SelectItem value="follow_up">Generate Follow-up</SelectItem>
                      <SelectItem value="score_lead">Score Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    placeholder="e.g., Global Logistics Inc"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="size">Company Size</Label>
                    <Input
                      id="size"
                      type="number"
                      placeholder="e.g., 500"
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      placeholder="e.g., Logistics"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleSalesTask}
                  disabled={handleSalesTaskMutation.isPending || !companyName}
                  className="w-full"
                >
                  {handleSalesTaskMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Process Sales Task
                    </>
                  )}
                </Button>
                
                {salesResult && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-lg">Sales Analysis Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Lead Score:</span>
                          <Badge variant={salesResult.score >= 70 ? 'default' : salesResult.score >= 40 ? 'secondary' : 'outline'}>
                            {salesResult.score}/100
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Qualification:</span>
                          <Badge>{salesResult.qualification}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Priority:</span>
                          <Badge variant={salesResult.priority === 'high' ? 'destructive' : salesResult.priority === 'medium' ? 'default' : 'secondary'}>
                            {salesResult.priority}
                          </Badge>
                        </div>
                        {salesResult.estimated_value && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Estimated Value:</span>
                            <span className="text-sm">{salesResult.estimated_value}</span>
                          </div>
                        )}
                        {salesResult.recommendations && (
                          <div>
                            <Label className="mb-2">Recommended Actions:</Label>
                            <ul className="list-disc list-inside space-y-1">
                              {salesResult.recommendations.map((rec: string, idx: number) => (
                                <li key={idx} className="text-sm text-muted-foreground">{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {salesResult.next_actions && (
                          <div>
                            <Label className="mb-2">Next Steps:</Label>
                            <ul className="list-disc list-inside space-y-1">
                              {salesResult.next_actions.map((action: string, idx: number) => (
                                <li key={idx} className="text-sm text-muted-foreground">{action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}