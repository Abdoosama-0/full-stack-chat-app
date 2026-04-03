import { Button } from '@/components/ui/button'
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
      </div>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
        <Link href="/auth/register" className="w-full sm:w-auto">
          <Button className="h-11 w-full rounded-xl bg-gradient-to-r from-primary to-violet-500 px-6 font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:from-primary/90 hover:to-violet-500/90 sm:w-auto">
            <HiOutlineUserPlus className="size-4" aria-hidden />
            Register
          </Button>
        </Link>
        <Link href="/auth/login" className="w-full sm:w-auto">
          <Button
            variant="outline"
            className="h-11 w-full rounded-xl border-border/80 bg-card/90 px-6 font-semibold shadow-sm backdrop-blur-sm hover:border-primary/40 hover:bg-accent/40 sm:w-auto"
          >
            <HiOutlineArrowRightEndOnRectangle className="size-4" aria-hidden />
            log in
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default GuestPage