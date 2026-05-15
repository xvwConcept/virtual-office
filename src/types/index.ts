export type StatusValue = 'online' | 'pause' | 'dnd' | 'offline';

export interface User {
  id: string;
  name: string;
  avatar_id: number;
  desk_position: number;
  created_at: string;
}

export interface Status {
  id: string;
  user_id: string;
  status: StatusValue;
  custom_message: string | null;
  updated_at: string;
}

export interface Desk {
  position: number;
  user: User | null;
  status: Status | null;
}

export const STATUS_LABELS: Record<StatusValue, string> = {
  online:  'Am Platz',
  pause:   'Pause',
  dnd:     'Nicht stören',
  offline: 'Abwesend',
};

export const STATUS_COLORS: Record<StatusValue, string> = {
  online:  '#5cbf60',
  pause:   '#e8a44c',
  dnd:     '#d84a4a',
  offline: '#8a8590',
};

export const OFFICE_GRID = { cols: 20, rows: 15, tileSize: 32 } as const;
export const DESK_COUNT = 6;
