import React, { useState } from "react";
import { useUserData } from "../store/userData";

interface SearchForGroupProps {
  setUsernames: React.Dispatch<React.SetStateAction<string[]>>;
}

const SearchForGroup = ({ setUsernames }: SearchForGroupProps) => {
  const { token } = useUserData();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const searchUsers = async (value: string) => {
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/user/search?q=${value}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setResults(data || []);
       
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ➕ add user to group
  const addUser = (username: string) => {
    setUsernames((prev) => {
      if (prev.includes(username)) return prev;
      return [...prev, username];
    });

    setQuery("");
    setResults([]);
  };

  return (
    <div className="space-y-2">
      {/* 🔍 search input */}
      <input
        value={query}
        onChange={(e) => searchUsers(e.target.value)}
        placeholder="Search users..."
        className="w-full border p-2 rounded"
      />

      {/* 📋 results */}
      <div className="max-h-40 overflow-y-auto space-y-1">
        {results.map((user) => (
          <div
            key={user.id}
            onClick={() => addUser(user.username)}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded"
          >
            <img
              src={user.avatar || "/default-avatar.png"}
              className="w-6 h-6 rounded-full"
            />
            <span>{user.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchForGroup;