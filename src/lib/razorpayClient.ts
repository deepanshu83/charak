/**
 * Razorpay Standard Web Checkout Client Integration
 * Handles script loading, order creation, checkout modal display, and signature verification.
 */

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface RazorpayOrderResponse {
  ok: boolean;
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  error?: string;
}

export interface RazorpaySuccessPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayFailurePayload {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  };
}

export interface VerifyPaymentResponse {
  ok: boolean;
  success: boolean;
  message?: string;
  error?: string;
  order_id?: string;
  payment_id?: string;
}

export interface CheckoutOptions {
  amountPaise: number; // In paise (minimum 100 paise = ₹1)
  currency?: string; // Default "INR"
  receipt?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  appointmentId?: string;
  onSuccess: (verifyResult: VerifyPaymentResponse, raw: RazorpaySuccessPayload) => void;
  onError: (errorMessage: string) => void;
  onDismiss?: () => void;
}

/**
 * Dynamically loads the Razorpay checkout script if not already present.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Step 1: Call Backend to Create Order
 */
export async function createRazorpayOrder(params: {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrderResponse> {
  const res = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency || "INR",
      receipt: params.receipt,
      notes: params.notes,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.ok || !data.order_id) {
    throw new Error(data.error || "Failed to initialize payment order.");
  }

  return data as RazorpayOrderResponse;
}

/**
 * Step 3: Call Backend to Verify Payment Signature
 */
export async function verifyRazorpayPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  appointmentId?: string;
}): Promise<VerifyPaymentResponse> {
  const res = await fetch("/api/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order_id: payload.razorpay_order_id,
      payment_id: payload.razorpay_payment_id,
      signature: payload.razorpay_signature,
      appointment_id: payload.appointmentId,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.ok || !data.success) {
    throw new Error(data.error || "Payment signature verification failed.");
  }

  return data as VerifyPaymentResponse;
}

/**
 * Step 2: Full Standard Checkout Flow
 * 1. Loads script
 * 2. Creates order
 * 3. Opens Razorpay modal
 * 4. Handles success, dismissal, and failure events
 * 5. Verifies signature on success
 */
export async function launchRazorpayCheckout(
  options: CheckoutOptions
): Promise<void> {
  // 1. Verify script availability
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    options.onError(
      "Unable to load Razorpay payment gateway. Please check your internet connection."
    );
    return;
  }

  try {
    // 2. Call backend /api/create-order
    const orderData = await createRazorpayOrder({
      amount: options.amountPaise,
      currency: options.currency || "INR",
      receipt: options.receipt,
      notes: options.notes,
    });

    const keyId =
      orderData.key_id ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      "rzp_test_TqQLYoIiSQSV0s";

    // 3. Configure Razorpay Standard Modal options
    const razorpayOptions = {
      key: keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Charak Ayurveda Clinic",
      description: options.description || "Ayurvedic Doctor Consultation",
      image: "/favicon.ico",
      order_id: orderData.order_id,
      prefill: {
        name: options.prefill?.name || "",
        email: options.prefill?.email || "",
        contact: options.prefill?.contact || "",
      },
      notes: options.notes || {},
      theme: {
        color: "#184232", // Authentic Charak deep ayurvedic emerald green
      },
      modal: {
        confirm_close: true,
        ondismiss: () => {
          if (options.onDismiss) {
            options.onDismiss();
          }
        },
      },
      handler: async (response: RazorpaySuccessPayload) => {
        try {
          // 4. Verify signature on backend
          const verifyResult = await verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            appointmentId: options.appointmentId,
          });

          options.onSuccess(verifyResult, response);
        } catch (verifyErr: any) {
          options.onError(
            verifyErr?.message ||
              "Payment received but verification failed. Please contact reception."
          );
        }
      },
    };

    const rzpInstance = new window.Razorpay(razorpayOptions);

    // Handle payment.failed event
    rzpInstance.on("payment.failed", (response: RazorpayFailurePayload) => {
      const reason =
        response.error?.description ||
        response.error?.reason ||
        "Payment transaction could not be processed.";
      options.onError(`Payment Failed: ${reason}`);
    });

    // Open Razorpay Standard Checkout modal
    rzpInstance.open();
  } catch (err: any) {
    options.onError(err?.message || "Failed to initiate payment checkout.");
  }
}
