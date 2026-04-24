import { create } from "zustand";

type selectedUserStore = {
  selectedUserId: number | null;
  setSelectedUserId: (id: number | null) => void;
  selectedUserName: string | null;
  setSelectedUserName: (name: string | null) => void;
  selectedUserAvatar: string | null;
  setSelectedUserAvatar: (avatar: string | null) => void;

  clearSelectedUser: () => void; 
};

export const useSelectedUserStore = create<selectedUserStore>((set) => ({
  selectedUserId: null,

  setSelectedUserId: (id) =>
    set({ selectedUserId: id }),
  selectedUserName: null,
  setSelectedUserName: (name) => set({ selectedUserName: name }),
  selectedUserAvatar: null,
  setSelectedUserAvatar: (avatar) => set({ selectedUserAvatar: avatar }),

  clearSelectedUser: () =>
    set({
      selectedUserId: null,
      selectedUserName: null,
      selectedUserAvatar: null,
    }),
}));
