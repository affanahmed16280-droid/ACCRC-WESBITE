import { auth } from './firebase';
import { signOut } from 'firebase/auth';

export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
  }
}
