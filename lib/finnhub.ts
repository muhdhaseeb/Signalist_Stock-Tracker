const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

function getApiKey(): string | undefined {
  return process.env.FINNHUB_API_KEY || undefined;
}

// Fallback quotes if Finnhub API key is not configured or rate-limited
const MOCK_QUOTES: Record<string, { c: number; d: number; dp: number; h: number; l: number; o: number; pc: number }> = {
  AAPL: { c: 228.45, d: 2.15, dp: 0.95, h: 230.12, l: 226.5, o: 227.0, pc: 226.3 },
  MSFT: { c: 422.8, d: -1.2, dp: -0.28, h: 426.0, l: 420.5, o: 425.0, pc: 424.0 },
  GOOGL: { c: 178.6, d: 3.4, dp: 1.94, h: 180.2, l: 175.9, o: 176.1, pc: 175.2 },
  AMZN: { c: 195.3, d: 1.8, dp: 0.93, h: 197.1, l: 193.4, o: 194.0, pc: 193.5 },
  TSLA: { c: 260.1, d: -5.4, dp: -2.03, h: 268.0, l: 257.5, o: 267.0, pc: 265.5 },
  META: { c: 590.2, d: 8.5, dp: 1.46, h: 594.0, l: 582.0, o: 585.0, pc: 581.7 },
  NVDA: { c: 141.5, d: 4.2, dp: 3.06, h: 143.0, l: 137.8, o: 138.5, pc: 137.3 },
  NFLX: { c: 745.0, d: 12.0, dp: 1.64, h: 749.0, l: 735.0, o: 738.0, pc: 733.0 },
  AMD: { c: 156.4, d: -2.1, dp: -1.32, h: 160.0, l: 154.5, o: 159.0, pc: 158.5 },
  SPY: { c: 580.4, d: 2.8, dp: 0.49, h: 582.0, l: 578.5, o: 579.0, pc: 577.6 },
};

const MOCK_PROFILES: Record<string, { name: string; ticker: string; marketCapitalization: number; finnhubIndustry: string; logo?: string; weburl?: string }> = {
  AAPL: { name: 'Apple Inc', ticker: 'AAPL', marketCapitalization: 3480000, finnhubIndustry: 'Technology', weburl: 'https://apple.com' },
  MSFT: { name: 'Microsoft Corporation', ticker: 'MSFT', marketCapitalization: 3140000, finnhubIndustry: 'Technology', weburl: 'https://microsoft.com' },
  GOOGL: { name: 'Alphabet Inc', ticker: 'GOOGL', marketCapitalization: 2210000, finnhubIndustry: 'Communication Services', weburl: 'https://abc.xyz' },
  AMZN: { name: 'Amazon.com Inc', ticker: 'AMZN', marketCapitalization: 2040000, finnhubIndustry: 'Consumer Discretionary', weburl: 'https://amazon.com' },
  TSLA: { name: 'Tesla Inc', ticker: 'TSLA', marketCapitalization: 830000, finnhubIndustry: 'Automotive', weburl: 'https://tesla.com' },
  META: { name: 'Meta Platforms Inc', ticker: 'META', marketCapitalization: 1500000, finnhubIndustry: 'Technology', weburl: 'https://meta.com' },
  NVDA: { name: 'NVIDIA Corporation', ticker: 'NVDA', marketCapitalization: 3470000, finnhubIndustry: 'Semiconductors', weburl: 'https://nvidia.com' },
  NFLX: { name: 'Netflix Inc', ticker: 'NFLX', marketCapitalization: 320000, finnhubIndustry: 'Entertainment', weburl: 'https://netflix.com' },
  AMD: { name: 'Advanced Micro Devices Inc', ticker: 'AMD', marketCapitalization: 250000, finnhubIndustry: 'Semiconductors', weburl: 'https://amd.com' },
  SPY: { name: 'SPDR S&P 500 ETF Trust', ticker: 'SPY', marketCapitalization: 570000, finnhubIndustry: 'Financial', weburl: 'https://ssga.com' },
};

