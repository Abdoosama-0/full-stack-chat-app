import Link from 'next/link'
import React from 'react'
import { MdAccountBox } from 'react-icons/md'
import { useUserData } from '../store/userData';

const Account = () => {

     const { avatar } = useUserData();
  
  return (
    
 <Link href="/account"> 
 

 
                        {avatar && (
  <img
    src={avatar || "/default-avatar.png"}
    alt="Avatar"
    className="w-10 h-10 rounded-full object-cover border border-gray-300"
  />
)}</Link>  
  )
}

export default Account