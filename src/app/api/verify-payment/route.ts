import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminSupabaseClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function POST(req: Request) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: "Razorpay secret key is not configured on the server.",
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const orderId = body.order_id || body.razorpay_order_id;
    const paymentId = body.payment_id || body.razorpay_payment_id;
    const signature = body.signature || body.razorpay_signature;
    const appointmentId = body.appointment_id || body.appointmentId;

    // Validate missing fields -> return 400
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: "Missing required fields: order_id, payment_id, and signature are required.",
        },
        { status: 400 }
      );
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const payload = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(payload)
      .digest("hex");

    // Timing-safe comparison to prevent timing attacks
    const isAuthentic =
      generatedSignature.length === signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(generatedSignature, "utf8"),
        Buffer.from(signature, "utf8")
      );

    if (!isAuthentic) {
      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: "Signature mismatch. Payment verification failed.",
        },
        { status: 400 }
      );
    }

    // Payment signature is valid and authentic!
    // If appointment ID was passed, update appointment payment status in Supabase
    if (appointmentId && typeof appointmentId === "string" && isUUID(appointmentId)) {
      try {
        const supabase = getAdminSupabaseClient();
        if (supabase) {
          await supabase
            .from("appointments")
            .update({
              payment_status: "PAID",
              status: "CONFIRMED",
              notes: body.notes ? String(body.notes) : undefined,
            })
            .eq("id", appointmentId);
        }
      } catch (dbError) {
        console.warn("[Razorpay verify] Note: Appointment DB update warning:", dbError);
      }
    }

    return NextResponse.json({
      ok: true,
      success: true,
      message: "Payment verified successfully.",
      order_id: orderId,
      payment_id: paymentId,
    });
  } catch (error: unknown) {
    console.error("[Razorpay verify-payment error]:", error);
    const msg = error instanceof Error ? error.message : "Internal server error verifying payment.";
    return NextResponse.json(
      {
        ok: false,
        success: false,
        error: msg,
      },
      { status: 500 }
    );
  }
}
