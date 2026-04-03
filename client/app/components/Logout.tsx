import { Button } from '@/components/ui/button'
import React from 'react'
import{useUserData} from "../store/userData"
import { useSelectedUserStore } from '../store/selectedUser';
import { useChatStore } from '../store/chatStore';



const Logout = () => {
 const { clearUserData } = useUserData();
 const { clearSelectedUser } = useSelectedUserStore();
 const { clearSelectedChat } = useChatStore();
    return (
    <Button onClick={() => { clearUserData(); clearSelectedUser(); clearSelectedChat(); }}  >Logout</Button>
  )
}

export default Logout