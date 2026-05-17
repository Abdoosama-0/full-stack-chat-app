import React from 'react'

import Search from './Search'
import Conversation from './Conversation'
import ChatList from './ChatList'
import CreateGroup from './CreateGroup'

const UserPage = () => {
 

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:flex-row lg:items-stretch lg:gap-6 lg:px-8">
        <aside className="app-card flex w-full shrink-0 flex-col gap-5 p-4 sm:p-5 lg:max-w-sm xl:max-w-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Messages
            </h2>
            <CreateGroup />
          </div>
          <Search />
          <ChatList />
        </aside>
        <main className="app-card flex min-h-[min(70vh,32rem)] flex-1 flex-col p-4 sm:min-h-[65vh] sm:p-6">
          <Conversation chatId={3} />
        </main>
      </div>
    </div>
  )
}

export default UserPage