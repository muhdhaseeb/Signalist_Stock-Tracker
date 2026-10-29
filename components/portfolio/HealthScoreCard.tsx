import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthScoreProps {
  score: number;
  rating: string;
  flags: string[];
  riskTolerance: string;
}

export default function HealthScoreCard({
  score,
  rating,
  flags,
  riskTolerance,
}: HealthScoreProps) {
  const isOptimal = score >= 80;
  const isCaution = score < 60;

  return (
    <div className='bg-gray-800 border border-gray-600 rounded-xl p-5 space-y-4'>
      <div className='flex items-center justify-between pb-3 border-b border-gray-700'>
        <div className='flex items-center gap-2'>
          {isOptimal ? (
            <ShieldCheck className='h-5 w-5 text-emerald-400' />
          ) : isCaution ? (
            <ShieldAlert className='h-5 w-5 text-red-400' />
          ) : (
            <AlertTriangle className='h-5 w-5 text-yellow-400' />
          )}
          <h2 className='text-lg font-bold text-gray-100'>Portfolio Health Score</h2>
        </div>
        <span
          className={cn(
            'text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider',
            isOptimal
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : isCaution
              ? 'bg-red-500/15 text-red-400 border border-red-500/20'
              : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
          )}
        >
          {rating}
        </span>
      </div>

      <div className='flex items-center gap-6'>
        {/* Score Ring / Value */}
        <div className='flex flex-col items-center justify-center p-4 bg-gray-900/60 border border-gray-700 rounded-xl min-w-[90px]'>
          <span
            className={cn(
              'text-3xl font-extrabold',
              isOptimal
                ? 'text-emerald-400'
                : isCaution
                ? 'text-red-400'
                : 'text-yellow-400'
            )}
          >
            {score}
          </span>
          <span className='text-[10px] text-gray-500 uppercase font-semibold mt-0.5'>
            out of 100
          </span>
        </div>

        <div className='flex-1 space-y-1.5'>
          <div className='flex items-center justify-between text-xs text-gray-400'>
            <span>Alignment: Stated Risk ({riskTolerance})</span>
            <span>{isOptimal ? 'Strong Fit' : 'Variance Detected'}</span>
          </div>
          <div className='w-full bg-gray-700 h-2 rounded-full overflow-hidden'>
            <div
              className={cn(
                'h-full transition-all duration-500',
                isOptimal
                  ? 'bg-emerald-400'
                  : isCaution
                  ? 'bg-red-400'
                  : 'bg-yellow-400'
              )}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className='text-xs text-gray-400'>
            Evaluates concentration thresholds and sector tilts against your personal risk mandate.
          </p>
        </div>
      </div>

      {flags.length > 0 && (
        <div className='pt-2 space-y-2 border-t border-gray-700/60'>
          <span className='text-[11px] font-bold uppercase tracking-wider text-gray-400'>
            Risk Advisories & Mismatch Flags
          </span>
          <ul className='space-y-1.5'>
            {flags.map((flag, idx) => (
              <li key={idx} className='text-xs text-gray-300 flex items-start gap-2'>
                <span className='mt-1 h-1.5 w-1.5 rounded-full bg-yellow-500 shrink-0' />
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

