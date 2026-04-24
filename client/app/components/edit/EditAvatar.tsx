"use client";

import React, { useRef } from "react";
import { MdEdit } from "react-icons/md";
import { useUserData } from "../../store/userData";
import router from "next/router";

const EditAvatar = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { token, setAvatar } = useUserData();

  // 1️⃣ فتح file picker
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // 2️⃣ لما يختار صورة
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(
        "http://localhost:5000/api/user/update-avatar",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Upload failed");
        return;
      }
      alert("Avatar updated successfully");

      // update zustand state
      setAvatar(data.user.avatar);
window.location.reload(); // reload the page to show the new avatar
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Icon */}
      <MdEdit
        size={20}
        className="cursor-pointer"
        onClick={handleClick}
      />

      {/* Hidden input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default EditAvatar;