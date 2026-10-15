"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ShieldAlert, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";
  const authErrorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    authErrorParam === "unauthorized"
      ? "Your account does not possess administrator privileges."
      : ""
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your administrator email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const result = await res.json();

      if (!res.ok || !result.ok) {
        setErrorMessage(
          result.error || "Invalid credentials. Please verify your administrator email and password."
        );
        setIsLoading(false);
        return;
      }

      // Successful admin login - HttpOnly session cookie set by API response
      document.cookie = "charak_admin_ui=1; Path=/; SameSite=Lax; Max-Age=86400";
      router.push(nextPath);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "A network or server error occurred. Please check your connection.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <ShieldCheck size={32} className="admin-login-icon" />
          </div>
          <h1>Charak Ayurveda</h1>
          <p className="admin-login-subtitle">Hospital Operations & Administration Console</p>
        </div>

        {errorMessage && (
          <div className="admin-login-error" role="alert">
            <ShieldAlert size={18} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
          <div className="form-group">
            <label htmlFor="admin-email">Administrator Email</label>
            <div className="admin-input-wrapper">
              <Mail size={18} className="admin-input-icon" />
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="admin@charakayurvedapilani.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <div className="admin-input-wrapper">
              <Lock size={18} className="admin-input-icon" />
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="admin-login-btn"
            disabled={isLoading}
            id="admin-login-submit"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Admin Portal</span>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <Link href="/" className="admin-login-back-link">
            <ArrowLeft size={16} /> Return to Public Website
          </Link>
          <span className="admin-login-secure-notice">
            Authorized Medical Staff Access Only
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-login-wrapper">
          <div className="admin-login-card">
            <div className="flex justify-center items-center py-12">
              <Loader2 size={32} className="animate-spin text-emerald-800" />
            </div>
          </div>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
