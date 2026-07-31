'use server';

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

  // Simulate email dispatch / server action handling
  console.log('Contact inquiry received:', { name, email, phone, service, message });

  return {
    success: true,
    message: 'Thank you for reaching out! Our 24/7 dispatch desk has received your message and will respond within 15 minutes.',
  };
}
