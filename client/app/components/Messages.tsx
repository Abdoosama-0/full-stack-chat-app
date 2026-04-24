"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../provider/SocketProvider";
import { useSelectedUserStore } from "../store/selectedUser";
import{useUserData} from "../store/userData"
import { HiOutlinePaperAirplane } from "react-icons/hi2";
import { Span } from "next/dist/trace";

interface MessagesProps {
  chatId: string|null;
  userName: string|null;
  userId: number|null;
  avatar: string|null;

}

interface Message {
  id?: string | number;
  content: string;
  sender: string;
  createdAt: string;
}

const Messages = ({ chatId, userName, userId, avatar }: MessagesProps) => {
    const selectedUserId = useSelectedUserStore(
    (state) => state.selectedUserId
  );
  const socket = useSocket();
const { token } = useUserData();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // ===============================
  // Fetch Chat History
  // ===============================

  const fetchChatHistory = async (chatId: number) => {

    
    try {
      setLoading(true);
      setErrorMessage("");


      const res = await fetch(
        `http://localhost:5000/api/chat/${chatId}/messages`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Failed to fetch chat history");
      } else {
        // نفترض إن الباك بيرجع sender.username
        const formatted = (data.messages || []).map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender?.username || msg.sender,
          createdAt: msg.createdAt,
        }));

        setMessages(formatted);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    if (chatId && chatId !== "-1") {
      fetchChatHistory(Number(chatId));
    }
  }, [chatId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(), 
          content: data.content,
          sender: data.from,
          createdAt: data.createdAt,
        },
      ]);
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [socket]);

  // ===============================
  // Send Message
  // ===============================

  const sendMessage = () => {
    alert("send message")
    if (!socket ) {
      alert("No socket connection");
      return};
 if (!newMessage.trim()) {
  alert("Message cannot be empty");
  return};
    

    socket.emit("send-message", {
      toUsername: userName,
      content: newMessage,
    });

    setNewMessage("");
  };

  // ===============================
  // UI
  // ===============================

  return (
    <div className="space-y-4 p-1 sm:p-2">
      <div className="space-y-1 border-b border-border/60 pb-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Conversation with {userName}
        </h2>
        <h2 className="text-xs font-mono font-normal text-muted-foreground">
          {selectedUserId}
        </h2>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">Loading...</p>
      )}
      {errorMessage && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <div className="h-[min(52vh,360px)] overflow-y-auto rounded-2xl border border-border/70 bg-muted/25 p-4 shadow-inner">
        <div className="space-y-3">
{messages.map((msg, index) => (
  <div
    key={msg.id ?? index}
    className={`rounded-xl w-fit border border-border/40 bg-card/90 px-3 py-2.5 text-sm shadow-sm ${
      msg.sender === userName ? "ml-auto text-right" : "mr-auto text-left"
    }`}
  >
    <span dir={msg.sender === userName ? "rtl" : "ltr"}>
      {msg.content}
    </span>
  </div>
))}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-4 text-sm shadow-sm outline-none ring-primary/15 transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4"
        />

        <button
          type="button"
          onClick={sendMessage}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet-500 px-5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:from-primary/90 hover:to-violet-500/90 sm:px-6"
        >
          <HiOutlinePaperAirplane className="size-4" aria-hidden />
          Send
        </button>
      </div>
    </div>
  );
};

export default Messages;
