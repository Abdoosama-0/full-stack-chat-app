"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import{useUserData} from "../../store/userData"
import {
  HiOutlineArrowRightEndOnRectangle,
  HiOutlineEnvelope,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineLockClosed,
} from "react-icons/hi2";
import Link from "next/dist/client/link";
const Login = () => {
  const router = useRouter();
  const { setToken, setUserName, setEmail, setId,setAvatar } = useUserData();

  const [email, setEmailIn] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
   

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
          credentials: "include", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        return; // مهم جدًا
      }

      

      setToken(data.token);
      setUserName(data.username);
      setEmail(data.email);
      setId(data.id);
      setAvatar(data.avatar);

      //================logedin 

      //=================
       router.push("/");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-b from-background via-muted/30 to-primary/5 px-4 py-12">
      <div className="w-full max-w-md space-y-4">
        <form
          onSubmit={handleLogin}
          className="app-card flex w-full flex-col gap-5 p-6 shadow-xl shadow-primary/10 sm:p-8"
        >
          <div className="space-y-1 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Login
            </h2>
            <p className="text-sm text-muted-foreground">Access your account to continue chatting.</p>
          </div>

        <div className="relative">
          <HiOutlineEnvelope
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="email"
            placeholder="Enter your email"
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm shadow-sm outline-none ring-primary/15 transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4"
            value={email}
            onChange={(e) => setEmailIn(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <HiOutlineLockClosed
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-16 text-sm shadow-sm outline-none ring-primary/15 transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
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

        {message && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
            {message}
          </p>
        )}

          <button
            type="submit"
            disabled={loading}
            className="app-btn-primary w-full"
          >
            <HiOutlineArrowRightEndOnRectangle className="size-4" aria-hidden />
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-medium text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
