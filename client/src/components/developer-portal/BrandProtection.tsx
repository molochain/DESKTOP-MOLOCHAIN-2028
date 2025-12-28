// Brand Protection Component
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Download, 
  Eye, 
  Shield, 
  AlertTriangle, 
  FileImage, 
  Palette, 
  Type, 
  Layout,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface BrandAsset {
  id: string;
  name: string;
  type: 'logo' | 'icon' | 'color' | 'font' | 'template';
  url: string;
  format: string;
  size: string;
  usage: 'primary' | 'secondary' | 'restricted';
  guidelines: string;
  restrictions: string[];
  lastUpdated: string;
}

interface BrandGuideline {
  category: string;
  title: string;
  description: string;
  examples: string[];
  restrictions: string[];
}

const brandAssets: BrandAsset[] = [
  {
    id: 'primary-logo',
    name: 'MoloChain Primary Logo',
    type: 'logo',
    url: '/molochain-logo.png',
    format: 'PNG',
    size: '500x200',
    usage: 'primary',
    guidelines: 'Use for main branding, maintain minimum 20px padding around logo',
    restrictions: ['No modifications allowed', 'No color changes', 'Minimum size 100px width'],
    lastUpdated: '2025-01-15'
  },
  {
    id: 'container-logo',
    name: 'Container Logistics Icon',
    type: 'icon',
    url: '/container-aerial.jpg',
    format: 'JPG',
    size: '400x300',
    usage: 'secondary',
    guidelines: 'Use for logistics and shipping contexts',
    restrictions: ['Maintain aspect ratio', 'No overlay text'],
    lastUpdated: '2025-01-10'
  },
  {
    id: 'primary-color',
    name: 'Primary Brand Color',
    type: 'color',
    url: '#2563eb',
    format: 'HEX',
    size: 'N/A',
    usage: 'primary',
    guidelines: 'Primary blue for buttons, links, and key interface elements',
    restrictions: ['Use exact hex value', 'Minimum contrast ratio 4.5:1'],
    lastUpdated: '2025-01-01'
  },
  {
    id: 'secondary-color',
    name: 'Secondary Brand Color',
    type: 'color',
    url: '#64748b',
    format: 'HEX',
    size: 'N/A',
    usage: 'secondary',
    guidelines: 'Secondary gray for text and subtle elements',
    restrictions: ['Use for supporting content only', 'Never as primary color'],
    lastUpdated: '2025-01-01'
  },
  {
    id: 'brand-font',
    name: 'Inter Font Family',
    type: 'font',
    url: 'https://fonts.google.com/specimen/Inter',
    format: 'Web Font',
    size: 'Variable',
    usage: 'primary',
    guidelines: 'Primary typeface for all digital communications',
    restrictions: ['Use weights 400, 500, 600, 700 only', 'Fallback to system fonts'],
    lastUpdated: '2025-01-01'
  }
];

const brandGuidelines: BrandGuideline[] = [
  {
    category: 'Logo Usage',
    title: 'Proper Logo Implementation',
    description: 'Guidelines for using the MoloChain logo across different media and contexts.',
    examples: [
      'Website headers and navigation',
      'Email signatures and communications',
      'Marketing materials and presentations',
      'Social media profiles and posts'
    ],
    restrictions: [
      'Never stretch or distort the logo',
      'Maintain clear space equal to the height of the "M" in MoloChain',
      'Do not use on backgrounds with insufficient contrast',
      'Never recreate or redraw the logo'
    ]
  },
  {
    category: 'Color Palette',
    title: 'Brand Color Guidelines',
    description: 'Proper usage of MoloChain brand colors to maintain consistency and recognition.',
    examples: [
      'Primary blue (#2563eb) for call-to-action buttons',
      'Secondary gray (#64748b) for body text',
      'White (#ffffff) for backgrounds and negative space',
      'Success green (#10b981) for positive states'
    ],
    restrictions: [
      'Do not modify brand colors or use similar shades',
      'Ensure proper contrast ratios for accessibility',
      'Use colors consistently across all platforms',
      'Never use colors outside the approved palette'
    ]
  },
  {
    category: 'Typography',
    title: 'Font and Text Guidelines',
    description: 'Typography standards for maintaining professional and consistent communication.',
    examples: [
      'Inter font family for all digital content',
      'Minimum 16px font size for body text',
      'Line height of 1.5 for optimal readability',
      'Consistent heading hierarchy (H1-H6)'
    ],
    restrictions: [
      'Do not use decorative or script fonts',
      'Avoid excessive use of bold or italic text',
      'Never use all caps for large blocks of text',
      'Maintain consistent spacing and alignment'
    ]
  }
];

