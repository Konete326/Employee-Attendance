"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthUI } from "@/components/ui/auth-fuse";

interface LoginResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    _id: string;
    name: string;
    email: string;
    role: "admin" | "employee";
    department: string;
    createdAt: string;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: LoginResponse = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Login failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Redirect based on role with a full page refresh
      const userRole = result.data?.role;
      if (userRole === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/employee";
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
      setIsLoading(false);
    }
  };

  return (
    <AuthUI
      onSignInSubmit={handleSignIn}
      isLoading={isLoading}
      error={error}
      signInContent={{
        quote: {
          text: "Welcome back! Track attendance, manage leaves, and streamline your workflow.",
          author: "AttendEase Team"
        }
      }}
    />
  );
}
