"use client";

import { useEffect, useState } from "react";
import { useUserData } from "../store/userData";
import EditAvatar from "../components/edit/EditAvatar";
import EditProfile from "../components/edit/EditProfile";
import EditUserName from "../components/edit/EditProfile";
import EditEmail from "../components/edit/EditEmail";
import { Delete } from "lucide-react";
import DeleteAccount from "../components/DeleteAccount";
import ImagePreview from "../components/ImagePreview";

type User = {
  id: number;
  email: string;
  username: string;
  avatar?: string;
};

const Account = () => {

    const [preview, setPreview] = useState<string | null>(null);
  
    const previewPhoto = (url: string | undefined) => {
      setPreview(url? url : null);
    };
  const { token } = useUserData();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);

        const res = await fetch("http://localhost:5000/api/user/userData", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to fetch user");
        } else {
          setUser(data.user);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchUser();
  }, [token]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4 space-y-3">
 
      <h1 className="text-xl font-bold">Account</h1>
<div><EditAvatar />
      <img
        src={user?.avatar}
          className="w-20 h-20 rounded-full cursor-zoom-in object-cover"
        alt="avatar"
              onClick={() => previewPhoto(user?.avatar)}

      />
                 <ImagePreview
  imageUrl={preview}
  onClose={() => setPreview(null)}
/>

</div>
<span>

  <p>User Name: {user?.username}</p>
   <EditUserName    />
</span>
    
<span>
    <p>Email: {user?.email}</p> 
      <EditEmail    />
</span>
  
      <p>ID: {user?.id}</p>

      <DeleteAccount />
    </div>
  );
};

export default Account;