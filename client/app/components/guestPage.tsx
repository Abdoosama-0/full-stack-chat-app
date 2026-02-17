import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const GuestPage = () => {
  return (
       <div className="flex items-center justify-center gap-2 h-screen">
<Link href="/auth/register">
  <Button>Register</Button>
</Link>

      
      <Button  className="">log in</Button>

      
    </div>
  )
}

export default GuestPage