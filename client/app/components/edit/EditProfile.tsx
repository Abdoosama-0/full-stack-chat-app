"use client";

import React from "react";
import { HiOutlineCheck } from "react-icons/hi2";
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
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={value}
            placeholder={`Enter new user name`}
            onChange={(e) => setValue(e.target.value)}
            className="app-input h-9 min-w-[12rem] flex-1"
          />

          <button type="button" onClick={handleSubmit} className="app-btn-primary h-9 px-4">
            <HiOutlineCheck className="size-4" aria-hidden />
            Submit
          </button>
        </div>
      )}

      <MdEdit
        size={20}
        className="cursor-pointer text-muted-foreground transition hover:text-primary"
        onClick={() => setClicked(true)}
      />
    </div>
  );
};

export default EditUserName;