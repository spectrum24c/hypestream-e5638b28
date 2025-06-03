
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import type { SocialShare as SocialShareType } from '@/types/movie';
import { useToast } from '@/hooks/use-toast';
import { Share2, Facebook, Twitter, Mail, Linkedin, MessageCircle, Copy, Share } from 'lucide-react';

interface SocialShareProps {
  title: string;
  message?: string;
  url: string;
}

const SocialShare: React.FC<SocialShareProps> = ({
  title,
  message = 'Check out what I\'m watching on HypeStream:',
  url
}) => {
  const { toast } = useToast();
  const shareData = { title, text: message, url };

  const shareOptions: SocialShareType[] = [
    {
      platform: 'facebook',
      title: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message + ' ' + title)}`
    },
    {
      platform: 'twitter',
      title: 'Twitter',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message + ' ' + title)}&url=${encodeURIComponent(url)}`
    },
    {
      platform: 'email',
      title: 'Email',
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message + ' ' + title + '\n\n' + url)}`
    }
  ];

  // Additional share options that don't match the strict type
  const additionalShareOptions = [
    {
      platform: 'linkedin',
      title: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    },
    {
      platform: 'whatsapp',
      title: 'WhatsApp',
      url: `https://wa.me/?text=${encodeURIComponent(message + ' ' + title + ' ' + url)}`
    }
  ];

  const handleShare = async (platform: string, shareUrl: string) => {
    // Try Web Share API first for mobile devices if it's the native sharing
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully",
          description: "Content shared via your device",
        });
        return;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
        // Fall back to platform-specific sharing if Web Share API fails
      }
    }
    
    // Platform specific sharing
    if (platform === 'email') {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    toast({
      title: "Shared successfully",
      description: `Content shared via ${platform}`,
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Link copied to clipboard",
    });
  };

  // Check if Web Share API is available (mostly on mobile)
  const canUseNativeShare = navigator.share !== undefined;

  const renderPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="mr-2 h-4 w-4" />;
      case 'twitter': return <Twitter className="mr-2 h-4 w-4" />;
      case 'linkedin': return <Linkedin className="mr-2 h-4 w-4" />;
      case 'whatsapp': return <MessageCircle className="mr-2 h-4 w-4" />;
      case 'email': return <Mail className="mr-2 h-4 w-4" />;
      default: return <Share className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <>
      {canUseNativeShare ? (
        <Button 
          variant="outline"
          onClick={() => handleShare('native', '')}
          className="flex items-center"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {shareOptions.map((option) => (
              <DropdownMenuItem 
                key={option.platform}
                onClick={() => handleShare(option.platform, option.url)}
                className="cursor-pointer flex items-center"
              >
                {renderPlatformIcon(option.platform)}
                {option.title}
              </DropdownMenuItem>
            ))}
            {additionalShareOptions.map((option) => (
              <DropdownMenuItem 
                key={option.platform}
                onClick={() => handleShare(option.platform, option.url)}
                className="cursor-pointer flex items-center"
              >
                {renderPlatformIcon(option.platform)}
                {option.title}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleCopyLink}
              className="cursor-pointer flex items-center"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};

export default SocialShare;
