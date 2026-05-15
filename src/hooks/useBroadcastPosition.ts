import { useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useOfficeStore } from '../stores/officeStore';

export function useBroadcastPosition() {
  const currentUserId = useOfficeStore((s) => s.currentUserId);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (col: number, row: number) => {
      if (!currentUserId) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        supabase
          .from('positions')
          .upsert(
            { user_id: currentUserId, col, row, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          );
      }, 200);
    },
    [currentUserId]
  );
}
