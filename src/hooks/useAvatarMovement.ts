import { useEffect } from 'react';
import { useOfficeStore } from '../stores/officeStore';
import { useUpdateStatus } from './useUpdateStatus';
import { useBroadcastPosition } from './useBroadcastPosition';
import { OFFICE_MAP, WALKABLE_TILES, BREAK_ZONE_TILES } from '../components/Office/officeMap';
import { GRID_COLS, GRID_ROWS } from '../components/Office/officeTokens';

const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

export function useAvatarMovement(
  mySeatRow: number | null,
  mySeatCol: number | null,
) {
  const setAvatarPos      = useOfficeStore((s) => s.setAvatarPos);
  const currentUserId     = useOfficeStore((s) => s.currentUserId);
  const updateStatus      = useUpdateStatus();
  const broadcastPosition = useBroadcastPosition();

  useEffect(() => {
    if (!currentUserId) return;

    const onKey = (e: KeyboardEvent) => {
      if (!ARROW_KEYS.has(e.key)) return;
      e.preventDefault();

      const { avatarPos, statuses } = useOfficeStore.getState();
      if (!avatarPos) return;

      const dr = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
      const dc = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;

      const nr = avatarPos.row + dr;
      const nc = avatarPos.col + dc;

      if (nr < 0 || nr >= GRID_ROWS || nc < 0 || nc >= GRID_COLS) return;

      const tile = OFFICE_MAP[nr]?.[nc] ?? '';
      if (!WALKABLE_TILES.has(tile)) return;

      setAvatarPos({ row: nr, col: nc });
      broadcastPosition(nc, nr);

      const currentStatus = statuses[currentUserId]?.status;
      if (BREAK_ZONE_TILES.has(tile)) {
        // Only trigger break zone for active statuses — don't override offline/dnd
        if (currentStatus === 'online') updateStatus('pause');
      } else if (tile === 'C' && nr === mySeatRow && nc === mySeatCol) {
        // Returned to own desk from a break
        if (currentStatus === 'pause') updateStatus('online');
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentUserId, setAvatarPos, updateStatus, broadcastPosition, mySeatRow, mySeatCol]);
}
