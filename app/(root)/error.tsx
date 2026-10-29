'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root boundary caught error:', error);
  }, [error]);

  return (
    <div className='min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-4'>
      <div className='p-4 bg-red-500/10 border border-red-500/30 rounded-2xl'>
        <AlertCircle className='h-10 w-10 text-red-400' />
      </div>
      <h1 className='text-2xl font-bold text-gray-100'>Something went wrong</h1>
      <p className='text-sm text-gray-400 max-w-md'>
        {error.message || 'An error occurred while loading this page. Our telemetry has logged the issue.'}
      </p>
      <div className='flex items-center gap-3 pt-2'>
        <Button onClick={reset} className='yellow-btn px-6 text-sm font-semibold'>
          <RefreshCw className='h-4 w-4 mr-2' />
          Try Again
        </Button>
        <Link href='/' className='p-2.5 px-4 bg-gray-800 border border-gray-600 rounded-lg text-sm text-gray-300 hover:text-white flex items-center gap-1.5'>
          <Home className='h-4 w-4' />
          Dashboard
        </Link>
      </div>
    </div>
  );
}

