import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useOfficeStore } from '../stores/officeStore';
import type { Status, StatusValue } from '../types';

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
          if (!row) return;

          const { statuses, users, currentUserId, addToast, setPulsing } =
            useOfficeStore.getState();

          const prev = statuses[row.user_id]?.status as StatusValue | undefined;
          const next = row.status as StatusValue;

          if (prev && prev !== next && row.user_id !== currentUserId) {
            const user = users[row.user_id];
            if (user) {
              addToast({ id: `${row.user_id}-${Date.now()}`, userId: row.user_id, from: prev, to: next });
              setPulsing(row.user_id);
            }
          }

          upsertStatus(row);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [upsertStatus]);
}
