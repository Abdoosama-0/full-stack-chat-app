import React from 'react'
import { useChatStore } from "../store/chatStore";

interface ConversationProps {
  chatId: number;
}
const Conversation = (props: ConversationProps) => {
  const selectedChatId = useChatStore(
    (state) => state.selectedChatId
  );
  
    return (
    <div>Current Chat: {selectedChatId}</div>
  )
}

export default Conversation