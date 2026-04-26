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
        className="rounded-full bg-black/60 p-2 text-white"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-[300px] space-y-3 rounded-xl bg-white p-4">
            
            <img
              src={preview}
              alt="preview"
              className="h-40 w-full rounded-lg object-cover"
            />

            <div className="flex justify-between gap-2">
              <button
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                }}
                className="w-full rounded bg-gray-400 px-3 py-1 text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleUpload}
                disabled={loading}
                className="w-full rounded bg-blue-600 px-3 py-1 text-white"
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