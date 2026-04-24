import React from 'react'

import Search from './Search'
import Conversation from './Conversation'
import ChatList from './ChatList'

const UserPage = () => {
 

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:gap-8 lg:px-8">
        <aside className="w-full shrink-0 space-y-5 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm lg:max-w-md">
          <Search />
          <ChatList />
        </aside>
        <main className="min-h-[65vh] flex-1 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm backdrop-blur-sm sm:p-6">
          <Conversation chatId={3} />
        </main>
      </div>
    </div>
  )
}

export default UserPage