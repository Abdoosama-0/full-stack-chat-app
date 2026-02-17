import React from 'react'
import ChatHistory from './ChatHistory'

import Search from './Search'
import Conversation from './Conversation'
import Nav from './Nav'

const UserPage = () => {
  return (
    <div>
      {/**nav */}
      <Nav />
    <div className='flex justify-around items-center p-2 '>
      <div className='border-r-4 border-black'>
    
    <Search/>
    <ChatHistory />
    </div>
    <div>
      <Conversation chatId={3} />
    </div>
    </div>
    </div>
  )
}

export default UserPage