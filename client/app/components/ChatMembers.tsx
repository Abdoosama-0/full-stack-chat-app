import React, { useState } from "react";
import { useUserData } from "../store/userData";
import ImagePreview from "./ImagePreview";

type Props = {
  chatId: number;
};

type Member = {
  userId: number;
  username: string;
  avatar?: string;
  isAdmin: boolean;
};

const ChatMembers = ({ chatId }: Props) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [clicked, setClicked] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const { token } = useUserData();

  // 🚀 open image preview
  const previewPhoto = (url?: string) => {
    if (!url) return;
    setPreview(url);
  };

  // 🚀 fetch members
  const fetchMembers = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/chat/group/${chatId}/members`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMembers(data.members);
      } else {
        alert(data.message || "Error fetching members");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // 🚀 open modal
  const openModal = () => {
    setClicked(true);
    fetchMembers();
  };

  return (
    <div>
      <button
        onClick={openModal}
        className="rounded bg-blue-500 px-4 py-2 text-white"
      >
        chat members
      </button>

      {clicked && (
        <div
          onClick={() => setClicked(false)}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[400px] rounded-xl bg-white p-4 space-y-4"
          >
            <h2 className="text-lg font-bold">Group Members</h2>

            {members.length === 0 ? (
              <p className="text-sm text-gray-500">No members</p>
            ) : (
              <div className="space-y-2">
                {members.map((m) => (
                  <div
                    key={m.userId}
                    className="flex items-center gap-3 rounded-lg border p-2"
                  >
                    {m.avatar ? (
                      <img
                        src={m.avatar}
                        className="h-8 w-8 cursor-zoom-in rounded-full"
                        onClick={() => previewPhoto(m.avatar)}
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                        {m.username[0]}
                      </div>
                    )}

                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {m.username}
                      </p>

                      {m.isAdmin && (
                        <p className="text-xs text-blue-500">
                          admin
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ Image Preview (OUTSIDE MAP) */}
      <ImagePreview
        imageUrl={preview}
        onClose={() => setPreview(null)}
      />
    </div>
  );
};

export default ChatMembers;