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
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/group/${chatId}/members`,
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
        className="app-btn-secondary text-xs sm:text-sm"
      >
        Chat members
      </button>

      {clicked && (
        <div
          onClick={() => setClicked(false)}
          className="app-modal-overlay z-40"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="app-modal-panel max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Group Members
            </h2>

            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members</p>
            ) : (
              <div className="space-y-2">
                {members.map((m) => (
                  <div
                    key={m.userId}
                    className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/30 p-2.5"
                  >
                    {m.avatar ? (
                      <img
                        src={m.avatar}
                        className="size-9 cursor-zoom-in rounded-full border border-border/70 object-cover"
                        onClick={() => previewPhoto(m.avatar)}
                      />
                    ) : (
                      <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                        {m.username[0]}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {m.username}
                      </p>

                      {m.isAdmin && (
                        <p className="text-xs font-medium text-primary">
                          Admin
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