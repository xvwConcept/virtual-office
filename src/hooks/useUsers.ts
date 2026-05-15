import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useOfficeStore } from '../stores/officeStore';
import type { User, Status } from '../types';

export function useUsers() {
  const setUsers = useOfficeStore((s) => s.setUsers);
  const setStatuses = useOfficeStore((s) => s.setStatuses);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [usersRes, statusesRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('statuses').select('*'),
      ]);

      if (cancelled) return;

      if (usersRes.error) setError(usersRes.error.message);
      else setUsers((usersRes.data ?? []) as User[]);

      if (statusesRes.error) setError(statusesRes.error.message);
      else setStatuses((statusesRes.data ?? []) as Status[]);

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [setUsers, setStatuses]);

  return { loading, error };
}
