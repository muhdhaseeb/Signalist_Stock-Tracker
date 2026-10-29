'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface AddHoldingModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddHoldingModal({
  open,
  setOpen,
  onSuccess,
}: AddHoldingModalProps) {
  const [symbol, setSymbol] = useState('');
  const [company, setCompany] = useState('');
  const [shares, setShares] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numShares = parseFloat(shares);
    const numPrice = parseFloat(buyPrice);

    if (!symbol.trim()) {
      setError('Ticker symbol is required');
      return;
    }
    if (isNaN(numShares) || numShares <= 0) {
      setError('Please enter a valid number of shares');
      return;
    }
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Please enter a valid buy price');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: symbol.toUpperCase().trim(),
          company: company.trim() || symbol.toUpperCase().trim(),
          shares: numShares,
          buyPrice: numPrice,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add holding');
      }

      setSymbol('');
      setCompany('');
      setShares('');
      setBuyPrice('');
      setOpen(false);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add holding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='bg-gray-800 border-gray-600 text-gray-200 sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold text-gray-100'>
            Add Holding to Portfolio
          </DialogTitle>
          <DialogDescription className='text-xs text-gray-400'>
            Record a stock position to calculate your real-time profit and loss and sector allocations.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className='p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='holding-symbol' className='form-label'>
                Symbol
              </Label>
              <Input
                id='holding-symbol'
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder='e.g. AAPL'
                className='form-input uppercase'
                required
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='holding-company' className='form-label'>
                Company (Optional)
              </Label>
              <Input
                id='holding-company'
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder='e.g. Apple Inc'
                className='form-input'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='holding-shares' className='form-label'>
                Shares
              </Label>
              <Input
                id='holding-shares'
                type='number'
                step='any'
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder='10'
                className='form-input'
                required
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='holding-price' className='form-label'>
                Buy Price ($)
              </Label>
              <Input
                id='holding-price'
                type='number'
                step='0.01'
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder='150.00'
                className='form-input'
                required
              />
            </div>
          </div>

          <DialogFooter className='pt-2'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => setOpen(false)}
              className='text-gray-400 hover:text-white'
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading} className='yellow-btn px-6'>
              {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Add Holding
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

