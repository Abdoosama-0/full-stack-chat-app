"use client";

import React, { useEffect, useState } from "react";
import Search from "./Search";
import { useChatStore } from "../store/chatStore";
import { useSelectedUserStore } from "../store/selectedUser";
import{useUserData} from "../store/userData"

const PreviousChats = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  const setSelectedChatId = useChatStore(
    (state) => state.setSelectedChatId
  );

  const {
    setSelectedUserId,
    setSelectedUserName,
    setSelectedUserAvatar,
  } = useSelectedUserStore();
  const { token } = useUserData();
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        setMessage("");



        const res = await fetch(
          "http://localhost:5000/api/chat/getUserChats",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
          }
        );

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
  }, []);

  if (loading) return <div>Loading chats...</div>;

  return (
    <div>
      {message && <p>{message}</p>}

      {chatHistory.length === 0 ? (
        <div>
          <p>No chats yet. Search for people to contact:</p>
          <Search />
        </div>
      ) : (
        <>
          <h1 className="border-t-4 border-black">Your Chats</h1>

          <ul className="space-y-3">
            {chatHistory.map((chat) => {
              const isPrivate = chat.isPrivate;

              const displayName = isPrivate
                ? chat.otherUser?.username
                : chat.members?.map((m: any) => m.username).join(", ");

              const displayAvatar = isPrivate
                ? chat.otherUser?.avatar
                : null;

              return (
                <li
                  key={chat.id}
                  onClick={() => {
                    setSelectedChatId(chat.id);

                    if (isPrivate) {
                      setSelectedUserId(chat.otherUser?.id || null);
                      setSelectedUserName(chat.otherUser?.username || null);
                      setSelectedUserAvatar(chat.otherUser?.avatar || null);
                    } 
                  }}
                  className="border-2 rounded-2xl p-3 cursor-pointer bg-slate-800 hover:bg-slate-700 text-white w-full"
                >
                  <p>
                    <strong>Name:</strong> {displayName || "Unknown"}
                  </p>

                  <p>
                    <strong>Last Message:</strong>{" "}
                    {chat.messages?.[0]?.content || "No messages yet"}
                  </p>

                  <p>
                    <strong>Chat ID:</strong> {chat.id}
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export default PreviousChats;