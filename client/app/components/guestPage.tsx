import Link from 'next/link'
import React from 'react'
import { HiOutlineArrowRightEndOnRectangle, HiOutlineChatBubbleLeftRight, HiOutlineUserPlus } from 'react-icons/hi2'

const GuestPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-background via-primary/5 to-violet-200/30 px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-500 text-primary-foreground shadow-lg shadow-primary/30">
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
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet-500 px-6 font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:from-primary/90 hover:to-violet-500/90 sm:w-auto"
        >
            <HiOutlineUserPlus className="size-4" aria-hidden />
            Register
        </Link>
        <Link
          href="/auth/login"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border/80 bg-card/90 px-6 font-semibold text-foreground shadow-sm backdrop-blur-sm transition hover:border-primary/40 hover:bg-accent/40 sm:w-auto"
        >
            <HiOutlineArrowRightEndOnRectangle className="size-4" aria-hidden />
            Log in
        </Link>
      </div>
    </div>
  )
}

export default GuestPage