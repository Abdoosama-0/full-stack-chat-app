import { create } from "zustand";

type ChatStore = {
  selectedChatId: string | null;
  isGroup: boolean;

  setSelectedChatId: (id: string) => void;
  setIsGroup: (value: boolean) => void;

  clearSelectedChat: () => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  selectedChatId: null,
  isGroup: false,

  setSelectedChatId: (id) =>
    set({ selectedChatId: id }),

  setIsGroup: (value) =>
    set({ isGroup: value }),

  clearSelectedChat: () =>
    set({
      selectedChatId: null,
      isGroup: false,
    }),
}));