'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, Star, Filter, ArrowUpRight, Clock, Loader2 } from 'lucide-react';
import { CalendarEvent } from '@/app/api/calendar/route';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [watchlistOnly, setWatchlistOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadEvents = async () => {
      try {
        const res = await fetch(`/api/calendar?watchlistOnly=${watchlistOnly}`);
        const data = await res.json();
        if (isMounted && data?.events) {
          setEvents(data.events);
        }
      } catch (err) {
        console.error('Failed to load calendar:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadEvents();
    return () => {
      isMounted = false;
    };
  }, [watchlistOnly]);

  return (
    <div className='max-w-5xl mx-auto space-y-8 pb-12'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-extrabold text-gray-100 flex items-center gap-3'>
            <CalendarIcon className='h-8 w-8 text-yellow-500' />
            Earnings & Market Events Calendar
          </h1>
          <p className='text-gray-400 text-sm mt-1'>
            Key earnings announcements, dividend record dates, and market-moving events.
          </p>
        </div>

        {/* Watchlist Filter Toggle */}
        <div className='flex items-center gap-2 p-1.5 bg-gray-800 border border-gray-700 rounded-xl'>
          <button
            onClick={() => setWatchlistOnly(false)}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors',
              !watchlistOnly
                ? 'bg-yellow-500 text-gray-950 shadow'
                : 'text-gray-400 hover:text-gray-200'
            )}
          >
            <Filter className='h-3.5 w-3.5' />
            All Events
          </button>
          <button
            onClick={() => setWatchlistOnly(true)}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors',
              watchlistOnly
                ? 'bg-yellow-500 text-gray-950 shadow'
                : 'text-gray-400 hover:text-gray-200'
            )}
          >
            <Star className='h-3.5 w-3.5 fill-current' />
            My Watchlist Only
          </button>
        </div>
      </div>

      {loading ? (
        <div className='p-16 bg-gray-800 border border-gray-600 rounded-2xl flex items-center justify-center space-x-3 text-gray-400'>
          <Loader2 className='h-6 w-6 animate-spin text-yellow-500' />
          <span>Loading earnings calendar...</span>
        </div>
      ) : events.length === 0 ? (
        <div className='p-16 text-center bg-gray-800 border border-gray-600 rounded-2xl space-y-3'>
          <CalendarIcon className='h-12 w-12 text-gray-600 mx-auto' />
          <h3 className='text-lg font-bold text-gray-200'>No events for your watchlist</h3>
          <p className='text-sm text-gray-400 max-w-md mx-auto'>
            None of the stocks currently on your watchlist have scheduled releases in this window.
          </p>
          <button
            onClick={() => setWatchlistOnly(false)}
            className='yellow-btn px-6 py-2 text-xs font-bold inline-block'
          >
            View All Upcoming Events
          </button>
        </div>
      ) : (
        <div className='bg-gray-800 border border-gray-600 rounded-2xl overflow-hidden'>
          <div className='divide-y divide-gray-700/60'>
            {events.map((ev) => (
                <div
                  key={ev.id}
                  className='p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-700/30 transition-colors'
                >
                  <div className='flex items-start sm:items-center gap-4'>
                    <div className='p-3 bg-gray-900 border border-gray-700 rounded-xl text-center min-w-[70px]'>
                      <span className='block text-[11px] font-bold uppercase text-yellow-400'>
                        {new Date(ev.date).toLocaleDateString(undefined, { month: 'short' })}
                      </span>
                      <span className='block text-xl font-extrabold text-gray-100'>
                        {new Date(ev.date).getDate()}
                      </span>
                    </div>

                    <div className='space-y-1'>
                      <div className='flex items-center gap-2.5'>
                        <Link
                          href={`/stocks/${ev.symbol}`}
                          className='font-mono font-extrabold text-yellow-400 text-lg hover:underline flex items-center gap-1 group'
                        >
                          {ev.symbol}
                          <ArrowUpRight className='h-3.5 w-3.5 opacity-60 group-hover:opacity-100' />
                        </Link>
                        {ev.isInWatchlist && (
                          <span className='px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'>
                            In Watchlist
                          </span>
                        )}
                        <span className='px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-700 text-gray-300'>
                          {ev.eventType}
                        </span>
                      </div>
                      <p className='text-xs text-gray-400'>{ev.company}</p>
                    </div>
                  </div>

                  <div className='flex items-center gap-6 self-end sm:self-auto text-xs'>
                    {ev.estimateEps !== undefined && (
                      <div className='flex flex-col text-right'>
                        <span className='text-gray-500 font-semibold uppercase text-[10px]'>
                          Consensus EPS
                        </span>
                        <span className='font-bold text-gray-200 text-sm'>
                          ${ev.estimateEps.toFixed(2)}
                        </span>
                        <span className='text-[10px] text-gray-500'>
                          Prior: ${ev.priorEps?.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {ev.dividendAmount !== undefined && (
                      <div className='flex flex-col text-right'>
                        <span className='text-gray-500 font-semibold uppercase text-[10px]'>
                          Dividend
                        </span>
                        <span className='font-bold text-emerald-400 text-sm'>
                          ${ev.dividendAmount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-gray-300'>
                      <Clock className='h-3.5 w-3.5 text-yellow-500' />
                      <span className='font-medium'>{ev.timeOfDay}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

