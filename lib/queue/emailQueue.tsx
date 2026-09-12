import { render } from '@react-email/render';
import { BookingConfirmationEmail } from '@/emails/BookingConfirmationEmail';
import { RideCancelledEmail } from '@/emails/RideCancelledEmail';
import { RideCompletedEmail } from '@/emails/RideCompletedEmail';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { generateInvoicePdf } from '@/lib/pdf/invoice';
import { EMAIL_FROM_BOT, EMAIL_FROM_DISPATCH, EMAIL_FROM_WELCOME, transporter } from '@/lib/mailer';

export const EMAIL_QUEUE_NAME = 'gm_taxi_email_queue'; // kept for reference

type EmailJobName =
  | 'WELCOME_EMAIL'
  | 'BOOKING_CONFIRMATION_EMAIL'
  | 'RIDE_COMPLETED_EMAIL'
  | 'RIDE_CANCELLED_EMAIL';

/**
 * Send email directly via Gmail SMTP (nodemailer), using React Email
 * components rendered to HTML for the message body.
 * Wraps sendMail in a try/catch so a failed email never breaks the API response.
 */
export async function enqueueEmail(jobName: EmailJobName, data: any) {
  try {
    const dispatchEmail = process.env.DISPATCH_EMAIL || 'info@bostonluxurychauffeur.com';

    switch (jobName) {
      case 'WELCOME_EMAIL': {
        const { passengerName, email, tempPassword } = data;
        const html = await render(<WelcomeEmail passengerName={passengerName} email={email} tempPassword={tempPassword} />);

        await transporter.sendMail({
          from: EMAIL_FROM_WELCOME,
          to: email,
          subject: tempPassword
            ? 'Your GM Limo Account Credentials & Welcome to GM Limo Services'
            : 'Welcome to GM Limo Services Boston!',
          html,
        });

        console.log(`[Email] Welcome email sent to ${email}`);
        break;
      }

      case 'BOOKING_CONFIRMATION_EMAIL': {
        const { booking } = data;
        const html = await render(<BookingConfirmationEmail booking={booking} />);

        // Send to passenger
        await transporter.sendMail({
          from: EMAIL_FROM_DISPATCH,
          to: booking.email,
          subject: `Reservation Confirmed #${booking.confirmationNumber} — GM Limo Services`,
          html,
        });

        // Send to admin dispatch
        if (dispatchEmail && dispatchEmail !== booking.email) {
          await transporter.sendMail({
            from: EMAIL_FROM_BOT,
            to: dispatchEmail,
            subject: `[NEW RESERVATION] #${booking.confirmationNumber} - ${booking.fullName} ($${booking.estimatedPrice})`,
            html,
          });
        }

        console.log(`[Email] Booking confirmation sent for #${booking.confirmationNumber}`);
        break;
      }

      case 'RIDE_COMPLETED_EMAIL': {
        const { booking } = data;
        const html = await render(<RideCompletedEmail booking={booking} />);
        const invoicePdf = await generateInvoicePdf(booking);
        const invoiceAttachment = {
          filename: `Invoice-${booking.confirmationNumber}.pdf`,
          content: invoicePdf,
          contentType: 'application/pdf',
        };

        // Send to passenger, with the paid invoice attached
        await transporter.sendMail({
          from: EMAIL_FROM_DISPATCH,
          to: booking.email,
          subject: `Ride Completed & Invoice #${booking.confirmationNumber} — GM Limo Services`,
          html,
          attachments: [invoiceAttachment],
        });

        // Send to admin dispatch (no attachment needed)
        if (dispatchEmail && dispatchEmail !== booking.email) {
          await transporter.sendMail({
            from: EMAIL_FROM_BOT,
            to: dispatchEmail,
            subject: `[RIDE COMPLETED] #${booking.confirmationNumber} - ${booking.fullName} ($${booking.estimatedPrice})`,
            html,
          });
        }

        console.log(`[Email] Ride completed email + invoice sent for #${booking.confirmationNumber}`);
        break;
      }

      case 'RIDE_CANCELLED_EMAIL': {
        const { booking } = data;
        const html = await render(<RideCancelledEmail booking={booking} />);

        // Send to passenger
        await transporter.sendMail({
          from: EMAIL_FROM_DISPATCH,
          to: booking.email,
          subject: `Reservation Cancelled #${booking.confirmationNumber} — GM Limo Services`,
          html,
        });

        // Send to admin dispatch
        if (dispatchEmail && dispatchEmail !== booking.email) {
          await transporter.sendMail({
            from: EMAIL_FROM_BOT,
            to: dispatchEmail,
            subject: `[RIDE CANCELLED] #${booking.confirmationNumber} - ${booking.fullName}`,
            html,
          });
        }

        console.log(`[Email] Ride cancelled email sent for #${booking.confirmationNumber}`);
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
