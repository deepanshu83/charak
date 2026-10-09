"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Plus,
  ShoppingBag,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { Badge, Button, Card } from "@/components/ui";
import { fetchAdminAppointments, subscribeAppointments } from "@/lib/appointmentService";
import { fetchAdminOrders, subscribeOrders } from "@/lib/orderService";
import { fetchAdminProducts, subscribeProducts } from "@/lib/productService";
import type { Appointment, Order, Product } from "@/types";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbStats, setDbStats] = useState<{
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    pendingOrders: number;
    totalAppointments: number;
    pendingAppointments: number;
    totalDoctors: number;
    totalTreatments: number;
  } | null>(null);

  const inFlightRef = useRef(false);

  const loadData = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    try {
      const [pList, oList, aList, statsRes] = await Promise.all([
        fetchAdminProducts(),
        fetchAdminOrders(),
        fetchAdminAppointments(),
        fetch("/api/admin/dashboard").then((r) => r.json()).catch(() => ({})),
      ]);

      setProducts(pList);
      setOrders(oList);
      setAppointments(aList);

      if (statsRes && statsRes.ok && statsRes.data) {
        setDbStats(statsRes.data);
      }
    } catch (err) {
      console.warn("Could not load dashboard data from database:", err);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubP = subscribeProducts(loadData);
    const unsubO = subscribeOrders(loadData);
    const unsubA = subscribeAppointments(loadData);
    return () => {
      unsubP();
      unsubO();
      unsubA();
    };
  }, [loadData]);

  const todayStr = new Date().toISOString().split("T")[0];

  // Calculated Metrics (using dbStats when available, with fallback to local collections)
  const totalProducts = dbStats ? dbStats.totalProducts : products.length;
  const activeProducts = dbStats ? dbStats.activeProducts : products.filter((p) => p.active !== false).length;
  const lowStockProducts = products.filter((p) => p.stock <= 5);
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  const totalOrders = dbStats ? dbStats.totalOrders : orders.length;
  const pendingOrders = dbStats ? dbStats.pendingOrders : orders.filter((o) => o.status === "PENDING").length;
  const processingOrders = orders.filter((o) => o.status === "PROCESSING").length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const totalAppointments = dbStats ? dbStats.totalAppointments : appointments.length;
  const pendingAppointments = dbStats ? dbStats.pendingAppointments : appointments.filter((a) => a.status === "PENDING").length;

  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const upcomingAppointments = appointments.filter(
    (a) => a.date >= todayStr && a.status !== "CANCELLED"
  );

  const recentOrders = orders.slice(0, 5);
  const recentAppointments = appointments.slice(0, 5);

  return (
    <div className="wrap admin-page-container">
      <div className="admin-page-header">
        <div>
          <Badge variant="gold">Pilani Dispensary &bull; Operations</Badge>
          <h1 style={{ marginTop: "6px" }}>Hospital &amp; Dispensary Dashboard</h1>
          <p>Real-time Supabase operations overview for patient appointments, orders, clinical care, and stock.</p>
        </div>
        <div className="header-quick-actions" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            icon={<Clock size={14} className={loading ? "animate-spin" : ""} />}
          >
            Refresh
          </Button>
          <Link href="/admin/products">
            <Button variant="primary" size="sm" icon={<Plus size={15} />}>
              Add Product
            </Button>
          </Link>
          <Link href="/appointment" target="_blank">
            <Button variant="ghost" size="sm" icon={<Eye size={15} />}>
              Test Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="admin-kpi-grid">
        {/* Card 1: Total Products */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Formulations</span>
            <div className="kpi-icon-wrap">
              <Boxes size={20} />
            </div>
          </div>
          <div className="kpi-value">{totalProducts}</div>
          <div className="kpi-footer">
            <span>
              {activeProducts} active &bull; {outOfStockCount} out of stock
            </span>
            <Link href="/admin/products" className="kpi-link">
              Manage →
            </Link>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Dispensary Orders</span>
            <div className="kpi-icon-wrap">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="kpi-value">{totalOrders}</div>
          <div className="kpi-footer">
            <span>₹{totalRevenue.toLocaleString("en-IN")} total volume</span>
            <Link href="/admin/orders" className="kpi-link">
              View orders →
            </Link>
          </div>
        </div>

        {/* Card 3: Pending Orders */}
        <div className="kpi-card highlight-card">
          <div className="kpi-header">
            <span className="kpi-title">Pending Orders</span>
            <div className="kpi-icon-wrap warning-icon">
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-value">{pendingOrders}</div>
          <div className="kpi-footer">
            <span>{processingOrders} in processing</span>
            <Link href="/admin/orders" className="kpi-link">
              Fulfill →
            </Link>
          </div>
        </div>

        {/* Card 4: Today's Appointments */}
        <div className="kpi-card highlight-card">
          <div className="kpi-header">
            <span className="kpi-title">Today&apos;s Appointments</span>
            <div className="kpi-icon-wrap success-icon">
              <CalendarCheck size={20} />
            </div>
          </div>
          <div className="kpi-value">{todayAppointments.length}</div>
          <div className="kpi-footer">
            <span>
              {totalAppointments} total &bull; {pendingAppointments} pending
            </span>
            <Link href="/admin/appointments" className="kpi-link">
              Schedule →
            </Link>
          </div>
        </div>

        {/* Card 5: Upcoming Appointments */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Upcoming 7-Days</span>
            <div className="kpi-icon-wrap">
              <CalendarDays size={20} />
            </div>
          </div>
          <div className="kpi-value">{upcomingAppointments.length}</div>
          <div className="kpi-footer">
            <span>Active future consultations</span>
            <Link href="/admin/appointments" className="kpi-link">
              All slots →
            </Link>
          </div>
        </div>
      </div>

      {/* TODAY'S SCHEDULE & LOW-STOCK PRODUCTS (Specific Polish Additions) */}
      <div className="dashboard-columns-grid" style={{ marginBottom: "28px" }}>
        {/* Today's Schedule */}
        <Card className="dashboard-section-card">
          <div className="section-card-header">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CalendarCheck size={18} className="text-green" />
                <h2 style={{ margin: 0 }}>Today&apos;s Schedule ({todayStr})</h2>
              </div>
              <p>Consultations booked for patient intake today</p>
            </div>
            <Link href="/admin/appointments" className="view-all-link">
              Manage ({todayAppointments.length}) <ArrowRight size={14} />
            </Link>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="empty-mini-state" style={{ padding: "28px 16px", textAlign: "center", color: "var(--ink-muted)" }}>
              <Clock size={28} style={{ opacity: 0.35, margin: "0 auto 8px" }} />
              <p style={{ margin: 0 }}>No consultations scheduled for today yet.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Contact</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAppointments.map((apt) => (
                    <tr key={apt.id}>
                      <td>
                        <strong>{apt.time}</strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{apt.patientName}</div>
                      </td>
                      <td>
                        <span className="text-muted">{apt.phone}</span>
                      </td>
                      <td>
                        <StatusBadge status={apt.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Low-Stock Products Warning */}
        <Card className="dashboard-section-card">
          <div className="section-card-header">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} color="var(--terra)" />
                <h2 style={{ margin: 0 }}>Low-Stock Formulations</h2>
              </div>
              <p>Items with &le; 5 units requiring restock</p>
            </div>
            <Link href="/admin/products" className="view-all-link">
              Inventory ({products.length}) <ArrowRight size={14} />
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="empty-mini-state" style={{ padding: "28px 16px", textAlign: "center", color: "var(--green)" }}>
              <CheckCircle2 size={28} style={{ opacity: 0.7, margin: "0 auto 8px", color: "var(--green)" }} />
              <p style={{ margin: 0, fontWeight: 500 }}>All herbal formulations well-stocked (&gt; 5 units in dispensary).</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock Remaining</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {p.image && (
                            <Image
                              src={p.image}
                              alt={p.name}
                              width={32}
                              height={32}
                              style={{ borderRadius: "6px", objectFit: "cover" }}
                            />
                          )}
                          <strong style={{ fontSize: "0.9rem" }}>{p.name}</strong>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.82rem", color: "var(--ink-light)" }}>{p.category}</span>
                      </td>
                      <td>
                        {p.stock <= 0 ? (
                          <Badge variant="danger" size="sm">Out of stock</Badge>
                        ) : (
                          <Badge variant="warning" size="sm">{p.stock} left</Badge>
                        )}
                      </td>
                      <td>
                        <Link href="/admin/products">
                          <Button variant="outline" size="sm">
                            Restock
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Two Column Quick Previews */}
      <div className="dashboard-columns-grid">
        {/* Recent Orders Preview */}
        <div className="dashboard-section-card">
          <div className="section-card-header">
            <div>
              <h2>Recent Dispensary Orders</h2>
              <p>Registered customer dispensary orders</p>
            </div>
            <Link href="/admin/orders" className="view-all-link">
              View All ({orders.length}) <ArrowRight size={14} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="empty-mini-state">No orders placed yet.</div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.id}</strong>
                      </td>
                      <td>
                        <div>{order.customerName}</div>
                        <small className="text-muted">{order.phone}</small>
                      </td>
                      <td>{order.items.length} items</td>
                      <td>
                        <strong>₹{order.total.toLocaleString("en-IN")}</strong>
                      </td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Appointments Preview */}
        <div className="dashboard-section-card">
          <div className="section-card-header">
            <div>
              <h2>Recent Consultation Bookings</h2>
              <p>Booked via public appointment portal</p>
            </div>
            <Link href="/admin/appointments" className="view-all-link">
              View All ({appointments.length}) <ArrowRight size={14} />
            </Link>
          </div>

          {recentAppointments.length === 0 ? (
            <div className="empty-mini-state">No appointments recorded yet.</div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Patient</th>
                    <th>Date &amp; Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map((apt) => (
                    <tr key={apt.id}>
                      <td>
                        <strong>{apt.id}</strong>
                      </td>
                      <td>
                        <div>{apt.patientName}</div>
                        <small className="text-muted">{apt.phone}</small>
                      </td>
                      <td>
                        <div>{apt.date}</div>
                        <small className="text-muted">{apt.time}</small>
                      </td>
                      <td>
                        <StatusBadge status={apt.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
