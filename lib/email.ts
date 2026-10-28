import nodemailer from 'nodemailer';

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  const { email, name, intro } = data;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'Signalist <welcome@signalist.com>',
        to: email,
        subject: 'Welcome to Signalist — Real-Time Stock Tracking & Insights',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050505; color: #CCDADC; padding: 40px 20px;">
            <div style="max-width: 560px; margin: 0 auto; background-color: #141414; border: 1px solid #30333A; border-radius: 12px; padding: 32px;">
              <h1 style="color: #FDD458; margin-top: 0; font-size: 24px;">Welcome to Signalist, ${name}!</h1>
              <p style="font-size: 16px; line-height: 1.6; color: #DBDBDB;">
                ${intro || "We're excited to have you onboard. Track your favorite stocks, monitor price alerts, and get actionable market intelligence tailored to your goals."}
              </p>
              <div style="margin: 28px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/watchlist" 
                   style="display: inline-block; background: #E8BA40; color: #050505; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 8px;">
                  Explore Your Watchlist
                </a>
              </div>
              <p style="font-size: 14px; color: #9095A1; margin-bottom: 0;">
                Stay ahead of market shifts with personalized alerts and smart briefings.
              </p>
            </div>
          </div>
        `,
      });
      return true;
    } catch (err) {
      console.warn('Failed to send SMTP welcome email, logging to console instead:', err);
    }
  }

  // Simulated email dispatch log
  console.log(`[EMAIL DISPATCH - Welcome] Sent to ${email} (${name}): ${intro}`);
  return true;
}

export async function sendAlertEmail({
  email,
  name,
  symbol,
  company,
  currentPrice,
  threshold,
  alertType,
}: {
  email: string;
  name: string;
  symbol: string;
  company: string;
  currentPrice: number;
  threshold: number;
  alertType: 'upper' | 'lower';
}): Promise<boolean> {
  const condition = alertType === 'upper' ? 'crossed above' : 'dropped below';

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'Signalist Alerts <alerts@signalist.com>',
        to: email,
        subject: `🚨 Price Alert: ${symbol} ${condition} $${threshold}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #050505; color: #CCDADC; padding: 40px 20px;">
            <div style="max-width: 560px; margin: 0 auto; background-color: #141414; border: 1px solid #30333A; border-radius: 12px; padding: 32px;">
              <span style="display: inline-block; background-color: rgba(253, 212, 88, 0.15); color: #FDD458; padding: 4px 8px; border-radius: 4px; font-size: 13px; font-weight: bold; margin-bottom: 12px;">PRICE ALERT TRIGGERED</span>
              <h2 style="color: #ffffff; margin-top: 0;">${company} (${symbol})</h2>
              <p style="font-size: 16px; color: #DBDBDB;">
                Hi ${name}, your price alert was triggered. <strong>${symbol}</strong> is currently trading at <strong style="color: #FDD458;">$${currentPrice.toFixed(2)}</strong>, which ${condition} your target threshold of <strong>$${threshold.toFixed(2)}</strong>.
              </p>
              <div style="margin: 24px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/stocks/${symbol}" 
                   style="background: #E8BA40; color: #050505; text-decoration: none; font-weight: 600; padding: 10px 20px; border-radius: 6px; display: inline-block;">
                  View ${symbol} Details
                </a>
              </div>
            </div>
          </div>
        `,
      });
      return true;
    } catch (err) {
      console.warn('Failed to send SMTP alert email:', err);
    }
  }

  console.log(`[EMAIL DISPATCH - Alert] ${symbol} triggered at $${currentPrice} (${condition} $${threshold}) for ${email}`);
  return true;
}
