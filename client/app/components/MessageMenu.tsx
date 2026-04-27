import React from "react";
import { CiMenuKebab } from "react-icons/ci";
import { useUserData } from "../store/userData";

interface Props {
  messageId: number | string;
}

const MessageMenu = ({ messageId }: Props) => {
  const [clicked, setClicked] = React.useState(false);
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
        </div>
      )}
    </div>
  );
};

export default MessageMenu;