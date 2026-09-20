import { render } from '@react-email/render';
import { BookingConfirmationEmail } from '@/emails/BookingConfirmationEmail';
import { RideCancelledEmail } from '@/emails/RideCancelledEmail';
import { RideCompletedEmail } from '@/emails/RideCompletedEmail';
import { RideRescheduledEmail } from '@/emails/RideRescheduledEmail';
import { CancellationRequestedEmail } from '@/emails/CancellationRequestedEmail';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { generateInvoicePdf } from '@/lib/pdf/invoice';
import { EMAIL_FROM_BOT, EMAIL_FROM_DISPATCH, EMAIL_FROM_WELCOME, noReplyTransporter, transporter } from '@/lib/mailer';
import { prisma } from '@/lib/prisma';

export const EMAIL_QUEUE_NAME = 'gm_taxi_email_queue'; // kept for reference

type EmailJobName =
  | 'WELCOME_EMAIL'
  | 'BOOKING_CONFIRMATION_EMAIL'
  | 'RIDE_COMPLETED_EMAIL'
  | 'RIDE_CANCELLED_EMAIL'
  | 'RIDE_RESCHEDULED_EMAIL'
  | 'RIDE_CANCELLATION_REQUESTED_EMAIL';

/**
 * Send email directly via Gmail SMTP (nodemailer), using React Email
 * components rendered to HTML for the message body.
 * Wraps sendMail in a try/catch so a failed email never breaks the API response.
 */
export async function enqueueEmail(jobName: EmailJobName, data: any) {
  try {
    const dispatchEmail = process.env.DISPATCH_EMAIL || 'info@bostonluxurychauffeur.com';

    let phoneDisplay: string | undefined;
    try {
      const settings = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
      phoneDisplay = settings?.phoneDisplay;
    } catch (e) {
      console.error('[Email] Failed to fetch site settings for phone number:', e);
    }

    switch (jobName) {
      case 'WELCOME_EMAIL': {
        const { passengerName, email, tempPassword } = data;
        const html = await render(<WelcomeEmail passengerName={passengerName} email={email} tempPassword={tempPassword} phoneDisplay={phoneDisplay} />);

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
        const html = await render(<BookingConfirmationEmail booking={booking} phoneDisplay={phoneDisplay} />);

        // Send to passenger
        await noReplyTransporter.sendMail({
          from: EMAIL_FROM_DISPATCH,
          to: booking.email,
          subject: `Reservation Confirmed #${booking.confirmationNumber} — GM Limo Services`,
          html,
        });

        // Send to admin dispatch
        if (dispatchEmail && dispatchEmail !== booking.email) {
          await noReplyTransporter.sendMail({
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
        const html = await render(<RideCompletedEmail booking={booking} phoneDisplay={phoneDisplay} />);
        const invoicePdf = await generateInvoicePdf(booking);
        const invoiceAttachment = {
          filename: `Invoice-${booking.confirmationNumber}.pdf`,
          content: invoicePdf,
          contentType: 'application/pdf',
        };

        // Send to passenger, with the paid invoice attached
        await noReplyTransporter.sendMail({
          from: EMAIL_FROM_DISPATCH,
          to: booking.email,
          subject: `Ride Completed & Invoice #${booking.confirmationNumber} — GM Limo Services`,
          html,
          attachments: [invoiceAttachment],
        });

        // Send to admin dispatch (no attachment needed)
        if (dispatchEmail && dispatchEmail !== booking.email) {
          await noReplyTransporter.sendMail({
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
        const html = await render(<RideCancelledEmail booking={booking} phoneDisplay={phoneDisplay} />);

        // Send to passenger
        await noReplyTransporter.sendMail({
          from: EMAIL_FROM_DISPATCH,
          to: booking.email,
          subject: `Reservation Cancelled #${booking.confirmationNumber} — GM Limo Services`,
          html,
        });

        // Send to admin dispatch
        if (dispatchEmail && dispatchEmail !== booking.email) {
          await noReplyTransporter.sendMail({
            from: EMAIL_FROM_BOT,
            to: dispatchEmail,
            subject: `[RIDE CANCELLED] #${booking.confirmationNumber} - ${booking.fullName}`,
            html,
          });
        }

        console.log(`[Email] Ride cancelled email sent for #${booking.confirmationNumber}`);
        break;
      }

      case 'RIDE_RESCHEDULED_EMAIL': {
        const { booking, previousPickupDate, previousPickupTime } = data;
        const html = await render(
          <RideRescheduledEmail
            booking={booking}
            previousPickupDate={previousPickupDate}
            previousPickupTime={previousPickupTime}
            phoneDisplay={phoneDisplay}
          />
        );

        // Send to passenger
        await noReplyTransporter.sendMail({
          from: EMAIL_FROM_DISPATCH,
          to: booking.email,
          subject: `Reservation Rescheduled #${booking.confirmationNumber} — GM Limo Services`,
          html,
        });

        // Send to admin dispatch
        if (dispatchEmail && dispatchEmail !== booking.email) {
          await noReplyTransporter.sendMail({
            from: EMAIL_FROM_BOT,
            to: dispatchEmail,
            subject: `[RIDE RESCHEDULED] #${booking.confirmationNumber} - ${booking.fullName} now ${booking.pickupDate} ${booking.pickupTime}`,
            html,
          });
        }

        console.log(`[Email] Ride rescheduled email sent for #${booking.confirmationNumber}`);
        break;
      }

      case 'RIDE_CANCELLATION_REQUESTED_EMAIL': {
        const { booking, reason } = data;
        const html = await render(
          <CancellationRequestedEmail booking={booking} reason={reason} phoneDisplay={phoneDisplay} />
        );

        // Dispatch only — the passenger's hold has not been touched and the
        // booking is unchanged until an admin actions the request.
        await noReplyTransporter.sendMail({
          from: EMAIL_FROM_BOT,
          to: dispatchEmail,
          subject: `[CANCELLATION REQUESTED] #${booking.confirmationNumber} - ${booking.fullName}`,
          html,
        });

        console.log(`[Email] Cancellation request notified dispatch for #${booking.confirmationNumber}`);
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
