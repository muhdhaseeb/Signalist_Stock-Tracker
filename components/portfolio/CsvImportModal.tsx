'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileSpreadsheet, Loader2, Upload } from 'lucide-react';

interface CsvImportModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: () => void;
}

const SAMPLE_CSV = `Symbol,Shares,Price
AAPL,25,185.50
NVDA,15,120.00
MSFT,10,410.25
AMZN,20,175.80`;

export default function CsvImportModal({
  open,
  setOpen,
  onSuccess,
}: CsvImportModalProps) {
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvText.trim()) {
      setError('Please provide CSV data or upload a file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/portfolio/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: csvText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to import CSV');
      }

      setCsvText('');
      setOpen(false);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to import CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='bg-gray-800 border-gray-600 text-gray-200 sm:max-w-lg'>
        <DialogHeader>
          <div className='flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase'>
            <FileSpreadsheet className='h-4 w-4' />
            <span>Batch Portfolio Import</span>
          </div>
          <DialogTitle className='text-xl font-bold text-gray-100'>
            Import Holdings from CSV
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className='p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm'>
            {error}
          </div>
        )}

        <div className='space-y-4 text-sm'>
          <p className='text-gray-400 text-xs'>
            Upload a CSV exported from your brokerage or paste rows below. Expected columns:
            <code className='text-yellow-400 font-mono ml-1'>Symbol, Shares, Price</code>
          </p>

          <div className='border-2 border-dashed border-gray-700 hover:border-gray-500 rounded-xl p-4 text-center cursor-pointer transition-colors relative'>
            <Upload className='h-6 w-6 text-gray-400 mx-auto mb-1' />
            <span className='text-xs text-gray-300 font-medium'>
              Click to select a .csv file
            </span>
            <input
              type='file'
              accept='.csv,text/csv'
              onChange={handleFileUpload}
              className='absolute inset-0 opacity-0 cursor-pointer'
            />
          </div>

          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='csv-paste' className='form-label text-xs'>
                Or Paste CSV Text
              </Label>
              <button
                type='button'
                onClick={() => setCsvText(SAMPLE_CSV)}
                className='text-xs text-yellow-500 hover:underline'
              >
                Insert Sample Data
              </button>
            </div>
            <textarea
              id='csv-paste'
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder='Symbol,Shares,Price&#10;AAPL,20,180.00'
              rows={6}
              className='w-full p-3 font-mono text-xs bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-yellow-500'
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
          <Button
            type='button'
            onClick={handleImport}
            disabled={loading || !csvText.trim()}
            className='yellow-btn px-6'
          >
            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Import Holdings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

