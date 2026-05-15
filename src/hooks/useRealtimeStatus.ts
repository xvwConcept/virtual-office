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
          const row = (payload.new && Object.keys(payload.new).length > 0 ? payload.new : null) as Status | null;
          if (!row) return;

          const { statuses, users, currentUserId, addToast, setPulsing } =
            useOfficeStore.getState();

          // Skip own changes and skip if not yet authenticated
          if (!currentUserId || row.user_id === currentUserId) {
            upsertStatus(row);
            return;
          }

          const prev = statuses[row.user_id]?.status as StatusValue | undefined;
          const next = row.status as StatusValue;

          if (prev && prev !== next) {
            const user = users[row.user_id];
            if (user) {
              addToast({
                id: `${row.user_id}-${Date.now()}`,
                userId: row.user_id,
                userName: user.name,
                from: prev,
                to: next,
              });
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
