"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldX, LogOut, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function AdminUnauthorizedPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card admin-unauthorized-card">
        <div className="admin-unauthorized-icon-box">
          <ShieldX size={44} className="text-red-600" />
        </div>

        <h1>Access Denied</h1>
        <p className="admin-login-subtitle">
          403 Forbidden — Administrative Privileges Required
        </p>

        <div className="admin-unauthorized-details">
          <p>
            You are authenticated, but your account is not registered as an active administrator
            in the Charak Ayurveda hospital system.
          </p>
          <p>
            If you are a doctor or administrative staff member, please contact your systems
            administrator to assign the <code>admin</code> role to your account.
          </p>
        </div>

        <div className="admin-unauthorized-actions">
          <button
            type="button"
            onClick={handleSignOut}
            className="admin-login-btn admin-btn-secondary"
            id="admin-switch-account-btn"
          >
            <LogOut size={16} /> Sign In With Different Account
          </button>

          <Link href="/" className="admin-login-back-link">
            <ArrowLeft size={16} /> Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
