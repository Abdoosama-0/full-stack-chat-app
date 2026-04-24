"use client";

import React from "react";
import { MdEdit } from "react-icons/md";
import { useUserData } from "../../store/userData";


const EditUserName = () => {
  const { token } = useUserData();

  const [clicked, setClicked] = React.useState(false);
  const [value, setValue] = React.useState("");

  const handleSubmit = async () => {
    if (!value) return;

    try {
      const res = await fetch(
        "http://localhost:5000/api/user/editUserName",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            userName: value,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Update failed");
        return;
      }

      alert("Profile updated successfully 🎉");

      setClicked(false);
      setValue("");
      window.location.reload(); // reload the page to show the updated info
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div>
      {clicked && (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={value}
            placeholder={`Enter new user name`}
            onChange={(e) => setValue(e.target.value)}
            className="border p-1 rounded"
          />

          <button onClick={handleSubmit}>Submit</button>
        </div>
      )}

      <MdEdit
        size={20}
        className="cursor-pointer"
        onClick={() => setClicked(true)}
      />
    </div>
  );
};

export default EditUserName;