async function finnhubFetch<T>(endpoint: string, params: Record<string, string> = {}, revalidate = 60): Promise<T | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }

  const searchParams = new URLSearchParams({ ...params, token: apiKey });
  const url = `${FINNHUB_BASE_URL}${endpoint}?${searchParams.toString()}`;

  try {
    const res = await fetch(url, {
      next: { revalidate },
      headers: { Accept: 'application/json' },
    });

    if (res.status === 429) {
      console.warn(`[Finnhub] Rate limit hit on ${endpoint}. Using cache/fallback.`);
      return null;
    }

    if (!res.ok) {
      console.warn(`[Finnhub] HTTP ${res.status} on ${endpoint}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error(`[Finnhub] Fetch error on ${endpoint}:`, error);
    return null;
  }
}

/**
 * Search ticker symbols & companies
 */
export async function searchSymbols(query: string): Promise<FinnhubSearchResponse> {
  const q = query.trim();
  if (!q) {
    return { count: 0, result: [] };
  }

  const live = await finnhubFetch<FinnhubSearchResponse>('/search', { q }, 300);
  if (live && Array.isArray(live.result) && live.result.length > 0) {
    return live;
  }

  // Fallback search over mock catalog
  const filtered = Object.keys(MOCK_PROFILES)
    .filter((sym) => sym.toLowerCase().includes(q.toLowerCase()) || MOCK_PROFILES[sym].name.toLowerCase().includes(q.toLowerCase()))
    .map((sym) => ({
      symbol: sym,
      description: MOCK_PROFILES[sym].name,
      displaySymbol: sym,
      type: 'Common Stock',
    }));

  return {
    count: filtered.length,
    result: filtered,
  };
}

/**
 * Get real-time stock quote (c = current, dp = change percent, d = change, h = high, l = low, o = open, pc = prev close)
 */
export async function getQuote(symbol: string): Promise<QuoteData & { d?: number; h?: number; l?: number; o?: number; pc?: number }> {
  const sym = symbol.toUpperCase().trim();
  const live = await finnhubFetch<QuoteData & { d?: number; h?: number; l?: number; o?: number; pc?: number }>('/quote', { symbol: sym }, 30);

  if (live && typeof live.c === 'number' && live.c > 0) {
    return live;
  }

  if (MOCK_QUOTES[sym]) {
    return MOCK_QUOTES[sym];
  }

  // Deterministic pseudo-quote for unknown symbols
  const hash = sym.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const basePrice = (hash % 400) + 50;
  const changePercent = ((hash % 100) - 48) / 10;
  return {
    c: Number(basePrice.toFixed(2)),
    dp: Number(changePercent.toFixed(2)),
    d: Number(((basePrice * changePercent) / 100).toFixed(2)),
    h: Number((basePrice * 1.02).toFixed(2)),
    l: Number((basePrice * 0.98).toFixed(2)),
    o: Number((basePrice * 0.99).toFixed(2)),
    pc: Number(basePrice.toFixed(2)),
  };
}

/**
 * Get company profile (name, market cap, weburl, industry)
 */
export async function getCompanyProfile(symbol: string): Promise<ProfileData & { ticker?: string; logo?: string; weburl?: string; finnhubIndustry?: string }> {
  const sym = symbol.toUpperCase().trim();
  const live = await finnhubFetch<ProfileData & { ticker?: string; logo?: string; weburl?: string; finnhubIndustry?: string }>('/stock/profile2', { symbol: sym }, 86400);

  if (live && live.name) {
    return live;
  }

  if (MOCK_PROFILES[sym]) {
    return MOCK_PROFILES[sym];
  }

  return {
    name: sym,
    ticker: sym,
    marketCapitalization: 10000,
    finnhubIndustry: 'Diversified',
  };
}

/**
 * Get basic financial metrics (e.g. PE ratio, 52-week high/low, beta)
 */
export async function getBasicFinancials(symbol: string): Promise<FinancialsData> {
  const sym = symbol.toUpperCase().trim();
  const live = await finnhubFetch<{ metric: Record<string, number> }>('/stock/metric', { symbol: sym, metric: 'all' }, 3600);

  if (live && live.metric) {
    return live;
  }

  return {
    metric: {
      peNormalizedAnnual: 28.5,
      beta: 1.15,
      '52WeekHigh': 240.0,
      '52WeekLow': 165.0,
    },
  };
}

/**
 * Get general market news
 */
export async function getMarketNews(category = 'general'): Promise<MarketNewsArticle[]> {
  const live = await finnhubFetch<MarketNewsArticle[]>('/news', { category }, 300);

  if (Array.isArray(live) && live.length > 0) {
    return live.slice(0, 12);
  }

  // Fallback news
  const now = Math.floor(Date.now() / 1000);
  return [
    {
      id: 101,
      headline: 'Tech Sector Rallies Amid Strong AI Infrastructure Demand',
      summary: 'Major technology and semiconductor stocks gained momentum as enterprise spending on cloud and AI data centers accelerated.',
      source: 'MarketWire',
      url: 'https://finance.yahoo.com',
      datetime: now - 3600,
      category: 'technology',
      related: 'AAPL,NVDA,MSFT',
    },
    {
      id: 102,
      headline: 'Federal Reserve Signals Measured Policy Path Ahead of Upcoming Meeting',
      summary: 'Central bank officials noted persistent progress on inflation metrics while monitoring labor market resilience.',
      source: 'Global Financial Times',
      url: 'https://bloomberg.com',
      datetime: now - 7200,
      category: 'general',
      related: 'SPY',
    },
    {
      id: 103,
      headline: 'Consumer Spending Trends Show Selective Resilience Across Retail',
      summary: 'E-commerce and cloud retail leaders beat margin expectations, while discretionary spending adjusted to shifting household budgets.',
      source: 'Retail Watch',
      url: 'https://reuters.com',
      datetime: now - 14400,
      category: 'business',
      related: 'AMZN,WMT',
    },
  ];
}

/**
 * Format market cap for display (e.g. $3.48T or $830B)
 */
export function formatMarketCap(marketCapMillions?: number): string {
  if (!marketCapMillions || marketCapMillions <= 0) return 'N/A';
  if (marketCapMillions >= 1_000_000) {
    return `$${(marketCapMillions / 1_000_000).toFixed(2)}T`;
  }
  if (marketCapMillions >= 1_000) {
    return `$${(marketCapMillions / 1_000).toFixed(2)}B`;
  }
  return `$${marketCapMillions.toFixed(2)}M`;
}
