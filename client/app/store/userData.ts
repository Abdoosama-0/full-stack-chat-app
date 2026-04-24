import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserData = {
  token: string | null;
  userName: string | null;
  email: string | null;
  id: string | null;
  avatar: string | null;

  setToken: (token: string | null) => void;
  setUserName: (userName: string | null) => void;
  setEmail: (email: string | null) => void;
  setId: (id: string | null) => void;
  setAvatar: (avatar: string | null) => void;

  clearUserData: () => void;
};

export const useUserData = create<UserData>()(
  persist(
    (set) => ({
      token: null,
      userName: null,
      email: null,
      id: null,
      avatar: null,

      setToken: (token) => set({ token }),
      setUserName: (userName) => set({ userName }),
      setEmail: (email) => set({ email }),
      setId: (id) => set({ id }),
      setAvatar: (avatar) => set({ avatar }),

      clearUserData: () =>
        set({
          token: null,
          userName: null,
          email: null,
          id: null,
          avatar: null,
        }),
    }),
    {
      name: "user-storage",
    }
  )
);