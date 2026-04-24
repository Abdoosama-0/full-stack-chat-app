"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
    >
      {loading ? "Deleting..." : "Delete Account"}
    </button>
  );
};

export default DeleteAccount;