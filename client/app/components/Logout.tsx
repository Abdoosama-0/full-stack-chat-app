import { Button } from '@/components/ui/button'
import React from 'react'

const Logout = () => {
    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/"; // Redirect to home page after logout
      };
    return (
    <Button onClick={handleLogout}  >Logout</Button>
  )
}

export default Logout