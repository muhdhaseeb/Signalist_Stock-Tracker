import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { getUserWatchlist, getUserAlerts } from '@/lib/db/store';
import {
  getQuote,
  getCompanyProfile,
  getBasicFinancials,
  getMarketNews,
  formatMarketCap,
} from '@/lib/finnhub';
import WatchlistTable from '@/components/watchlist/WatchlistTable';
import AlertsList from '@/components/watchlist/AlertsList';
import WatchlistNews from '@/components/watchlist/WatchlistNews';
import SearchCommand from '@/components/SearchCommand';
import ShareWatchlistButton from '@/components/watchlist/ShareWatchlistButton';
import { Eye, Newspaper } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Watchlist | Signalist',
  description: 'Track your personalized stock watchlist, live prices, and market movements.',
};

export default async function WatchlistPage() {
  const session = await getSession();
  const userId = session?.userId || 'guest';

  const [rawWatchlist, rawAlerts, news] = await Promise.all([
    getUserWatchlist(userId),
    getUserAlerts(userId),
    getMarketNews('general'),
  ]);

  // Hydrate watchlist with real-time Finnhub market quotes
  const hydratedWatchlist: StockWithData[] = await Promise.all(
    rawWatchlist.map(async (item) => {
      const symbol = item.symbol.toUpperCase();
      const [quote, profile, financials] = await Promise.all([
        getQuote(symbol),
        getCompanyProfile(symbol),
        getBasicFinancials(symbol),
      ]);

      const price = quote.c || 0;
      const changePercent = quote.dp || 0;
      const peRatio = financials?.metric?.peNormalizedAnnual
        ? financials.metric.peNormalizedAnnual.toFixed(2)
        : 'N/A';

      return {
        userId,
        symbol,
        company: item.company || profile.name || symbol,
        addedAt: item.addedAt,
        currentPrice: price,
        changePercent,
        priceFormatted: `$${price.toFixed(2)}`,
        changeFormatted: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
        marketCap: formatMarketCap(profile.marketCapitalization),
        peRatio,
      };
    })
  );

  // Hydrate alerts with current prices
  const hydratedAlerts: Alert[] = await Promise.all(
    rawAlerts.map(async (alert) => {
      const quote = await getQuote(alert.symbol);
      const alertId = String(
        (alert as { _id?: unknown; id?: unknown })._id || (alert as { id?: unknown }).id
      );
      return {
        id: alertId,
        symbol: alert.symbol,
        company: alert.company,
        alertName: alert.alertName,
        currentPrice: quote.c || 0,
        alertType: alert.alertType,
        threshold: alert.threshold,
        changePercent: quote.dp,
      };
    })
  );

  return (
    <div className='space-y-10 pb-12'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-extrabold text-gray-100 flex items-center gap-3'>
            <Eye className='h-8 w-8 text-yellow-500' />
            My Watchlist & Alerts
          </h1>
          <p className='text-gray-400 text-sm mt-1'>
            Real-time market valuation, key multiples, and target price monitoring.
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <ShareWatchlistButton />
          <SearchCommand
            renderAs='button'
            buttonLabel='Add Stocks (⌘K)'
            buttonVariant='primary'
            className='yellow-btn px-4 text-sm font-semibold h-11'
          />
        </div>
      </div>

      {hydratedWatchlist.length === 0 ? (
        <div className='watchlist-empty-container bg-gray-800 border border-gray-600 rounded-xl py-16'>
          <div className='watchlist-empty'>
            <Image
              src='/assets/icons/star.svg'
              alt='Star'
              width={72}
              height={72}
              className='watchlist-star opacity-40 mb-4'
            />
            <h2 className='empty-title text-2xl font-bold'>Your Watchlist is Empty</h2>
            <p className='empty-description'>
              Track your favorite stocks, monitor price targets, and receive automated email alerts
              by adding tickers to your watchlist.
            </p>
            <div className='flex items-center gap-4 mt-2'>
              <Link href='/search' className='search-btn px-6 py-2.5 font-semibold'>
                Search Stocks
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
          {/* Main Table */}
          <div className='lg:col-span-2 space-y-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-bold text-gray-100'>
                Tracked Assets ({hydratedWatchlist.length})
              </h2>
            </div>
            <WatchlistTable watchlist={hydratedWatchlist} />
          </div>

          {/* Side Alerts Column */}
          <div className='lg:col-span-1'>
            <AlertsList alertData={hydratedAlerts} />
          </div>
        </div>
      )}

      {/* Market News Section */}
      <div className='space-y-4 pt-6 border-t border-gray-700/60'>
        <div className='flex items-center gap-2'>
          <Newspaper className='h-6 w-6 text-yellow-500' />
          <h2 className='text-2xl font-bold text-gray-100'>Latest Market News</h2>
        </div>
        <WatchlistNews news={news} />
      </div>
    </div>
  );
}
