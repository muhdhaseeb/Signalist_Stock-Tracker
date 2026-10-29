import { Metadata } from 'next';
import TradingViewWidget from '@/components/TradingViewWidget';
import StockActions from '@/components/stocks/StockActions';
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  BASELINE_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
} from '@/lib/constants';
import { getCompanyProfile, getQuote } from '@/lib/finnhub';
import { getSession } from '@/lib/auth/session';
import { isStockInWatchlist } from '@/lib/db/store';

export async function generateMetadata({ params }: StockDetailsPageProps): Promise<Metadata> {
  const { symbol } = await params;
  const upper = symbol.toUpperCase();
  const profile = await getCompanyProfile(upper);
  return {
    title: `${profile.name || upper} (${upper}) Stock Quote & Analysis | Signalist`,
    description: `Real-time quotes, technical charts, financials, and company profile for ${profile.name || upper} (${upper}).`,
  };
}

export default async function StockDetailsPage({ params }: StockDetailsPageProps) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  const [profile, quote, session] = await Promise.all([
    getCompanyProfile(upperSymbol),
    getQuote(upperSymbol),
    getSession(),
  ]);

  const inWatchlist = session?.userId
    ? await isStockInWatchlist(session.userId, upperSymbol)
    : false;

  const companyName = profile.name || upperSymbol;
  const currentPrice = quote.c || 0;

  return (
    <div className='space-y-8 pb-12'>
      {/* Top Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-700/60 pb-6'>
        <div>
          <div className='flex items-center gap-3'>
            <h1 className='text-3xl md:text-4xl font-extrabold text-gray-100'>
              {companyName}
            </h1>
            <span className='px-3 py-1 bg-yellow-500/10 text-yellow-400 font-mono font-bold text-sm rounded-md border border-yellow-500/20'>
              {upperSymbol}
            </span>
          </div>
          <p className='text-gray-400 text-sm mt-1'>
            {profile.finnhubIndustry ? `${profile.finnhubIndustry} • ` : ''}Real-time market tracking & technical indicators
          </p>
        </div>

        <StockActions
          symbol={upperSymbol}
          company={companyName}
          isInWatchlist={inWatchlist}
          currentPrice={currentPrice}
          changePercent={quote.dp || 0}
        />
      </div>

      {/* 1. Symbol Info Widget */}
      <div>
        <TradingViewWidget
          scriptUrl='https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js'
          config={SYMBOL_INFO_WIDGET_CONFIG(upperSymbol)}
          height={170}
        />
      </div>

      {/* 2. Interactive Candle Chart */}
      <div className='bg-gray-800 border border-gray-600 rounded-xl p-4'>
        <h2 className='text-xl font-bold text-gray-100 mb-4'>Price Action & Volume</h2>
        <TradingViewWidget
          scriptUrl='https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
          config={CANDLE_CHART_WIDGET_CONFIG(upperSymbol)}
          height={600}
        />
      </div>

      {/* 3. Baseline & Technicals Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-1 bg-gray-800 border border-gray-600 rounded-xl p-4'>
          <h2 className='text-lg font-bold text-gray-100 mb-4'>Technical Analysis</h2>
          <TradingViewWidget
            scriptUrl='https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js'
            config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(upperSymbol)}
            height={400}
          />
        </div>

        <div className='lg:col-span-2 bg-gray-800 border border-gray-600 rounded-xl p-4'>
          <h2 className='text-lg font-bold text-gray-100 mb-4'>Baseline Trend</h2>
          <TradingViewWidget
            scriptUrl='https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
            config={BASELINE_WIDGET_CONFIG(upperSymbol)}
            height={400}
          />
        </div>
      </div>

      {/* 4. Company Profile & Financials */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-gray-800 border border-gray-600 rounded-xl p-4'>
          <h2 className='text-lg font-bold text-gray-100 mb-4'>Company Profile</h2>
          <TradingViewWidget
            scriptUrl='https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js'
            config={COMPANY_PROFILE_WIDGET_CONFIG(upperSymbol)}
            height={440}
          />
        </div>

        <div className='bg-gray-800 border border-gray-600 rounded-xl p-4'>
          <h2 className='text-lg font-bold text-gray-100 mb-4'>Financial Fundamentals</h2>
          <TradingViewWidget
            scriptUrl='https://s3.tradingview.com/external-embedding/embed-widget-financials.js'
            config={COMPANY_FINANCIALS_WIDGET_CONFIG(upperSymbol)}
            height={440}
          />
        </div>
      </div>
    </div>
  );
}
