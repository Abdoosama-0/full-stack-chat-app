"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../provider/SocketProvider";
import { useUserData } from "../store/userData";
import { useSelectedUserStore } from "../store/selectedUser";
import { useChatStore } from "../store/chatStore";
import ChatMenu from "./ChatMenu";
import ImagePreview from "./ImagePreview";

type Message = {
  content: string;
  createdAt: string;
  sender?: { username: string };
};

type Chat = {
  chatPhoto: any;
  lastSeenMessageId: any;
  lastMessage: any;
  name: any;
  isGroup: any;
  id: number;
   isCurrentUserAdmin?: boolean;



  isUpToDate?: boolean; // 👈 الجديد

  isPrivate?: boolean;
  otherUser?: {
    id?: number;
    username: string;
    avatar?: string;
  } | null;

  members?: {
    userId: number;
    username: string;
    avatar?: string;
  }[];

  messages?: Message[];
};

const ChatList = () => {
  const [preview, setPreview] = useState<string | null>(null);
const { selectedChatId } = useChatStore();
  const previewPhoto = (url: string | undefined) => {
    setPreview(url ? url : null);
  };

  const socket = useSocket();
  const { token } = useUserData();

  const { setSelectedChatId, setIsGroup } = useChatStore();

  const {
    setSelectedUserId,
    setSelectedUserName,
    setSelectedUserAvatar,
    setIsCurrentUserAdmin
  } = useSelectedUserStore();

  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= FETCH CHATS =================
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        setError("");

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
          setError(data.message || "Failed to fetch chats");
        } else {
          setChats(data.chats || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchChats();
  }, [token]);

  // ================= SOCKET =================
  const handleNewChat = (data: any) => {
  setChats((prev) => {
    const exists = prev.some((c) => c.id === data.id);
    if (exists) return prev;

    return [data, ...prev];
  });
};

socket?.on("new-chat", handleNewChat);
//============useEffect socit==================
useEffect(() => {
  if (!socket) return;


  //======================   handleNewChat 
  const handleNewChat = (data: any) => {
  setChats((prev) => {
    const exists = prev.some((c) => c.id === data.id);
    if (exists) return prev;

    return [
      {
        ...data,
        lastMessage: data.messages?.[0] || null,
      },
      ...prev,
    ];
  });
};
socket.on("new-chat", handleNewChat);
  // ================= CHAT UPDATED =================
  const handleUpdate = (data: any) => {
    setChats((prev) => {
      const updated = prev.map((chat) => {
        if (Number(chat.id) === Number(data.chatId)) {
          return {
            ...chat,
            lastMessage: {
              ...data.lastMessage,
              id: String(data.lastMessage.id),
            },
            lastSeenMessageId: data.lastSeenMessageId
              ? String(data.lastSeenMessageId)
              : chat.lastSeenMessageId,
          };
        }
        return chat;
      });
      

      const moved = updated.find((c) => c.id === data.chatId);
      const rest = updated.filter((c) => c.id !== data.chatId);

      return moved ? [moved, ...rest] : updated;
    });
  };


  // ================= CHAT SEEN UPDATED =================
  const handleSeenUpdate = (data: any) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (Number(chat.id) === Number(data.chatId)) {
          return {
            ...chat,
            lastSeenMessageId: String(data.lastSeenMessageId),
          };
        }
        return chat;
      })
    );
  };
  socket.on("chat-updated", handleUpdate);
  socket.on("chat-seen-updated", handleSeenUpdate);
// ================= CHAT SEEN UPDATED =================

 const handleSeenUpdate2 = (data: any) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (Number(chat.id) === Number(data.chatId)) {
          return {
            ...chat,
            lastSeenMessageId: data.lastSeenMessageId,
          };
        }
        return chat;
      })
    );
  };

  socket.on("chat-seen-updated", handleSeenUpdate2);


  return () => {
    socket.off("chat-updated", handleUpdate);
    socket.off("chat-seen-updated", handleSeenUpdate);
        socket.off("chat-seen-updated", handleSeenUpdate);
          socket.off("new-chat", handleNewChat);


  };

  
}, [socket]);

  // ================= HELPER =================
  const getChatUser = (chat: Chat) => {
    if (chat.otherUser) return chat.otherUser;

    const other = chat.members?.[0];

    return {
      id: other?.userId,
      username: other?.username,
      avatar: other?.avatar,
    };
  };

  // ================= UI =================
  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 border-t border-border/70 pt-4 text-base font-semibold tracking-tight text-foreground">
        Your Chats
      </h2>

      {loading && (
        <p className="rounded-lg border border-border/70 bg-muted/35 px-3 py-2 text-sm text-muted-foreground">
          Loading...
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {chats.length === 0 && !loading && (
        <p className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          No chats yet
        </p>
      )}

      <div className="space-y-2">
        {chats.map((chat) => {
          const lastMessage = chat.lastMessage;

          const user = chat.isGroup ? null : getChatUser(chat);

          const displayName = chat.isGroup
            ? chat.name
            : user?.username || "Unknown";

          const displayAvatar = chat.isGroup ? chat.chatPhoto : user?.avatar;



          return (
            <div
              key={chat.id}
              onClick={() => {
                setSelectedChatId(String(chat.id));
                setIsGroup(!!chat.isGroup);

                if (!chat.isGroup) {
                  setSelectedUserId(user?.id ?? null);
                  setSelectedUserName(user?.username ?? null);
                  setSelectedUserAvatar(user?.avatar ?? null);
                } else {
                  setSelectedUserId(null);
                  setSelectedUserName(chat.name ?? null);
                  setSelectedUserAvatar(chat.chatPhoto ?? null);
                  setIsCurrentUserAdmin?.(!!chat.isCurrentUserAdmin);
                }
              }}
      className={`group flex cursor-pointer items-start gap-3 rounded-2xl border p-3 shadow-sm transition hover:border-primary/35 hover:shadow-md
${
  chat.lastMessage?.id == null
    ? "border-border/75 bg-card/90"
    : Number(chat.lastMessage?.id) === Number(chat.lastSeenMessageId)
    ? "border-border/75 bg-card/90"
    : "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
}`}
            >
              {/* Avatar */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (displayAvatar) previewPhoto(displayAvatar);
                }}
                className="mt-0.5 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-muted/70"
              >
                {chat.isGroup ? (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-muted-foreground">
                   <img
                      src={displayAvatar}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  displayAvatar && (
                    <img
                      src={displayAvatar}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  )
                )}

                <ImagePreview
                  imageUrl={preview}
                  onClose={() => setPreview(null)}
                />
              </button>

              {/* Content */}
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {displayName}
                </p>

                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {lastMessage?.content || "No messages yet"}
                </p>
              </div>

              {/* Menu */}
              <div onClick={(e) => e.stopPropagation()}>
                {!chat.isGroup && <ChatMenu chatId={chat.id} />}
           
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;