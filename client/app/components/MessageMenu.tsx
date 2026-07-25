import React from "react";
import {
  HiOutlineCheck,
  HiOutlineEllipsisVertical,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi2";
import { useUserData } from "../store/userData";

interface Props {
  messageId: number | string;
  messageContent?: string;
  messageType?: string;

  isMe?:string
}

const MessageMenu = ({ messageId, messageContent ,isMe,messageType}: Props) => {
  const [clicked, setClicked] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [newContent, setNewContent] = React.useState(messageContent || "");

  const { token } = useUserData();

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/message/${messageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Delete failed");
        return;
      }

      // 🔥 سيب السوكت يعمل التحديث
      setClicked(false);
      alert("Message deleted");

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

 const handleEdit = async () => {
  if (!newContent.trim()) {
    alert("Message cannot be empty");
    return;
  }

  try {
    const res = await fetch(
     `${process.env.NEXT_PUBLIC_API_URL}/api/chat/message/${messageId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newContent,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Edit failed");
      return;
    }
    alert("Message updated");


    // 🔥 سيب السوكت يحدث الرسالة
    setEditMode(false);
    setClicked(false);

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setClicked((prev) => !prev)}
        className="app-icon-btn"
        aria-label="Message options"
        title="Options"
      >
        <HiOutlineEllipsisVertical className="size-5" aria-hidden />
      </button>

      {clicked && (
        <div className={`absolute ${isMe=== "yes" ? "right-0": "left-0"}  z-50 mt-2 w-40 overflow-hidden rounded-xl border border-border/70 bg-popover p-1 shadow-lg`}>
          
          {messageType === "text" && (
               <button
            type="button"
            onClick={() => setEditMode(true)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-accent"
          >
            <HiOutlinePencil className="size-4 shrink-0" aria-hidden />
            Edit
          </button>
          )}
           <button
            type="button"
            onClick={handleDelete}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-destructive transition hover:bg-destructive/10"
          >

            <HiOutlineTrash className="size-4 shrink-0" aria-hidden />
            Delete 
          </button>
    
          {editMode && (

            <div onClick={()=>setEditMode(false)} className="app-modal-overlay">
            <div  onClick={(e) => e.stopPropagation()} className="app-modal-panel flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="app-input flex-1"
              />
              <button type="button" onClick={handleEdit} className="app-btn-primary shrink-0">
                <HiOutlineCheck className="size-4" aria-hidden />
                Save
              </button>

          </div>
            </div>
            
       
          )}

        </div>
      )}
    </div>
  );
};

export default MessageMenu;