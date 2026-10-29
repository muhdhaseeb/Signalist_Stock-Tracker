'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  FileSpreadsheet,
  Trash2,
  TrendingUp,
  TrendingDown,
  Scale,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddHoldingModal from '@/components/portfolio/AddHoldingModal';
import CsvImportModal from '@/components/portfolio/CsvImportModal';
import HealthScoreCard from '@/components/portfolio/HealthScoreCard';
import SectorAllocationBar from '@/components/portfolio/SectorAllocationBar';
import { cn } from '@/lib/utils';

interface HoldingItem {
  id: string;
  symbol: string;
  company: string;
  shares: number;
  buyPrice: number;
  currentPrice: number;
  totalValue: number;
  costBasis: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  dayChangePercent: number;
  sector: string;
}

interface PortfolioData {
  timeframe: string;
  summary: {
    totalValue: number;
    totalCostBasis: number;
    unrealizedPnl: number;
    unrealizedPnlPercent: number;
    realizedPnl: number;
    timeframePortfolioReturn: number;
    timeframeSpyReturn: number;
  };
  sectorAllocation: Array<{ sector: string; value: number; percentage: number }>;
  health: {
    score: number;
    rating: string;
    flags: string[];
    riskTolerance: string;
  };
  holdings: HoldingItem[];
}

const TIMEFRAMES = ['1D', '1W', '1M', '1Y'] as const;

