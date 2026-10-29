import { Metadata } from 'next';
import Link from 'next/link';
import { getQuote, getCompanyProfile, getBasicFinancials, formatMarketCap } from '@/lib/finnhub';
import { Share2, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Shared Watchlist | Signalist',
  description: 'View curated stock picks and live market metrics on this public shared watchlist.',
};

export default async function SharedWatchlistPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Curated shared stocks
  const sampleStocks = [
    { symbol: 'NVDA', company: 'NVIDIA Corporation' },
    { symbol: 'AAPL', company: 'Apple Inc' },
    { symbol: 'MSFT', company: 'Microsoft Corporation' },
    { symbol: 'AMZN', company: 'Amazon.com Inc' },
  ];

  const hydrated = await Promise.all(
    sampleStocks.map(async (item) => {
      const [quote, profile, financials] = await Promise.all([
        getQuote(item.symbol),
        getCompanyProfile(item.symbol),
        getBasicFinancials(item.symbol),
      ]);

      const price = quote.c || 0;
      const change = quote.dp || 0;

      return {
        symbol: item.symbol,
        company: profile.name || item.company,
        price,
        change,
        marketCap: formatMarketCap(profile.marketCapitalization),
        peRatio: financials.metric?.peNormalizedAnnual?.toFixed(2) || 'N/A',
      };
    })
  );

  return (
    <div className='max-w-4xl mx-auto space-y-8 pb-12'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-700 pb-6'>
        <div>
          <div className='flex items-center gap-2 text-yellow-500 text-xs font-bold uppercase tracking-wider mb-1'>
            <Share2 className='h-4 w-4' />
            <span>Public Shared Portfolio Watchlist</span>
          </div>
          <h1 className='text-3xl font-extrabold text-gray-100'>Curated Watchlist</h1>
          <p className='text-xs text-gray-400 mt-1 font-mono'>Token: {token}</p>
        </div>

        <Link href='/sign-up' className='yellow-btn px-6 text-sm font-semibold flex items-center gap-2'>
          <span>Track in Signalist</span>
          <ArrowUpRight className='h-4 w-4' />
        </Link>
      </div>

      <div className='watchlist-table overflow-x-auto'>
        <table className='w-full text-left border-collapse'>
          <thead>
            <tr className='table-header-row'>
              <th className='p-4 text-xs font-semibold uppercase text-gray-400'>Company</th>
              <th className='p-4 text-xs font-semibold uppercase text-gray-400'>Symbol</th>
              <th className='p-4 text-xs font-semibold uppercase text-gray-400'>Price</th>
              <th className='p-4 text-xs font-semibold uppercase text-gray-400'>Day Change</th>
              <th className='p-4 text-xs font-semibold uppercase text-gray-400'>Market Cap</th>
              <th className='p-4 text-xs font-semibold uppercase text-gray-400'>P/E Ratio</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-700/60'>
            {hydrated.map((stock) => {
              const isUp = stock.change >= 0;

              return (
                <tr key={stock.symbol} className='table-row'>
                  <td className='p-4 font-semibold text-gray-100'>{stock.company}</td>
                  <td className='p-4'>
                    <Link
                      href={`/stocks/${stock.symbol}`}
                      className='font-bold text-yellow-500 hover:underline'
                    >
                      {stock.symbol}
                    </Link>
                  </td>
                  <td className='p-4 font-bold text-gray-100'>${stock.price.toFixed(2)}</td>
                  <td className='p-4'>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold',
                        isUp
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      )}
                    >
                      {isUp ? <TrendingUp className='h-3 w-3' /> : <TrendingDown className='h-3 w-3' />}
                      {isUp ? '+' : ''}
                      {stock.change.toFixed(2)}%
                    </span>
                  </td>
                  <td className='p-4 text-gray-300'>{stock.marketCap}</td>
                  <td className='p-4 text-gray-300'>{stock.peRatio}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

