import { create } from "zustand";

type ChatStore = {
  selectedChatId: string | null;
  setSelectedChatId: (id: string) => void;
  clearSelectedChat: () => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  selectedChatId: null,

  setSelectedChatId: (id) =>
    set({ selectedChatId: id }),
  clearSelectedChat: () =>
    set({
      selectedChatId: null,
    }),
}));
