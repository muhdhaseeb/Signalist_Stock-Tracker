'use client';

import { useEffect } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application boundary error:', error);
  }, [error]);

  return (
    <div className='min-h-[70vh] flex flex-col items-center justify-center p-6'>
      <div className='p-8 bg-gray-800 border border-red-500/30 rounded-2xl max-w-md w-full text-center space-y-4 shadow-xl'>
        <AlertOctagon className='h-12 w-12 text-red-500 mx-auto' />
        <h2 className='text-2xl font-bold text-gray-100'>Something went wrong</h2>
        <p className='text-sm text-gray-400'>
          A problem occurred while rendering this page. You can attempt to reload the view.
        </p>
        <Button onClick={reset} className='yellow-btn w-full mt-4'>
          <RefreshCw className='h-4 w-4 mr-2' />
          Try Again
        </Button>
      </div>
    </div>
  );
}
