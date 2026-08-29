import { redirect } from 'next/navigation';

export default function PassengerLoginRedirect() {
  redirect('/login');
}
