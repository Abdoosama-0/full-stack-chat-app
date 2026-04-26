import React, { useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import { useChatStore } from "../store/chatStore";
import { useUserData } from "../store/userData";
import EditGroupPhoto from "./edit/EditGroupPhoto";

type Member = {
  user: any;
  userId: number;
  username: string;
  email: string;
  avatar: string;
  isAdmin: boolean;
};

type GroupData = {
  chatId: number;
  groupName: string;
  chatPhoto?: string;
  members: Member[];
};

const GroupDetails = () => {
  const [clicked, setClicked] = useState(false);
  const [group, setGroup] = useState<GroupData | null>(null);

  const { selectedChatId } = useChatStore();
  const { token } = useUserData();

  const handleClick = async () => {
    if (!selectedChatId) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/chat/${selectedChatId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setGroup(data);
    } catch (err) {
      console.error("Error fetching chat:", err);
    }
  };

  return (
    <div>
      <CiMenuKebab
        onClick={() => {
          setClicked(true);
          handleClick();
        }}
        className="cursor-pointer"
      />

      {clicked && (
        <div
          onClick={() => setClicked(false)}
          className="fixed inset-0 flex items-center justify-center bg-black/80"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[380px] rounded-xl bg-white p-4 space-y-4"
          >
            {/* ===== HEADER ===== */}
            <h2 className="text-lg font-semibold">Group Details</h2>

            {/* ===== GROUP PHOTO ===== */}
            <div className="flex justify-center">
                <div className="border">


        
              <img
                src={
                  group?.chatPhoto ||
                  "https://static.vecteezy.com/system/resources/previews/026/019/617/non_2x/group-profile-avatar-icon-default-social-media-forum-profile-photo-vector.jpg"
                }
                className="h-20 w-20 rounded-full object-cover border"
              />             <EditGroupPhoto chatId={Number(selectedChatId) || 0} />

                     </div>
            </div>

            {/* ===== GROUP NAME ===== */}
            <p className="text-center font-semibold">
              {group?.groupName}
            </p>

            {/* ===== MEMBERS ===== */}
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {group?.members?.map((m) => (
                <div
                  key={m.userId}
                  className="flex items-center gap-3 border p-2 rounded-lg"
                >
                  <img
                    src={m.user.avatar}
                    className="h-10 w-10 rounded-full object-cover"
                  />

                  <div className="flex-1">
                    <p className="font-medium">{m.user.username}</p>
                    <p className="text-xs text-gray-500">{m.user.email}</p>
                  </div>

                  {/* ROLE */}
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      m.isAdmin
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {m.isAdmin ? "Admin" : "Member"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;