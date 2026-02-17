"use client"
import React, { use, useEffect } from 'react'
import Logout from './Logout'

const Nav = () => {
const [username, setUsername] = React.useState<string | null>(null);
    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
     
        setUsername(storedUsername);
        }, []);
  return (
    <div className='flex justify-around items-center'>

    <Logout />
    <h1 className='text-2xl font-bold'>Chat App</h1>
    <h1>{username}</h1>
 </div>
  )
}

export default Nav