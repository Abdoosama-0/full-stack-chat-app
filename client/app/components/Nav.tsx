"use client"
import React, { use, useEffect } from 'react'
import Logout from './Logout'
import{useUserData} from "../store/userData"
const Nav = () => {
   const { token, userName, email, id } = useUserData();

  return (
    <div className='flex justify-around items-center'>

    <Logout />
    <h1 className='text-2xl font-bold'>Chat App</h1>
    <h1>{userName}</h1>
    <h1>{token}</h1>
 </div>
  )
}

export default Nav