export function BrandProtection() {
  const [activeTab, setActiveTab] = useState('assets');
  const [selectedAsset, setSelectedAsset] = useState<BrandAsset | null>(null);
  const [violationForm, setViolationForm] = useState({
    type: '',
    description: '',
    evidence: ''
  });
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleDownloadAsset = async (asset: BrandAsset) => {
    if (asset.type === 'color') {
      // Copy color to clipboard
      await navigator.clipboard.writeText(asset.url);
      setCopiedColor(asset.id);
      setTimeout(() => setCopiedColor(null), 2000);
      return;
    }

    // For other assets, create download link
    const link = document.createElement('a');
    link.href = asset.url;
    link.download = `${asset.name.toLowerCase().replace(/\s+/g, '-')}.${asset.format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViolationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/brand/violations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: violationForm.type,
          description: violationForm.description,
          evidence: violationForm.evidence.split('\n').filter(line => line.trim())
        }),
      });

      if (response.ok) {
        setViolationForm({ type: '', description: '', evidence: '' });
        // Brand violation report submitted successfully
      }
    } catch (error) {
      // Error submitting violation report
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'logo': return <FileImage className="h-5 w-5" />;
      case 'icon': return <Layout className="h-5 w-5" />;
      case 'color': return <Palette className="h-5 w-5" />;
      case 'font': return <Type className="h-5 w-5" />;
      default: return <FileImage className="h-5 w-5" />;
    }
  };

  const getUsageBadgeVariant = (usage: string) => {
    switch (usage) {
      case 'primary': return 'default';
      case 'secondary': return 'secondary';
      case 'restricted': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Brand Protection Center</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Access official MoloChain brand assets, guidelines, and report unauthorized usage to protect our brand integrity.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assets">Brand Assets</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          <TabsTrigger value="report">Report Violation</TabsTrigger>
          <TabsTrigger value="legal">Legal Information</TabsTrigger>
        </TabsList>

        <TabsContent value="assets">
          <div className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Brand Asset Usage Notice</AlertTitle>
              <AlertDescription>
                These assets are provided for approved partners and developers. Usage must comply with brand guidelines.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brandAssets.map((asset) => (
                <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {getAssetIcon(asset.type)}
                        {asset.name}
                      </CardTitle>
                      <Badge variant={getUsageBadgeVariant(asset.usage)}>
                        {asset.usage}
                      </Badge>
                    </div>
                    <CardDescription>
                      {asset.format} • {asset.size}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Asset Preview */}
                      <div className="bg-muted rounded-lg p-4 flex items-center justify-center min-h-[120px]">
                        {asset.type === 'color' ? (
                          <div className="text-center">
                            <div 
                              className="w-16 h-16 rounded-lg border-2 border-border mx-auto mb-2"
                              style={{ backgroundColor: asset.url }}
                            />
                            <code className="text-sm font-mono">{asset.url}</code>
                          </div>
                        ) : asset.type === 'font' ? (
                          <div className="text-center">
                            <div className="text-2xl font-bold mb-2">Aa</div>
                            <p className="text-sm">Inter Font Family</p>
                          </div>
                        ) : (
                          <img 
                            src={asset.url} 
                            alt={asset.name}
                            className="max-w-full max-h-20 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = '<div class="text-muted-foreground">Preview unavailable</div>';
                            }}
                          />
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {asset.guidelines}
                      </p>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleDownloadAsset(asset)}
                          className="flex-1"
                        >
                          {asset.type === 'color' ? (
                            copiedColor === asset.id ? (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                              </>
                            )
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </>
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedAsset(asset)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="guidelines">
          <div className="space-y-6">
            {brandGuidelines.map((guideline, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{guideline.title}</CardTitle>
                  <CardDescription>{guideline.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">{guideline.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-green-700 mb-3">✓ Do</h4>
                      <ul className="space-y-2">
                        {guideline.examples.map((example, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-red-700 mb-3">✗ Don't</h4>
                      <ul className="space-y-2">
                        {guideline.restrictions.map((restriction, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-red-600 mt-1">•</span>
                            {restriction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="report">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Report Brand Violation
                </CardTitle>
                <CardDescription>
                  Help us protect the MoloChain brand by reporting unauthorized usage or violations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleViolationSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="violation-type">Violation Type</Label>
                    <Select 
                      value={violationForm.type} 
                      onValueChange={(value) => setViolationForm(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select violation type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unauthorized_usage">Unauthorized Usage</SelectItem>
                        <SelectItem value="modification">Logo/Asset Modification</SelectItem>
                        <SelectItem value="misrepresentation">Brand Misrepresentation</SelectItem>
                        <SelectItem value="trademark_infringement">Trademark Infringement</SelectItem>
                        <SelectItem value="counterfeit">Counterfeit Products</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the violation in detail..."
                      value={violationForm.description}
                      onChange={(e) => setViolationForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="evidence">Evidence URLs</Label>
                    <Textarea
                      id="evidence"
                      placeholder="Provide URLs or links to evidence (one per line)..."
                      value={violationForm.evidence}
                      onChange={(e) => setViolationForm(prev => ({ ...prev, evidence: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={!violationForm.type || !violationForm.description}
                  >
                    Submit Violation Report
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="legal">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Legal Information & Trademark Notice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Trademark Protection</h4>
                  <p className="text-sm text-muted-foreground">
                    MoloChain and associated logos are registered trademarks. Unauthorized use is strictly prohibited and may result in legal action.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Permitted Use</h4>
                  <p className="text-sm text-muted-foreground">
                    Brand assets may be used by authorized partners, developers, and media representatives in accordance with these guidelines. Commercial use requires explicit permission.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <p className="text-sm text-muted-foreground">
                    For brand usage inquiries or to report violations: brand@molochain.com
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Legal Disclaimer</h4>
                  <p className="text-sm text-muted-foreground">
                    These guidelines may be updated without notice. Users are responsible for staying current with the latest brand standards.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getAssetIcon(selectedAsset.type)}
                  {selectedAsset.name}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedAsset(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted rounded-lg p-6 flex items-center justify-center">
                  {selectedAsset.type === 'color' ? (
                    <div className="text-center">
                      <div 
                        className="w-24 h-24 rounded-lg border-2 border-border mx-auto mb-4"
                        style={{ backgroundColor: selectedAsset.url }}
                      />
                      <code className="text-lg font-mono">{selectedAsset.url}</code>
                    </div>
                  ) : selectedAsset.type === 'font' ? (
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-4">Aa Bb Cc</div>
                      <p>Inter Font Family</p>
                    </div>
                  ) : (
                    <img 
                      src={selectedAsset.url} 
                      alt={selectedAsset.name}
                      className="max-w-full max-h-40 object-contain"
                    />
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Usage Guidelines</h4>
                  <p className="text-sm text-muted-foreground">{selectedAsset.guidelines}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Restrictions</h4>
                  <ul className="space-y-1">
                    {selectedAsset.restrictions.map((restriction, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-red-600 mt-1">•</span>
                        {restriction}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={() => handleDownloadAsset(selectedAsset)}>
                    {selectedAsset.type === 'color' ? 'Copy Color' : 'Download Asset'}
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedAsset(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}