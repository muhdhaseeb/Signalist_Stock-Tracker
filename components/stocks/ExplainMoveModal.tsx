'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sparkles, ExternalLink, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ExplainMoveResult } from '@/lib/ai';
import { cn } from '@/lib/utils';

interface ExplainMoveModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  symbol: string;
  company: string;
  currentPrice: number;
  changePercent: number;
}

export default function ExplainMoveModal({
  open,
  setOpen,
  symbol,
  company,
  currentPrice,
  changePercent,
}: ExplainMoveModalProps) {
  const [data, setData] = useState<ExplainMoveResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (open && symbol) {
      const load = async () => {
        try {
          const res = await fetch(`/api/ai/explain-move?symbol=${encodeURIComponent(symbol)}`);
          const resData = await res.json();
          if (isMounted && resData?.explanation) {
            setData(resData.explanation);
          }
        } catch (err) {
          console.error('Explain move failed:', err);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };
      load();
    }
    return () => {
      isMounted = false;
    };
  }, [open, symbol]);

  const isUp = changePercent >= 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='bg-gray-800 border-gray-600 text-gray-200 sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='border-b border-gray-700 pb-4'>
          <div className='flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1'>
            <Sparkles className='h-4 w-4' />
            <span>AI Context & Catalyst Analysis</span>
          </div>
          <DialogTitle className='text-2xl font-extrabold text-gray-100 flex items-center justify-between'>
            <span>
              {company} ({symbol})
            </span>
            <span
              className={cn(
                'text-base px-2.5 py-1 rounded-md font-bold flex items-center gap-1',
                isUp
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              )}
            >
              {isUp ? <TrendingUp className='h-4 w-4' /> : <TrendingDown className='h-4 w-4' />}
              ${currentPrice.toFixed(2)} ({isUp ? '+' : ''}
              {changePercent.toFixed(2)}%)
            </span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className='py-16 flex flex-col items-center justify-center space-y-3 text-center'>
            <Loader2 className='h-8 w-8 animate-spin text-yellow-500' />
            <p className='text-sm text-gray-400'>
              Synthesizing news feeds, filings, and market sentiment for {symbol}...
            </p>
          </div>
        ) : data ? (
          <div className='space-y-6 pt-2'>
            {/* Catalyst Badge */}
            <div className='p-4 bg-gray-750/70 border border-gray-700 rounded-xl space-y-1.5'>
              <div className='flex items-center justify-between'>
                <span className='text-xs font-bold uppercase tracking-wider text-gray-400'>
                  Primary Driver / Catalyst
                </span>
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded font-bold flex items-center gap-1',
                    data.sentiment === 'Bullish'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : data.sentiment === 'Bearish'
                      ? 'bg-red-500/15 text-red-400'
                      : 'bg-gray-600 text-gray-300'
                  )}
                >
                  {data.sentiment === 'Bullish' && <TrendingUp className='h-3 w-3' />}
                  {data.sentiment === 'Bearish' && <TrendingDown className='h-3 w-3' />}
                  {data.sentiment === 'Neutral' && <Minus className='h-3 w-3' />}
                  {data.sentiment} Catalyst
                </span>
              </div>
              <h3 className='text-lg font-bold text-gray-100'>{data.catalyst}</h3>
            </div>

            {/* Detailed Analysis */}
            <div className='space-y-3'>
              <h4 className='text-xs font-bold uppercase tracking-wider text-gray-400'>
                Executive Breakdown
              </h4>
              <div className='space-y-3 text-sm text-gray-300 leading-relaxed whitespace-pre-line'>
                {data.detailedAnalysis}
              </div>
            </div>

            {/* Source Citations */}
            {data.sources && data.sources.length > 0 && (
              <div className='space-y-3 pt-4 border-t border-gray-700/60'>
                <h4 className='text-xs font-bold uppercase tracking-wider text-gray-400'>
                  Verified Intelligence Sources
                </h4>
                <div className='space-y-2'>
                  {data.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='p-3 bg-gray-900/60 hover:bg-gray-900 border border-gray-700/80 rounded-lg flex items-center justify-between text-xs text-gray-300 group transition-colors'
                    >
                      <div className='flex flex-col gap-0.5 flex-1 pr-2'>
                        <span className='font-semibold text-gray-200 group-hover:text-yellow-400 transition-colors line-clamp-1'>
                          {src.title}
                        </span>
                        <span className='text-[11px] text-gray-500'>{src.source}</span>
                      </div>
                      <ExternalLink className='h-3.5 w-3.5 text-gray-500 group-hover:text-yellow-400 shrink-0' />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

