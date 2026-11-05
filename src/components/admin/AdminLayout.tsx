"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Boxes,
  Briefcase,
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

interface PendingAppointmentSummary {
  id: string;
  patientName: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  doctorName?: string;
  treatmentName?: string;
}

// Feature flags: set to true to show Products/Orders in admin navigation
const SHOW_PRODUCTS = false;
const SHOW_ORDERS = false;

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  ...(SHOW_PRODUCTS ? [{ href: "/admin/products", label: "Products", icon: Boxes }] : []),
  ...(SHOW_ORDERS ? [{ href: "/admin/orders", label: "Orders", icon: ClipboardList }] : []),
  { href: "/admin/appointments", label: "Appointments", icon: CalendarCheck },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/admin/treatments", label: "Treatments", icon: HeartPulse },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/patient-stories", label: "Patient Stories", icon: MessageSquare },
  { href: "/admin/video-testimonials", label: "Video Testimonials", icon: Video },
  { href: "/admin/careers", label: "Careers / Vacancies", icon: Briefcase },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState<string>("admin@charakayurvedapilani.com");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Notification state for pending appointments
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [pendingList, setPendingList] = useState<PendingAppointmentSummary[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsNotifOpen(false);
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

  // Fetch pending appointments count & preview list
  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/appointments/pending-count", {
        credentials: "include",
        headers: {
          "x-admin-auth": "authenticated_admin",
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setPendingCount(typeof data.pendingCount === "number" ? data.pendingCount : 0);
          setPendingList(Array.isArray(data.pendingList) ? data.pendingList : []);
        }
      }
    } catch {
      // Graceful fallback
    }
  }, []);

  // Real-time and polling setup for pending appointments
  useEffect(() => {
    fetchPendingCount();

    // 1. Polling fallback every 15 seconds
    const interval = setInterval(fetchPendingCount, 15000);

    // 2. Custom window event from internal status updates
    const handleCustomEvent = () => {
      fetchPendingCount();
    };
    window.addEventListener("charak_appointments_updated", handleCustomEvent);

    // 3. Supabase Realtime channel subscription
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel("admin-appointments-badge")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "appointments" },
          () => {
            fetchPendingCount();
          }
        )
        .subscribe();
    } catch {
      // realtime fallback to polling
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener("charak_appointments_updated", handleCustomEvent);
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [fetchPendingCount]);

  // Click outside listener for notification dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
                <NextImage
                  src="/logo.png"
                  alt="Charak Ayurveda Logo"
                  width={28}
                  height={28}
                  className="admin-brand-logo-img"
                />
                <span>
                  Charak{" "}<em>Ayurveda</em>
                </span>
                <span className="admin-pill">Admin Console</span>
              </Link>
            </div>
          </div>

          <div className="admin-header-actions">
            {/* Header Notification Bell for New Appointments */}
            <div className="admin-notif-container" ref={notifRef}>
              <button
                type="button"
                className={`admin-notif-bell-btn ${pendingCount > 0 ? "has-pending" : ""}`}
                onClick={() => setIsNotifOpen((prev) => !prev)}
                title={
                  pendingCount > 0
                    ? `🔴 ${pendingCount} New Pending Appointment${pendingCount > 1 ? "s" : ""}`
                    : "Notifications (All appointments reviewed)"
                }
                aria-label="Appointment notifications"
              >
                <Bell size={17} className="bell-icon" />
                {pendingCount > 0 && (
                  <span className="admin-notif-bell-badge">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="admin-notif-dropdown">
                  <div className="admin-notif-header">
                    <span className="admin-notif-title">
                      {pendingCount > 0 ? (
                        <>
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: "#ef4444",
                              display: "inline-block",
                            }}
                            className="pulse-dot"
                          />
                          <span>
                            {pendingCount} Pending Request{pendingCount > 1 ? "s" : ""}
                          </span>
                        </>
                      ) : (
                        <span>All Clear</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsNotifOpen(false)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                      }}
                      aria-label="Close notifications"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="admin-notif-list">
                    {pendingCount === 0 ? (
                      <div
                        style={{
                          padding: "24px 16px",
                          textAlign: "center",
                          color: "#64748b",
                          fontSize: "0.82rem",
                        }}
                      >
                        <p style={{ margin: 0, fontWeight: 600, color: "#166534" }}>
                          ✓ All Caught Up!
                        </p>
                        <p style={{ margin: "6px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>
                          No pending appointments. When a patient books online, a red notification dot will appear here.
                        </p>
                      </div>
                    ) : (
                      pendingList.map((item) => (
                        <Link
                          key={item.id}
                          href="/admin/appointments"
                          className="admin-notif-item"
                          onClick={() => setIsNotifOpen(false)}
                        >
                          <div className="admin-notif-patient">
                            <span>{item.patientName}</span>
                            <span
                              style={{
                                color: "#ef4444",
                                background: "#fee2e2",
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              NEW
                            </span>
                          </div>
                          <div className="admin-notif-details">
                            <span>📅 {item.date}</span>
                            <span>⏰ {item.time}</span>
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
                            Physician: <strong>{item.doctorName || "Ayurvedic Doctor"}</strong>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>

                  <div className="admin-notif-footer">
                    <Link
                      href="/admin/appointments"
                      onClick={() => setIsNotifOpen(false)}
                    >
                      {pendingCount > 0
                        ? `Review & Action (${pendingCount}) →`
                        : "Open Appointments Schedule →"}
                    </Link>
                  </div>
                </div>
              )}
            </div>

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
              const isAppointmentsLink = item.href === "/admin/appointments";
              const showDot = isAppointmentsLink && pendingCount > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-sidebar-item ${isActive ? "active" : ""}`}
                  onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="admin-sidebar-icon admin-sidebar-icon-wrapper">
                    <Icon size={18} />
                    {showDot && (
                      <span
                        className="admin-sidebar-red-dot"
                        title={`${pendingCount} pending consultation(s)`}
                      />
                    )}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="admin-sidebar-label">{item.label}</span>
                      {showDot && (
                        <span
                          className="admin-sidebar-badge-count"
                          title={`${pendingCount} new pending appointment(s)`}
                        >
                          🔴 {pendingCount}
                        </span>
                      )}
                    </>
                  )}
                  {isCollapsed && <span className="admin-sidebar-tooltip">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="admin-sidebar-footer">
            {!isCollapsed && (
              <div className="admin-sidebar-badge">
                <span className="sidebar-status-dot" />
                <span>Ayurveda Hospital Portal</span>
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
