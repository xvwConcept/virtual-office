import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useOfficeStore } from '../stores/officeStore';

export function useAuth() {
  const setCurrentUserId = useOfficeStore((s) => s.setCurrentUserId);
  const [ready, setReady] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes('type=recovery')) {
      setIsPasswordRecovery(true);
    }

    supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data.session?.user.id ?? null);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUserId(session?.user.id ?? null);
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [setCurrentUserId]);

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const resetPasswordForEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    setIsPasswordRecovery(false);
    window.history.replaceState(null, '', window.location.pathname);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsPasswordRecovery(false);
  };

  return {
    ready,
    isPasswordRecovery,
    signInWithPassword,
    resetPasswordForEmail,
    updatePassword,
    signOut,
  };
}
