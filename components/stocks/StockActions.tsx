'use client';

import { useState } from 'react';
import WatchlistButton from '@/components/WatchlistButton';
import AlertModal from '@/components/alerts/AlertModal';
import ExplainMoveModal from '@/components/stocks/ExplainMoveModal';
import { Bell, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StockActionsProps {
  symbol: string;
  company: string;
  isInWatchlist: boolean;
  currentPrice: number;
  changePercent?: number;
}

export default function StockActions({
  symbol,
  company,
  isInWatchlist,
  currentPrice,
  changePercent = 0,
}: StockActionsProps) {
  const [alertOpen, setAlertOpen] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);

  return (
    <div className='flex flex-wrap items-center gap-3 w-full sm:w-auto'>
      <Button
        variant='outline'
        onClick={() => setExplainOpen(true)}
        className='border-yellow-500/40 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 font-semibold h-11 px-4 transition-colors'
      >
        <Sparkles className='mr-2 h-4 w-4' />
        Explain This Move
      </Button>

      <Button
        variant='outline'
        onClick={() => setAlertOpen(true)}
        className='border-gray-600 bg-gray-800 hover:bg-gray-700 text-yellow-500 hover:text-yellow-400 font-medium h-11 px-4'
      >
        <Bell className='mr-2 h-4 w-4' />
        Set Alert
      </Button>

      <div className='w-44'>
        <WatchlistButton
          symbol={symbol}
          company={company}
          isInWatchlist={isInWatchlist}
          type='button'
        />
      </div>

      <ExplainMoveModal
        open={explainOpen}
        setOpen={setExplainOpen}
        symbol={symbol}
        company={company}
        currentPrice={currentPrice}
        changePercent={changePercent}
      />

      <AlertModal
        open={alertOpen}
        setOpen={setAlertOpen}
        alertData={{
          symbol,
          company,
          alertName: `${symbol} Price Alert`,
          alertType: 'upper',
          threshold: String(currentPrice > 0 ? (currentPrice * 1.05).toFixed(2) : '100'),
        }}
      />
    </div>
  );
}
