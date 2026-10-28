'use client';

import { useState } from 'react';
import { Star, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function WatchlistButton({
  symbol,
  company,
  isInWatchlist: initialInWatchlist,
  showTrashIcon = false,
  type = 'button',
  onWatchlistChange,
}: WatchlistButtonProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(initialInWatchlist);
  const [loading, setLoading] = useState(false);

  const toggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    setLoading(true);

    const nextState = !isInWatchlist;
    setIsInWatchlist(nextState);

    try {
      if (nextState) {
        await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol, company }),
        });
      } else {
        await fetch(`/api/watchlist?symbol=${encodeURIComponent(symbol)}`, {
          method: 'DELETE',
        });
      }

      if (onWatchlistChange) {
        onWatchlistChange(symbol, nextState);
      }
    } catch (err) {
      // Revert optimistic update
      setIsInWatchlist(!nextState);
      console.error('Failed to update watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  if (type === 'icon') {
    return (
      <button
        onClick={toggleWatchlist}
        disabled={loading}
        title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        aria-label={isInWatchlist ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
        className={cn(
          'watchlist-icon-btn p-1.5 transition-colors',
          isInWatchlist && !showTrashIcon ? 'watchlist-icon-added' : ''
        )}
      >
        <span className='watchlist-icon'>
          {loading ? (
            <Loader2 className='h-4 w-4 animate-spin text-gray-400' />
          ) : showTrashIcon && isInWatchlist ? (
            <Trash2 className='trash-icon' />
          ) : (
            <Star
              className={cn(
                'star-icon',
                isInWatchlist ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'
              )}
            />
          )}
        </span>
      </button>
    );
  }

  return (
    <Button
      onClick={toggleWatchlist}
      disabled={loading}
      className={cn(
        'watchlist-btn transition-colors',
        isInWatchlist && showTrashIcon ? 'watchlist-remove' : ''
      )}
    >
      {loading ? (
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
      ) : isInWatchlist ? (
        showTrashIcon ? (
          <Trash2 className='mr-2 h-4 w-4' />
        ) : (
          <Star className='mr-2 h-4 w-4 fill-current' />
        )
      ) : (
        <Star className='mr-2 h-4 w-4' />
      )}
      {isInWatchlist ? (showTrashIcon ? 'Remove from Watchlist' : 'In Watchlist') : 'Add to Watchlist'}
    </Button>
  );
}
