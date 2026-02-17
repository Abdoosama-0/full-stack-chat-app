"use client";
import { useRouter } from "next/navigation";

import React, { useState } from "react";

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
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow"
      >
        <h1 className="text-2xl font-bold text-center">Create Account</h1>

        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Error */}
        {message && (
          <p className="text-center text-sm text-red-500">
            {message}
          </p>
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full rounded-lg bg-blue-600 py-2 font-semibold text-white
            hover:bg-blue-700
            disabled:cursor-not-allowed disabled:opacity-50
            transition
          "
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
