import { NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/lib/supabaseServer";
import { verifyAdminRequest } from "@/lib/adminAuthServer";

export async function GET(req: Request) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const supabase = getAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Database client not configured. SUPABASE_SERVICE_ROLE_KEY is required in .env.local." },
        { status: 500 }
      );
    }

    const [
      totalProductsRes,
      activeProductsRes,
      totalOrdersRes,
      pendingOrdersRes,
      totalAppointmentsRes,
      pendingAppointmentsRes,
      totalDoctorsRes,
      activeDoctorsRes,
      totalTreatmentsRes,
      activeTreatmentsRes,
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("active", true),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }).in("order_status", ["PENDING", "PROCESSING"]),
      supabase.from("appointments").select("*", { count: "exact", head: true }),
      supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
      supabase.from("doctors").select("*", { count: "exact", head: true }),
      supabase.from("doctors").select("*", { count: "exact", head: true }).eq("active", true),
      supabase.from("treatments").select("*", { count: "exact", head: true }),
      supabase.from("treatments").select("*", { count: "exact", head: true }).eq("active", true),
    ]);

    const errors = [
      totalProductsRes.error,
      activeProductsRes.error,
      totalOrdersRes.error,
      pendingOrdersRes.error,
      totalAppointmentsRes.error,
      pendingAppointmentsRes.error,
      totalDoctorsRes.error,
      activeDoctorsRes.error,
      totalTreatmentsRes.error,
      activeTreatmentsRes.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      console.warn(
        "[Admin Dashboard API] Warning during count queries:",
        errors.map((e) => e?.message)
      );
    }

    const stats = {
      totalProducts: totalProductsRes.count ?? 0,
      activeProducts: activeProductsRes.count ?? 0,
      totalOrders: totalOrdersRes.count ?? 0,
      pendingOrders: pendingOrdersRes.count ?? 0,
      totalAppointments: totalAppointmentsRes.count ?? 0,
      pendingAppointments: pendingAppointmentsRes.count ?? 0,
      totalDoctors: totalDoctorsRes.count ?? 0,
      activeDoctors: activeDoctorsRes.count ?? 0,
      totalTreatments: totalTreatmentsRes.count ?? 0,
      activeTreatments: activeTreatmentsRes.count ?? 0,
    };

    return NextResponse.json({ ok: true, data: stats });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
