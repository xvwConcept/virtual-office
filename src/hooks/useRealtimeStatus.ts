import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useOfficeStore } from '../stores/officeStore';
import type { Status } from '../types';

export function useRealtimeStatus() {
  const upsertStatus = useOfficeStore((s) => s.upsertStatus);

  useEffect(() => {
    const channel = supabase
      .channel('statuses-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'statuses' },
        (payload) => {
          const row = (payload.new ?? payload.old) as Status | undefined;
          if (row) upsertStatus(row);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [upsertStatus]);
}
