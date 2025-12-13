'use client';

import { useState } from 'react';
import { HiShare as ShareIcon } from 'react-icons/hi2';
import { usePathname } from 'next/navigation';

import { useToast } from '@/hooks/useToast';
import { Button } from './ui/button';

export function ShareButton() {
  const { toast } = useToast();
  const pathname = usePathname();
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (isSharing) return;

    setIsSharing(true);
    const currentUrl = `${window.location.origin}${pathname}`;

    try {
      // Check if Web Share API is available
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'SnapRetro - Join my Retrospective',
          text: 'Join my retrospective meeting on SnapRetro!',
          url: currentUrl
        });
        toast({
          title: 'Shared successfully!'
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(currentUrl);
        toast({
          title: 'URL copied to clipboard!'
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to clipboard if share failsoo
      try {
        await navigator.clipboard.writeText(currentUrl);
        toast({
          title: 'URL copied to clipboard!'
        });
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
        toast({
          title: 'Unable to share. Please copy the URL manually.'
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  const isShareSupported = typeof navigator !== 'undefined' && navigator.share;

  return (
    <Button
      variant="secondary"
      size="sm"
      className="mr-4 text-sm"
      onClick={handleShare}
      disabled={isSharing}
    >
      {isShareSupported ? (
        <ShareIcon size={16} className="shrink-0" />
      ) : (
        <ShareIcon size={16} className="shrink-0" />
      )}
      Share
    </Button>
  );
}
