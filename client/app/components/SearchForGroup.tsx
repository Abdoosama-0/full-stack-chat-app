import React, { useState } from "react";
import { HiOutlineMagnifyingGlass, HiOutlineUserPlus } from "react-icons/hi2";
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/search?q=${value}`,
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
   
       <div className="relative flex items-center justify-around">
          {query && (
    <button
      onClick={() => {
        searchUsers("");
      
      }}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-red-500 transition"
    >
      ✕
    </button>
  )}
          <HiOutlineMagnifyingGlass
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="text"
            value={query}
            onChange={(e) => searchUsers(e.target.value)}
            placeholder="Search people..."
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm shadow-sm outline-none ring-primary/20 transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4"
          />
          
        </div>

      <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-border/60 bg-muted/20 p-1">
        {results.map((user) => (
          <div
            key={user.id}
            onClick={() => addUser(user.username)}
            className="flex cursor-pointer items-center gap-2 rounded-lg p-2 transition hover:bg-primary/10"
          >
            <img
              src={user.avatar || "/default-avatar.png"}
              className="size-7 rounded-full border border-border/70 object-cover"
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{user.username}</span>
            <HiOutlineUserPlus className="size-4 shrink-0 text-primary opacity-70" aria-hidden />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchForGroup;