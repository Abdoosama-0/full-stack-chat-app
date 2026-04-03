"use client"
import Logout from './Logout'
import{useUserData} from "../store/userData"
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

const Nav = () => {
   const { token, userName, email, id } = useUserData();

  return (
    <header className="sticky top-0 z-10 border-b border-border/80 bg-card/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 text-primary-foreground shadow-md shadow-primary/25">
            <HiOutlineChatBubbleLeftRight className="size-5" aria-hidden />
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Chat App
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{userName}</p>
      
          </div>
          <Logout />
        </div>
      </div>
    </header>
  )
}

export default Nav
