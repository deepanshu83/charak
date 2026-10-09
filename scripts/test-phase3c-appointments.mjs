// Comprehensive test suite for Phase 3C Real Supabase Appointment Booking System
// Run with: node scripts/test-phase3c-appointments.mjs

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

async function runTests() {
  console.log("==================================================");
  console.log("PHASE 3C: APPOINTMENT SYSTEM VERIFICATION SUITE");
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

  // Pick future test dates
  const testDate = "2026-10-15"; // Future Thursday
  const testSlot = "10:00";
  const doctorId = "doc-1";
  const treatmentId = "treat-1";

  // Reset any prior test run appointments on this slot so suite is idempotent
  const existingAppts = await get("/api/admin/appointments");
  if (Array.isArray(existingAppts.data?.data)) {
    for (const appt of existingAppts.data.data) {
      if (appt.date === testDate && appt.time === testSlot && appt.status !== "CANCELLED") {
        await patch("/api/admin/appointments", { id: appt.id, status: "CANCELLED" });
      }
    }
  }

  // Test 4: Past date rejected
  console.log("\n--- Testing Edge Cases: Validation ---");
  const pastRes = await post("/api/appointments", {
    patientName: "Past Date Test",
    phone: "+91 98765 43210",
    email: "test@example.com",
    doctorId,
    treatmentId,
    date: "2026-10-01",
    time: "10:00",
  });
  assert(
    pastRes.status === 400 && pastRes.data.code === "DATE_IN_PAST",
    "Test 4: Past date rejected with 400 DATE_IN_PAST",
    `Status: ${pastRes.status}, Error: ${pastRes.data.error}`
  );

  // Test 5: Invalid doctor rejected
  const invDocRes = await post("/api/appointments", {
    patientName: "Invalid Doctor Test",
    phone: "+91 98765 43210",
    email: "test@example.com",
    doctorId: "doc-999-invalid",
    treatmentId,
    date: testDate,
    time: "10:00",
  });
  assert(
    invDocRes.status === 400 && invDocRes.data.code === "DOCTOR_NOT_FOUND",
    "Test 5: Invalid doctor rejected with 400 DOCTOR_NOT_FOUND",
    `Status: ${invDocRes.status}, Error: ${invDocRes.data.error}`
  );

  // Test 6: Invalid treatment rejected
  const invTreatRes = await post("/api/appointments", {
    patientName: "Invalid Treatment Test",
    phone: "+91 98765 43210",
    email: "test@example.com",
    doctorId,
    treatmentId: "treat-999-invalid",
    date: testDate,
    time: "10:00",
  });
  assert(
    invTreatRes.status === 400 && invTreatRes.data.code === "TREATMENT_NOT_FOUND",
    "Test 6: Invalid treatment rejected with 400 TREATMENT_NOT_FOUND",
    `Status: ${invTreatRes.status}, Error: ${invTreatRes.data.error}`
  );

  // Test 7: Invalid slot rejected (Dr. Sharma hours on Thursday end at 13:00)
  const invSlotRes = await post("/api/appointments", {
    patientName: "Invalid Slot Test",
    phone: "+91 98765 43210",
    email: "test@example.com",
    doctorId,
    treatmentId,
    date: testDate,
    time: "16:00", // Not in consulting hours
  });
  assert(
    invSlotRes.status === 400 && invSlotRes.data.code === "INVALID_SLOT",
    "Test 7: Invalid slot outside consulting hours rejected with 400 INVALID_SLOT",
    `Status: ${invSlotRes.status}, Error: ${invSlotRes.data.error}`
  );

  // Test 8: Doctor with no availability (Sunday for doc-1 if doc-1 is Mon-Sat)
  const sundayDate = "2026-10-18"; // Sunday
  const noAvailRes = await post("/api/appointments", {
    patientName: "Sunday Consult Test",
    phone: "+91 98765 43210",
    email: "test@example.com",
    doctorId,
    treatmentId,
    date: sundayDate,
    time: "10:00",
  });
  assert(
    noAvailRes.status === 400 && noAvailRes.data.code === "NO_AVAILABILITY_ON_DAY",
    "Test 8: Doctor with no availability on Sunday rejected with 400 NO_AVAILABILITY_ON_DAY",
    `Status: ${noAvailRes.status}, Error: ${noAvailRes.data.error}`
  );

  // Test 1: Normal booking
  console.log("\n--- Testing Normal Booking & Double Booking ---");
  const book1Res = await post("/api/appointments", {
    patientName: "Ananya Deshmukh",
    phone: "+91 98765 43210",
    email: "ananya@example.com",
    doctorId,
    treatmentId,
    date: testDate,
    time: testSlot,
    notes: "Chronic joint ache and dosha consultation",
  });
  assert(
    book1Res.status === 201 && book1Res.data.ok === true && !!book1Res.data.data.id,
    "Test 1: Normal booking created successfully (201)",
    `Status: ${book1Res.status}, Response: ${JSON.stringify(book1Res.data)}`
  );
  const createdApptId = book1Res.data?.data?.id;

  // Test 2: Same slot booked twice simultaneously (Double Booking Protection)
  const doubleBookRes = await post("/api/appointments", {
    patientName: "Rohan Varma",
    phone: "+91 91234 56789",
    email: "rohan@example.com",
    doctorId,
    treatmentId,
    date: testDate,
    time: testSlot, // IDENTICAL SLOT
  });
  assert(
    doubleBookRes.status === 409 &&
      doubleBookRes.data.code === "SLOT_ALREADY_BOOKED" &&
      doubleBookRes.data.error === "This appointment slot was just booked. Please select another time.",
    "Test 2: Double-booking rejected with 409 and clean error message",
    `Status: ${doubleBookRes.status}, Error: ${doubleBookRes.data.error}`
  );

  // Test 9 & Slot Availability: Check that booked slot is marked unavailable
  console.log("\n--- Testing Availability Endpoint Reflection ---");
  const availRes = await get(`/api/appointments/availability?doctorId=${doctorId}&date=${testDate}`);
  const slotObj = availRes.data?.data?.slots?.find((s) => s.time === testSlot);
  const isExcludedFromAvailableList = !availRes.data?.data?.availableSlots?.includes(testSlot);
  assert(
    availRes.status === 200 && slotObj && slotObj.isAvailable === false && isExcludedFromAvailableList,
    "Test 9: Booked slot is excluded from available slots and marked isAvailable: false",
    `Slot status: ${JSON.stringify(slotObj)}`
  );

  // Test 10: Refresh after booking (retrieval by ID)
  console.log("\n--- Testing Fetch Appointment by ID & Admin Reflection ---");
  if (createdApptId) {
    const fetchRes = await get(`/api/appointments?id=${createdApptId}`);
    assert(
      fetchRes.status === 200 &&
        fetchRes.data.data.id === createdApptId &&
        fetchRes.data.data.patientName === "Ananya Deshmukh" &&
        fetchRes.data.data.status === "CONFIRMED",
      "Test 10: Refresh/Lookup after booking retrieves full appointment",
      `Data: ${JSON.stringify(fetchRes.data)}`
    );
  }

  // Test 11: Admin sees newly created appointment
  const adminRes = await get("/api/admin/appointments");
  const adminFound = adminRes.data?.data?.find(
    (a) => a.id === createdApptId || (a.date === testDate && a.time === testSlot)
  );
  assert(
    adminRes.status === 200 && !!adminFound,
    "Test 11: Admin list immediately reflects newly created appointment",
    `Found in admin: ${JSON.stringify(adminFound)}`
  );

  // Test 12 & 3: Admin status change and Cancelled slot becomes available again
  console.log("\n--- Testing Admin Status Change & Slot Release ---");
  if (createdApptId) {
    const patchRes = await patch("/api/admin/appointments", {
      id: createdApptId,
      status: "CANCELLED",
      notes: "Cancelled upon patient request",
    });
    assert(
      patchRes.status === 200 && patchRes.data.ok === true,
      "Test 12: Admin status change persists (status updated to CANCELLED)",
      `Status: ${patchRes.status}, Response: ${JSON.stringify(patchRes.data)}`
    );

    // Test 3: Cancelled slot becomes available again
    const availAfterCancel = await get(
      `/api/appointments/availability?doctorId=${doctorId}&date=${testDate}`
    );
    const releasedSlot = availAfterCancel.data?.data?.slots?.find((s) => s.time === testSlot);
    const isNowAvailable = availAfterCancel.data?.data?.availableSlots?.includes(testSlot);
    assert(
      availAfterCancel.status === 200 && releasedSlot?.isAvailable === true && isNowAvailable,
      "Test 3: Cancelled slot becomes available again for new bookings",
      `Released slot: ${JSON.stringify(releasedSlot)}`
    );

    // Book the freed slot again to verify reuse
    const rebookRes = await post("/api/appointments", {
      patientName: "Vikram Malhotra",
      phone: "+91 99887 76655",
      email: "vikram@example.com",
      doctorId,
      treatmentId,
      date: testDate,
      time: testSlot,
    });
    assert(
      rebookRes.status === 201 && rebookRes.data.ok === true,
      "Freed slot successfully re-booked by another patient",
      `Status: ${rebookRes.status}`
    );

    // Clean up rebooked slot so subsequent test runs start clean
    if (rebookRes.data?.data?.id) {
      await patch("/api/admin/appointments", {
        id: rebookRes.data.data.id,
        status: "CANCELLED",
      });
    }
  }

  console.log("\n==================================================");
  console.log(`SUMMARY: ${passed} of ${total} tests passed.`);
  console.log("==================================================");

  if (passed === total) {
    console.log("🎉 ALL PHASE 3C TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  } else {
    console.error("⚠️ Some tests failed. Please investigate.");
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test runner encountered error:", e);
  process.exit(1);
});
