import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const keyId =
      process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Handle auth / configuration failure
    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          ok: false,
          error: "Razorpay credentials are not configured on the server.",
        },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawAmount = body.amount;
    const currency = (body.currency || "INR").toUpperCase();
    const receipt =
      body.receipt ||
      `rcpt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const notes = body.notes || {};

    // Validate amount: Minimum 100 paise (₹1.00)
    const amountInPaise = Math.round(Number(rawAmount));
    if (isNaN(amountInPaise) || amountInPaise < 100) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid amount. Amount must be at least 100 paise (₹1.00).",
        },
        { status: 400 }
      );
    }

    // Initialize Razorpay SDK client
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Call Razorpay API: POST https://api.razorpay.com/v1/orders
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: String(receipt).slice(0, 40),
      notes: typeof notes === "object" && notes !== null ? notes : {},
    });

    return NextResponse.json({
      ok: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
    });
  } catch (error: any) {
    console.error("[Razorpay create-order error]:", error);

    const statusCode = error?.statusCode || 500;
    const errorMessage =
      error?.error?.description ||
      error?.message ||
      "Failed to create Razorpay order.";

    return NextResponse.json(
      {
        ok: false,
        error: errorMessage,
      },
      { status: statusCode === 401 ? 401 : 500 }
    );
  }
}
