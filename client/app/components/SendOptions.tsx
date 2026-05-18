import React, { useRef, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";

const SendOptions = ({ setImageUrl }: any) => {
  const [clicked, setClicked] = useState(false);

  const uploadImage = async (file: File) => {
    const formData = new FormData();

    formData.append("file", file);

    formData.append("upload_preset", "chat-app");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dnrwv3xif/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();


    return data.secure_url;
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (!file) {
      alert("no file");
      return;
    }

    const imageUrl = await uploadImage(file);

    setImageUrl(imageUrl); // 👈 هنا النقل
  };

  return (
    <div className="relative border-2 p-5">
      <CiCirclePlus
        onClick={() => setClicked(!clicked)}
      />

      {clicked && (
        <div className="absolute left-0 bg-white p-5 flex flex-col gap-3">
          <label
            htmlFor="imageInput"
            className="cursor-pointer"
          >
            image
          </label>

          <div>video</div>

          <div>file</div>
        </div>
      )}

      <input
        id="imageInput"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />
    </div>
  );
};

export default SendOptions;