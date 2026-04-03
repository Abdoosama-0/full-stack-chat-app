"use client";

import React, { useEffect, useState } from "react";
import Chat from "./Messages";
import { useChatStore } from "../store/chatStore";
import { useSelectedUserStore } from "../store/selectedUser";
import{useUserData} from "../store/userData"


const Search = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [clickedUser, setClickedUser] = useState<any | null>(null);  
  const [chatId, setChatId] = useState<number | null>(null);
  const setSelectedChatId = useChatStore(
    (state) => state.setSelectedChatId
  );
  const setSelectedUserId = useSelectedUserStore(
    (state) => state.setSelectedUserId
  );
  const setSelectedUserName = useSelectedUserStore(
    (state) => state.setSelectedUserName
  );
  const setSelectedUserAvatar = useSelectedUserStore(
    (state) => state.setSelectedUserAvatar
  );

  //=========================
  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }
//get users from backend based on query
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setMessage("");
  const { token } = useUserData();

        const res = await fetch(
          `http://localhost:5000/api/user/search?q=${query}`,
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
          setMessage(data.message || "Search failed");
        } else {
          setUsers(data.users || data); // حسب شكل الريسبونس
        }
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [query]); // 👈 كل ما query تتغير يتعمل fetch
//=========================

 const fetchChatData = async (user: any) => {
      try {
        setLoading(true);
        setMessage("");

        const token = localStorage.getItem("token") || "";
        const res = await fetch(
          `http://localhost:5000/api/chat/getChatData/${user?.id}`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
            setSelectedUserId(user.id);
            setSelectedUserName(user.username);
            setSelectedUserAvatar(user.avatar);
         

          setMessage(data.message || "No chat found");
                     setSelectedChatId("-1")

        } else {

           setSelectedChatId(data.chatId)
            setSelectedUserId(user.id);
            setSelectedUserName(user.username);
            setSelectedUserAvatar(user.avatar);
          
        }
      } catch (err) {
        setMessage(
          err instanceof Error ? err.message : "An error occurred"
        );
      } finally {
        setLoading(false);
      }
    };
    const handleUserClick = (user: any) => {
      setClickedUser(user);
      fetchChatData(user);
    }
  return (
    <div className="max-w-sm">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search people..."
        className="border p-2 rounded w-full"
      />

      {loading && <p>Searching...</p>}
      {message && <p>{message}</p>}

      <ul className="mt-2">
        {users.map((user) => (
          <li onClick={() => handleUserClick(user)}
            key={user.id}
            className="p-2 border-b cursor-pointer hover:bg-gray-100"
          >
            {user.username}
          </li>
        ))}
      </ul>
      {/* {clickedUser &&<Chat user={clickedUser}/> } */}
    </div>
  );
};

export default Search;
