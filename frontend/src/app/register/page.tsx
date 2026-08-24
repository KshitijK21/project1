"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Activity, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { registerRequest } from "@/lib/api/auth";
import { useToast } from "@/components/ui/Toast";
import { isAxiosError } from "axios";

function getPasswordStrength(password: string): { label: string; className: string } {
  if (password.length === 0) return { label: "", className: "" };
  if (password.length < 6) return { label: "Too short", className: "text-negative" };
  if (password.length < 10) return { label: "Okay", className: "text-signal" };
  return { label: "Strong", className: "text-positive" };
}

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await registerRequest({ email, password });
      showToast("Account created. Please sign in.", "success");
      router.push("/login");
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-signal/10 border border-signal/30 mb-3">
            <Activity className="h-5 w-5 text-signal" />
          </div>
          <h1 className="font-display font-semibold text-lg text-text-primary">
            Create your account
          </h1>
          <p className="text-sm text-text-muted mt-1">Get started with the BI platform</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-lg p-6 space-y-4"
        >
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <div>
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-[34px] text-text-muted hover:text-text-primary"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {strength.label && (
              <p className={`mt-1.5 text-xs ${strength.className}`}>{strength.label}</p>
            )}
          </div>

          <Input
            label="Confirm password"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            required
            autoComplete="new-password"
            error={!passwordsMatch ? "Passwords do not match" : undefined}
          />

          {error && (
            <p className="text-sm text-negative bg-negative/10 border border-negative/30 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-signal hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}