import Link from 'next/link';
import { Search, Home, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className='min-h-[65vh] flex flex-col items-center justify-center text-center px-4 space-y-4'>
      <div className='p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl'>
        <HelpCircle className='h-10 w-10 text-yellow-400' />
      </div>
      <span className='font-mono text-sm text-yellow-500 font-bold uppercase tracking-wider'>
        404 — Page Not Found
      </span>
      <h1 className='text-3xl font-extrabold text-gray-100'>
        The requested market view doesn&apos;t exist
      </h1>
      <p className='text-sm text-gray-400 max-w-md'>
        The ticker symbol, dashboard route, or asset identifier you were looking for might have been
        delisted, moved, or misspelled.
      </p>
      <div className='flex items-center gap-3 pt-3'>
        <Link href='/search' className='yellow-btn px-6 text-sm font-semibold flex items-center gap-2'>
          <Search className='h-4 w-4' />
          Search Tickers
        </Link>
        <Link
          href='/'
          className='p-2.5 px-5 bg-gray-800 border border-gray-600 rounded-lg text-sm text-gray-300 hover:text-white flex items-center gap-2'
        >
          <Home className='h-4 w-4' />
          Return Home
        </Link>
      </div>
    </div>
  );
}

