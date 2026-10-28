'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import WatchlistButton from './WatchlistButton';
import { POPULAR_STOCK_SYMBOLS } from '@/lib/constants';

export default function SearchCommand({
  open: controlledOpen,
  setOpen: controlledSetOpen,
  renderAs = 'button',
  buttonLabel = 'Search stocks (⌘K)',
  buttonVariant = 'primary',
  className = '',
  initialStocks = [],
}: SearchCommandProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockWithWatchlistStatus[]>(initialStocks);
  const [loading, setLoading] = useState(false);

  const isControlled = typeof controlledOpen !== 'undefined';
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = useCallback(
    (value: boolean) => {
      if (isControlled && controlledSetOpen) {
        controlledSetOpen(value);
      } else {
        setInternalOpen(value);
      }
    },
    [isControlled, controlledSetOpen]
  );

  // Keyboard shortcut listener: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      if (initialStocks.length > 0) {
        setResults(initialStocks);
      } else {
        // Show top 6 popular stocks as initial default suggestions
        setResults(
          POPULAR_STOCK_SYMBOLS.slice(0, 8).map((sym) => ({
            symbol: sym,
            name: sym,
            exchange: 'US',
            type: 'Common Stock',
            isInWatchlist: false,
          }))
        );
      }
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.result || []);
        }
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, initialStocks]);

  const handleSelect = (symbol: string) => {
    setOpen(false);
    router.push(`/stocks/${symbol}`);
  };

  return (
    <>
      {renderAs === 'button' ? (
        <button
          type='button'
          onClick={() => setOpen(true)}
          className={
            buttonVariant === 'primary'
              ? `search-btn ${className}`
              : `search-text flex items-center gap-2 text-sm text-gray-400 hover:text-yellow-500 ${className}`
          }
        >
          <Search className='h-4 w-4' />
          <span>{buttonLabel}</span>
        </button>
      ) : (
        <span
          onClick={() => setOpen(true)}
          className={`search-text cursor-pointer ${className}`}
        >
          {buttonLabel}
        </span>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='p-0 overflow-hidden bg-gray-800 border-gray-600 sm:max-w-xl'>
          <Command className='bg-gray-800 border-none' shouldFilter={false}>
            <div className='flex items-center px-4 border-b border-gray-600 relative'>
              <Search className='mr-2 h-4 w-4 shrink-0 text-gray-400' />
              <CommandInput
                placeholder='Search by ticker or company (e.g. AAPL, NVDA)...'
                value={query}
                onValueChange={setQuery}
                className='text-white placeholder:text-gray-500 bg-transparent h-14 border-0 focus:ring-0 text-base'
              />
              {loading && <Loader2 className='h-4 w-4 animate-spin text-yellow-500' />}
            </div>

            <CommandList className='max-h-80 overflow-y-auto p-2 bg-gray-800'>
              {!loading && results.length === 0 && (
                <CommandEmpty className='py-6 text-center text-gray-500 text-sm'>
                  No matching stocks found for &quot;{query}&quot;.
                </CommandEmpty>
              )}

              {results.length > 0 && (
                <CommandGroup
                  heading={
                    query ? `Search Results (${results.length})` : 'Popular Stocks'
                  }
                  className='text-gray-500 font-semibold text-xs px-2'
                >
                  {results.map((stock) => (
                    <CommandItem
                      key={stock.symbol}
                      value={stock.symbol}
                      onSelect={() => handleSelect(stock.symbol)}
                      className='flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/60 cursor-pointer text-gray-200 transition-colors'
                    >
                      <div className='flex items-center gap-3'>
                        <span className='font-bold text-yellow-500 text-base w-16'>
                          {stock.symbol}
                        </span>
                        <div className='flex flex-col'>
                          <span className='font-medium text-gray-200 text-sm line-clamp-1'>
                            {stock.name}
                          </span>
                          <span className='text-xs text-gray-400'>
                            {stock.exchange} • {stock.type}
                          </span>
                        </div>
                      </div>

                      <div onClick={(e) => e.stopPropagation()}>
                        <WatchlistButton
                          symbol={stock.symbol}
                          company={stock.name}
                          isInWatchlist={stock.isInWatchlist}
                          type='icon'
                        />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
