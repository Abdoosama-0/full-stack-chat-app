"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../provider/SocketProvider";
import { useUserData } from "../store/userData";
import { useChatStore } from "../store/chatStore";
import { HiOutlinePaperAirplane } from "react-icons/hi2";

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
}

const Messages = ({ chatId, userName }: MessagesProps) => {
  const socket = useSocket();
  const { token, userName: myUsername } = useUserData();
  const isGroup = useChatStore((state) => state.isGroup);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(null);

  // ================= FETCH CHAT HISTORY =================
  const fetchChatHistory = async (chatId: number) => {
    try {
      setLoading(true);
      setErrorMessage("");

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
        setErrorMessage(data.message || "Failed to fetch chat history");
        return;
      }

      const formatted = (data.messages || []).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender?.username || msg.sender,
        createdAt: msg.createdAt,
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
    if (chatId && chatId !== "-1") {
      fetchChatHistory(Number(chatId));
    }
  }, [chatId]);


  //===========emit("mark-chat-seen"==================
useEffect(() => {
  if (!socket || !chatId) return;

  socket.emit("mark-chat-seen", {
    chatId: Number(chatId),
  });
}, [chatId, socket]);
  // ================= SOCKET =================
useEffect(() => {
  if (!socket || !chatId) return;

  const handleNewMessage = (data: any) => {
    // 1️⃣ ضيف الرسالة
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        content: data.content,
        sender: data.from,
        createdAt: data.createdAt,
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

  return () => {
    socket.off("new-message", handleNewMessage);
  };
}, [socket, chatId, myUsername]);

  // ================= SEND MESSAGE =================
  const sendMessage = () => {
    if (!socket || !newMessage.trim()) return;

    if (!isGroup) {
      socket.emit("send-message", {
        type: "private",
        toUsername: userName,
        content: newMessage,
      });
    } else {
      socket.emit("send-message", {
        type: "group",
        chatId: Number(chatId),
        content: newMessage,
      });
    }

    setNewMessage("");
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

          return (
            <div
              key={msg.id ?? index}
              className={`flex flex-col w-full ${
                isMe ? "items-end" : "items-start"
              }`}
            >
              {isGroup && !isMe && (
                <span className="text-xs text-gray-500 mb-1">
                  {msg.sender}
                </span>
              )}

              <div
                className={`px-3 py-2 rounded-xl text-sm max-w-[70%] ${
                  isMe
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= INPUT ================= */}
      <div className="flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Type message..."
        />

        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 rounded-lg"
        >
          <HiOutlinePaperAirplane />
        </button>
      </div>
    </div>
  );
};

export default Messages;