import Link from 'next/link'
import React from 'react'
import { MdAccountBox } from 'react-icons/md'
import { useUserData } from '../store/userData';

const Account = () => {

     const { avatar } = useUserData();
  
  return (
    <Link
      href="/account"
      className="inline-flex shrink-0 overflow-hidden rounded-full ring-2 ring-border/80 transition hover:ring-primary/40"
    >
      {avatar && (
        <img
          src={avatar || "/default-avatar.png"}
          alt="Avatar"
          className="size-9 object-cover sm:size-10"
        />
      )}
    </Link>
  )
}

export default Account