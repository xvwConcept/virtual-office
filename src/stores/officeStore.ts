import { create } from 'zustand';
import type { Status, User } from '../types';

interface OfficeState {
  currentUserId: string | null;
  users: Record<string, User>;
  statuses: Record<string, Status>;
  selectedDesk: number | null;
  avatarPos: { row: number; col: number } | null;

  setCurrentUserId: (id: string | null) => void;
  setUsers: (users: User[]) => void;
  setStatuses: (statuses: Status[]) => void;
  upsertStatus: (status: Status) => void;
  upsertUser: (user: User) => void;
  selectDesk: (deskPosition: number | null) => void;
  setAvatarPos: (pos: { row: number; col: number }) => void;
}

export const useOfficeStore = create<OfficeState>((set) => ({
  currentUserId: null,
  users: {},
  statuses: {},
  selectedDesk: null,
  avatarPos: null,

  setCurrentUserId: (id) => set({ currentUserId: id }),
  setUsers: (users) =>
    set({ users: Object.fromEntries(users.map((u) => [u.id, u])) }),
  setStatuses: (statuses) =>
    set({
      statuses: Object.fromEntries(statuses.map((s) => [s.user_id, s])),
    }),
  upsertStatus: (status) =>
    set((s) => ({ statuses: { ...s.statuses, [status.user_id]: status } })),
  upsertUser: (user) =>
    set((s) => ({ users: { ...s.users, [user.id]: user } })),
  selectDesk: (deskPosition) => set({ selectedDesk: deskPosition }),
  setAvatarPos: (pos) => set({ avatarPos: pos }),
}));
