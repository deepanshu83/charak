"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  HeartPulse,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Video,
  X,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarCheck },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/admin/treatments", label: "Treatments", icon: HeartPulse },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/patient-stories", label: "Patient Stories", icon: MessageSquare },
  { href: "/admin/video-testimonials", label: "Video Testimonials", icon: Video },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState<string>("admin@charakayurvedapilani.com");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Load user session details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email) {
          setAdminEmail(data.user.email);
        }
      } catch {
        // Fallback
      }
    };
    fetchUser();
  }, []);

  // Prevent background scrolling when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      document.cookie = "charak_admin_session=; Path=/; Max-Age=0";
      document.cookie = "charak_admin_ui=; Path=/; Max-Age=0";
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="admin-wrapper">
      {/* Clean Minimal Top Header */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-header-left">
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              aria-label={isMobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="admin-brand">
              <Link href="/admin">
                Charak<em>Ayurveda</em>
                <span className="admin-pill">Admin Console</span>
              </Link>
            </div>
          </div>

          <div className="admin-header-actions">
            <Link
              href="/"
              className="admin-public-link"
              target="_blank"
              title="Open Public Website in new tab"
            >
              <ExternalLink size={14} />
              <span className="hidden-sm">Public Website</span>
            </Link>

            <div className="admin-user-pill" title={`Logged in as ${adminEmail}`}>
              <UserCheck size={14} className="text-emerald-700" />
              <span>{adminEmail.split("@")[0]}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="admin-logout-button"
              id="admin-logout-btn"
              title="Sign out of Admin Console"
            >
              <LogOut size={14} />
              <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Body: Left Sidebar + Main Content */}
      <div className="admin-body-layout">
        {/* Mobile Backdrop */}
        {isMobileOpen && (
          <div
            className="admin-sidebar-backdrop"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Left Admin Sidebar */}
        <aside
          className={`admin-sidebar ${isCollapsed ? "collapsed" : ""} ${isMobileOpen ? "mobile-open" : ""}`}
          aria-label="Admin Navigation Sidebar"
        >
          <div className="admin-sidebar-header">
            <span className="admin-sidebar-title">
              {!isCollapsed && "Navigation"}
            </span>
            <button
              type="button"
              className="admin-sidebar-collapse-btn"
              onClick={() => setIsCollapsed((prev) => !prev)}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          <nav className="admin-sidebar-nav" aria-label="Admin Sections">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin" || pathname === "/admin/dashboard"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-sidebar-item ${isActive ? "active" : ""}`}
                  onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="admin-sidebar-icon">
                    <Icon size={18} />
                  </span>
                  {!isCollapsed && <span className="admin-sidebar-label">{item.label}</span>}
                  {isCollapsed && <span className="admin-sidebar-tooltip">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="admin-sidebar-footer">
            {!isCollapsed && (
              <div className="admin-sidebar-badge">
                <span className="sidebar-status-dot" />
                <span>Ayurveda Clinic Portal</span>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Beside Left Sidebar */}
        <main className="admin-main-content">{children}</main>
      </div>
    </div>
  );
}
