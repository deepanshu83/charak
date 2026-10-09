"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  fetchAdminOrders,
  adminUpdateOrderStatus,
  subscribeOrders,
} from "@/lib/orderService";
import type { Order, OrderStatus } from "@/types";
import { Badge, Button, Modal, useToast } from "@/components/ui";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const PAGE_SIZE = 8;

export default function OrderManager() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const inFlightRef = useRef(false);

  const loadData = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    try {
      const data = await fetchAdminOrders();
      setOrders(data);
    } catch (err) {
      console.error("[OrderManager] Failed to load orders from database:", err);
      setOrders([]);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsub = subscribeOrders(loadData);
    return unsub;
  }, [loadData]);

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await adminUpdateOrderStatus(orderId, nextStatus);
      toast.success("Order Updated", `Order #${orderId} marked as ${nextStatus}.`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
      await loadData();
    } catch (err) {
      toast.error("Update Failed", err instanceof Error ? err.message : "Unable to update order");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.phone.includes(search) ||
        order.city.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "All" || order.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: orders.length };
    ORDER_STATUSES.forEach((st) => {
      counts[st] = orders.filter((o) => o.status === st).length;
    });
    return counts;
  }, [orders]);

  return (
    <div className="wrap admin-page-container">
      <div className="admin-page-header">
        <div>
          <Badge variant="gold">Dispensary Fulfillment</Badge>
          <h1 style={{ marginTop: "6px" }}>Manage Orders &amp; Prescriptions</h1>
          <p>
            Orders placed through checkout appear here immediately.
            Update fulfillment stages, track shipments, and inspect delivery information.
          </p>
        </div>
        <div className="header-quick-actions" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            icon={<RefreshCw size={14} className={loading ? "animate-spin" : ""} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by order ID, customer name, phone, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-pill-group">
          {["All", ...ORDER_STATUSES].map((st) => (
            <button
              key={st}
              type="button"
              className={`filter-pill ${statusFilter === st ? "active" : ""}`}
              onClick={() => setStatusFilter(st)}
            >
              {st} ({statusCounts[st] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Destination</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && orders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "36px", color: "var(--ink-muted)" }}>
                  Connecting to Supabase...
                </td>
              </tr>
            ) : paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "36px", color: "var(--ink-muted)" }}>
                  No dispensary orders found matching criteria.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.id}</strong>
                    <div className="text-muted text-xs">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                    <div className="text-muted text-xs">{order.phone}</div>
                  </td>
                  <td>
                    <div>{order.city}, {order.state}</div>
                    <div className="text-muted text-xs">{order.pincode}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.85rem" }}>
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--green)" }}>
                      ₹{order.total.toLocaleString("en-IN")}
                    </strong>
                  </td>
                  <td>
                    <select
                      className="status-dropdown"
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value as OrderStatus)
                      }
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        border: "1px solid var(--border)",
                        fontSize: "0.82rem",
                        fontFamily: "inherit",
                        opacity: updatingId === order.id ? 0.6 : 1,
                      }}
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="table-actions-cell">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye size={14} />}
                        onClick={() => setSelectedOrder(order)}
                        title="View Order Details"
                      >
                        Details
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filteredOrders.length > PAGE_SIZE && (
          <div className="admin-pagination">
            <span>
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} of{" "}
              {filteredOrders.length} orders
            </span>
            <div className="pagination-controls">
              <button
                type="button"
                className="pagination-btn"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={15} /> Prev
              </button>
              <span className="pagination-page-indicator">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="pagination-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* REUSABLE MODAL: Order Details Drawer */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order Details: ${selectedOrder.id}` : "Order Details"}
        description={
          selectedOrder
            ? `Placed on ${new Date(selectedOrder.createdAt).toLocaleString("en-IN")}`
            : ""
        }
        size="lg"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="primary" onClick={() => setSelectedOrder(null)}>
              Done
            </Button>
          </div>
        }
      >
        {selectedOrder && (
          <div className="order-drawer-content" style={{ marginTop: "12px" }}>
            {/* Customer and Delivery Details */}
            <div className="drawer-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div className="drawer-info-block" style={{ padding: "16px", background: "var(--cream-card)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <h4 style={{ margin: "0 0 10px", color: "var(--green)" }}>Customer Information</h4>
                <p style={{ margin: "0 0 4px", fontSize: "0.9rem" }}>
                  <strong>Name:</strong> {selectedOrder.customerName}
                </p>
                <p style={{ margin: "0 0 4px", fontSize: "0.9rem" }}>
                  <strong>Phone:</strong> {selectedOrder.phone}
                </p>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>
                  <strong>Email:</strong> {selectedOrder.email}
                </p>
              </div>

              <div className="drawer-info-block" style={{ padding: "16px", background: "var(--cream-card)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <h4 style={{ margin: "0 0 10px", color: "var(--green)" }}>Delivery Address</h4>
                <p style={{ margin: "0 0 4px", fontSize: "0.9rem" }}>{selectedOrder.address}</p>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>
                  {selectedOrder.city}, {selectedOrder.state} &bull;{" "}
                  <strong>{selectedOrder.pincode}</strong>
                </p>
              </div>
            </div>

            {/* Status Controls */}
            <div
              className="drawer-status-bar"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 16px",
                background: "rgba(24, 66, 50, 0.04)",
                borderRadius: "12px",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Fulfillment Stage:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    fontFamily: "inherit",
                    fontWeight: 500,
                  }}
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--ink-light)" }}>Payment Status:</span>
                <Badge variant="success">PAID (Simulated)</Badge>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="drawer-items-section">
              <h4 style={{ margin: "0 0 12px", color: "var(--green)" }}>Dispensing Formulations</h4>
              <div className="drawer-items-table" style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 16px",
                      borderBottom:
                        idx === selectedOrder.items.length - 1
                          ? "none"
                          : "1px solid var(--border)",
                      background: idx % 2 === 0 ? "#fff" : "var(--cream)",
                    }}
                  >
                    <div>
                      <strong>{item.name}</strong>
                      <div className="text-muted text-xs">SKU: {item.productId}</div>
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "var(--ink-light)" }}>
                      {item.quantity} &times; ₹{item.price.toLocaleString("en-IN")}
                    </div>
                    <div>
                      <strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "16px",
                  padding: "12px 16px",
                  background: "var(--cream-card)",
                  borderRadius: "10px",
                  fontSize: "1.05rem",
                }}
              >
                <span>Grand Total:</span>
                <strong style={{ color: "var(--green)", fontSize: "1.2rem" }}>
                  ₹{selectedOrder.total.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
