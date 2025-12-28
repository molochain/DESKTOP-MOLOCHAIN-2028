import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Share2, Download, Check } from 'lucide-react';

interface TrackingQRCodeProps {
  trackingNumber: string;
  className?: string;
  size?: number;
  showButtons?: boolean;
}

export default function TrackingQRCode({
  trackingNumber,
  className,
  size = 128,
  showButtons = true,
}: TrackingQRCodeProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Get the current origin
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Create the tracking URL
  const trackingUrl = `${origin}/tracking?number=${trackingNumber}`;

  // Handle sharing via Web Share API if available
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Track my shipment',
          text: `Track my shipment with tracking number: ${trackingNumber}`,
          url: trackingUrl,
        });
        
        toast({
          title: 'Shared successfully',
          description: 'Tracking information has been shared',
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast({
            title: 'Sharing failed',
            description: 'Failed to share tracking information',
            variant: 'destructive',
          });
        }
      }
    } else {
      // Fallback to clipboard for browsers without Web Share API
      handleCopyLink();
    }
  };

  // Copy tracking link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      
      toast({
        title: 'Link copied',
        description: 'Tracking link copied to clipboard',
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy link to clipboard',
        variant: 'destructive',
      });
    }
  };

  // Download QR code as SVG
  const handleDownload = () => {
    // Create a blob from the SVG
    const svgElement = document.getElementById('tracking-qr-code');
    if (!svgElement) return;
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    // Create download link and trigger click
    const link = document.createElement('a');
    link.href = url;
    link.download = `tracking-${trackingNumber}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    toast({
      title: 'QR Code downloaded',
      description: 'QR code has been downloaded as SVG',
    });
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <Card className="w-auto">
        <CardContent className="flex justify-center p-4">
          <QRCodeSVG
            id="tracking-qr-code"
            value={trackingUrl}
            size={size}
            bgColor={'#ffffff'}
            fgColor={'#000000'}
            level={'M'}
            includeMargin={false}
          />
        </CardContent>
      </Card>
      
      {showButtons && (
        <div className="flex mt-4 gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {copied ? 'Copied' : 'Copy Link'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-2">
        Scan to track shipment
      </p>
    </div>
  );
}