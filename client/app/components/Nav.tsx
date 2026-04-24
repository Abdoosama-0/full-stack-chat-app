"use client"
import Logout from './Logout'
import{useUserData} from "../store/userData"
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import Account from './Account';
import { FaHome } from 'react-icons/fa';
import Link from 'next/link';

const Nav = () => {
   const { token, userName } = useUserData();

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-card/80 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
         

                   <Link className='flex items-center gap-2' href="/">
       
             
         
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 text-primary-foreground shadow-md shadow-primary/25">
            <HiOutlineChatBubbleLeftRight className="size-5" aria-hidden />
          </span>
           <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Chat App</h1>
            </Link>
       
         
        </div>
        {token && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
   
            <div className=" bg-background/70 px-3 py-2 text-sm font-medium text-foreground">
              {userName}
            </div>
            <Account />
            <Logout />
          </div>
        )}
<h1 >{token}</h1>
      </div>
    </header>
  )
}

export default Nav
