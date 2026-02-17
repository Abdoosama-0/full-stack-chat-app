'use client'
import { useEffect, useState } from "react";
import GuestPage from "./components/guestPage"
import UserPage from "./components/userPage";


export default function Home() {
const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // ده هيتنفذ بس بعد ما الصفحة تبقى على المتصفح
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

if (token) {
  return (
    <>
    <h1>{token}</h1>
    
    <UserPage />
    </>
  
  )
} else {
  return (

  <GuestPage />
  
  )
 
}
  
}