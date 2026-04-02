"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthUI } from "@/components/ui/auth-fuse";

interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    createdAt: string;
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (data: { name: string; email: string; password: string; department?: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: RegisterResponse = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Redirect to login page on success
      router.push("/login");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Registration error:", err);
      setIsLoading(false);
    }
  };

  return (
    <AuthUI
      onSignUpSubmit={handleSignUp}
      isLoading={isLoading}
      error={error}
      signUpContent={{
        quote: {
          text: "Join us today! Start managing your team's attendance efficiently.",
          author: "AttendEase Team"
        }
      }}
    />
  );
}
