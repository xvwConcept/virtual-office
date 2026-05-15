import { create } from 'zustand';
import type { Status, StatusValue, User } from '../types';

export interface ToastEntry {
  id: string;
  userId: string;
  from: StatusValue;
  to: StatusValue;
}

interface OfficeState {
  currentUserId: string | null;
  users: Record<string, User>;
  statuses: Record<string, Status>;
  selectedDesk: number | null;
  avatarPos: { row: number; col: number } | null;
  positions: Record<string, { col: number; row: number }>;
  pulsingUsers: Record<string, true>;
  toasts: ToastEntry[];

  setCurrentUserId: (id: string | null) => void;
  setUsers: (users: User[]) => void;
  setStatuses: (statuses: Status[]) => void;
  upsertStatus: (status: Status) => void;
  upsertUser: (user: User) => void;
  selectDesk: (deskPosition: number | null) => void;
  setAvatarPos: (pos: { row: number; col: number }) => void;
  setPositions: (positions: { user_id: string; col: number; row: number }[]) => void;
  upsertPosition: (pos: { user_id: string; col: number; row: number }) => void;
  setPulsing: (userId: string) => void;
  addToast: (toast: ToastEntry) => void;
  removeToast: (id: string) => void;
}

export const useOfficeStore = create<OfficeState>((set) => ({
  currentUserId: null,
  users: {},
  statuses: {},
  selectedDesk: null,
  avatarPos: null,
  positions: {},
  pulsingUsers: {},
  toasts: [],

  setCurrentUserId: (id) => set({ currentUserId: id }),
  setUsers: (users) =>
    set({ users: Object.fromEntries(users.map((u) => [u.id, u])) }),
  setStatuses: (statuses) =>
    set({ statuses: Object.fromEntries(statuses.map((s) => [s.user_id, s])) }),
  upsertStatus: (status) =>
    set((s) => ({ statuses: { ...s.statuses, [status.user_id]: status } })),
  upsertUser: (user) =>
    set((s) => ({ users: { ...s.users, [user.id]: user } })),
  selectDesk: (deskPosition) => set({ selectedDesk: deskPosition }),
  setAvatarPos: (pos) => set({ avatarPos: pos }),
  setPositions: (list) =>
    set({ positions: Object.fromEntries(list.map((p) => [p.user_id, { col: p.col, row: p.row }])) }),
  upsertPosition: (pos) =>
    set((s) => ({ positions: { ...s.positions, [pos.user_id]: { col: pos.col, row: pos.row } } })),
  setPulsing: (userId) => {
    set((s) => ({ pulsingUsers: { ...s.pulsingUsers, [userId]: true } }));
    setTimeout(
      () => set((s) => {
        const next = { ...s.pulsingUsers };
        delete next[userId];
        return { pulsingUsers: next };
      }),
      700
    );
  },
  addToast: (toast) =>
    set((s) => ({ toasts: [...s.toasts.slice(-3), toast] })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
