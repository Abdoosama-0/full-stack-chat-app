"use client";

import React, { useState } from "react";
import {
  HiOutlineCheck,
  HiOutlineUserGroup,
  HiOutlineXMark,
} from "react-icons/hi2";
import { useUserData } from "../store/userData";
import SearchForGroup from "./SearchForGroup";

const CreateGroup = () => {
  const [clicked, setClicked] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [usernames, setUsernames] = useState<string[]>([]);
  const [groupImage, setGroupImage] = useState<File | null>(null);

  const { token } = useUserData();

  // ➕ إضافة username
  const addUser = () => {
    if (!usernameInput.trim()) return;

    if (usernames.includes(usernameInput.trim())) return;

    setUsernames([...usernames, usernameInput.trim()]);
    setUsernameInput("");
  };

  // ❌ حذف user
  const removeUser = (name: string) => {
    setUsernames(usernames.filter((u) => u !== name));
  };

  // 🚀 submit
  const handleSubmit = async () => {
    if (!groupName.trim()) return;
    if (usernames.length === 0) return;

    try {
      const formData = new FormData();

      formData.append("name", groupName);
      formData.append("usernames", JSON.stringify(usernames));

      if (groupImage) {
        formData.append("chatPhoto", groupImage);
      }

      const res = await fetch("http://localhost:5000/api/chat/createGroup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error creating group");
        return;
      }

      setClicked(false);
      setGroupName("");
      setUsernames([]);
      setGroupImage(null);

      alert("Group created successfully");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div>
      <button
        onClick={() => setClicked(true)}
        className="app-btn-primary h-9 w-full px-3 text-xs sm:w-auto sm:text-sm"
      >
        <HiOutlineUserGroup className="size-4 shrink-0" aria-hidden />
        Create Group
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
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Create Group</h2>

            {/* 🏷️ Group Name */}
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="app-input"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setGroupImage(e.target.files[0]);
                }
              }}
              className="block w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
            />

            <SearchForGroup setUsernames={setUsernames} />

            {/* 👥 Selected Users */}
            <div className="flex flex-wrap gap-2">
              {usernames.map((u) => (
                <div
                  key={u}
                  className="flex items-center gap-2 rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-sm"
                >
                  <span className="font-medium text-foreground">{u}</span>
                  <button
                    type="button"
                    onClick={() => removeUser(u)}
                    className="inline-flex size-6 items-center justify-center rounded-full text-destructive transition hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Remove ${u}`}
                  >
                    <HiOutlineXMark className="size-3.5" aria-hidden />
                  </button>
                </div>
              ))}
            </div>

            {/* 🎯 Actions */}
            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setClicked(false)}
                className="app-btn-secondary"
              >
                <HiOutlineXMark className="size-4" aria-hidden />
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="app-btn-primary"
              >
                <HiOutlineCheck className="size-4" aria-hidden />
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGroup;