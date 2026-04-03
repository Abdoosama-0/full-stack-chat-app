import { create } from "zustand";

type selectedUserStore = {
  selectedUserId: number | null;
  setSelectedUserId: (id: number) => void;
   selectedUserName: string | null;
  setSelectedUserName: (name: string) => void;
  selectedUserAvatar: string | null;
  setSelectedUserAvatar: (avatar: string) => void;

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
