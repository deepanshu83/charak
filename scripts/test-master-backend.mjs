// Master Backend Verification Suite - Ayurveda Hospital Website
// Tests Products, Orders & Stock Safety, Appointments & Double Booking,
// Content Availability, Admin CRUD, and Dashboard Statistics.
// Run with: node scripts/test-master-backend.mjs

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const ADMIN_TOKEN = "charak-admin-internal-test-token-2026";

function getHeaders(path, extra = {}) {
  const headers = { ...extra };
  if (path.startsWith("/api/admin")) {
    headers["Authorization"] = `Bearer ${ADMIN_TOKEN}`;
  }
  return headers;
}

async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: getHeaders(path, { "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: getHeaders(path),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function patch(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: getHeaders(path, { "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runSuite() {
  console.log("==================================================");
  console.log("CHARAK AYURVEDA — MASTER BACKEND VERIFICATION");
  console.log("==================================================");
  console.log(`Target: ${BASE_URL}\n`);

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = "") {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${details}`);
    }
  }

  // ==========================================================================
  // MODULE 1: PRODUCT & ORDER SYSTEM (WITH STOCK SAFETY)
  // ==========================================================================
  console.log("--- MODULE 1: Product & Order System (With Stock Safety) ---");

  // 1.1 Customer Info Validation
  const invOrderName = await post("/api/orders", {
    customerName: "",
    phone: "+91 98765 43210",
    address: "123 Main Road",
    city: "Pilani",
    state: "Rajasthan",
    pincode: "333031",
    items: [{ productId: "prod-1", quantity: 1 }],
  });
  assert(
    invOrderName.status === 400 && invOrderName.data.code === "NAME_REQUIRED",
    "Orders: Customer name required (400 NAME_REQUIRED)",
    `Status: ${invOrderName.status}, Error: ${invOrderName.data.error}`
  );

  const invOrderPhone = await post("/api/orders", {
    customerName: "Rohan Varma",
    phone: "abc",
    address: "123 Main Road",
    city: "Pilani",
    state: "Rajasthan",
    pincode: "333031",
    items: [{ productId: "prod-1", quantity: 1 }],
  });
  assert(
    invOrderPhone.status === 400 && invOrderPhone.data.code === "INVALID_PHONE",
    "Orders: Valid phone required (400 INVALID_PHONE)",
    `Status: ${invOrderPhone.status}, Error: ${invOrderPhone.data.error}`
  );

  const invOrderPincode = await post("/api/orders", {
    customerName: "Rohan Varma",
    phone: "+91 98765 43210",
    address: "123 Main Road",
    city: "Pilani",
    state: "Rajasthan",
    pincode: "123", // invalid
    items: [{ productId: "prod-1", quantity: 1 }],
  });
  assert(
    invOrderPincode.status === 400 && invOrderPincode.data.code === "PINCODE_REQUIRED",
    "Orders: 6-digit postal PIN code required (400 PINCODE_REQUIRED)",
    `Status: ${invOrderPincode.status}, Error: ${invOrderPincode.data.error}`
  );

  const invOrderItems = await post("/api/orders", {
    customerName: "Rohan Varma",
    phone: "+91 98765 43210",
    address: "123 Main Road",
    city: "Pilani",
    state: "Rajasthan",
    pincode: "333031",
    items: [],
  });
  assert(
    invOrderItems.status === 400 && invOrderItems.data.code === "ITEMS_REQUIRED",
    "Orders: Empty cart/items rejected (400 ITEMS_REQUIRED)",
    `Status: ${invOrderItems.status}, Error: ${invOrderItems.data.error}`
  );

  // 1.2 Inactive / Out-of-Stock Products
  const outOfStockRes = await post("/api/orders", {
    customerName: "Sunita Roy",
    phone: "+91 98765 43210",
    address: "12, Birla Colony",
    city: "Pilani",
    state: "Rajasthan",
    pincode: "333031",
    items: [{ productId: "prod-6", quantity: 1 }], // prod-6 has stock: 0
  });
  assert(
    outOfStockRes.status === 409 && outOfStockRes.data.code === "INSUFFICIENT_STOCK",
    "Orders: Product with zero stock rejected (409 INSUFFICIENT_STOCK)",
    `Status: ${outOfStockRes.status}, Error: ${outOfStockRes.data.error}`
  );

  const excessiveStockRes = await post("/api/orders", {
    customerName: "Sunita Roy",
    phone: "+91 98765 43210",
    address: "12, Birla Colony",
    city: "Pilani",
    state: "Rajasthan",
    pincode: "333031",
    items: [{ productId: "prod-1", quantity: 9999 }], // Exceeds inventory
  });
  assert(
    excessiveStockRes.status === 409 && excessiveStockRes.data.code === "INSUFFICIENT_STOCK",
    "Orders: Excessive quantity exceeding inventory rejected (409 INSUFFICIENT_STOCK)",
    `Status: ${excessiveStockRes.status}, Error: ${excessiveStockRes.data.error}`
  );

  // 1.3 Server-Side Pricing & Normal Order Creation
  // Customer sends manipulated client price (e.g., price = ₹1); server must override with true ₹1499!
  const normalOrderRes = await post("/api/orders", {
    customerName: "Kavita Rao",
    phone: "+91 98765 43210",
    email: "kavita@example.com",
    address: "Flat 4B, Shivalik Towers",
    city: "Pilani",
    state: "Rajasthan",
    pincode: "333031",
    items: [{ productId: "prod-1", quantity: 2, price: 1 }], // Fake price 1 sent by client
  });
  const createdOrder = normalOrderRes.data?.data;
  assert(
    normalOrderRes.status === 201 &&
      createdOrder?.total === 2998 && // 1499 * 2 = 2998
      createdOrder?.items[0]?.price === 1499 &&
      createdOrder?.paymentStatus === "PENDING" &&
      createdOrder?.status === "PROCESSING",
    "Orders: Server calculates true price (₹1499 x 2 = ₹2998), ignoring client price",
    `Status: ${normalOrderRes.status}, Total: ${createdOrder?.total}`
  );

  // 1.4 Order Lookup & Admin Order Listing
  const orderId = createdOrder?.id;
  if (orderId) {
    const fetchOrderRes = await get(`/api/orders?id=${orderId}`);
    assert(
      fetchOrderRes.status === 200 && fetchOrderRes.data?.data?.customerName === "Kavita Rao",
      "Orders: Order details retrievable via GET /api/orders?id=...",
      `Status: ${fetchOrderRes.status}`
    );

    const adminOrdersRes = await get("/api/admin/orders");
    const foundInAdmin = adminOrdersRes.data?.data?.find((o) => o.id === orderId);
    assert(
      adminOrdersRes.status === 200 && !!foundInAdmin,
      "Orders: Newly created order immediately appears in Admin Orders",
      `Found: ${JSON.stringify(foundInAdmin)}`
    );

    // 1.5 Admin Status Update Persistence
    const patchOrderRes = await patch("/api/admin/orders", {
      id: orderId,
      orderStatus: "SHIPPED",
      paymentStatus: "PAID",
    });
    assert(
      patchOrderRes.status === 200 && patchOrderRes.data?.ok === true,
      "Orders: Admin updates orderStatus to SHIPPED & paymentStatus to PAID",
      `Status: ${patchOrderRes.status}`
    );

    const recheckAdmin = await get("/api/admin/orders");
    const updatedInAdmin = recheckAdmin.data?.data?.find((o) => o.id === orderId);
    assert(
      updatedInAdmin?.status === "SHIPPED" && updatedInAdmin?.paymentStatus === "PAID",
      "Orders: Admin status updates persist upon re-fetch",
      `Status: ${updatedInAdmin?.status}, Payment: ${updatedInAdmin?.paymentStatus}`
    );
  }

  // ==========================================================================
  // MODULE 2: APPOINTMENT SYSTEM & DOUBLE-BOOKING PROTECTION
  // ==========================================================================
  console.log("\n--- MODULE 2: Appointment System & Double-Booking Protection ---");

  const testDate = "2026-10-22"; // Future Thursday
  const testSlot = "11:00";
  const doctorId = "doc-1";
  const treatmentId = "treat-1";

  // Reset prior test booking on this slot for test idempotency
  const adminAppts = await get("/api/admin/appointments");
  if (Array.isArray(adminAppts.data?.data)) {
    for (const appt of adminAppts.data.data) {
      if (appt.date === testDate && appt.time === testSlot && appt.status !== "CANCELLED") {
        await patch("/api/admin/appointments", { id: appt.id, status: "CANCELLED" });
      }
    }
  }

  // 2.1 Dynamic Slots
  const availRes = await get(`/api/appointments/availability?doctorId=${doctorId}&date=${testDate}`);
  assert(
    availRes.status === 200 && Array.isArray(availRes.data?.data?.slots),
    "Appointments: Dynamic availability returned from doctor schedule",
    `Slots count: ${availRes.data?.data?.slots?.length}`
  );

  // 2.2 Rejections: Past Date & Sunday
  const pastApt = await post("/api/appointments", {
    patientName: "Past Test",
    phone: "+91 98765 43210",
    doctorId,
    treatmentId,
    date: "2026-09-01",
    time: "10:00",
  });
  assert(
    pastApt.status === 400 && pastApt.data.code === "DATE_IN_PAST",
    "Appointments: Past date rejected (400 DATE_IN_PAST)",
    `Status: ${pastApt.status}`
  );

  const sundayApt = await post("/api/appointments", {
    patientName: "Sunday Test",
    phone: "+91 98765 43210",
    doctorId,
    treatmentId,
    date: "2026-10-25", // Sunday
    time: "10:00",
  });
  assert(
    sundayApt.status === 400 && sundayApt.data.code === "NO_AVAILABILITY_ON_DAY",
    "Appointments: Sunday consultation rejected for doctor off-duty (400 NO_AVAILABILITY_ON_DAY)",
    `Status: ${sundayApt.status}`
  );

  // 2.3 Booking & Double-Booking Prevention
  const bookApt1 = await post("/api/appointments", {
    patientName: "Deepak Joshi",
    phone: "+91 98765 43210",
    doctorId,
    treatmentId,
    date: testDate,
    time: testSlot,
  });
  assert(
    bookApt1.status === 201 && !!bookApt1.data?.data?.id,
    "Appointments: Normal booking created successfully (201 Created)",
    `Status: ${bookApt1.status}`
  );
  const createdAptId = bookApt1.data?.data?.id;

  const doubleBookApt = await post("/api/appointments", {
    patientName: "Concurrent Patient",
    phone: "+91 91111 22222",
    doctorId,
    treatmentId,
    date: testDate,
    time: testSlot, // IDENTICAL SLOT
  });
  assert(
    doubleBookApt.status === 409 &&
      doubleBookApt.data.code === "SLOT_ALREADY_BOOKED" &&
      doubleBookApt.data.error === "This appointment slot was just booked. Please select another time.",
    "Appointments: Double-booking rejected with 409 & clean user message",
    `Status: ${doubleBookApt.status}, Message: ${doubleBookApt.data.error}`
  );

  // 2.4 Cancellation frees the slot
  if (createdAptId) {
    const cancelRes = await patch("/api/admin/appointments", {
      id: createdAptId,
      status: "CANCELLED",
    });
    assert(
      cancelRes.status === 200 && cancelRes.data?.ok === true,
      "Appointments: Admin cancels appointment",
      `Status: ${cancelRes.status}`
    );

    const checkFreedSlot = await get(`/api/appointments/availability?doctorId=${doctorId}&date=${testDate}`);
    const isNowFree = checkFreedSlot.data?.data?.availableSlots?.includes(testSlot);
    assert(
      checkFreedSlot.status === 200 && isNowFree === true,
      "Appointments: Cancelled slot becomes available again for future patients",
      `Is free: ${isNowFree}`
    );
  }

  // ==========================================================================
  // MODULE 3: ADMIN CRUD & VALIDATIONS
  // ==========================================================================
  console.log("\n--- MODULE 3: Admin CRUD & Data Validations ---");

  // 3.1 Doctor Specialization Validation
  const invDoctorRes = await post("/api/admin/doctors", {
    name: "Dr. Testing",
    specialization: "", // Missing specialization
  });
  assert(
    invDoctorRes.status === 400 && invDoctorRes.data.error.includes("specialization"),
    "Admin Doctors: Missing specialization rejected (400)",
    `Status: ${invDoctorRes.status}, Error: ${invDoctorRes.data.error}`
  );

  // 3.2 Product Validation: Negative Price
  const invProdPrice = await post("/api/admin/products", {
    name: "Herbal Test",
    price: -50,
  });
  assert(
    invProdPrice.status === 400 && invProdPrice.data.error.includes("negative"),
    "Admin Products: Negative price rejected (400)",
    `Status: ${invProdPrice.status}, Error: ${invProdPrice.data.error}`
  );

  // 3.3 Treatment Validation: Negative Price
  const invTreatPrice = await post("/api/admin/treatments", {
    name: "Therapy Test",
    price: -100,
  });
  assert(
    invTreatPrice.status === 400 && invTreatPrice.data.error.includes("negative"),
    "Admin Treatments: Negative price rejected (400)",
    `Status: ${invTreatPrice.status}, Error: ${invTreatPrice.data.error}`
  );

  // ==========================================================================
  // MODULE 4: ADMIN DASHBOARD METRICS
  // ==========================================================================
  console.log("\n--- MODULE 4: Admin Dashboard Metrics ---");

  const dashRes = await get("/api/admin/dashboard");
  const stats = dashRes.data?.data;
  assert(
    dashRes.status === 200 &&
      typeof stats?.totalProducts === "number" &&
      typeof stats?.activeProducts === "number" &&
      typeof stats?.totalDoctors === "number" &&
      typeof stats?.totalTreatments === "number" &&
      typeof stats?.totalOrders === "number" &&
      typeof stats?.totalAppointments === "number",
    "Admin Dashboard: Returns real metrics for products, orders, appointments, doctors & treatments",
    `Dashboard Stats: ${JSON.stringify(stats)}`
  );

  console.log("\n==================================================");
  console.log(`SUMMARY: ${passed} of ${total} tests passed.`);
  console.log("==================================================");

  if (passed === total) {
    console.log("🎉 ALL MASTER BACKEND TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  } else {
    console.error("⚠️ Some tests failed. Please review output above.");
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
