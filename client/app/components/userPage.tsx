import React from 'react'

import Search from './Search'
import Conversation from './Conversation'
import Nav from './Nav'
import PreviousChats from './PreviousChats'

const UserPage = () => {
 

  return (
    <div>
      {/**nav */}
      <Nav />
    <div className='flex justify-around items-center p-2 '>
      <div className='border-r-4 border-black'>
    
    <Search/>
    <PreviousChats />
    </div>
    <div>
      <Conversation chatId={3} />
    </div>
    </div>
    </div>
  )
}

export default UserPage