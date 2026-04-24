import React, { useEffect, useState } from 'react'
import { useChatStore } from "../store/chatStore";
import { useSelectedUserStore } from "../store/selectedUser";
import Messages from './Messages';
import { HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import ImagePreview from './ImagePreview';

interface ConversationProps {
  chatId: number;
}
const Conversation = (props: ConversationProps) => {

  const [preview, setPreview] = useState<string | null>(null);

  const previewPhoto = (url: string) => {
    setPreview(url);
  };
  const selectedChatId = useChatStore(
    (state) => state.selectedChatId
  );
  const selectedUserName = useSelectedUserStore(
    (state) => state.selectedUserName
  );
  const selectedUserId = useSelectedUserStore(
    (state) => state.selectedUserId
  );
  const selectedUserAvatar = useSelectedUserStore(
    (state) => state.selectedUserAvatar
  );

  
  if (selectedChatId == "-1") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-foreground">
          <HiOutlineChatBubbleLeftRight className="size-5 text-primary" aria-hidden />
          <div className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-muted/60">
            {selectedUserAvatar ? (
              <img
                src={selectedUserAvatar}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold">
                {selectedUserName?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span>Start conversation with {selectedUserName}</span>
        </div>
        <Messages chatId={"-1"} userName={selectedUserName} userId={selectedUserId} avatar={""} />
      </div>
    );
  } else if (selectedChatId !== null && selectedChatId !== "-1") {
 
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-muted/35 px-4 py-3 text-sm text-foreground">
          <HiOutlineChatBubbleLeftRight className="size-5 text-primary" aria-hidden />
          <button
            type="button"
            onClick={() => selectedUserAvatar && previewPhoto(selectedUserAvatar)}
            className="group flex size-10 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-muted/70 transition hover:border-primary/40"
          >
            {selectedUserAvatar&& (
              <img
                src={selectedUserAvatar}
                alt="avatar"
                className="h-full w-full cursor-zoom-in object-cover"
              />
            ) }
             <ImagePreview
          imageUrl={preview}
          onClose={() => setPreview(null)}
        />
          </button>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-medium">Current Chat: {selectedChatId}</span>
            <span className="text-muted-foreground">Chatting with: {selectedUserName}</span>
          </div>
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