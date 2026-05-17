"use client";

import { useUserData } from "@/app/store/userData";
import React, { useRef, useState } from "react";
import { MdEdit } from "react-icons/md";

type Props = {
  chatId: number;
  onUpdated?: (newPhoto: string) => void;
};

const EditGroupPhoto = ({ chatId }: Props) => {
    const {token} = useUserData();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 📌 open file picker
  const handleClick = () => {
    fileRef.current?.click();
  };

  // 📌 select file
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  // 📌 upload
  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(
        `http://localhost:5000/api/chat/${chatId}/photo`,
        {
          method: "PUT",
           headers: {
      Authorization: `Bearer ${token}`,
    },
          body: formData,
        }
      
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Upload failed");
        return;
      }

      alert("Photo updated successfully");
     window.location.reload();

      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* edit icon */}
      <button
        onClick={handleClick}
        className="rounded-full border border-border/70 bg-card/90 p-2 text-foreground shadow-sm transition hover:bg-accent"
      >
        <MdEdit />
      </button>

      {/* hidden input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleChange}
      />

      {/* preview modal */}
      {preview && (
        <div className="app-modal-overlay z-50">
          <div className="app-modal-panel w-full max-w-sm">
            <img
              src={preview}
              alt="preview"
              className="h-40 w-full rounded-xl object-cover"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                }}
                className="app-btn-secondary flex-1"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpload}
                disabled={loading}
                className="app-btn-primary flex-1"
              >
                {loading ? "Uploading..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditGroupPhoto;