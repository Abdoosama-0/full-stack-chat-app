"use client";

import React, { useEffect, useState } from "react";
import Chat from "./Messages";
import { useChatStore } from "../store/chatStore";
import { useSelectedUserStore } from "../store/selectedUser";
import{useUserData} from "../store/userData"
import { HiOutlineMagnifyingGlass, HiOutlineUser } from "react-icons/hi2";


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
    <div className="w-full max-w-md space-y-3">
      <div className="relative">
        <HiOutlineMagnifyingGlass
          className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people..."
          className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm shadow-sm outline-none ring-primary/20 transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4"
        />
      </div>

      {loading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-block size-3.5 animate-pulse rounded-full bg-primary/60" aria-hidden />
          Searching...
        </p>
      )}
      {message && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
          {message}
        </p>
      )}

      <ul className="mt-1 max-h-64 space-y-1 overflow-y-auto rounded-xl border border-border/60 bg-muted/20 p-1">
        {users.map((user) => (
          <li onClick={() => handleUserClick(user)}
            key={user.id}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-primary/10 hover:text-primary"
          >
            <HiOutlineUser className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            {user.username}
          </li>
        ))}
      </ul>
      {/* {clickedUser &&<Chat user={clickedUser}/> } */}
    </div>
  );
};

export default Search;
