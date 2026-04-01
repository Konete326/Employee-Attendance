"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { NeuCard, NeuCardHeader, NeuCardTitle, NeuCardDescription, NeuCardContent, NeuCardFooter } from "@/components/ui/neu-card";
import { NeuInput } from "@/components/ui/neu-input";
import { NeuButton } from "@/components/ui/neu-button";

interface LoginFormData {
  email: string;
  password: string;
}

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

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Login failed. Please try again.");
        return;
      }

      // Redirect based on role with a full page refresh to ensure layouts sync with the new session
      const userRole = data.data?.role;
      if (userRole === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/employee";
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NeuCard className="w-full max-w-md mx-auto">
      <NeuCardHeader className="text-center">
        <NeuCardTitle className="text-2xl">Welcome Back</NeuCardTitle>
        <NeuCardDescription>
          Sign in to your AttendEase account
        </NeuCardDescription>
      </NeuCardHeader>

      <form onSubmit={handleSubmit}>
        <NeuCardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[var(--neu-danger)]/10 border border-[var(--neu-danger)]/30 text-[var(--neu-danger)] text-sm">
              {error}
            </div>
          )}

          <NeuInput
            label="Email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            icon={<Mail size={18} />}
            disabled={isLoading}
            required
          />

          <div className="relative">
            <NeuInput
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              icon={<Lock size={18} />}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[2.25rem] text-[var(--neu-text-muted)] hover:text-[var(--neu-text)] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </NeuCardContent>

        <NeuCardFooter className="flex flex-col gap-4">
          <NeuButton
            type="submit"
            variant="accent"
            size="lg"
            loading={isLoading}
            className="w-full"
          >
            Sign In
          </NeuButton>

          <p className="text-sm text-[var(--neu-text-secondary)] text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[var(--neu-accent)] hover:text-[var(--neu-accent-hover)] font-medium transition-colors"
            >
              Register
            </Link>
          </p>
        </NeuCardFooter>
      </form>
    </NeuCard>
  );
}
