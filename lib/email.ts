import nodemailer from 'nodemailer';

// Nodemailer Transporter Configuration (SMTP)
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';
const smtpFrom = process.env.SMTP_FROM || 'info@bostonluxurychauffeur.com';

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
});

/**
 * 1. Render Welcome Email HTML for New Passenger Registration
 */
export function renderWelcomeEmailHtml(passengerName: string, phoneDisplay: string = '(617) 784-0264'): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to GM Limo Services</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; color: #18181b;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7;">

        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #09090b 0%, #18181b 100%); padding: 30px; text-align: center; border-bottom: 3px solid #bfa054;">
          <a href="https://gmlimoservices.com" style="display: inline-block;">
            <img
              src="https://gmlimoservices.com/images/logo.png"
              alt="GM Limo Services"
              width="140"
              style="display: block; margin: 0 auto; max-width: 140px; height: auto;"
            />
          </a>
        </div>

        <!-- Body Content -->
        <div style="padding: 30px; line-height: 1.6;">
          <h2 style="color: #09090b; font-size: 20px; margin-top: 0;">Welcome, ${passengerName}!</h2>
          <p>Thank you for creating an account with <strong>GM Limo Services</strong>. Your passenger portal is now active, giving you access to seamless reservations, real-time chauffeur dispatch tracking, and saved luxury preferences.</p>

          <div style="background-color: #fafafa; border-left: 4px solid #bfa054; padding: 15px; margin: 25px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>Your Chauffeur Perks:</strong></p>
            <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; color: #3f3f46;">
              <li>Instant flat-rate price quotes for Logan BOS transfers</li>
              <li>1-click card checkout &amp; automated receipt delivery</li>
              <li>Dedicated executive flight delay &amp; early arrival monitoring</li>
            </ul>
          </div>

          <a href="https://gmlimoservices.com/dashboard" style="display: inline-block; background-color: #bfa054; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
            Go to Passenger Dashboard &rarr;
          </a>
        </div>

        <!-- Footer -->
        <div style="background-color: #f4f4f5; padding: 20px; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #e4e4e7;">
          <p style="margin: 0;">Need immediate dispatch assistance? Call <strong>${phoneDisplay}</strong></p>
          <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} GM Limo Services Boston, MA. All rights reserved.</p>
        </div>

      </div>
    </body>
    </html>
  `;
}

/**
 * 2. Render Ride Confirmation Email HTML (Sent to Passenger & Admin Dispatch)
 */
export function renderBookingConfirmationEmailHtml(booking: any, phoneDisplay: string = '(617) 784-0264'): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ride Reservation Confirmation - ${booking.confirmationNumber}</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; color: #18181b;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7;">

        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #09090b 0%, #18181b 100%); padding: 30px; text-align: center; border-bottom: 3px solid #bfa054;">
          <a href="https://gmlimoservices.com" style="display: inline-block;">
            <img
              src="https://gmlimoservices.com/images/logo.png"
              alt="GM Limo Services"
              width="140"
              style="display: block; margin: 0 auto; max-width: 140px; height: auto;"
            />
          </a>
        </div>

        <!-- Footer -->
        <div style="background-color: #f4f4f5; padding: 20px; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #e4e4e7;">
          <p style="margin: 0;">24/7 Dispatch Hotline: <strong>${phoneDisplay}</strong> | Email: <strong>info@bostonluxurychauffeur.com</strong></p>
          <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} GM Limo Services Boston. All rights reserved.</p>
        </div>

      </div>
    </body>
    </html>
  `;
}
