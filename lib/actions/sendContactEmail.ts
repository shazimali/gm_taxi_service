'use server';

import { EMAIL_FROM_CONTACT, transporter } from '@/lib/mailer';

export interface ContactState {
  success?: boolean;
  message?: string;
  error?: string;
}

export async function sendContactEmail(prevState: ContactState, formData: FormData): Promise<ContactState> {
  const name = formData.get('name')?.toString();
  const email = formData.get('email')?.toString();
  const phone = formData.get('phone')?.toString();
  const service = formData.get('service')?.toString();
  const message = formData.get('message')?.toString();

  if (!name || !email || !message) {
    return {
      error: 'Please fill in all required fields (Name, Email, Message).',
    };
  }

  const dispatchEmail = process.env.DISPATCH_EMAIL || 'info@bostonluxurychauffeur.com';

  try {
    await transporter.sendMail({
      from: EMAIL_FROM_CONTACT,
      to: dispatchEmail,
      replyTo: email,
      subject: `[Contact Inquiry] ${name}${service ? ` — ${service}` : ''}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Service Interested In:</strong> ${service || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    });
  } catch (err: any) {
    console.error('[Contact Email Error] Failed to send contact inquiry:', err?.message);
    return {
      error: 'Sorry, something went wrong sending your message. Please call us directly or try again shortly.',
    };
  }

  return {
    success: true,
    message: 'Thank you for reaching out! Our 24/7 dispatch desk has received your message and will respond within 15 minutes.',
  };
}
