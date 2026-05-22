import React, { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaPlus } from "react-icons/fa";

const SendOptions = ({
  setImageUrl,
  setFileUrl,
  setFileName,
    setVideoUrl,

}: any) => {
  const [clicked, setClicked] = useState(false);
//upload video
const [loading,setLoading] = useState(false);


const [messageType,setMessageType] = useState("");




//=========
  const uploadFile = async (file: File) => {
    setLoading(true)
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", "chat-app");
    

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dnrwv3xif/${messageType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    if(!res.ok){
            alert('err')
                setLoading(false)


    }

    const data = await res.json();

    setLoading(false)




return data.secure_url;
  
  };

const handleImageChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  setMessageType("image");

  const file = e.target.files?.[0];

  if (!file) return;

  const imageUrl = await uploadFile(file);

  setImageUrl(imageUrl);
};

const handleVideoChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  setMessageType("video");

  const file = e.target.files?.[0];

  if (!file) return;

  const videoUrl = await uploadFile(file);

  setVideoUrl(videoUrl);
};

const handleFileChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  setMessageType("raw");

  const file = e.target.files?.[0];

  if (!file) return;

  const fileUrl = await uploadFile(file);

  setFileUrl(fileUrl);
  setFileName(file.name);
};

  return (
  <div className="relative">
    <FaPlus 

      size={28}
      className="cursor-pointer hover:text-primary transition"
      onClick={() => setClicked(!clicked)}
    />

    {clicked && (
      <div className="absolute left-0 bottom-10 bg-white shadow-lg rounded-lg p-4 flex flex-col gap-3 z-50">
        <label
          htmlFor="imageInput"
          className="cursor-pointer"
        >
          🖼 Image
        </label>

        <label
          htmlFor="videoInput"
          className="cursor-pointer"
        >
          🎥 Video
        </label>
{/* future feature */}
        {/* <label
          htmlFor="fileInput"
          className="cursor-pointer"
        >
          📎 File
        </label> */}
      </div>
    )}

    {/* image input */}
    <input
      id="imageInput"
      type="file"
      accept="image/*"
      className="hidden"
         

      onChange={handleImageChange}
    />

    {/* file input */}
    <input
      id="fileInput"
      type="file"
      className="hidden"
      onChange={handleFileChange}
    />

    {/* video input */}
    <input
      id="videoInput"
      type="file"
      accept="video/*"
  
      className="hidden"
      onChange={handleVideoChange}
    />
  </div>
);
};

export default SendOptions;