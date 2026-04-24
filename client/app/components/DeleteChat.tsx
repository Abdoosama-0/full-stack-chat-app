import React from "react";
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
      onClick={handleDeleteChat}

    >
      Delete Chat
    </button>
  );
};

export default DeleteChat;