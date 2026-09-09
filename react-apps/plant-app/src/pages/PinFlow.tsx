import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PinInput } from '../components/PinInput';
import { LockKeyhole, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function PinFlow({ mode }: { mode: 'setup' | 'verify' }) {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Check if user is actually logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/auth');
    });
  }, [navigate]);

  const handlePinComplete = async (pin: string) => {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      if (mode === 'setup') {
        // Save PIN to Supabase profiles table
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.id, 
            pin: pin,
            updated_at: new Date().toISOString()
          });

        if (upsertError) throw upsertError;

        // Mark as verified locally
        localStorage.setItem('pin_verified', 'true');
        navigate('/dashboard');
      } else {
        // Verify PIN against Supabase
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('pin')
          .eq('id', user.id)
          .single();

        if (fetchError) throw fetchError;

        if (profile?.pin === pin) {
          localStorage.setItem('pin_verified', 'true');
          navigate('/dashboard');
        } else {
          setError('Incorrect PIN. Please try again.');
          setTimeout(() => setError(''), 2000);
        }
      }
    } catch (err: any) {
      console.error('PIN Error:', err);
      setError(err.message || 'Failed to process PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FAFAF9] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
          {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <LockKeyhole className="w-8 h-8" />}
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {mode === 'setup' ? 'Set Your Security PIN' : 'Enter PIN to Unlock'}
        </h2>
        <p className="text-gray-500 mb-8">
          {mode === 'setup' 
            ? 'Create a 6-digit PIN to secure your plant collection.' 
            : 'Welcome back! Please enter your PIN to continue.'}
        </p>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100">
          <PinInput 
            length={6} 
            onComplete={handlePinComplete} 
            label={mode === 'setup' ? "Create PIN" : "Enter PIN"}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
