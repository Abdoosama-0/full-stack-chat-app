import React, { useState } from "react";
import { HiOutlineEllipsisVertical } from "react-icons/hi2";
import { useChatStore } from "../store/chatStore";
import { useUserData } from "../store/userData";
import EditGroupPhoto from "./edit/EditGroupPhoto";
import EditGroupName from "./edit/EditGroupName";

type Member = {
  user: any;
  userId: number;
  username: string;
  email: string;
  avatar: string;
  isAdmin: boolean;
};

type GroupData = {
  id: number;
  name: string;
  chatPhoto?: string;
  members: Member[];
};

const GroupDetails = () => {
  const [clicked, setClicked] = useState(false);
  const [group, setGroup] = useState<GroupData | null>(null);
const [isAdmin, setIsAdmin] = useState(false);

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
      setIsAdmin(data.isCurrentUserAdmin)
    } catch (err) {
      console.error("Error fetching chat:", err);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setClicked(true);
          handleClick();
        }}
        className="app-icon-btn"
        aria-label="Group details"
        title="Group details"
      >
        <HiOutlineEllipsisVertical className="size-5" aria-hidden />
      </button>

      {clicked && (
        <div
          onClick={() => setClicked(false)}
          className="app-modal-overlay"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="app-modal-panel max-h-[90vh] w-full max-w-md overflow-y-auto"
          >
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Group Details</h2>

          

            {/* ===== GROUP PHOTO ===== */}
            <div className="flex justify-center">
                <div className="">


        
              <img
                src={
                  group?.chatPhoto ||
                  "https://static.vecteezy.com/system/resources/previews/026/019/617/non_2x/group-profile-avatar-icon-default-social-media-forum-profile-photo-vector.jpg"
                }
                className="size-20 rounded-full border-2 border-border/70 object-cover shadow-sm"
              />             
              {isAdmin && (
                <EditGroupPhoto chatId={Number(selectedChatId) || 0} />
              )}
                     </div>
            </div>

            {/* ===== GROUP NAME ===== */}
           <div className="flex items-center justify-center gap-2">
            <p className="text-center font-semibold">
              {group?.name}
            </p>
             <EditGroupName chatId={Number(group?.id) || 0} chatName={group?.name ?? ""} />
            </div>
           

            {/* ===== MEMBERS ===== */}
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {group?.members?.map((m) => (
                <div
                  key={m.userId}
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/30 p-2.5 transition hover:bg-muted/50"
                >
                  <img
                    src={m.user.avatar}
                    className="size-10 rounded-full border border-border/70 object-cover"
                  />

                  <div className="flex-1">
                    <p className="font-medium">{m.user.username}</p>
                    <p className="text-xs text-muted-foreground">{m.user.email}</p>
                  </div>

                  {/* ROLE */}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      m.isAdmin
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
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