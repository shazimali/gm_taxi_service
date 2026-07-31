import React from 'react';
import BookingForm from '@/components/forms/BookingForm';

export const metadata = {
  title: 'Instant Rate Quote & Reservation | GM Limo Services Boston',
  description: 'Book your executive chauffeur or airport transfer online in under 60 seconds. Transparent pricing and 24/7 live confirmation.',
};

export default function BookPage() {
  return (
    <div className="pt-28 pb-20 bg-neutral-950 text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c5a059] block mb-2">
            Online Reservation
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">
            Instant Quote & Booking
          </h1>
          <p className="text-neutral-400 text-sm">
            Select your route, choose your executive vehicle, and receive guaranteed fixed pricing with 24/7 dispatch confirmation.
          </p>
        </div>

        <BookingForm />
      </div>
    </div>
  );
}
