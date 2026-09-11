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
 * 1. Render Welcome Email HTML for New Passenger Registration (includes credentials if provided)
 */
export function renderWelcomeEmailHtml(
  passengerName: string,
  email?: string,
  tempPassword?: string,
  phoneDisplay: string = '(617) 784-0264'
): string {
  const credentialsBox = tempPassword
    ? `
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px; margin: 25px 0;">
        <h3 style="color: #166534; font-size: 15px; margin: 0 0 10px 0; display: flex; align-items: center; gap: 6px;">
          🔑 Your Account Login Credentials
        </h3>
        <p style="font-size: 13px; color: #15803d; margin: 0 0 12px 0;">
          An account has been automatically created for you so you can review your rides, download receipts, and track your chauffeur.
        </p>
        <table style="width: 100%; font-size: 13px; color: #1e293b; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; font-weight: bold; width: 120px;">Email / Login:</td>
            <td style="padding: 4px 0; font-family: monospace; font-size: 14px;">${email || ''}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">Temp Password:</td>
            <td style="padding: 4px 0; font-family: monospace; font-size: 14px; font-weight: bold; color: #0f172a;">${tempPassword}</td>
          </tr>
        </table>
        <p style="font-size: 11px; color: #64748b; margin: 10px 0 0 0;">
          * We recommend changing your password after your first login via your Passenger Dashboard.
        </p>
      </div>
    `
    : '';

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
          <p>Thank you for choosing <strong>GM Limo Services</strong>. Your passenger account is now active, giving you access to reservations, live chauffeur dispatch tracking, and saved ride receipts.</p>

          ${credentialsBox}

          <div style="background-color: #fafafa; border-left: 4px solid #bfa054; padding: 15px; margin: 25px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>Your Chauffeur Perks:</strong></p>
            <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; color: #3f3f46;">
              <li>Instant flat-rate price quotes for Logan BOS transfers</li>
              <li>1-click card checkout &amp; automated receipt delivery</li>
              <li>Dedicated executive flight delay &amp; early arrival monitoring</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 25px;">
            <a href="https://gmlimoservices.com/dashboard" style="display: inline-block; background-color: #bfa054; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
              Access Passenger Dashboard &rarr;
            </a>
          </div>
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
  const priceDisplay = booking.estimatedPrice != null ? `$${Number(booking.estimatedPrice).toFixed(2)}` : 'Flat Rate / Pending';

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

        <!-- Body Content -->
        <div style="padding: 30px; line-height: 1.6;">
          <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
            <span style="font-size: 13px; font-weight: bold; color: #047857; text-transform: uppercase; letter-spacing: 0.05em;">Reservation Confirmed</span>
            <h2 style="color: #065f46; font-size: 24px; margin: 5px 0 0 0; font-family: monospace;">#${booking.confirmationNumber}</h2>
          </div>

          <p style="margin-top: 0;">Dear <strong>${booking.fullName || 'Valued Passenger'}</strong>,</p>
          <p>Thank you for booking with <strong>GM Limo Services</strong>. Your luxury chauffeur reservation has been received and our 24/7 dispatch desk is managing your itinerary.</p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
            <h3 style="font-size: 14px; font-weight: bold; color: #0f172a; margin: 0 0 12px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
              Trip Itinerary &amp; Details
            </h3>

            <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; width: 140px;">Service:</td>
                <td style="padding: 6px 0;">${booking.serviceType || 'Chauffeur Transfer'}</td>
              </tr>
              ${booking.vehicleSlug ? `
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Fleet Tier:</td>
                <td style="padding: 6px 0; text-transform: capitalize;">${booking.vehicleSlug.replace(/-/g, ' ')}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Pickup Date:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${booking.pickupDate} at ${booking.pickupTime}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Pickup Location:</td>
                <td style="padding: 6px 0;">${booking.pickupLocation}</td>
              </tr>
              ${booking.dropoffLocation ? `
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Drop-off:</td>
                <td style="padding: 6px 0;">${booking.dropoffLocation}</td>
              </tr>` : ''}
              ${booking.flightNumber ? `
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Flight Tail #:</td>
                <td style="padding: 6px 0;">${booking.flightNumber}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Passengers / Bags:</td>
                <td style="padding: 6px 0;">${booking.passengers ?? 1} Passengers, ${booking.luggage ?? 1} Luggage</td>
              </tr>
              <tr style="border-top: 1px dashed #cbd5e1;">
                <td style="padding: 10px 0 4px 0; font-weight: bold; font-size: 14px; color: #0f172a;">Authorized Hold / Total:</td>
                <td style="padding: 10px 0 4px 0; font-weight: 800; font-size: 16px; color: #b8860b;">${priceDisplay}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 13px; color: #64748b;">
            🔒 <em>Note: Your card authorization hold secures your vehicle and dedicated chauffeur. Payment is only finalized once your journey is safely completed.</em>
          </p>

          <div style="text-align: center; margin-top: 25px;">
            <a href="https://gmlimoservices.com/dashboard" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px;">
              View Reservation in Portal &rarr;
            </a>
          </div>
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
