'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';

interface ExtendedAlertModalProps extends AlertModalProps {
  onSuccess?: () => void;
}

const SMART_ALERT_TYPES = [
  { value: 'upper', label: 'Price Rises Above Target (≥ $)' },
  { value: 'lower', label: 'Price Drops Below Target (≤ $)' },
  { value: 'pct_move_day', label: 'Single-Day % Move (± %)' },
  { value: '52w_high', label: 'Near 52-Week High (within 2%)' },
  { value: '52w_low', label: 'Near 52-Week Low (within 2%)' },
  { value: 'volume_spike', label: 'Unusual Volume Spike (>2x Avg)' },
];

export default function AlertModal({
  alertId,
  alertData,
  action = 'create',
  open,
  setOpen,
  onSuccess,
}: ExtendedAlertModalProps) {
  const [nlQuery, setNlQuery] = useState('');
  const [parsingNl, setParsingNl] = useState(false);

  const [symbol, setSymbol] = useState(alertData?.symbol || '');
  const [company, setCompany] = useState(alertData?.company || '');
  const [alertName, setAlertName] = useState(alertData?.alertName || '');
  const [alertType, setAlertType] = useState<string>(alertData?.alertType || 'upper');
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
      setNlQuery('');
    }
  }, [alertData, open]);

  const handleParseNl = async () => {
    if (!nlQuery.trim()) return;
    setParsingNl(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/parse-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: nlQuery }),
      });

      const data = await res.json();
      if (!res.ok || !data.alert) {
        throw new Error(data.error || 'Could not parse alert request');
      }

      setSymbol(data.alert.symbol);
      setAlertName(data.alert.alertName);
      setAlertType(data.alert.alertType);
      setThreshold(String(data.alert.threshold));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to parse natural language alert');
    } finally {
      setParsingNl(false);
    }
  };

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
            alertType: alertType as 'upper' | 'lower',
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
            alertType: alertType as 'upper' | 'lower',
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
          <DialogTitle className='text-xl font-bold text-gray-100 flex items-center justify-between'>
            <span>{action === 'edit' ? 'Edit Smart Alert' : 'Create Smart Alert'}</span>
          </DialogTitle>
          <DialogDescription className='text-xs text-gray-400'>
            Set price alert thresholds with automated tracking and email notifications.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className='p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm'>
            {error}
          </div>
        )}

        {/* Natural Language AI Creator (only for new alerts) */}
        {action !== 'edit' && (
          <div className='p-3.5 bg-gray-900/70 border border-yellow-500/30 rounded-xl space-y-2'>
            <div className='flex items-center gap-1.5 text-yellow-400 text-xs font-bold'>
              <Sparkles className='h-3.5 w-3.5' />
              <span>Natural Language AI Creator</span>
            </div>
            <div className='flex items-center gap-2'>
              <Input
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                placeholder='e.g. "tell me if NVDA drops 5% in a day"'
                className='h-9 text-xs bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleParseNl();
                  }
                }}
              />
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={handleParseNl}
                disabled={parsingNl || !nlQuery.trim()}
                className='h-9 text-xs border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 shrink-0'
              >
                {parsingNl ? (
                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                ) : (
                  <Wand2 className='h-3.5 w-3.5 mr-1' />
                )}
                Auto-Fill
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4 pt-1'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='alert-symbol' className='form-label'>
                Stock Symbol
              </Label>
              <Input
                id='alert-symbol'
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder='e.g. NVDA'
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
                placeholder='e.g. NVIDIA Corporation'
                className='form-input'
              />
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='alert-name' className='form-label'>
              Alert Name / Trigger Label
            </Label>
            <Input
              id='alert-name'
              value={alertName}
              onChange={(e) => setAlertName(e.target.value)}
              placeholder='e.g. 5% Sudden Pullback Alert'
              className='form-input'
              required
            />
          </div>

          <div className='space-y-1.5'>
            <Label className='form-label'>Alert Condition</Label>
            <Select value={alertType} onValueChange={(val: string) => setAlertType(val)}>
              <SelectTrigger className='select-trigger'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='bg-gray-800 border-gray-600 text-white'>
                {SMART_ALERT_TYPES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className='focus:bg-gray-600'>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='alert-threshold' className='form-label'>
              Target Threshold Value ({alertType === 'pct_move_day' ? '%' : '$'})
            </Label>
            <Input
              id='alert-threshold'
              type='number'
              step='any'
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder='e.g. 150 or 5'
              className='form-input'
              required
            />
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
              {action === 'edit' ? 'Update Alert' : 'Create Smart Alert'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
