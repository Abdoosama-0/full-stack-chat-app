import React from "react";
import { HiOutlineTrash } from "react-icons/hi2";
import { useUserData } from "../store/userData";

const DeleteChat = ({ chatId }: { chatId: number }) => {
      const { token } = useUserData();
    
  const handleDeleteChat = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/chat/${chatId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // مهم لو عندك auth
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete chat");
      }

      alert("Chat deleted:" + data.message);

      // هنا ممكن تعمل refresh أو update state
      // مثال:
      window.location.reload();
      // أو remove chat from UI state

    } catch (error: any) {
      console.error("Error deleting chat:", error.message);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDeleteChat}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive transition hover:bg-destructive/10"
    >
      <HiOutlineTrash className="size-4 shrink-0" aria-hidden />
      Delete Chat
    </button>
  );
};

export default DeleteChat;