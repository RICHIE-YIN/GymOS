import { redirect } from 'next/navigation';

export default function RootPage() {
  // Middleware handles auth-based redirects, but this catches direct root visits
  redirect('/dashboard');
}
