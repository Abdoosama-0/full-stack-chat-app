import React from 'react'
import { useChatStore } from "../store/chatStore";
import { useSelectedUserStore } from "../store/selectedUser";
import Chat from './Messages';
import Messages from './Messages';

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
<>
    <div>start Conversation with {selectedUserName}</div>
    <Messages chatId={"-1"} userName={selectedUserName} userId={selectedUserId} avatar={""}/>

  </>
  )} else if (selectedChatId !== null && selectedChatId !== "-1") {
    return (
      <>
      <div>Current Chat: {selectedChatId}</div>
          <Messages chatId={selectedChatId} userName={selectedUserName} userId={selectedUserId} avatar={""}/>

      </>
    )}
    else {
      return <div>No chat selected</div>;

    }

}

export default Conversation