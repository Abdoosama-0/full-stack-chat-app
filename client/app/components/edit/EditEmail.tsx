"use client";

import React from "react";
import { MdEdit } from "react-icons/md";
import { useUserData } from "../../store/userData";

const EditEmail = () => {
  const { token } = useUserData();

  const [step, setStep] = React.useState<1 | 2|null>(null);

  const [email, setEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");

  // ================= STEP 1: send email =================
  const handleSendEmail = async () => {
    if (!email) return;

    try {
      const res = await fetch(
        "http://localhost:5000/api/user/email/updateEmail",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            newEmail: email,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed");
        return;
      }

      alert("OTP sent to email 📩");

      setStep(2);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= STEP 2: verify OTP =================
  const handleVerifyOtp = async () => {
    if (!otp) return;

    try {
      const res = await fetch(
        "http://localhost:5000/api/user/email/verify-change",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            otp,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Invalid OTP");
        return;
      }

      alert("Email updated successfully 🎉");

      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-3">
      <MdEdit onClick={() => setStep(1)} size={20} className="cursor-pointer" />

      {/* ================= STEP 1 ================= */}
      {step === 1 && (
        <div className="flex gap-2 items-center">
          <input
            type="email"
            value={email}
            placeholder="Enter new email"
            onChange={(e) => setEmail(e.target.value)}
            className="border p-1 rounded"
          />

          <button onClick={handleSendEmail}>Send OTP</button>
        </div>
      )}

      {/* ================= STEP 2 ================= */}
      {step === 2 && (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={otp}
            placeholder="Enter OTP"
            onChange={(e) => setOtp(e.target.value)}
            className="border p-1 rounded"
          />

          <button onClick={handleVerifyOtp}>Verify</button>
        </div>
      )}
    </div>
  );
};

export default EditEmail;