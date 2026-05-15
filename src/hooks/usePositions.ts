import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useOfficeStore } from '../stores/officeStore';

export function usePositions() {
  const setPositions   = useOfficeStore((s) => s.setPositions);
  const upsertPosition = useOfficeStore((s) => s.upsertPosition);
  const removePosition = useOfficeStore((s) => s.removePosition);

  useEffect(() => {
    supabase
      .from('positions')
      .select('user_id, col, row')
      .then(({ data, error }) => {
        if (error) console.error('[usePositions] initial fetch:', error.message);
        if (data) setPositions(data as { user_id: string; col: number; row: number }[]);
      });

    const channel = supabase
      .channel('positions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'positions' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const old = payload.old as { user_id?: string };
            if (old?.user_id) removePosition(old.user_id);
            return;
          }
          const row = payload.new as { user_id: string; col: number; row: number } | null;
          if (row?.user_id) upsertPosition(row);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [setPositions, upsertPosition, removePosition]);
}