export default function PortfolioPage() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/portfolio?timeframe=${timeframe}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/portfolio?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchPortfolio();
      }
    } catch (err) {
      console.error('Failed to remove holding:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const isPositivePnl = (data?.summary.unrealizedPnl || 0) >= 0;
  const isOutperformingSpy =
    (data?.summary.timeframePortfolioReturn || 0) >= (data?.summary.timeframeSpyReturn || 0);

  return (
    <div className='space-y-8 pb-12'>
      {/* Top Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-extrabold text-gray-100 flex items-center gap-3'>
            <Briefcase className='h-8 w-8 text-yellow-500' />
            Portfolio Tracking & Health
          </h1>
          <p className='text-gray-400 text-sm mt-1'>
            Holdings, unrealized & realized P&L, SPY benchmark comparison, and risk diagnosis.
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            onClick={() => setImportOpen(true)}
            className='border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium h-10'
          >
            <FileSpreadsheet className='h-4 w-4 mr-2 text-yellow-500' />
            Import CSV
          </Button>
          <Button
            onClick={() => setAddOpen(true)}
            className='yellow-btn text-sm font-semibold h-10 px-4'
          >
            <Plus className='h-4 w-4 mr-1' />
            Add Holding
          </Button>
        </div>
      </div>

      {/* Timeframe selector */}
      <div className='flex items-center justify-between border-b border-gray-700 pb-3'>
        <span className='text-xs font-bold uppercase tracking-wider text-gray-400'>
          Performance Horizon
        </span>
        <div className='flex items-center gap-1.5 p-1 bg-gray-800 border border-gray-700 rounded-lg'>
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                'px-3 py-1 text-xs font-bold rounded-md transition-colors',
                timeframe === tf
                  ? 'bg-yellow-500 text-gray-950 shadow'
                  : 'text-gray-400 hover:text-gray-200'
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Total Value */}
        <div className='p-5 bg-gray-800 border border-gray-600 rounded-xl space-y-1.5'>
          <span className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>
            Total Portfolio Value
          </span>
          <div className='text-2xl sm:text-3xl font-extrabold text-gray-100'>
            ${(data?.summary.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className='text-xs text-gray-500 block'>
            Cost Basis: ${(data?.summary.totalCostBasis || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Unrealized P&L */}
        <div className='p-5 bg-gray-800 border border-gray-600 rounded-xl space-y-1.5'>
          <span className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>
            Unrealized P&L
          </span>
          <div
            className={cn(
              'text-2xl sm:text-3xl font-extrabold flex items-center gap-1.5',
              isPositivePnl ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {isPositivePnl ? <TrendingUp className='h-6 w-6' /> : <TrendingDown className='h-6 w-6' />}
            {isPositivePnl ? '+' : ''}$
            {Math.abs(data?.summary.unrealizedPnl || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span
            className={cn(
              'text-xs font-bold',
              isPositivePnl ? 'text-emerald-400/90' : 'text-red-400/90'
            )}
          >
            {isPositivePnl ? '+' : ''}
            {(data?.summary.unrealizedPnlPercent || 0).toFixed(2)}% overall return
          </span>
        </div>

        {/* SPY Benchmark Comparison */}
        <div className='p-5 bg-gray-800 border border-gray-600 rounded-xl space-y-1.5'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>
              vs SPY Benchmark ({timeframe})
            </span>
            <Scale className='h-4 w-4 text-yellow-500' />
          </div>
          <div className='text-2xl sm:text-3xl font-extrabold text-gray-100 flex items-center gap-2'>
            <span>
              {(data?.summary.timeframePortfolioReturn || 0) >= 0 ? '+' : ''}
              {(data?.summary.timeframePortfolioReturn || 0).toFixed(2)}%
            </span>
            <span className='text-xs font-normal text-gray-500'>
              vs SPY {(data?.summary.timeframeSpyReturn || 0) >= 0 ? '+' : ''}
              {(data?.summary.timeframeSpyReturn || 0).toFixed(2)}%
            </span>
          </div>
          <span
            className={cn(
              'text-xs font-bold block',
              isOutperformingSpy ? 'text-emerald-400' : 'text-yellow-400'
            )}
          >
            {isOutperformingSpy ? 'Outperforming S&P 500' : 'Tracking below benchmark'}
          </span>
        </div>

        {/* Realized Gains */}
        <div className='p-5 bg-gray-800 border border-gray-600 rounded-xl space-y-1.5'>
          <span className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>
            Realized P&L
          </span>
          <div className='text-2xl sm:text-3xl font-extrabold text-gray-100 flex items-center gap-1.5'>
            <DollarSign className='h-6 w-6 text-gray-500' />
            ${(data?.summary.realizedPnl || 0).toFixed(2)}
          </div>
          <span className='text-xs text-gray-500 block'>Closed positions & distributions</span>
        </div>
      </div>

      {/* Diagnostics Grid: Health Score & Sector Allocation */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {data && (
          <>
            <HealthScoreCard
              score={data.health.score}
              rating={data.health.rating}
              flags={data.health.flags}
              riskTolerance={data.health.riskTolerance}
            />
            <SectorAllocationBar allocation={data.sectorAllocation} />
          </>
        )}
      </div>

      {/* Holdings Table */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-bold text-gray-100'>
            Holdings & Position Sizing ({data?.holdings.length || 0})
          </h2>
        </div>

        {loading ? (
          <div className='p-12 bg-gray-800 border border-gray-600 rounded-xl flex items-center justify-center space-x-3 text-gray-400'>
            <Loader2 className='h-6 w-6 animate-spin text-yellow-500' />
            <span>Calculating portfolio analytics and valuations...</span>
          </div>
        ) : !data || data.holdings.length === 0 ? (
          <div className='p-12 text-center bg-gray-800 border border-gray-600 rounded-xl space-y-3'>
            <Briefcase className='h-12 w-12 text-gray-600 mx-auto' />
            <h3 className='text-lg font-bold text-gray-200'>No holdings recorded yet</h3>
            <p className='text-sm text-gray-400 max-w-md mx-auto'>
              Add stocks you currently own to calculate cost basis, monitor asset allocation, and
              measure risk health score.
            </p>
            <div className='flex items-center justify-center gap-3 pt-2'>
              <Button onClick={() => setAddOpen(true)} className='yellow-btn px-6 text-sm font-semibold'>
                Add First Holding
              </Button>
              <Button
                variant='outline'
                onClick={() => setImportOpen(true)}
                className='border-gray-600 bg-gray-800 text-gray-300'
              >
                Import CSV
              </Button>
            </div>
          </div>
        ) : (
          <div className='watchlist-table overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='table-header-row'>
                  <th className='p-4 text-xs font-semibold uppercase text-gray-400'>Asset</th>
                  <th className='p-4 text-xs font-semibold uppercase text-gray-400'>Shares</th>
                  <th className='p-4 text-xs font-semibold uppercase text-gray-400'>Cost Basis</th>
                  <th className='p-4 text-xs font-semibold uppercase text-gray-400'>Market Price</th>
                  <th className='p-4 text-xs font-semibold uppercase text-gray-400'>Current Value</th>
                  <th className='p-4 text-xs font-semibold uppercase text-gray-400'>Unrealized P&L</th>
                  <th className='p-4 text-xs font-semibold uppercase text-gray-400'>Sector</th>
                  <th className='p-4 text-xs font-semibold uppercase text-gray-400 text-right'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-700/60'>
                {data.holdings.map((h) => {
                  const isUp = h.unrealizedPnl >= 0;

                  return (
                    <tr key={h.id} className='table-row hover:bg-gray-700/40 transition-colors'>
                      <td className='p-4'>
                        <Link
                          href={`/stocks/${h.symbol}`}
                          className='flex flex-col group hover:underline'
                        >
                          <span className='font-bold text-yellow-500 text-base'>{h.symbol}</span>
                          <span className='text-xs text-gray-400 line-clamp-1'>{h.company}</span>
                        </Link>
                      </td>
                      <td className='p-4 font-semibold text-gray-100'>{h.shares}</td>
                      <td className='p-4 text-gray-300 font-medium'>${h.buyPrice.toFixed(2)}</td>
                      <td className='p-4 text-gray-100 font-bold'>${h.currentPrice.toFixed(2)}</td>
                      <td className='p-4 text-gray-100 font-bold'>${h.totalValue.toLocaleString()}</td>
                      <td className='p-4'>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 font-bold text-sm',
                            isUp ? 'text-emerald-400' : 'text-red-400'
                          )}
                        >
                          {isUp ? '+' : ''}${h.unrealizedPnl.toFixed(2)} ({isUp ? '+' : ''}
                          {h.unrealizedPnlPercent.toFixed(2)}%)
                        </span>
                      </td>
                      <td className='p-4 text-xs text-gray-400'>{h.sector}</td>
                      <td className='p-4 text-right'>
                        <button
                          onClick={() => handleDelete(h.id)}
                          disabled={deletingId === h.id}
                          className='p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors'
                          title='Remove holding'
                        >
                          {deletingId === h.id ? (
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
        )}
      </div>

      {/* Modals */}
      <AddHoldingModal open={addOpen} setOpen={setAddOpen} onSuccess={fetchPortfolio} />
      <CsvImportModal open={importOpen} setOpen={setImportOpen} onSuccess={fetchPortfolio} />
    </div>
  );
}

