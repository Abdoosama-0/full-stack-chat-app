import React from 'react'
import { useChatStore } from "../store/chatStore";
import { useSelectedUserStore } from "../store/selectedUser";
import Messages from './Messages';
import { HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';

interface ConversationProps {
  chatId: number;
}
const Conversation = (props: ConversationProps) => {
  const selectedChatId = useChatStore(
    (state) => state.selectedChatId
  );
  const selectedUserName = useSelectedUserStore(
    (state) => state.selectedUserName
  );
  const selectedUserId = useSelectedUserStore(
    (state) => state.selectedUserId
  );
  
  if (selectedChatId == "-1") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-foreground">
          <HiOutlineChatBubbleLeftRight className="size-5 text-primary" aria-hidden />
          <span>start Conversation with {selectedUserName}</span>
        </div>
        <Messages chatId={"-1"} userName={selectedUserName} userId={selectedUserId} avatar={""} />
      </div>
    );
  } else if (selectedChatId !== null && selectedChatId !== "-1") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm font-semibold text-foreground">
          <HiOutlineChatBubbleLeftRight className="size-5 text-primary" aria-hidden />
          <span>Current Chat: {selectedChatId}</span>
        </div>
        <Messages chatId={selectedChatId} userName={selectedUserName} userId={selectedUserId} avatar={""} />
      </div>
    );
  } else {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
        <HiOutlineChatBubbleLeftRight className="size-10 text-muted-foreground/60" aria-hidden />
        <p className="text-sm font-medium text-muted-foreground">No chat selected</p>
      </div>
    );
  }

}

export default Conversation