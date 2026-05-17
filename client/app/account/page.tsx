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

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="rounded-lg border border-border/70 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Loading...
        </p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Account
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile and account settings.
        </p>
      </div>

      <div className="app-card flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
        <div className="relative">
          <img
            src={user?.avatar}
            className="size-24 cursor-zoom-in rounded-full border-2 border-border/70 object-cover shadow-md transition hover:ring-4 hover:ring-primary/20"
            alt="avatar"
            onClick={() => previewPhoto(user?.avatar)}
          />
          <div className="absolute -bottom-1 -right-1 rounded-full border border-border/70 bg-card p-1 shadow-sm">
            <EditAvatar />
          </div>
          <ImagePreview imageUrl={preview} onClose={() => setPreview(null)} />
        </div>
        <div className="min-w-0 flex-1 space-y-1 text-center sm:text-left">
          <p className="text-lg font-semibold text-foreground">{user?.username}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-muted-foreground">ID: {user?.id}</p>
        </div>
      </div>

      <div className="app-card space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
          <p className="text-sm font-medium text-foreground">
            Username: <span className="font-normal text-muted-foreground">{user?.username}</span>
          </p>
          <EditUserName />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">
            Email: <span className="font-normal text-muted-foreground">{user?.email}</span>
          </p>
          <EditEmail />
        </div>
      </div>

      <div className="app-card border-destructive/30 p-6">
        <h2 className="mb-2 text-sm font-semibold text-destructive">Danger zone</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Permanently delete your account and all associated data.
        </p>
        <DeleteAccount />
      </div>
    </div>
  );
};

export default Account;