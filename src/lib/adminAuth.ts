import { signInWithEmail, signOutUser } from './authHelpers';

// Admin email (configure this)
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';

export async function adminLogin(email: string, password: string) {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return { success: true, message: 'Login successful' };
  }
  return { success: false, message: 'Invalid credentials' };
}

export async function adminLogout() {
  await signOutUser();
}
