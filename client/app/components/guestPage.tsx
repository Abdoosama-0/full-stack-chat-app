import Link from 'next/link'
import React from 'react'
import { HiOutlineArrowRightEndOnRectangle, HiOutlineChatBubbleLeftRight, HiOutlineUserPlus } from 'react-icons/hi2'

const GuestPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8 bg-gradient-to-b from-background via-muted/30 to-primary/5 px-6 py-16">
      <div className="flex max-w-lg flex-col items-center gap-3 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <HiOutlineChatBubbleLeftRight className="size-7" aria-hidden />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Welcome to Chat App
        </h1>
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          Connect instantly with friends and teammates in a clean and modern chat experience.
        </p>
      </div>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
        <Link
          href="/auth/register"
          className="app-btn-primary h-11 w-full sm:w-auto"
        >
            <HiOutlineUserPlus className="size-4" aria-hidden />
            Register
        </Link>
        <Link
          href="/auth/login"
          className="app-btn-secondary h-11 w-full sm:w-auto"
        >
            <HiOutlineArrowRightEndOnRectangle className="size-4" aria-hidden />
            Log in
        </Link>
      </div>
    </div>
  )
}

export default GuestPage