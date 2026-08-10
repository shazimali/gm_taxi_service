import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin, revokeAdminSessions } from '@/lib/auth';

export async function POST() {
  const admin = await getAuthenticatedAdmin();
  if (admin?.userId) {
    await revokeAdminSessions(admin.userId);
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
