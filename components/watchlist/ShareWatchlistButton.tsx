'use client';

import { useState } from 'react';
import { Share2, Check, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ShareWatchlistButton() {
  const [open, setOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOpenShare = async () => {
    setOpen(true);
    setLoading(true);
    setCopied(false);
    try {
      const res = await fetch('/api/watchlist/share', { method: 'POST' });
      const data = await res.json();
      if (data?.shareUrl) {
        setShareUrl(data.shareUrl);
      }
    } catch (err) {
      console.error('Failed to generate share link:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <Button
        variant='outline'
        onClick={handleOpenShare}
        className='border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium h-11 px-4'
      >
        <Share2 className='h-4 w-4 mr-2 text-yellow-500' />
        Share Watchlist
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='bg-gray-800 border-gray-600 text-gray-200 sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold text-gray-100 flex items-center gap-2'>
              <Share2 className='h-5 w-5 text-yellow-500' />
              <span>Share Your Watchlist</span>
            </DialogTitle>
          </DialogHeader>

          <p className='text-xs text-gray-400'>
            Anyone with this unique link can view your curated watchlist and real-time market quotes.
          </p>

          {loading ? (
            <div className='py-6 flex items-center justify-center'>
              <Loader2 className='h-6 w-6 animate-spin text-yellow-500' />
            </div>
          ) : (
            <div className='flex items-center gap-2 pt-2'>
              <input
                readOnly
                value={shareUrl}
                className='flex-1 p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-xs font-mono text-gray-300'
              />
              <Button onClick={handleCopy} className='yellow-btn px-4 text-xs font-bold'>
                {copied ? <Check className='h-4 w-4 text-emerald-900' /> : <Copy className='h-4 w-4' />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

