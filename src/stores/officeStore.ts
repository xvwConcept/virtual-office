import { create } from 'zustand';
import type { Status, User } from '../types';

interface OfficeState {
  currentUserId: string | null;
  users: Record<string, User>;
  statuses: Record<string, Status>;
  selectedDesk: number | null;

  setCurrentUserId: (id: string | null) => void;
  setUsers: (users: User[]) => void;
  setStatuses: (statuses: Status[]) => void;
  upsertStatus: (status: Status) => void;
  upsertUser: (user: User) => void;
  selectDesk: (deskPosition: number | null) => void;
}

export const useOfficeStore = create<OfficeState>((set) => ({
  currentUserId: null,
  users: {},
  statuses: {},
  selectedDesk: null,

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
}));
