"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, Building2 } from "lucide-react";
import { NeuCard, NeuCardHeader, NeuCardTitle, NeuCardDescription, NeuCardContent, NeuCardFooter } from "@/components/ui/neu-card";
import { NeuInput } from "@/components/ui/neu-input";
import { NeuSelect } from "@/components/ui/neu-select";
import { NeuButton } from "@/components/ui/neu-button";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
}

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

const departmentOptions = [
  { value: "", label: "Select Department (Optional)" },
  { value: "Engineering", label: "Engineering" },
  { value: "Design", label: "Design" },
  { value: "Marketing", label: "Marketing" },
  { value: "Sales", label: "Sales" },
  { value: "HR", label: "Human Resources" },
  { value: "Finance", label: "Finance" },
  { value: "Operations", label: "Operations" },
  { value: "Management", label: "Management" },
  { value: "Other", label: "Other" },
];

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          department: formData.department || undefined,
        }),
      });

      const data: RegisterResponse = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Registration failed. Please try again.");
        return;
      }

      // Redirect to login page on success
      router.push("/login");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NeuCard className="w-full max-w-md mx-auto">
      <NeuCardHeader className="text-center">
        <NeuCardTitle className="text-2xl">Create Account</NeuCardTitle>
        <NeuCardDescription>
          Sign up for an AttendEase account
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
            label="Full Name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            icon={<User size={18} />}
            disabled={isLoading}
            required
          />

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
              placeholder="Create a password (min 6 chars)"
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

          <div className="relative">
            <NeuInput
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={<Lock size={18} />}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[2.25rem] text-[var(--neu-text-muted)] hover:text-[var(--neu-text)] transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <NeuSelect
            label="Department"
            name="department"
            options={departmentOptions}
            value={formData.department}
            onChange={handleChange}
            disabled={isLoading}
          />
        </NeuCardContent>

        <NeuCardFooter className="flex flex-col gap-4">
          <NeuButton
            type="submit"
            variant="accent"
            size="lg"
            loading={isLoading}
            className="w-full"
          >
            Create Account
          </NeuButton>

          <p className="text-sm text-[var(--neu-text-secondary)] text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[var(--neu-accent)] hover:text-[var(--neu-accent-hover)] font-medium transition-colors"
            >
              Login
            </Link>
          </p>
        </NeuCardFooter>
      </form>
    </NeuCard>
  );
}
