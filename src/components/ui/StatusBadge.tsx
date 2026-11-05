import React from "react";

export default function StatusBadge({ status }: { status: string }) {
  const norm = (status || "").toUpperCase();
  let badgeClass = "badge-pending";
  let dotColor = "#f59e0b";
  let label = status;

  if (norm === "CONFIRMED") {
    badgeClass = "badge-confirmed";
    dotColor = "#16a34a";
    label = "Confirmed";
  } else if (norm === "COMPLETED") {
    badgeClass = "badge-completed";
    dotColor = "#2563eb";
    label = "Completed";
  } else if (norm === "CANCELLED") {
    badgeClass = "badge-cancelled";
    dotColor = "#dc2626";
    label = "Cancelled";
  } else if (norm === "PENDING") {
    badgeClass = "badge-pending";
    dotColor = "#ef4444";
    label = "New / Pending Action";
  }

  return (
    <span
      className={`admin-status-pill ${badgeClass}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "0.78rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          backgroundColor: dotColor,
          display: "inline-block",
          boxShadow: norm === "PENDING" ? `0 0 6px ${dotColor}` : "none",
        }}
        className={norm === "PENDING" ? "pulse-dot" : ""}
      />
      {label}
    </span>
  );
}
