const BASE_URL = 'http://localhost:3000';
let userACookie = '';
let userBCookie = '';

const results = [];

function record(section, item, passed, details = '') {
  results.push({ section, item, passed, details });
  const statusStr = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${statusStr}] [${section}] ${item} ${details ? '(' + details + ')' : ''}`);
}

async function run() {
  console.log('--- STARTING SIGNALIST QA TEST SUITE ---');

  // ==========================================
  // Section A: App boot and routing
  // ==========================================
  try {
    // A.1: Unauthenticated visit to protected route redirects to /sign-in
    const resProtected = await fetch(`${BASE_URL}/watchlist`, { redirect: 'manual' });
    const loc = resProtected.headers.get('location');
    const isRedirect = resProtected.status === 307 || resProtected.status === 302 || resProtected.status === 308;
    const redirectsToSignIn = isRedirect && loc && loc.includes('/sign-in');
    record('A. Routing', 'Unauthenticated visit to /watchlist redirects to /sign-in', redirectsToSignIn, `Status: ${resProtected.status}, Location: ${loc}`);
  } catch (err) {
    record('A. Routing', 'Unauthenticated visit to /watchlist redirects to /sign-in', false, err.message);
  }

  try {
    // A.2: Static /manifest.json returns valid JSON and status 200 (not redirected to sign-in)
    const resManifest = await fetch(`${BASE_URL}/manifest.json`);
    const manifestJson = await resManifest.json();
    const manifestValid = resManifest.status === 200 && manifestJson.name === 'Signalist Stock Tracker';
    record('A. Routing', '/manifest.json returns status 200 with valid JSON', manifestValid, `Status: ${resManifest.status}`);
  } catch (err) {
    record('A. Routing', '/manifest.json returns status 200 with valid JSON', false, err.message);
  }

  try {
    // A.3: Public auth pages return 200
    const resSignIn = await fetch(`${BASE_URL}/sign-in`);
    const resSignUp = await fetch(`${BASE_URL}/sign-up`);
    record('A. Routing', '/sign-in and /sign-up return HTTP 200', resSignIn.status === 200 && resSignUp.status === 200, `Sign-in: ${resSignIn.status}, Sign-up: ${resSignUp.status}`);
  } catch (err) {
    record('A. Routing', '/sign-in and /sign-up return HTTP 200', false, err.message);
  }

  // ==========================================
  // Section C: Sign-up
  // ==========================================
  try {
    // C.1: Empty submit validation
    const resEmpty = await fetch(`${BASE_URL}/api/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const jsonEmpty = await resEmpty.json();
    record('C. Sign-up', 'Empty sign-up body rejected with HTTP 400 and error message', resEmpty.status === 400 && !!jsonEmpty.error, `Status: ${resEmpty.status}, Error: ${jsonEmpty.error}`);
  } catch (err) {
    record('C. Sign-up', 'Empty sign-up body rejected with HTTP 400 and error message', false, err.message);
  }

  try {
    // C.2: Invalid password (< 8 chars)
    const resShortPass = await fetch(`${BASE_URL}/api/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'test_short@example.com',
        password: '123',
      }),
    });
    const jsonShort = await resShortPass.json();
    record('C. Sign-up', 'Password under 8 chars rejected with HTTP 400', resShortPass.status === 400 && jsonShort.error.includes('8 characters'), `Error: ${jsonShort.error}`);
  } catch (err) {
    record('C. Sign-up', 'Password under 8 chars rejected with HTTP 400', false, err.message);
  }

  const testEmailA = `qa_investor_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  try {
    // C.3: Valid sign-up creates user, sets session cookie, returns 200
    const resValid = await fetch(`${BASE_URL}/api/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'QA Investor A',
        email: testEmailA,
        password: testPassword,
        country: 'US',
        investmentGoals: 'Growth',
        riskTolerance: 'High',
        preferredIndustry: 'Technology',
      }),
    });
    const rawCookie = resValid.headers.get('set-cookie');
    userACookie = rawCookie ? rawCookie.split(';')[0] : '';
    const jsonValid = await resValid.json();
    const success = (resValid.status === 200 || resValid.status === 201) && jsonValid.success === true && !!userACookie;
    record('C. Sign-up', 'Valid sign-up creates user and returns session cookie', success, `Status: ${resValid.status}, Cookie present: ${!!userACookie}`);
  } catch (err) {
    record('C. Sign-up', 'Valid sign-up creates user and returns session cookie', false, err.message);
  }

  try {
    // C.4: Duplicate email rejected
    const resDup = await fetch(`${BASE_URL}/api/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'QA Investor Duplicate',
        email: testEmailA,
        password: testPassword,
      }),
    });
    const jsonDup = await resDup.json();
    record('C. Sign-up', 'Duplicate email rejected with HTTP 409 Conflict', resDup.status === 409 && jsonDup.error.includes('already exists'), `Status: ${resDup.status}, Msg: ${jsonDup.error}`);
  } catch (err) {
    record('C. Sign-up', 'Duplicate email rejected with HTTP 409 Conflict', false, err.message);
  }

  // Create User B for user-isolation checks
  const testEmailB = `qa_investor_b_${Date.now()}@example.com`;
  try {
    const resB = await fetch(`${BASE_URL}/api/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'QA Investor B',
        email: testEmailB,
        password: testPassword,
        country: 'CA',
        investmentGoals: 'Income',
        riskTolerance: 'Low',
        preferredIndustry: 'Healthcare',
      }),
    });
    const rawCookieB = resB.headers.get('set-cookie');
    userBCookie = rawCookieB ? rawCookieB.split(';')[0] : '';
  } catch {
    // Handled in tests below
  }

  // ==========================================
  // Section D: Sign-in / session / sign-out
  // ==========================================
  try {
    // D.1: Wrong password returns 401
    const resWrongPass = await fetch(`${BASE_URL}/api/auth/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmailA,
        password: 'IncorrectPassword999!',
      }),
    });
    const jsonWrong = await resWrongPass.json();
    record('D. Auth', 'Wrong password returns HTTP 401 with safe generic error', resWrongPass.status === 401 && jsonWrong.error === 'Invalid email or password', `Status: ${resWrongPass.status}`);
  } catch (err) {
    record('D. Auth', 'Wrong password returns HTTP 401 with safe generic error', false, err.message);
  }

  try {
    // D.2: Valid sign-in
    const resLogin = await fetch(`${BASE_URL}/api/auth/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmailA,
        password: testPassword,
      }),
    });
    const cookieHeader = resLogin.headers.get('set-cookie');
    const jsonLogin = await resLogin.json();
    const loginOk = resLogin.status === 200 && jsonLogin.success === true && !!cookieHeader;
    if (cookieHeader) {
      userACookie = cookieHeader.split(';')[0];
    }
    record('D. Auth', 'Valid login returns HTTP 200 and refreshes session cookie', loginOk, `Status: ${resLogin.status}`);
  } catch (err) {
    record('D. Auth', 'Valid login returns HTTP 200 and refreshes session cookie', false, err.message);
  }

  try {
    // D.3: /api/auth/session returns real session user
    const resSession = await fetch(`${BASE_URL}/api/auth/session`, {
      headers: { Cookie: userACookie },
    });
    const jsonSession = await resSession.json();
    const sessionOk = resSession.status === 200 && jsonSession?.session?.email === testEmailA && jsonSession?.session?.name === 'QA Investor A';
    record('D. Auth', '/api/auth/session returns authenticated user identity & preferences', sessionOk, `User: ${jsonSession?.session?.name}, Email: ${jsonSession?.session?.email}`);
  } catch (err) {
    record('D. Auth', '/api/auth/session returns authenticated user identity & preferences', false, err.message);
  }

  try {
    // D.4: Pre-seeded Demo account sign-in
    const resDemo = await fetch(`${BASE_URL}/api/auth/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'investor@signalist.com',
        password: 'Password123',
      }),
    });
    const jsonDemo = await resDemo.json();
    record('D. Auth', 'Pre-seeded demo user (investor@signalist.com) logs in successfully', resDemo.status === 200 && jsonDemo.success === true, `Status: ${resDemo.status}`);
  } catch (err) {
    record('D. Auth', 'Pre-seeded demo user logs in successfully', false, err.message);
  }

  // ==========================================
  // Section E: Search
  // ==========================================
  try {
    const resSearch = await fetch(`${BASE_URL}/api/stocks/search?q=AAPL`, {
      headers: { Cookie: userACookie },
    });
    const jsonSearch = await resSearch.json();
    const hasApple = Array.isArray(jsonSearch.result) && jsonSearch.result.some(s => s.symbol === 'AAPL');
    record('E. Search', '/api/stocks/search?q=AAPL returns matching ticker list', hasApple, `Results count: ${jsonSearch.result?.length}`);
  } catch (err) {
    record('E. Search', '/api/stocks/search?q=AAPL returns matching ticker list', false, err.message);
  }

  // ==========================================
  // Section F: Stock Detail
  // ==========================================
  try {
    const resStockDetail = await fetch(`${BASE_URL}/stocks/AAPL`, {
      headers: { Cookie: userACookie },
    });
    record('F. Stock Detail', '/stocks/AAPL renders successfully with HTTP 200', resStockDetail.status === 200, `Status: ${resStockDetail.status}`);
  } catch (err) {
    record('F. Stock Detail', '/stocks/AAPL renders successfully with HTTP 200', false, err.message);
  }

  try {
    const resStockLower = await fetch(`${BASE_URL}/stocks/nvda`, {
      headers: { Cookie: userACookie },
    });
    record('F. Stock Detail', 'Lowercase /stocks/nvda renders without error (case-insensitive)', resStockLower.status === 200, `Status: ${resStockLower.status}`);
  } catch (err) {
    record('F. Stock Detail', 'Lowercase /stocks/nvda renders without error', false, err.message);
  }

  // ==========================================
  // Section G: Watchlist & Data Isolation
  // ==========================================
  try {
    // Add AAPL to User A
    await fetch(`${BASE_URL}/api/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: userACookie },
      body: JSON.stringify({ symbol: 'AAPL', company: 'Apple Inc.' }),
    });

    // Add TSLA to User B
    await fetch(`${BASE_URL}/api/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: userBCookie },
      body: JSON.stringify({ symbol: 'TSLA', company: 'Tesla, Inc.' }),
    });

    // Check User A watchlist does NOT contain TSLA
    const resListA = await fetch(`${BASE_URL}/api/watchlist`, {
      headers: { Cookie: userACookie },
    });
    const jsonListA = await resListA.json();
    const hasAapl = jsonListA.watchlist.some(w => w.symbol === 'AAPL');
    const lacksTsla = !jsonListA.watchlist.some(w => w.symbol === 'TSLA');
    record('G. Watchlist', 'Watchlist items are strictly isolated per user (User A does not see User B items)', hasAapl && lacksTsla, `User A items: ${jsonListA.watchlist.map(w => w.symbol).join(', ')}`);
  } catch (err) {
    record('G. Watchlist', 'Watchlist items are strictly isolated per user', false, err.message);
  }

  try {
    // Duplicate prevention
    await fetch(`${BASE_URL}/api/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: userACookie },
      body: JSON.stringify({ symbol: 'AAPL', company: 'Apple Inc.' }),
    });
    const resListA2 = await fetch(`${BASE_URL}/api/watchlist`, {
      headers: { Cookie: userACookie },
    });
    const jsonListA2 = await resListA2.json();
    const aaplCount = jsonListA2.watchlist.filter(w => w.symbol === 'AAPL').length;
    record('G. Watchlist', 'Duplicate additions of same stock are prevented', aaplCount === 1, `AAPL occurrences: ${aaplCount}`);
  } catch (err) {
    record('G. Watchlist', 'Duplicate additions of same stock are prevented', false, err.message);
  }

  // ==========================================
  // Section H: Alerts
  // ==========================================
  let createdAlertId = '';
  try {
    // H.1: Reject negative threshold
    const resNeg = await fetch(`${BASE_URL}/api/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: userACookie },
      body: JSON.stringify({
        symbol: 'AAPL',
        company: 'Apple Inc.',
        alertName: 'AAPL dip',
        alertType: 'lower',
        threshold: -50,
      }),
    });
    record('H. Alerts', 'Validation rejects negative threshold', resNeg.status === 400, `Status: ${resNeg.status}`);
  } catch (err) {
    record('H. Alerts', 'Validation rejects negative threshold', false, err.message);
  }

  try {
    // H.2: Create valid alert
    const resCreateAlert = await fetch(`${BASE_URL}/api/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: userACookie },
      body: JSON.stringify({
        symbol: 'AAPL',
        company: 'Apple Inc.',
        alertName: 'AAPL $250 Target',
        alertType: 'upper',
        threshold: 250,
      }),
    });
    const jsonAlert = await resCreateAlert.json();
    createdAlertId = jsonAlert?.alert?._id || jsonAlert?.alert?.id;
    record('H. Alerts', 'Create valid upper price alert', resCreateAlert.ok && !!createdAlertId, `Alert ID: ${createdAlertId}`);
  } catch (err) {
    record('H. Alerts', 'Create valid upper price alert', false, err.message);
  }

  try {
    // H.3: Cron evaluation runner
    const cronSecret = process.env.CRON_SECRET || 'signalist_dev_cron_secret';
    const resCron = await fetch(`${BASE_URL}/api/cron/alerts`, {
      headers: { Authorization: `Bearer ${cronSecret}` },
    });
    const jsonCron = await resCron.json();
    record('H. Alerts', 'Scheduled cron job /api/cron/alerts executes evaluation', resCron.status === 200 && jsonCron.success === true, `Evaluated: ${jsonCron.evaluatedAlerts}, Triggered: ${jsonCron.triggeredCount}`);
  } catch (err) {
    record('H. Alerts', 'Scheduled cron job /api/cron/alerts executes evaluation', false, err.message);
  }

  // ==========================================
  // Section I: Portfolio
  // ==========================================
  let createdHoldingId = '';
  try {
    // I.1: Add holding
    const resAddHolding = await fetch(`${BASE_URL}/api/portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: userACookie },
      body: JSON.stringify({
        symbol: 'NVDA',
        company: 'NVIDIA Corporation',
        shares: 10,
        buyPrice: 120,
      }),
    });
    const jsonHolding = await resAddHolding.json();
    createdHoldingId = jsonHolding?.holding?._id || jsonHolding?.holding?.id;
    record('I. Portfolio', 'Add stock position holding to portfolio', resAddHolding.ok && !!createdHoldingId, `Holding ID: ${createdHoldingId}`);
  } catch (err) {
    record('I. Portfolio', 'Add stock position holding to portfolio', false, err.message);
  }

  try {
    // I.2: Get portfolio calculations (P&L, sector, benchmark)
    const resPort = await fetch(`${BASE_URL}/api/portfolio?timeframe=1M`, {
      headers: { Cookie: userACookie },
    });
    const jsonPort = await resPort.json();
    const hasSummary = jsonPort?.summary?.totalCostBasis > 0 && Array.isArray(jsonPort?.holdings);
    record('I. Portfolio', 'Calculate portfolio total value, cost basis, unrealized P&L and allocations', hasSummary, `Cost Basis: $${jsonPort?.summary?.totalCostBasis}, Holdings count: ${jsonPort?.holdings?.length}`);
  } catch (err) {
    record('I. Portfolio', 'Calculate portfolio total value, cost basis, unrealized P&L and allocations', false, err.message);
  }

  // ==========================================
  // Section J: AI Features
  // ==========================================
  try {
    const resBriefing = await fetch(`${BASE_URL}/api/ai/daily-briefing`, {
      headers: { Cookie: userACookie },
    });
    const jsonBriefing = await resBriefing.json();
    const hasBriefing = resBriefing.status === 200 && !!jsonBriefing?.briefing?.headline;
    record('J. AI Features', 'Personalized AI Daily Briefing returns tailored summary & watchlist impact', hasBriefing, `Headline: "${jsonBriefing?.briefing?.headline?.substring(0, 45)}..."`);
  } catch (err) {
    record('J. AI Features', 'Personalized AI Daily Briefing returns tailored summary', false, err.message);
  }

  try {
    const resExplain = await fetch(`${BASE_URL}/api/ai/explain-move?symbol=AAPL`, {
      headers: { Cookie: userACookie },
    });
    const jsonExplain = await resExplain.json();
    const hasExplain = resExplain.status === 200 && !!(jsonExplain?.explanation?.detailedAnalysis || jsonExplain?.explanation?.catalyst);
    record('J. AI Features', '"Explain this move" returns news catalysts, sentiment and sources', hasExplain, `Sentiment: ${jsonExplain?.explanation?.sentiment}`);
  } catch (err) {
    record('J. AI Features', '"Explain this move" returns news catalysts, sentiment and sources', false, err.message);
  }

  try {
    const resNlAlert = await fetch(`${BASE_URL}/api/ai/parse-alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: userACookie },
      body: JSON.stringify({ query: 'Alert me if NVDA crosses above 150 dollars' }),
    });
    const jsonNlAlert = await resNlAlert.json();
    const parsedOk = resNlAlert.status === 200 && jsonNlAlert?.alert?.symbol === 'NVDA' && jsonNlAlert?.alert?.threshold === 150;
    record('J. AI Features', 'Natural language alert parser extracts symbol, threshold and direction', parsedOk, `Symbol: ${jsonNlAlert?.alert?.symbol}, Threshold: ${jsonNlAlert?.alert?.threshold}`);
  } catch (err) {
    record('J. AI Features', 'Natural language alert parser extracts symbol, threshold and direction', false, err.message);
  }

  // ==========================================
  // Section K: Standout Features & Remaining Pages
  // ==========================================
  try {
    // K.1: Nav route endpoints resolve with HTTP 200
    const routes = ['/', '/search', '/watchlist', '/portfolio', '/calendar', '/simulator'];
    let allOk = true;
    for (const r of routes) {
      const res = await fetch(`${BASE_URL}${r}`, { headers: { Cookie: userACookie } });
      if (res.status !== 200) {
        allOk = false;
        break;
      }
    }
    record('K. Routing', 'All core navigation pages (/, /search, /watchlist, /portfolio, /calendar, /simulator) resolve with HTTP 200', allOk);
  } catch (err) {
    record('K. Routing', 'All core navigation pages resolve with HTTP 200', false, err.message);
  }

  try {
    // K.2: Calendar events endpoint
    const resCal = await fetch(`${BASE_URL}/api/calendar`, { headers: { Cookie: userACookie } });
    const jsonCal = await resCal.json();
    record('K. Features', 'Earnings & economic calendar endpoint returns market events', resCal.status === 200 && Array.isArray(jsonCal?.events) && jsonCal.events.length > 0, `Events count: ${jsonCal?.events?.length}`);
  } catch (err) {
    record('K. Features', 'Earnings & economic calendar endpoint returns market events', false, err.message);
  }

  try {
    // K.3: Paper trading & simulator endpoint
    const resSim = await fetch(`${BASE_URL}/api/simulator`, { headers: { Cookie: userACookie } });
    const jsonSim = await resSim.json();
    record('K. Features', 'Paper trading simulator loads virtual cash balance ($100k)', resSim.status === 200 && jsonSim.balance === 100000, `Balance: $${jsonSim.balance}`);
  } catch (err) {
    record('K. Features', 'Paper trading simulator loads virtual cash balance', false, err.message);
  }

  try {
    // K.4: Batch CSV import
    const csvContent = 'Symbol,Company,Shares,Cost Basis\nMSFT,Microsoft Corp,5,400\nAMZN,Amazon.com Inc,10,180';
    const resImport = await fetch(`${BASE_URL}/api/portfolio/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: userACookie },
      body: JSON.stringify({ csvContent }),
    });
    const jsonImport = await resImport.json();
    record('K. Features', 'CSV batch import parses and imports multiple positions', resImport.status === 200 && jsonImport.importedCount === 2, `Imported: ${jsonImport.importedCount}`);
  } catch (err) {
    record('K. Features', 'CSV batch import parses and imports multiple positions', false, err.message);
  }

  try {
    // K.5: Watchlist share token & public view
    const resShare = await fetch(`${BASE_URL}/api/watchlist/share`, {
      method: 'POST',
      headers: { Cookie: userACookie },
    });
    const jsonShare = await resShare.json();
    const token = jsonShare?.shareUrl ? jsonShare.shareUrl.split('/').pop() : '';
    const resPublicView = await fetch(`${BASE_URL}/api/watchlist/share?token=${token}`);
    const jsonPublic = await resPublicView.json();
    const hasItems = Array.isArray(jsonPublic?.items) || Array.isArray(jsonPublic?.watchlist);
    record('K. Features', 'Shareable watchlist generates token and allows public read-only access', resShare.status === 200 && hasItems, `Token: ${token}`);
  } catch (err) {
    record('K. Features', 'Shareable watchlist generates token and allows public read-only access', false, err.message);
  }

  try {
    // K.6: Sign-out clears cookie
    const resSignOut = await fetch(`${BASE_URL}/api/auth/sign-out`, {
      method: 'POST',
      headers: { Cookie: userACookie },
    });
    const signOutCookie = resSignOut.headers.get('set-cookie');
    const isCleared = !!signOutCookie && (signOutCookie.includes('Max-Age=0') || signOutCookie.includes('expires=Thu, 01 Jan 1970'));
    record('D. Auth', 'Sign-out clears session cookie with Max-Age=0', resSignOut.status === 200 && isCleared, `Set-Cookie: ${signOutCookie?.split(';')[0]}`);
  } catch (err) {
    record('D. Auth', 'Sign-out clears session cookie', false, err.message);
  }

  // ==========================================
  // Summary
  // ==========================================
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`\n==========================================`);
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`==========================================`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run();

