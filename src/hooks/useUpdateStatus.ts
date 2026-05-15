import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useOfficeStore } from '../stores/officeStore';
import type { StatusValue } from '../types';

export function useUpdateStatus() {
  const currentUserId = useOfficeStore((s) => s.currentUserId);

  return useCallback(
    async (status: StatusValue, customMessage: string | null = null) => {
      if (!currentUserId) throw new Error('No current user');

      const { error } = await supabase
        .from('statuses')
        .upsert(
          {
            user_id: currentUserId,
            status,
            custom_message: customMessage,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) throw error;
    },
    [currentUserId]
  );
}
