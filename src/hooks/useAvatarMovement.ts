import { useEffect } from 'react';
import { useOfficeStore } from '../stores/officeStore';
import { useUpdateStatus } from './useUpdateStatus';
import { useBroadcastPosition } from './useBroadcastPosition';
import { WALKABLE_TILES, BREAK_ZONE_TILES, DOOR_TILE, DOOR_ZONE_KEYS } from '../components/Office/officeMap';
import { getRoomMap, getWarpTarget, isWarpTile } from '../components/Office/rooms';
import { GRID_COLS, GRID_ROWS } from '../components/Office/officeTokens';

const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
const WARP_MS = 420;

export function useAvatarMovement(
  mySeatRow: number | null,
  mySeatCol: number | null,
) {
  const setAvatarPos          = useOfficeStore((s) => s.setAvatarPos);
  const currentUserId         = useOfficeStore((s) => s.currentUserId);
  const currentRoom           = useOfficeStore((s) => s.currentRoom);
  const setCurrentRoom        = useOfficeStore((s) => s.setCurrentRoom);
  const setRoomTransitioning  = useOfficeStore((s) => s.setRoomTransitioning);
  const updateStatus          = useUpdateStatus();
  const broadcastPosition     = useBroadcastPosition();

  useEffect(() => {
    if (!currentUserId) return;

    const onKey = (e: KeyboardEvent) => {
      if (!ARROW_KEYS.has(e.key)) return;
      e.preventDefault();

      const state = useOfficeStore.getState();
      if (!state.avatarPos || state.roomTransitioning) return;

      const map = getRoomMap(state.currentRoom);

      const dr = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
      const dc = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;

      const nr = state.avatarPos.row + dr;
      const nc = state.avatarPos.col + dc;

      if (nr < 0 || nr >= GRID_ROWS || nc < 0 || nc >= GRID_COLS) return;

      const tile = map[nr]?.[nc] ?? '';
      if (!WALKABLE_TILES.has(tile)) return;

      if (isWarpTile(state.currentRoom, nr, nc)) {
        const target = getWarpTarget(state.currentRoom);
        if (!target) return;

        setRoomTransitioning(true);
        setTimeout(() => {
          setCurrentRoom(target.room);
          setAvatarPos({ row: target.row, col: target.col });
          if (target.room === 'office') {
            broadcastPosition(target.col, target.row);
          }
          setRoomTransitioning(false);
        }, WARP_MS);
        return;
      }

      setAvatarPos({ row: nr, col: nc });
      if (state.currentRoom === 'office') {
        broadcastPosition(nc, nr);
      }

      if (state.currentRoom !== 'office') return;

      const currentStatus = state.statuses[currentUserId]?.status;
      const inDoorZone = tile === DOOR_TILE || DOOR_ZONE_KEYS.has(`${nr}-${nc}`);
      if (inDoorZone) {
        if (currentStatus !== 'dnd' && currentStatus !== 'offline') {
          updateStatus('offline');
        }
      } else if (BREAK_ZONE_TILES.has(tile)) {
        if (currentStatus === 'online') updateStatus('pause');
      } else if (tile === 'C' && nr === mySeatRow && nc === mySeatCol) {
        if (currentStatus === 'pause' || currentStatus === 'offline') {
          updateStatus('online');
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    currentUserId,
    currentRoom,
    setAvatarPos,
    setCurrentRoom,
    setRoomTransitioning,
    updateStatus,
    broadcastPosition,
    mySeatRow,
    mySeatCol,
  ]);
}
