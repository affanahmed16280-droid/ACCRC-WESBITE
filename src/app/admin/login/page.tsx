'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError('Firebase Auth is not configured.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 bg-primary text-primary px-4">
      <div className="max-w-sm w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-sans font-bold mb-2">ACCRC</h1>
          <p className="text-secondary font-mono text-sm uppercase tracking-wider">Admin Access</p>
        </div>
        
        <form onSubmit={handleLogin} className="bg-secondary p-6 border border-border flex flex-col gap-4">
          {error && (
            <div className="bg-danger/10 text-danger text-sm p-3 border border-danger/20 font-mono">
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-xs font-mono text-secondary uppercase">Email</label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              className="w-full"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-mono text-secondary uppercase">Password</label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              className="w-full"
            />
          </div>
          
          <Button type="submit" disabled={loading} className="w-full mt-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {loading ? 'Authenticating...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
}
