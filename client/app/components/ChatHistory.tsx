"use client";


import React, { useEffect, useState } from "react";
import Search from "./Search";
import { useChatStore } from "../store/chatStore";

const ChatHistory = () => {

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
 
 const setSelectedChatId = useChatStore(
    (state) => state.setSelectedChatId
  );
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        setMessage("");

        const token = localStorage.getItem("token") || "";

        const res = await fetch("http://localhost:5000/api/chat/getUserChats", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Failed to fetch chat history");
        } else {
           
          setChatHistory(data.chats || []);
        }
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []); // [] عشان ينفذ مرة واحدة أول ما الصفحة تحمل

  if (loading) return <div>Loading chats...</div>;

  return (
<div>
    {message && <p>{message}</p>}

    {chatHistory.length === 0 ? (
      // لو مفيش شاتس، نعرض search bar
      <div>
        <p>No chats yet. Search for people to contact:</p>
        
      </div>
    ) : (
      <>
      
  
      <ul>
        <h1 className="border-t-4 border-black  ">your chats</h1>
        {chatHistory.map((chat) => (
          <li onClick={()=>setSelectedChatId(chat.id)} className="border-2 rounded-2xl p-2 cursor-pointer bg-slate-800 hover:bg-slate-700 text-white w-fit" key={chat.id}>
            Members: {chat.members.map((m: any) => m.username).join(", ")}
            <br />
            Last Message: {chat.messages[0]?.content || "No messages yet"}
            <br />
            chatId: {chat.id}


   
          </li>
        ))}
      </ul>
      
      </>
    )}
  </div>
  );
};

export default ChatHistory;
