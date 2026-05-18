"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../provider/SocketProvider";
import { useUserData } from "../store/userData";
import { useChatStore } from "../store/chatStore";
import { HiOutlinePaperAirplane } from "react-icons/hi2";
import MessageMenu from "./MessageMenu";
import { useSelectedUserStore } from "../store/selectedUser";
import { FaReply } from "react-icons/fa";
import SendOptions from "./SendOptions";

interface MessagesProps {
  chatId: string | null;
  userName: string | null;
  userId: number | null;
  avatar: string | null;
}

interface Message {
  id?: string | number;
  content: string;
  sender: string;
  createdAt: string;
        messageType?: string;

  replyOn?: {
    id: number;
    content: string;
    senderId?: number;
  } | null;
}

const Messages = ({ chatId, userName }: MessagesProps) => {
  const socket = useSocket();
  const { token, userName: myUsername } = useUserData();
  const isGroup = useChatStore((state) => state.isGroup);
  const{isCurrentUserAdmin} = useSelectedUserStore();
const [replyToMessage, setReplyToMessage] = useState<{
  id: number;
  content: string;
  sender?: string;
} | null>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(null);
const formatMessageTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    // ⏰ time only (English format)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // 📅 full date + time (English format)
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
  // ================= FETCH CHAT HISTORY =================
  const fetchChatHistory = async (chatId: number) => {
    try {
      
      setLoading(true);
      setErrorMessage("");
      if(chatId === -1){
        setMessages([]);
        setLoading(false);
        return;
      }

      const res = await fetch(
        `http://localhost:5000/api/chat/${chatId}/messages`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
              setMessages([]);

        setErrorMessage(data.message || "Failed to fetch chat history");

        return;
      }

      const formatted = (data.messages || []).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        messageType:msg.messageType,
        sender: msg.sender?.username || msg.sender,
        createdAt: msg.createdAt,
        replyOn: msg.replyOn
          ? {
              id: msg.replyOn.id,
              content: msg.replyOn.content,
              senderId: msg.replyOn.senderId,
            }
          : null,
      }));

      setMessages(formatted);
      setLastSeenMessageId(data.lastSeenMessageId);

    } catch (err) {
      setErrorMessage("Error loading messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
   
      fetchChatHistory(Number(chatId));
    
  }, [chatId]);


  //===========emit("mark-chat-seen"==================
useEffect(() => {
  if (!socket || !chatId) return;

  socket.emit("mark-chat-seen", {
    chatId: Number(chatId),
  });
}, [chatId, socket]);
  // ================= new Message =================
useEffect(() => {
  if (!socket || !chatId) return;

  const handleNewMessage = (data: any) => {
    // 1️⃣ ضيف الرسالة
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        content: data.content,
        messageType:data.messageType,
        sender: data.from,
        createdAt: data.createdAt,
        replyOn: data.replyOn,
      },
    ]);

    // 2️⃣ 🔥 اعمل seen بشرطين
    const isSameChat = Number(data.chatId) === Number(chatId);
    const isFromMe = data.from === myUsername;

    if (isSameChat && !isFromMe) {
      socket.emit("mark-chat-seen", {
        chatId: Number(chatId),
      });
    }
  };
  



  socket.on("new-message", handleNewMessage);


  //=====================edit message========================
  socket.on("message-edited", (data) => {
  setMessages((prev) =>
    prev.map((msg) =>
      Number(msg.id) === Number(data.messageId)
        ? { ...msg, content: data.content }
        : msg
    )
  );
});
  // ================= DELETE MESSAGE =================
 const handleMessageDeleted = (data: {
    messageId: string | number;
    chatId: string | number;
  }) => {
    setMessages((prev) =>
      prev.filter(
        (msg) => Number(msg.id) !== Number(data.messageId)
      )
    );
  };

  socket.on("message-deleted", handleMessageDeleted);


  return () => {
    socket.off("new-message", handleNewMessage);
    socket.off("message-deleted", handleMessageDeleted);
  };


}, [socket, chatId, myUsername]);

  // ================= SEND MESSAGE =================
