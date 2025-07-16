"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

export default function EmailVerifiedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      if (!token) {
        toast.error("Invalid verification link");
        return;
      }

      const res = await fetch(`/api/verify-email?token=${token}`);
      const data = await res.json();

      if (res.ok) {
        toast.success("Email verified successfully!");
      } else {
        toast.error(data.error || "Verification failed");
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2e84cc]">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full h-120 max-w-md text-center">
        <h1 className="text-3xl font-bold text-[#0B3259] mb-4">Email Verified!</h1>
        <p className="text-gray-700 mb-6">
          Your email has been successfully verified. You can now log in to your account.
        </p>
        <a
          href="/loginpage"
          className="bg-[#2e84cc] text-white py-2 px-6 rounded-md font-semibold hover:bg-blue-600 transition duration-200"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}