"use client";

import React, { useEffect, useState } from "react";
import Chat from "./Chat";


const Search = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [clickedUser, setClickedUser] = useState<any | null>(null);  

  
  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setMessage("");

        const token = localStorage.getItem("token") || "";

        const res = await fetch(
          `http://localhost:5000/api/user/search?q=${query}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Search failed");
        } else {
          setUsers(data.users || data); // حسب شكل الريسبونس
        }
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [query]); // 👈 كل ما query تتغير يتعمل fetch

  return (
    <div className="max-w-sm">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search people..."
        className="border p-2 rounded w-full"
      />

      {loading && <p>Searching...</p>}
      {message && <p>{message}</p>}

      <ul className="mt-2">
        {users.map((user) => (
          <li onClick={() => setClickedUser(user)}
            key={user.id}
            className="p-2 border-b cursor-pointer hover:bg-gray-100"
          >
            {user.username}
          </li>
        ))}
      </ul>
      {clickedUser &&<Chat user={clickedUser}/> }
    </div>
  );
};

export default Search;
