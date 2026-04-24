import React, { useState } from "react";
import { useUserData } from "../store/userData";

const CreateGroup = () => {
  const [clicked, setClicked] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [usernames, setUsernames] = useState<string[]>([]);
  const{ token } = useUserData();

  // ➕ إضافة username
  const addUser = () => {
    if (!usernameInput.trim()) return;

    // منع التكرار
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
   
    if (!groupName.trim()) {
  
      return;
    }

    if (usernames.length === 0) {
  
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/chat/createGroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: groupName,
          usernames,
        }),
      });
   

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error creating group");
        return;
      }

      // reset
      setClicked(false);
      setGroupName("");
      setUsernames([]);
      alert("Group created successfully");

      console.log("Group created:", data);
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div>
      <button
        onClick={() => setClicked(true)}
        className="rounded bg-blue-500 px-4 py-2 text-white"
      >
        Create Group
      </button>

      {clicked && (
        <div  onClick={() => setClicked(false) }className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
          <div  onClick={(e) => e.stopPropagation()} className="w-[400px] rounded-xl bg-white  p-4 space-y-4">
            
            <h2 className="text-lg font-bold">Create Group</h2>

            {/* 🏷️ Group Name */}
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full rounded border p-2"
            />

            {/* 👤 Add user */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="flex-1 rounded border p-2"
              />
              <button
                onClick={addUser}
                className="rounded bg-green-500 px-3 text-white"
              >
                Add
              </button>
            </div>

            {/* 👥 Selected Users */}
            <div className="flex flex-wrap gap-2">
              {usernames.map((u) => (
                <div
                  key={u}
                  className="flex items-center gap-2 rounded bg-gray-200 px-2 py-1"
                >
                  <span>{u}</span>
                  <button
                    onClick={() => removeUser(u)}
                    className="text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* 🎯 Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setClicked(false)}
                className="rounded bg-gray-400 px-3 py-1 text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="rounded bg-blue-600 px-3 py-1 text-white"
              >
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