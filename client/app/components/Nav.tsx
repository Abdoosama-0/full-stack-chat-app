"use client"
import Logout from './Logout'
import{useUserData} from "../store/userData"
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import Account from './Account';
import { FaHome } from 'react-icons/fa';
import Link from 'next/link';
import { FaRocketchat } from 'react-icons/fa6';

const Nav = () => {
  
   const { token, userName ,avatar } = useUserData();
   

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-card/90 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-card/75">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
         

          <Link className="flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-90" href="/">
       
             
         
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25 sm:size-10">
            {/* <HiOutlineChatBubbleLeftRight className="size-5" aria-hidden /> */}
            <FaRocketchat className="size-5" aria-hidden />

          </span>
            <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">Chat App</h1>
            </Link>
       
         
        </div>
        {token && (
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
            <div className="hidden max-w-[10rem] truncate rounded-full border border-border/70 bg-muted/50 px-3 py-1.5 text-sm font-medium text-foreground sm:block sm:max-w-[14rem]">
              {userName}
              
            </div>

       {/* {token} */}
            <Account />
            <Logout />
          </div>
        )}

      </div>
    </header>
  )
}

export default Nav
