'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Calculator,
  Wallet,
  TrendingUp,
  ArrowRight,
  Loader2,
  DollarSign,
  Scale,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface WhatIfResult {
  symbol: string;
  company: string;
  period: string;
  initialInvestment: number;
  finalValue: number;
  profit: number;
  returnPercent: number;
  benchmark: {
    spyFinalValue: number;
    spyReturnPercent: number;
    alpha: number;
  };
  currentPrice: number;
}

interface Trade {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  shares: number;
  price: number;
  timestamp: string;
}

const PERIODS = ['1M', '6M', '1Y', '3Y', '5Y'];

export default function SimulatorPage() {
  const [activeTab, setActiveTab] = useState<'what-if' | 'paper'>('what-if');

  // What-If State
  const [symbol, setSymbol] = useState('NVDA');
  const [amount, setAmount] = useState('10000');
  const [period, setPeriod] = useState('1Y');
  const [whatIfData, setWhatIfData] = useState<WhatIfResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Paper Trading State
  const [balance, setBalance] = useState(100000);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tradeSymbol, setTradeSymbol] = useState('AAPL');
  const [tradeShares, setTradeShares] = useState('10');
  const [executing, setExecuting] = useState(false);
  const [tradeError, setTradeError] = useState<string | null>(null);

  const calculateWhatIf = useCallback(async () => {
    if (!symbol.trim()) return;
    setCalculating(true);
    try {
      const res = await fetch(
        `/api/simulator?type=what-if&symbol=${encodeURIComponent(symbol)}&amount=${amount}&period=${period}`
      );
      if (res.ok) {
        const json = await res.json();
        setWhatIfData(json);
      }
    } catch (err) {
      console.error('What-if calculation failed:', err);
    } finally {
      setCalculating(false);
    }
  }, [symbol, amount, period]);

  const fetchPaperAccount = useCallback(async () => {
    try {
      const res = await fetch('/api/simulator');
      if (res.ok) {
        const json = await res.json();
        setBalance(json.balance);
        setTrades(json.trades || []);
      }
    } catch (err) {
      console.error('Failed to load paper account:', err);
    }
  }, []);

  useEffect(() => {
    calculateWhatIf();
    fetchPaperAccount();
  }, [calculateWhatIf, fetchPaperAccount]);

  const handleExecuteTrade = async (action: 'BUY' | 'SELL') => {
    setTradeError(null);
    const sharesNum = parseFloat(tradeShares);
    if (isNaN(sharesNum) || sharesNum <= 0) {
      setTradeError('Please enter a valid share amount');
      return;
    }

    setExecuting(true);
    try {
      const res = await fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: tradeSymbol.toUpperCase().trim(),
          action,
          shares: sharesNum,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Trade execution failed');
      }

      setBalance(json.balance);
      setTrades((prev) => [json.trade, ...prev]);
    } catch (err: unknown) {
      setTradeError(err instanceof Error ? err.message : 'Trade failed');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className='max-w-5xl mx-auto space-y-8 pb-12'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-extrabold text-gray-100 flex items-center gap-3'>
            <Calculator className='h-8 w-8 text-yellow-500' />
            Paper Trading & &quot;What-If&quot; Simulator
          </h1>
          <p className='text-gray-400 text-sm mt-1'>
            Simulate historical alpha against the S&P 500 or practice trades with $100k virtual cash.
          </p>
        </div>

        {/* Tab switch */}
        <div className='flex items-center gap-2 p-1.5 bg-gray-800 border border-gray-700 rounded-xl'>
          <button
            onClick={() => setActiveTab('what-if')}
            className={cn(
              'px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors',
              activeTab === 'what-if'
                ? 'bg-yellow-500 text-gray-950 shadow'
                : 'text-gray-400 hover:text-gray-200'
            )}
          >
            <Sparkles className='h-3.5 w-3.5' />
            &quot;What-If&quot; Simulator
          </button>
          <button
            onClick={() => setActiveTab('paper')}
            className={cn(
              'px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors',
              activeTab === 'paper'
                ? 'bg-yellow-500 text-gray-950 shadow'
                : 'text-gray-400 hover:text-gray-200'
            )}
          >
            <Wallet className='h-3.5 w-3.5' />
            Paper Trading Terminal
          </button>
        </div>
      </div>

      {activeTab === 'what-if' ? (
        /* --- WHAT-IF SIMULATOR --- */
        <div className='space-y-6'>
          {/* Controls Box */}
          <div className='p-6 bg-gray-800 border border-gray-600 rounded-2xl space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <div className='space-y-1.5'>
                <Label className='form-label text-xs'>Stock Symbol</Label>
                <Input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder='e.g. NVDA, AAPL'
                  className='form-input uppercase'
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='form-label text-xs'>Initial Investment ($)</Label>
                <Input
                  type='number'
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder='10000'
                  className='form-input'
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='form-label text-xs'>Timeframe</Label>
                <div className='flex items-center gap-1 h-12 bg-gray-900 border border-gray-600 rounded-lg p-1'>
                  {PERIODS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={cn(
                        'flex-1 text-xs font-bold py-1.5 rounded transition-colors',
                        period === p
                          ? 'bg-yellow-500 text-gray-950 shadow'
                          : 'text-gray-400 hover:text-gray-200'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={calculateWhatIf}
              disabled={calculating}
              className='yellow-btn w-full sm:w-auto px-8'
            >
              {calculating ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <TrendingUp className='mr-2 h-4 w-4' />
              )}
              Simulate Return
            </Button>
          </div>

          {/* Results Display */}
          {whatIfData && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
              {/* Card 1: Final Value */}
              <div className='p-6 bg-gray-800 border border-gray-600 rounded-2xl space-y-2 relative overflow-hidden'>
                <span className='text-xs font-bold uppercase tracking-wider text-gray-400'>
                  Estimated Portfolio Value Today
                </span>
                <div className='text-3xl sm:text-4xl font-extrabold text-emerald-400'>
                  ${whatIfData.finalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className='flex items-center gap-1.5 text-xs text-gray-400'>
                  <span>Initial: ${whatIfData.initialInvestment.toLocaleString()}</span>
                  <span>•</span>
                  <span className='text-emerald-400 font-bold'>
                    +${whatIfData.profit.toLocaleString()} (+{whatIfData.returnPercent}%)
                  </span>
                </div>
              </div>

              {/* Card 2: Alpha vs SPY */}
              <div className='p-6 bg-gray-800 border border-gray-600 rounded-2xl space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold uppercase tracking-wider text-gray-400'>
                    Alpha vs S&P 500 (SPY)
                  </span>
                  <Scale className='h-4 w-4 text-yellow-500' />
                </div>
                <div
                  className={cn(
                    'text-3xl sm:text-4xl font-extrabold',
                    whatIfData.benchmark.alpha >= 0 ? 'text-yellow-400' : 'text-red-400'
                  )}
                >
                  {whatIfData.benchmark.alpha >= 0 ? '+' : ''}
                  {whatIfData.benchmark.alpha}%
                </div>
                <p className='text-xs text-gray-400'>
                  SPY generated +{whatIfData.benchmark.spyReturnPercent}% ($
                  {whatIfData.benchmark.spyFinalValue.toLocaleString()}) over the same {whatIfData.period}.
                </p>
              </div>

              {/* Card 3: Asset Details */}
              <div className='p-6 bg-gray-800 border border-gray-600 rounded-2xl space-y-2'>
                <span className='text-xs font-bold uppercase tracking-wider text-gray-400'>
                  Simulated Asset
                </span>
                <div className='text-2xl font-extrabold text-gray-100 flex items-center gap-2'>
                  <span>{whatIfData.symbol}</span>
                  <span className='text-sm font-normal text-gray-400'>${whatIfData.currentPrice?.toFixed(2)}</span>
                </div>
                <p className='text-xs text-gray-400 line-clamp-2'>{whatIfData.company}</p>
                <div className='pt-1'>
                  <Link
                    href={`/stocks/${whatIfData.symbol}`}
                    className='text-xs text-yellow-500 hover:underline inline-flex items-center gap-1'
                  >
                    <span>View full chart & technicals</span>
                    <ArrowRight className='h-3 w-3' />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* --- PAPER TRADING TERMINAL --- */
        <div className='space-y-6'>
          {/* Buying Power Bar */}
          <div className='p-6 bg-gradient-to-r from-gray-800 via-gray-800 to-gray-850 border border-gray-600 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div>
              <span className='text-xs font-bold uppercase tracking-wider text-gray-400'>
                Virtual Buying Power Balance
              </span>
              <div className='text-3xl sm:text-4xl font-extrabold text-yellow-400 flex items-center gap-1 mt-1'>
                <DollarSign className='h-8 w-8 text-yellow-500' />
                {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <span className='text-xs text-gray-400 bg-gray-900 border border-gray-700 px-3 py-2 rounded-xl'>
              Simulated Sandbox Environment • Live Pricing
            </span>
          </div>

          {/* Trade Execution Order Ticket */}
          <div className='p-6 bg-gray-800 border border-gray-600 rounded-2xl space-y-4'>
            <h2 className='text-lg font-bold text-gray-100'>Order Execution Ticket</h2>

            {tradeError && (
              <div className='p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm'>
                {tradeError}
              </div>
            )}

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label className='form-label text-xs'>Stock Symbol</Label>
                <Input
                  value={tradeSymbol}
                  onChange={(e) => setTradeSymbol(e.target.value.toUpperCase())}
                  placeholder='e.g. AAPL'
                  className='form-input uppercase'
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='form-label text-xs'>Quantity (Shares)</Label>
                <Input
                  type='number'
                  value={tradeShares}
                  onChange={(e) => setTradeShares(e.target.value)}
                  placeholder='10'
                  className='form-input'
                />
              </div>
            </div>

            <div className='flex items-center gap-4 pt-2'>
              <Button
                onClick={() => handleExecuteTrade('BUY')}
                disabled={executing}
                className='flex-1 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold h-11'
              >
                {executing ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                Execute Buy Order
              </Button>
              <Button
                onClick={() => handleExecuteTrade('SELL')}
                disabled={executing}
                className='flex-1 bg-red-500 hover:bg-red-600 text-white font-bold h-11'
              >
                {executing ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                Execute Sell Order
              </Button>
            </div>
          </div>

          {/* Trade History Ledger */}
          <div className='space-y-3'>
            <h3 className='text-lg font-bold text-gray-100'>Simulated Order History</h3>
            {trades.length === 0 ? (
              <div className='p-8 text-center text-gray-500 bg-gray-800 border border-gray-600 rounded-xl'>
                No paper trades placed yet. Use the ticket above to place your first order.
              </div>
            ) : (
              <div className='watchlist-table overflow-x-auto'>
                <table className='w-full text-left border-collapse'>
                  <thead>
                    <tr className='table-header-row'>
                      <th className='p-4 text-xs font-semibold uppercase text-gray-400'>Action</th>
                      <th className='p-4 text-xs font-semibold uppercase text-gray-400'>Symbol</th>
                      <th className='p-4 text-xs font-semibold uppercase text-gray-400'>Shares</th>
                      <th className='p-4 text-xs font-semibold uppercase text-gray-400'>Execution Price</th>
                      <th className='p-4 text-xs font-semibold uppercase text-gray-400'>Total Value</th>
                      <th className='p-4 text-xs font-semibold uppercase text-gray-400 text-right'>Time</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-700/60'>
                    {trades.map((t) => {
                      const isBuy = t.action === 'BUY';
                      return (
                        <tr key={t.id} className='table-row'>
                          <td className='p-4'>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-xs font-extrabold uppercase',
                                isBuy
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : 'bg-red-500/15 text-red-400'
                              )}
                            >
                              {t.action}
                            </span>
                          </td>
                          <td className='p-4 font-mono font-bold text-yellow-400'>{t.symbol}</td>
                          <td className='p-4 font-semibold text-gray-200'>{t.shares}</td>
                          <td className='p-4 text-gray-300'>${t.price.toFixed(2)}</td>
                          <td className='p-4 font-bold text-gray-100'>
                            ${(t.shares * t.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className='p-4 text-right text-xs text-gray-500'>
                            {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

