import React from 'react'
import{useUserData} from "../store/userData"
import { useSelectedUserStore } from '../store/selectedUser';
import { useChatStore } from '../store/chatStore';
import { HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';



const Logout = () => {
 const { clearUserData } = useUserData();
 const { clearSelectedUser } = useSelectedUserStore();
 const { clearSelectedChat } = useChatStore();
    return (
    <button
      className=" flex items-center gap-2 px-2 py-1  cursor-pointer rounded-lg border-border/80 bg-background/80 shadow-sm transition hover:border-primary/40 hover:bg-accent/50"
      onClick={() => { clearUserData(); clearSelectedUser(); clearSelectedChat(); }}
    >
      <HiOutlineArrowRightOnRectangle className="size-4 shrink-0" aria-hidden />
      Logout
    </button>
  )
}

export default Logout