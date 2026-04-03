'use client'
import { use, useEffect, useState } from "react";
import GuestPage from "./components/guestPage"
import UserPage from "./components/userPage";
import{useUserData} from "./store/userData"

export default function Home() {
  const { token } = useUserData();

if (token) {
  return (
    <>
   
    
    <UserPage />
    </>
  
  )
} else {
  return (

  <GuestPage />
  
  )
 
}
  
}