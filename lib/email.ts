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
export function renderWelcomeEmailHtml(passengerName: string, email: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to GM Limo Services</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; color: #18181b;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7;">
        
        {/* Header Banner */}
        <div style="background: linear-gradient(135deg, #09090b 0%, #18181b 100%); padding: 30px; text-align: center; border-bottom: 3px solid #bfa054;">
          <h1 style="color: #bfa054; margin: 0; font-size: 24px; font-family: Georgia, serif;">GM LIMO SERVICES</h1>
          <p style="color: #a1a1aa; margin: 5px 0 0 0; font-size: 13px; letter-spacing: 1px;">BOSTON LUXURY CHAUFFEUR &amp; AIRPORT TRANSFERS</p>
        </div>

        {/* Content */}
        <div style="padding: 30px;">
          <h2 style="color: #09090b; font-size: 20px; margin-top: 0;">Welcome, ${passengerName}!</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #3f3f46;">
            Thank you for registering your passenger account with <strong>GM Limo Services Boston</strong>. Your account gives you instant access to:
          </p>

          <ul style="font-size: 14px; color: #3f3f46; line-height: 1.8; padding-left: 20px;">
            <li>⚡ Fast 1-click reservations for Logan (BOS) &amp; regional airports</li>
            <li>💳 Secure card pre-authorization hold management</li>
            <li>🚘 Guaranteed luxury fleet &amp; uniformed executive chauffeurs</li>
            <li>📜 Complete access to your ride history &amp; receipts</li>
          </ul>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #475569;">
              <strong>Account Email:</strong> ${email}<br>
              <strong>Status:</strong> Active &amp; Verified Passenger
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://gmlimoservices.com/passenger/dashboard" style="background-color: #bfa054; color: #ffffff; padding: 12px 28px; border-radius: 99px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Access Passenger Dashboard</a>
          </div>
        </div>

        {/* Footer */}
        <div style="background-color: #f4f4f5; padding: 20px; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #e4e4e7;">
          <p style="margin: 0;">Need immediate dispatch assistance? Call <strong>(617) 784-0264</strong></p>
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
export function renderBookingConfirmationEmailHtml(booking: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ride Reservation Confirmation - ${booking.confirmationNumber}</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; color: #18181b;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7;">
        
        {/* Header Banner */}
        <div style="background: linear-gradient(135deg, #09090b 0%, #18181b 100%); padding: 30px; text-align: center; border-bottom: 3px solid #bfa054;">
          <span style="background-color: #bfa054; color: #09090b; font-size: 11px; font-weight: bold; padding: 3px 10px; border-radius: 20px; text-transform: uppercase;">🔒 Payment Hold Placed</span>
          <h1 style="color: #ffffff; margin: 10px 0 0 0; font-size: 22px; font-family: Georgia, serif;">Reservation Confirmed</h1>
          <p style="color: #bfa054; margin: 5px 0 0 0; font-size: 14px; font-weight: bold;">Confirmation #${booking.confirmationNumber}</p>
        </div>

        {/* Content */}
        <div style="padding: 30px;">
          <p style="font-size: 15px; color: #3f3f46; margin-top: 0;">
            Dear <strong>${booking.fullName}</strong>,
          </p>
          <p style="font-size: 14px; color: #3f3f46; line-height: 1.6;">
            Your executive chauffeur reservation request has been confirmed. A pre-authorization payment hold of <strong>$${booking.estimatedPrice}</strong> has been locked on your card. Funds will be held and NOT charged until your trip is completed.
          </p>

          {/* Trip Summary Box */}
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #09090b; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Trip Breakdown</h3>
            
            <table style="width: 100%; font-size: 14px; color: #334155; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a; width: 35%;">Service Type:</td>
                <td style="padding: 6px 0;">${booking.serviceType}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">Vehicle Fleet:</td>
                <td style="padding: 6px 0;">${booking.vehicleName || booking.vehicleSlug || 'Executive Vehicle'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">Pickup Location:</td>
                <td style="padding: 6px 0;">${booking.pickupLocation}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">Dropoff Location:</td>
                <td style="padding: 6px 0;">${booking.dropoffLocation || 'As Requested'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">Date &amp; Time:</td>
                <td style="padding: 6px 0;">${booking.pickupDate} at ${booking.pickupTime}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">Passengers &amp; Luggage:</td>
                <td style="padding: 6px 0;">👥 ${booking.passengers} Passengers | 🧳 ${booking.luggage} Suitcases</td>
              </tr>
              ${booking.flightNumber ? `
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">Flight Tracking:</td>
                <td style="padding: 6px 0;">${booking.flightNumber}</td>
              </tr>` : ''}
              <tr style="border-top: 1px solid #e2e8f0;">
                <td style="padding: 10px 0 0 0; font-weight: bold; color: #bfa054; font-size: 16px;">Total Hold Amount:</td>
                <td style="padding: 10px 0 0 0; font-weight: bold; color: #bfa054; font-size: 16px;">$${booking.estimatedPrice}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            🛡️ <strong>Chauffeur Guarantee:</strong> Your assigned chauffeur will send a SMS notification upon arrival. Flight status is continuously monitored for Logan (BOS) transfers.
          </p>
        </div>

        {/* Footer */}
        <div style="background-color: #f4f4f5; padding: 20px; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #e4e4e7;">
          <p style="margin: 0;">24/7 Dispatch Hotline: <strong>(617) 784-0264</strong> | Email: <strong>info@bostonluxurychauffeur.com</strong></p>
          <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} GM Limo Services Boston. All rights reserved.</p>
        </div>

      </div>
    </body>
    </html>
  `;
}
