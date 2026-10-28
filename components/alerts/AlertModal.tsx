'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ALERT_TYPE_OPTIONS } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

interface ExtendedAlertModalProps extends AlertModalProps {
  onSuccess?: () => void;
}

export default function AlertModal({
  alertId,
  alertData,
  action = 'create',
  open,
  setOpen,
  onSuccess,
}: ExtendedAlertModalProps) {
  const [symbol, setSymbol] = useState(alertData?.symbol || '');
  const [company, setCompany] = useState(alertData?.company || '');
  const [alertName, setAlertName] = useState(alertData?.alertName || '');
  const [alertType, setAlertType] = useState<'upper' | 'lower'>(
    alertData?.alertType || 'upper'
  );
  const [threshold, setThreshold] = useState(alertData?.threshold || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (alertData) {
      setSymbol(alertData.symbol);
      setCompany(alertData.company);
      setAlertName(alertData.alertName || `${alertData.symbol} Target Price`);
      setAlertType(alertData.alertType || 'upper');
      setThreshold(alertData.threshold ? String(alertData.threshold) : '');
    } else {
      setSymbol('');
      setCompany('');
      setAlertName('');
      setAlertType('upper');
      setThreshold('');
    }
  }, [alertData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numThreshold = parseFloat(threshold);
    if (!symbol.trim()) {
      setError('Ticker symbol is required');
      return;
    }
    if (!alertName.trim()) {
      setError('Alert name is required');
      return;
    }
    if (isNaN(numThreshold) || numThreshold <= 0) {
      setError('Please enter a valid price threshold greater than 0');
      return;
    }

    setLoading(true);
    try {
      if (action === 'edit' && alertId) {
        const res = await fetch('/api/alerts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alertId,
            alertName,
            alertType,
            threshold: numThreshold,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update alert');
        }
      } else {
        const res = await fetch('/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: symbol.toUpperCase().trim(),
            company: company.trim() || symbol.toUpperCase().trim(),
            alertName,
            alertType,
            threshold: numThreshold,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to create alert');
        }
      }

      setOpen(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='bg-gray-800 border-gray-600 text-gray-200 sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold text-gray-100'>
            {action === 'edit' ? 'Edit Price Alert' : 'Create Price Alert'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className='p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='alert-symbol' className='form-label'>
                Stock Symbol
              </Label>
              <Input
                id='alert-symbol'
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder='e.g. AAPL'
                disabled={Boolean(alertData?.symbol)}
                className='form-input uppercase'
                required
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='alert-company' className='form-label'>
                Company Name
              </Label>
              <Input
                id='alert-company'
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder='e.g. Apple Inc'
                className='form-input'
              />
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='alert-name' className='form-label'>
              Alert Name
            </Label>
            <Input
              id='alert-name'
              value={alertName}
              onChange={(e) => setAlertName(e.target.value)}
              placeholder='e.g. Breakout Above $250'
              className='form-input'
              required
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label className='form-label'>Condition</Label>
              <Select
                value={alertType}
                onValueChange={(val: 'upper' | 'lower') => setAlertType(val)}
              >
                <SelectTrigger className='select-trigger'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='bg-gray-800 border-gray-600 text-white'>
                  {ALERT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className='focus:bg-gray-600'
                    >
                      {opt.value === 'upper' ? 'Rises Above (≥)' : 'Drops Below (≤)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='alert-threshold' className='form-label'>
                Target Price ($)
              </Label>
              <Input
                id='alert-threshold'
                type='number'
                step='0.01'
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder='0.00'
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
              {action === 'edit' ? 'Update Alert' : 'Create Alert'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
