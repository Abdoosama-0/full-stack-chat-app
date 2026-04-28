import React from "react";
import { CiMenuKebab } from "react-icons/ci";
import { useUserData } from "../store/userData";

interface Props {
  messageId: number | string;
  messageContent?: string;
}

const MessageMenu = ({ messageId, messageContent }: Props) => {
  const [clicked, setClicked] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [newContent, setNewContent] = React.useState(messageContent || "");

  const { token } = useUserData();

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/chat/message/${messageId}`,
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
      `http://localhost:5000/api/chat/message/${messageId}`,
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
      <CiMenuKebab
        onClick={() => setClicked((prev) => !prev)}
        className="cursor-pointer"
      />

      {clicked && (
        <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-50">
          <button
            onClick={handleDelete}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Delete
          </button>
    
          <button
            onClick={() => setEditMode(true)}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Edit
          </button>
          {editMode && (

            <div onClick={()=>setEditMode(false)} className=" fixed inset-0 flex items-center justify-center bg-black/90">
            <div  onClick={(e) => e.stopPropagation()} className="p-2 bg-white rounded">
              <input
                type="text"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="border rounded-md px-2 py-1"
              />
              <button onClick={handleEdit} className="ml-2 bg-blue-500 text-white px-3 py-1 rounded">
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