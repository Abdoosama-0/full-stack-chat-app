import Link from 'next/link'
import React from 'react'
import { MdAccountBox } from 'react-icons/md'

const Account = () => {
  return (

 <Link href="/account"> <MdAccountBox size={30}  /></Link>  
  )
}

export default Account