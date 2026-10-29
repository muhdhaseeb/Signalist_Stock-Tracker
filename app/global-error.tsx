'use client';

import { useEffect } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application boundary error:', error);
  }, [error]);

  return (
    <html lang='en' className='dark'>
      <body className='min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6'>
        <div className='p-8 bg-gray-900 border border-red-500/30 rounded-2xl max-w-md w-full text-center space-y-4 shadow-2xl'>
          <AlertOctagon className='h-12 w-12 text-red-500 mx-auto' />
          <h2 className='text-2xl font-bold'>Application Critical Error</h2>
          <p className='text-sm text-gray-400'>
            A system fault prevented rendering the root application layout. Click below to reload.
          </p>
          <Button onClick={reset} className='yellow-btn w-full mt-4'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Reload Signalist
          </Button>
        </div>
      </body>
    </html>
  );
}

