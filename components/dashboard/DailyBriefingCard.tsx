'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Mail, Check, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface BriefingData {
  headline: string;
  summary: string;
  keyTakeaways: string[];
  watchlistImpact: Array<{ symbol: string; impact: string }>;
}

export default function DailyBriefingCard() {
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [prefs, setPrefs] = useState<{
    userName?: string;
    riskTolerance?: string;
    investmentGoals?: string;
    preferredIndustry?: string;
  }>({});

  useEffect(() => {
    fetch('/api/ai/daily-briefing')
      .then((res) => res.json())
      .then((data) => {
        if (data?.briefing) {
          setBriefing(data.briefing);
          setPrefs(data.userPreferences || {});
        }
      })
      .catch((err) => console.error('Failed to load briefing:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSendEmail = async () => {
    if (sendingEmail || emailSent) return;
    setSendingEmail(true);
    try {
      await new Promise((r) => setTimeout(r, 600)); // simulated email dispatch
      setEmailSent(true);
    } catch {
      // Ignored
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className='w-full p-6 bg-gradient-to-r from-gray-800 to-gray-850 border border-gray-700/80 rounded-2xl animate-pulse space-y-4'>
        <div className='flex items-center gap-2'>
          <div className='h-5 w-5 bg-yellow-500/30 rounded' />
          <div className='h-5 bg-gray-700 rounded w-48' />
        </div>
        <div className='h-6 bg-gray-700 rounded w-3/4' />
        <div className='h-16 bg-gray-700/60 rounded w-full' />
      </div>
    );
  }

  if (!briefing) return null;

  return (
    <div className='w-full relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-800/95 to-gray-900 border border-yellow-500/20 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6'>
      {/* Decorative accent glow */}
      <div className='absolute -right-16 -top-16 w-56 h-56 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none' />

      {/* Header bar */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='flex items-center gap-2.5'>
          <span className='p-2 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 rounded-xl flex items-center justify-center shadow-inner'>
            <Sparkles className='h-5 w-5' />
          </span>
          <div>
            <div className='flex items-center gap-2'>
              <h2 className='text-sm font-bold uppercase tracking-wider text-yellow-400'>
                Personalized AI Market Briefing
              </h2>
              <span className='px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-700 text-gray-300'>
                Today
              </span>
            </div>
            <p className='text-xs text-gray-400'>
              Tailored for {prefs.userName || 'you'} • {prefs.investmentGoals} • {prefs.riskTolerance} Risk • {prefs.preferredIndustry}
            </p>
          </div>
        </div>

        <Button
          size='sm'
          variant='outline'
          onClick={handleSendEmail}
          disabled={sendingEmail || emailSent}
          className='border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs self-start sm:self-auto'
        >
          {sendingEmail ? (
            <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
          ) : emailSent ? (
            <Check className='mr-1.5 h-3.5 w-3.5 text-emerald-400' />
          ) : (
            <Mail className='mr-1.5 h-3.5 w-3.5 text-yellow-500' />
          )}
          {emailSent ? 'Briefing Sent to Email' : 'Email Me This Briefing'}
        </Button>
      </div>

      {/* Main headline and summary */}
      <div className='space-y-2'>
        <h3 className='text-xl sm:text-2xl font-extrabold text-gray-100 leading-snug'>
          {briefing.headline}
        </h3>
        <p className='text-gray-300 text-sm sm:text-base leading-relaxed'>
          {briefing.summary}
        </p>
      </div>

      {/* Key Takeaways */}
      {briefing.keyTakeaways && briefing.keyTakeaways.length > 0 && (
        <div className='bg-gray-900/60 border border-gray-700/60 rounded-xl p-4 space-y-2.5'>
          <h4 className='text-xs font-bold uppercase tracking-wider text-gray-400'>
            Strategic Implications for Your Goals
          </h4>
          <ul className='space-y-2'>
            {briefing.keyTakeaways.map((takeaway, idx) => (
              <li key={idx} className='text-sm text-gray-300 flex items-start gap-2.5'>
                <span className='mt-1.5 h-1.5 w-1.5 rounded-full bg-yellow-500 shrink-0' />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Watchlist Impact Pills */}
      {briefing.watchlistImpact && briefing.watchlistImpact.length > 0 && (
        <div className='space-y-3 pt-1'>
          <h4 className='text-xs font-bold uppercase tracking-wider text-gray-400'>
            Watchlist Pulse
          </h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {briefing.watchlistImpact.map((item) => (
              <Link
                key={item.symbol}
                href={`/stocks/${item.symbol}`}
                className='p-3 bg-gray-750/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg flex items-start gap-3 transition-colors group'
              >
                <span className='font-mono font-bold text-yellow-400 text-sm px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 group-hover:border-yellow-500/40'>
                  {item.symbol}
                </span>
                <span className='text-xs text-gray-300 leading-relaxed flex-1'>
                  {item.impact}
                </span>
                <ArrowRight className='h-3.5 w-3.5 text-gray-500 group-hover:text-yellow-400 mt-1 transition-colors' />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

