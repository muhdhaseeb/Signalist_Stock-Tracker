import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'My Watchlist | Signalist',
  description: 'Track your personalized stock watchlist and real-time market movements.',
};

export default function WatchlistPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-100">My Watchlist</h1>
        <p className="text-gray-400">Keep track of your favorite stocks and set price alerts.</p>
      </div>
      <div className="watchlist-empty-container bg-gray-800 border border-gray-600 rounded-lg">
        <div className="watchlist-empty">
          <Image src="/assets/icons/star.svg" alt="Star" width={64} height={64} className="watchlist-star opacity-40" />
          <h2 className="empty-title">Your Watchlist is Empty</h2>
          <p className="empty-description">
            Start tracking stocks by searching for ticker symbols or browsing popular market movers.
          </p>
          <Link href="/search" className="search-btn">
            Search Stocks
          </Link>
        </div>
      </div>
    </div>
  );
}
