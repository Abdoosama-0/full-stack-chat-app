"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineTrash } from "react-icons/hi2";
import { useUserData } from "../store/userData";

const DeleteAccount = () => {
  const router = useRouter();
  const { token, clearUserData } = useUserData();

  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    const confirmDelete = confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/user/delete-account",
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to delete account");
        return;
      }

      alert("Account deleted successfully 💀");

      // 🧹 clear local user data
      clearUserData();

      // 🚪 redirect to login or home
      router.push("/auth/login");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex h-10 items-center justify-center rounded-xl border border-destructive/50 bg-destructive px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <HiOutlineTrash className="size-4 shrink-0" aria-hidden />
      {loading ? "Deleting..." : "Delete Account"}
    </button>
  );
};

export default DeleteAccount;