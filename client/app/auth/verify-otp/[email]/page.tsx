"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineEnvelope, HiOutlineKey } from "react-icons/hi2";

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/5 to-violet-200/25 px-4 py-12">
      <form
        onSubmit={handleVerifyOtp}
        className="w-full max-w-md space-y-5 rounded-2xl border border-border/70 bg-card/95 p-8 shadow-xl shadow-primary/10 backdrop-blur-sm"
      >
        <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground">
          Verify OTP
        </h2>

        <p className="flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <HiOutlineEnvelope className="size-5 shrink-0 text-primary" aria-hidden />
          <span>
            Email: {email}
          </span>
        </p>

        <div className="relative">
          <HiOutlineKey
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm shadow-sm outline-none ring-primary/15 transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet-500 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:from-primary/90 hover:to-violet-500/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <HiOutlineKey className="size-4 opacity-90" aria-hidden />
          {loading ? "Verifying..." : "Verify"}
        </button>

        {message && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default VerifyOTP;
