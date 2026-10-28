'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WATCHLIST_TABLE_HEADER } from '@/lib/constants';
import { Bell, Trash2, ArrowUpRight, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import AlertModal from '@/components/alerts/AlertModal';
import { cn } from '@/lib/utils';

export default function WatchlistTable({
  watchlist: initialWatchlist,
}: WatchlistTableProps) {
  const router = useRouter();
  const [items, setItems] = useState<StockWithData[]>(initialWatchlist);
  const [selectedStock, setSelectedStock] = useState<SelectedStock | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [deletingSymbol, setDeletingSymbol] = useState<string | null>(null);

  const handleRemove = async (e: React.MouseEvent, symbol: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (deletingSymbol) return;
    setDeletingSymbol(symbol);

    try {
      const res = await fetch(`/api/watchlist?symbol=${encodeURIComponent(symbol)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.symbol !== symbol));
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to remove stock from watchlist:', err);
    } finally {
      setDeletingSymbol(null);
    }
  };

  const handleOpenAlert = (e: React.MouseEvent, stock: StockWithData) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedStock({
      symbol: stock.symbol,
      company: stock.company,
      currentPrice: stock.currentPrice,
    });
    setAlertOpen(true);
  };

  return (
    <>
      <div className='watchlist-table overflow-x-auto'>
        <table className='w-full text-left border-collapse'>
          <thead>
            <tr className='table-header-row'>
              {WATCHLIST_TABLE_HEADER.map((header) => (
                <th
                  key={header}
                  className='p-4 text-xs font-semibold uppercase tracking-wider text-gray-400'
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-700/60'>
            {items.map((stock) => {
              const isPositive = (stock.changePercent || 0) >= 0;

              return (
                <tr
                  key={stock.symbol}
                  onClick={() => router.push(`/stocks/${stock.symbol}`)}
                  className='table-row hover:bg-gray-700/40 cursor-pointer transition-colors'
                >
                  {/* Company */}
                  <td className='p-4 font-semibold text-gray-100 flex items-center gap-2'>
                    <span>{stock.company}</span>
                    <ArrowUpRight className='h-3.5 w-3.5 text-gray-500 opacity-60' />
                  </td>

                  {/* Symbol */}
                  <td className='p-4'>
                    <Link
                      href={`/stocks/${stock.symbol}`}
                      className='font-bold text-yellow-500 hover:underline'
                      onClick={(e) => e.stopPropagation()}
                    >
                      {stock.symbol}
                    </Link>
                  </td>

                  {/* Price */}
                  <td className='p-4 font-bold text-gray-100'>
                    {stock.priceFormatted || `$${(stock.currentPrice || 0).toFixed(2)}`}
                  </td>

                  {/* Change */}
                  <td className='p-4'>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold',
                        isPositive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      )}
                    >
                      {isPositive ? (
                        <TrendingUp className='h-3 w-3' />
                      ) : (
                        <TrendingDown className='h-3 w-3' />
                      )}
                      {stock.changeFormatted || `${stock.changePercent?.toFixed(2)}%`}
                    </span>
                  </td>

                  {/* Market Cap */}
                  <td className='p-4 text-gray-300 font-medium'>
                    {stock.marketCap || 'N/A'}
                  </td>

                  {/* P/E Ratio */}
                  <td className='p-4 text-gray-300 font-medium'>
                    {stock.peRatio || 'N/A'}
                  </td>

                  {/* Alert */}
                  <td className='p-4'>
                    <button
                      onClick={(e) => handleOpenAlert(e, stock)}
                      className='add-alert hover:bg-yellow-500/10 transition-colors'
                      title='Set price alert'
                    >
                      <Bell className='h-3.5 w-3.5 text-yellow-500' />
                      <span>Set Alert</span>
                    </button>
                  </td>

                  {/* Action (Remove) */}
                  <td className='p-4'>
                    <button
                      onClick={(e) => handleRemove(e, stock.symbol)}
                      disabled={deletingSymbol === stock.symbol}
                      aria-label={`Remove ${stock.symbol} from watchlist`}
                      className='p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors'
                    >
                      {deletingSymbol === stock.symbol ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Trash2 className='h-4 w-4' />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedStock && (
        <AlertModal
          open={alertOpen}
          setOpen={setAlertOpen}
          alertData={{
            symbol: selectedStock.symbol,
            company: selectedStock.company,
            alertName: `${selectedStock.symbol} Alert`,
            alertType: 'upper',
            threshold: String(
              selectedStock.currentPrice
                ? (selectedStock.currentPrice * 1.05).toFixed(2)
                : '100'
            ),
          }}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  );
}
