import { Queue, Worker, Job } from 'bullmq';
import { redisConnection } from '@/lib/redis';
import { transporter, renderWelcomeEmailHtml, renderBookingConfirmationEmailHtml } from '@/lib/email';

export const EMAIL_QUEUE_NAME = 'gm_taxi_email_queue';

let _emailQueue: Queue | null = null;
let _emailWorker: Worker | null = null;

// Lazy getter for BullMQ Producer Queue
export function getEmailQueue(): Queue {
  if (!_emailQueue) {
    _emailQueue = new Queue(EMAIL_QUEUE_NAME, {
      connection: redisConnection as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
      },
    });
  }
  return _emailQueue;
}

// Safely enqueue email job without breaking during static page compilation
export async function enqueueEmail(jobName: 'WELCOME_EMAIL' | 'BOOKING_CONFIRMATION_EMAIL', data: any) {
  try {
    const queue = getEmailQueue();
    await queue.add(jobName, data);
  } catch (err: any) {
    console.warn(`[Queue Warning] Could not enqueue ${jobName}:`, err?.message);
  }
}

// Lazy getter for Background Email Worker
export function initEmailWorker(): Worker {
  if (!_emailWorker) {
    _emailWorker = new Worker(
      EMAIL_QUEUE_NAME,
      async (job: Job) => {
        console.log(`[BullMQ Worker] Processing email job ${job.name} (ID: ${job.id})...`);

        const dispatchEmail = process.env.DISPATCH_EMAIL || 'info@bostonluxurychauffeur.com';

        switch (job.name) {
          case 'WELCOME_EMAIL': {
            const { passengerName, email } = job.data;
            const html = renderWelcomeEmailHtml(passengerName, email);

            await transporter.sendMail({
              from: `"GM Limo Services" <${process.env.SMTP_FROM || 'info@bostonluxurychauffeur.com'}>`,
              to: email,
              subject: 'Welcome to GM Limo Services Boston!',
              html,
            });

            console.log(`[BullMQ Worker] Welcome email sent to ${email}`);
            break;
          }

          case 'BOOKING_CONFIRMATION_EMAIL': {
            const { booking } = job.data;
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

            console.log(`[BullMQ Worker] Booking confirmation email dispatched for #${booking.confirmationNumber}`);
            break;
          }

          default:
            console.warn(`[BullMQ Worker] Unknown job type: ${job.name}`);
        }
      },
      {
        connection: redisConnection as any,
      }
    );

    _emailWorker.on('completed', (job) => {
      console.log(`[BullMQ Worker] Job ${job.id} (${job.name}) completed successfully.`);
    });

    _emailWorker.on('failed', (job, err) => {
      console.error(`[BullMQ Worker] Job ${job?.id} failed:`, err);
    });
  }
  return _emailWorker;
}
