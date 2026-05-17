"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  HiOutlineEnvelope,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineUserPlus,
} from "react-icons/hi2";

const Register = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [avatar, setAvatar] = useState<File | null>(null);

  // 🔥 show password state
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();

      formData.append("email", email);
      formData.append("username", username);
      formData.append("password", password);

      if (avatar) {
        formData.append("avatar", avatar);
      }

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Registration failed");
        return;
      }

      alert("Register success 🎉");

      router.push(`/auth/verify-otp/${encodeURIComponent(email)}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-b from-background via-muted/30 to-primary/5 px-4 py-12">
      <form
        onSubmit={handleRegister}
        className="app-card w-full max-w-md space-y-5 p-6 shadow-xl shadow-primary/10 sm:p-8"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Create Account
          </h1>
          <p className="text-sm text-muted-foreground">Set up your profile and start chatting.</p>
        </div>

        {/* Username */}
        <div className="relative">
          <HiOutlineUser className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm shadow-sm outline-none ring-primary/15 transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4"
            required
          />
        </div>

        {/* Email */}
        <div className="relative">
          <HiOutlineEnvelope className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm shadow-sm outline-none ring-primary/15 transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4"
            required
          />
        </div>

        {/* Password + Show/Hide */}
        <div className="relative">
          <HiOutlineLockClosed className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-16 text-sm shadow-sm outline-none ring-primary/15 transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-primary transition hover:bg-accent"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <HiOutlineEyeSlash className="size-5" aria-hidden />
            ) : (
              <HiOutlineEye className="size-5" aria-hidden />
            )}
          </button>
        </div>

        {/* Avatar upload */}
        <div>
          <label className="text-sm text-muted-foreground">
            Upload Avatar (optional)
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setAvatar(e.target.files?.[0] || null)
            }
            className="mt-2 block w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
          />
        </div>

        {/* Message */}
        {message && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{message}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="app-btn-primary w-full"
        >
          <HiOutlineUserPlus className="size-4" aria-hidden />
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;