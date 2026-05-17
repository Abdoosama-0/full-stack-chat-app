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
      className="app-btn-secondary h-9 cursor-pointer px-3 text-sm"
      onClick={() => { clearUserData(); clearSelectedUser(); clearSelectedChat()
        window.location.href = "/"
        ; }}
    >
      <HiOutlineArrowRightOnRectangle className="size-4 shrink-0" aria-hidden />
      Logout
    </button>
  )
}

export default Logout