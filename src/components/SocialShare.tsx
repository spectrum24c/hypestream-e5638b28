
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SocialShare } from '@/types/movie';
import { useToast } from '@/hooks/use-toast';

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

  const shareOptions: SocialShare[] = [
    {
      platform: 'facebook',
      title: 'Share on Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message + ' ' + title)}`
    },
    {
      platform: 'twitter',
      title: 'Share on Twitter',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message + ' ' + title)}&url=${encodeURIComponent(url)}`
    },
    {
      platform: 'email',
      title: 'Share via Email',
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message + ' ' + title + '\n\n' + url)}`
    }
  ];

  const handleShare = (platform: string, shareUrl: string) => {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Share</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {shareOptions.map((option) => (
          <DropdownMenuItem 
            key={option.platform}
            onClick={() => handleShare(option.platform, option.url)}
            className="cursor-pointer"
          >
            {option.title}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem 
          onClick={handleCopyLink}
          className="cursor-pointer"
        >
          Copy link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SocialShare;
