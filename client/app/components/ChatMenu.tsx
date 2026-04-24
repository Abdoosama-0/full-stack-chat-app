import React from 'react'
import { CiMenuKebab } from 'react-icons/ci'
import DeleteChat from './DeleteChat';

const ChatMenu = ({ chatId }: { chatId: number }) => {
  const [clicked, setClicked] = React.useState(false);  
  return (
    <div className="relative flex items-center justify-center">
      <button
        type="button"
        onClick={() => setClicked((prev) => !prev)}
        className="inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition hover:border-primary/40 hover:bg-accent/50 hover:text-foreground"
        aria-label="Open chat menu"
      >
        <CiMenuKebab size={22} />
      </button>

      {clicked && (
        <div className="absolute right-0 top-11 z-20 min-w-[10rem] rounded-xl border border-border/70 bg-popover p-2 shadow-lg">
          <DeleteChat chatId={chatId} />
        </div>
      )}
    </div>
  )
}

export default ChatMenu