const sendMessage = () => {
  if (!socket) return;

  const finalContent = imageUrl ? imageUrl : newMessage.trim();

  if (!finalContent) return;

  const basePayload = {
    content: finalContent,
    replyOnId: replyToMessage?.id,
    messageType: imageUrl ? "image" : "text", // 👈 add this
  };

  if (!isGroup) {
    socket.emit("send-message", {
      type: "private",
      toUsername: userName,
      ...basePayload,
    });
  } else {
    socket.emit("send-message", {
      type: "group",
      chatId: Number(chatId),
      ...basePayload,
    });
  }

  setNewMessage("");
  setReplyToMessage(null);
  setImageUrl(null); // 👈 مهم جدًا بعد الإرسال
};
  // ================= UI =================
  return (
    <div className="space-y-4 p-2">
      <div className="border-b pb-3">
        <h2 className="text-lg font-semibold">
          Conversation with {userName}
       
        </h2>
      </div>

      {loading && <p>Loading...</p>}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      {/* ================= MESSAGES ================= */}
      <div className="h-[52vh] overflow-y-auto border rounded-xl p-3 space-y-3">
        {messages.map((msg, index) => {
  const isMe = msg.sender === myUsername;

const time = formatMessageTime(msg.createdAt);

  return (
    <div
      key={msg.id ?? index}
      className={`flex flex-col w-full ${
        isMe ? "items-end" : "items-start"
      }`}
    >
      {/* ⏰ time فوق الرسالة */}
      <span className="text-[10px] text-gray-400 mb-1">
        {time}
      </span>

      {isGroup && !isMe && (
        <span className="text-xs text-gray-500 mb-1">
          {msg.sender}
        </span>
      )}
      <div>
      {msg.replyOn && (
        <div className="border-l-2 border-gray-400 pl-2 mb-1">
       
          <p className="text-sm italic text-gray-600">
            {msg.replyOn.content}
          </p>
        </div>
      )}
      </div>

<div
  className={`px-3 py-2 rounded-xl text-sm max-w-[70%] ${
    isMe ? "bg-primary text-white" : "bg-gray-200 text-black"
  }`}
>
  {msg.messageType === "image" ? (
    <img
      src={msg.content}
      alt="image"
      className="rounded-lg max-w-[250px] object-cover"
    />
  ) : (
    msg.content
  )}
</div>
      <div className="flex">  

      <button onClick={() => setReplyToMessage({ id: Number(msg.id), content: msg.content, sender: msg.sender })}><FaReply />
      
      </button>
      {!isGroup && msg.sender === myUsername && (
        
        msg.id && <MessageMenu messageId={msg.id} messageContent={msg.content} isMe={isMe?"yes":"no"} />
      )}    


        {
        isGroup &&  isCurrentUserAdmin && 
       (msg.id && <MessageMenu messageId={msg.id}  isMe={isMe?"yes":"no"} />) 
       ||
          isGroup &&   msg.sender === myUsername && 
       (msg.id && <MessageMenu messageId={msg.id} isMe={isMe?"yes":"no"}/>) 

      }  
      
      
      </div>
      </div>
  );
})}
      </div>
      {imageUrl && (
  <div className="mb-2 relative w-fit">
    <img
      src={imageUrl}
      className="max-h-[150px] rounded-lg border"
    />

    <button
      onClick={() => setImageUrl(null)}
      className="absolute top-1 right-1 bg-red-500 text-white px-2 rounded"
    >
      X
    </button>
  </div>
)}

      {/* ================= INPUT ================= */}
      {replyToMessage !== null && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-500">
            Replying to message: {replyToMessage.content} {replyToMessage.sender && `from ${replyToMessage.sender}`}
          </span>
          <button
            onClick={() => setReplyToMessage(null)}
            className="text-red-500 hover:text-red-700"
          >
            Cancel
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input
                   onKeyDown={(e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  }}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Type message..."
        />
<SendOptions setImageUrl={setImageUrl}/>
        <button
          onClick={sendMessage}

          className="app-btn-primary text-white px-4 rounded-lg"
        >
          <HiOutlinePaperAirplane />
        </button>
      </div>
    </div>
  );
};

export default Messages;