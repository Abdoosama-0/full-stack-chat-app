"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const VerifyOTP = ({params,}: {params: Promise<{ email: string }>;}) => {
  const router = useRouter();

  const { email: paramEmail } = use(params);


  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

    const [email, setEmail] = useState("");
  useEffect(() => {
    if (paramEmail) {
      setEmail(decodeURIComponent(paramEmail));
    }
  }, [paramEmail]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("http://localhost:5000/api/auth/verifyOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
              alert(data.message);

        setMessage(data.message || "Verification failed");
        return;
      }

      alert("OTP Verified Successfully");
      router.push("/auth/login");

    } catch (err) {
      alert( "Verificsaation failed");
      setMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerifyOtp}>
      <h2>Verify OTP</h2>

      <p>Email: {email}</p>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Verifying..." : "Verify"}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
};

export default VerifyOTP;
