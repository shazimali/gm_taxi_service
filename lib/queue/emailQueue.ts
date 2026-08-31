import { transporter, renderWelcomeEmailHtml, renderBookingConfirmationEmailHtml } from '@/lib/email';

export const EMAIL_QUEUE_NAME = 'gm_taxi_email_queue'; // kept for reference

/**
 * Send email directly via Gmail SMTP (no Redis / BullMQ required).
 * Wraps sendMail in a try/catch so a failed email never breaks the API response.
 */
export async function enqueueEmail(jobName: 'WELCOME_EMAIL' | 'BOOKING_CONFIRMATION_EMAIL', data: any) {
  try {
    const dispatchEmail = process.env.DISPATCH_EMAIL || 'info@bostonluxurychauffeur.com';

    switch (jobName) {
      case 'WELCOME_EMAIL': {
        const { passengerName, email } = data;
        const html = renderWelcomeEmailHtml(passengerName, email);

        await transporter.sendMail({
          from: `"GM Limo Services" <${process.env.SMTP_FROM || 'info@bostonluxurychauffeur.com'}>`,
          to: email,
          subject: 'Welcome to GM Limo Services Boston!',
          html,
        });

        console.log(`[Email] Welcome email sent to ${email}`);
        break;
      }

      case 'BOOKING_CONFIRMATION_EMAIL': {
        const { booking } = data;
        const html = renderBookingConfirmationEmailHtml(booking);

        // Send to passenger
        await transporter.sendMail({
          from: `"GM Limo Services Dispatch" <${process.env.SMTP_FROM || 'info@bostonluxurychauffeur.com'}>`,
          to: booking.email,
          subject: `Reservation Confirmed #${booking.confirmationNumber} — GM Limo Services`,
          html,
        });

        // Send to admin dispatch
        if (dispatchEmail && dispatchEmail !== booking.email) {
          await transporter.sendMail({
            from: `"GM Limo Reservation Bot" <${process.env.SMTP_FROM || 'info@bostonluxurychauffeur.com'}>`,
            to: dispatchEmail,
            subject: `[NEW RESERVATION] #${booking.confirmationNumber} - ${booking.fullName} ($${booking.estimatedPrice})`,
            html,
          });
        }

        console.log(`[Email] Booking confirmation sent for #${booking.confirmationNumber}`);
        break;
      }

      default:
        console.warn(`[Email] Unknown job type: ${jobName}`);
    }
  } catch (err: any) {
    // Never crash the API — log the failure and move on
    console.error(`[Email Error] Failed to send ${jobName}:`, err?.message);
  }
}
