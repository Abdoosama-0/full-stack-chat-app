"use client";

import React, { useEffect, useState } from "react";
import Search from "./Search";
import { useChatStore } from "../store/chatStore";
import { useSelectedUserStore } from "../store/selectedUser";
import{useUserData} from "../store/userData"
import { HiOutlineChatBubbleLeftRight, HiOutlineHashtag, HiOutlineUserCircle } from "react-icons/hi2";

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

  if (loading) return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
      <HiOutlineChatBubbleLeftRight className="size-5 shrink-0 text-primary" aria-hidden />
      Loading chats...
    </div>
  );

  return (
    <div className="space-y-4">
      {message && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {message}
        </p>
      )}

      {chatHistory.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          <p className="mb-3 font-medium text-foreground">No chats yet. Search for people to contact:</p>
          <Search />
        </div>
      ) : (
        <>
          <h2 className="flex items-center gap-2 border-t border-border/80 pt-4 text-base font-semibold tracking-tight text-foreground">
            <HiOutlineChatBubbleLeftRight className="size-5 text-primary" aria-hidden />
            Your Chats
          </h2>

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
                  className="w-full cursor-pointer rounded-2xl border border-border/80 bg-card p-4 text-left shadow-sm transition hover:border-primary/35 hover:bg-accent/30 hover:shadow-md"
                >
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <HiOutlineUserCircle className="size-4 shrink-0 text-primary" aria-hidden />
                    <span>
                      <strong>Name:</strong> {displayName || "Unknown"}
                    </span>
                  </p>

                  <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                    <HiOutlineChatBubbleLeftRight className="mt-0.5 size-4 shrink-0 text-muted-foreground/80" aria-hidden />
                    <span>
                      <strong className="text-foreground/90">Last Message:</strong>{" "}
                      {chat.messages?.[0]?.content || "No messages yet"}
                    </span>
                  </p>

                  <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <HiOutlineHashtag className="size-3.5 shrink-0" aria-hidden />
                    <span>
                      <strong className="text-foreground/80">Chat ID:</strong> {chat.id}
                    </span>
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