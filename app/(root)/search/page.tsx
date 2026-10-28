'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Loader2, ArrowUpRight, TrendingUp } from 'lucide-react';
import WatchlistButton from '@/components/WatchlistButton';
import { POPULAR_STOCK_SYMBOLS } from '@/lib/constants';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockWithWatchlistStatus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
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
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className='max-w-4xl mx-auto space-y-8 py-4'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold text-gray-100 flex items-center gap-3'>
          <Search className='h-8 w-8 text-yellow-500' />
          Search Stocks & Markets
        </h1>
        <p className='text-gray-400'>
          Find stocks by ticker symbol or company name. Add them to your watchlist or explore detailed financials.
        </p>
      </div>

      <div className='relative'>
        <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
        <input
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search ticker or company (e.g. AAPL, NVDA, Microsoft)...'
          className='w-full pl-12 pr-12 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 text-lg focus:outline-none focus:border-yellow-500 transition-colors'
          autoFocus
        />
        {loading && (
          <Loader2 className='absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-yellow-500' />
        )}
      </div>

      {query.trim() && (
        <div className='bg-gray-800 border border-gray-600 rounded-xl overflow-hidden'>
          <div className='p-4 border-b border-gray-700 bg-gray-800/80 font-medium text-sm text-gray-400 flex justify-between items-center'>
            <span>Results for &quot;{query}&quot;</span>
            <span>{results.length} found</span>
          </div>

          {results.length === 0 && !loading ? (
            <div className='p-12 text-center text-gray-500'>
              No stocks found matching &quot;{query}&quot;. Try another symbol or company name.
            </div>
          ) : (
            <div className='divide-y divide-gray-700/60'>
              {results.map((stock) => (
                <div
                  key={stock.symbol}
                  className='p-4 flex items-center justify-between hover:bg-gray-700/40 transition-colors'
                >
                  <Link
                    href={`/stocks/${stock.symbol}`}
                    className='flex items-center gap-4 group flex-1'
                  >
                    <span className='text-xl font-bold text-yellow-500 w-20 group-hover:underline flex items-center gap-1'>
                      {stock.symbol}
                      <ArrowUpRight className='h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity' />
                    </span>
                    <div className='flex flex-col'>
                      <span className='font-semibold text-gray-100 group-hover:text-yellow-400 transition-colors'>
                        {stock.name}
                      </span>
                      <span className='text-xs text-gray-400'>
                        {stock.exchange} • {stock.type}
                      </span>
                    </div>
                  </Link>

                  <div className='flex items-center gap-3'>
                    <WatchlistButton
                      symbol={stock.symbol}
                      company={stock.name}
                      isInWatchlist={stock.isInWatchlist}
                      type='icon'
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Popular Movers Showcase */}
      <div className='space-y-4 pt-4'>
        <div className='flex items-center gap-2 text-gray-300 font-semibold text-base'>
          <TrendingUp className='h-5 w-5 text-yellow-500' />
          <span>Popular Market Movers</span>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
          {POPULAR_STOCK_SYMBOLS.slice(0, 16).map((symbol) => (
            <Link
              key={symbol}
              href={`/stocks/${symbol}`}
              className='p-3 bg-gray-800 border border-gray-600 rounded-lg hover:border-yellow-500/50 hover:bg-gray-750 transition-all flex items-center justify-between group'
            >
              <span className='font-bold text-gray-200 group-hover:text-yellow-500 transition-colors'>
                {symbol}
              </span>
              <ArrowUpRight className='h-4 w-4 text-gray-500 group-hover:text-yellow-500 transition-colors' />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
