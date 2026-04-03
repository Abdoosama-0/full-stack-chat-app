"use client";

import { use, useEffect, useState } from "react";
import { useSocket } from "../provider/SocketProvider";
import { useSelectedUserStore } from "../store/selectedUser";
import{useUserData} from "../store/userData"

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
    <div style={{ padding: "20px" }}>
      <h2>Conversation with {userName}</h2>
      <h2>{selectedUserId}</h2>

      {loading && <p>Loading...</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "auto",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <div key={msg.id ?? index} style={{ marginBottom: "5px" }}>
            <b>{msg.sender}</b>: {msg.content}
          </div>
        ))}
      </div>

      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
        style={{ width: "80%", padding: "5px" }}
      />

      <button
        onClick={sendMessage}
        style={{ padding: "6px 10px", marginLeft: "5px" }}
      >
        Send
      </button>
    </div>
  );
};

export default Messages;
