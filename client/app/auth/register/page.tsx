"use client";
import { useRouter } from "next/navigation";

import React, { useState } from "react";
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineUser } from "react-icons/hi2";

const Register = () => {
    const router = useRouter(); // ✅ App Router

  const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // مهم عشان الفورم ما يعملش reload

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Registration failed");
      }

      alert("Register success");
router.push(`/auth/verify-otp/${encodeURIComponent(email)}`);

    } catch (err) {
     
      setMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/5 to-violet-200/25 px-4 py-12">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md space-y-5 rounded-2xl border border-border/70 bg-card/95 p-8 shadow-xl shadow-primary/10 backdrop-blur-sm"
      >
        <h1 className="text-center text-2xl font-semibold tracking-tight text-foreground">
          Create Account
        </h1>

        <div className="relative">
          <HiOutlineUser
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="text"
            placeholder="Username"
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm shadow-sm outline-none ring-primary/15 transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <HiOutlineEnvelope
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="email"
            placeholder="Email"
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm shadow-sm outline-none ring-primary/15 transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <HiOutlineLockClosed
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="password"
            placeholder="Password"
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm shadow-sm outline-none ring-primary/15 transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {message && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary to-violet-500 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:from-primary/90 hover:to-violet-500/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
