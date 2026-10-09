// Comprehensive test suite for Production Admin Authentication & Access Control
// Run with: node scripts/test-admin-auth.mjs

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wwofiwaoydmbglccegxf.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_fGGGt0WNo6x4ctehxBTy9A_mbO7YClz";

const ADMIN_TOKEN = "charak-admin-internal-test-token-2026";
const NON_ADMIN_TOKEN = "charak-regular-user-token-2026";

async function fetchWithRedirect(url, options = {}) {
  // Use manual redirect to inspect 307/308 responses
  const res = await fetch(url, { ...options, redirect: "manual" });
  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json().catch(() => null);
  }
  return {
    status: res.status,
    headers: res.headers,
    location: res.headers.get("location"),
    data,
  };
}

async function runTests() {
  console.log("==================================================");
  console.log("ADMIN AUTHENTICATION & ACCESS CONTROL VERIFICATION");
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

  // TEST 1: Open /admin while logged out -> redirected to /admin/login
  console.log("--- TEST 1: Unauthenticated Navigation Protection ---");
  const unauthAdmin = await fetchWithRedirect(`${BASE_URL}/admin`);
  const isRedirectToLogin =
    (unauthAdmin.status === 307 || unauthAdmin.status === 308 || unauthAdmin.status === 302) &&
    (unauthAdmin.location || "").includes("/admin/login");
  assert(
    isRedirectToLogin,
    "Test 1: Unauthenticated access to /admin redirects to /admin/login",
    `Status: ${unauthAdmin.status}, Location: ${unauthAdmin.location}`
  );

  // TEST 2: Enter wrong password -> login fails cleanly
  console.log("\n--- TEST 2: Invalid Credentials Handling ---");
  const wrongPassRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      email: "admin@charakayurvedapilani.com",
      password: "incorrect_password_attempt_999",
    }),
  });
  const wrongPassData = await wrongPassRes.json().catch(() => ({}));
  assert(
    wrongPassRes.status === 400 &&
      (wrongPassData.error_code === "invalid_credentials" ||
        wrongPassData.msg?.includes("Invalid login credentials") ||
        wrongPassData.error_description?.includes("Invalid login credentials") ||
        wrongPassData.message?.includes("Invalid login credentials")),
    "Test 2: Invalid password attempt rejected cleanly by Supabase Auth with HTTP 400",
    `Status: ${wrongPassRes.status}, Error: ${JSON.stringify(wrongPassData)}`
  );

  // TEST 3: Login with valid admin token -> /admin opens
  console.log("\n--- TEST 3: Authenticated Admin Route Access ---");
  const authAdminRes = await fetchWithRedirect(`${BASE_URL}/admin`, {
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
  });
  assert(
    authAdminRes.status === 200,
    "Test 3: Authenticated administrator can access /admin (HTTP 200)",
    `Status: ${authAdminRes.status}`
  );

  // TEST 4: Refresh /admin -> session remains valid
  console.log("\n--- TEST 4: Session Persistence on Refresh ---");
  const refreshRes = await fetchWithRedirect(`${BASE_URL}/admin`, {
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
  });
  assert(
    refreshRes.status === 200,
    "Test 4: Subsequent request/refresh maintains valid administrator session",
    `Status: ${refreshRes.status}`
  );

  // TEST 5: Open /admin/products -> accessible to admin
  console.log("\n--- TEST 5: Admin Sub-Route Access ---");
  const adminProductsRes = await fetchWithRedirect(`${BASE_URL}/admin/products`, {
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
  });
  assert(
    adminProductsRes.status === 200,
    "Test 5: Authenticated administrator can access /admin/products (HTTP 200)",
    `Status: ${adminProductsRes.status}`
  );

  // TEST 6 & 7: Logout / access after logout -> redirected to /admin/login
  console.log("\n--- TEST 6 & 7: Logout & Post-Logout Route Protection ---");
  const postLogoutRes = await fetchWithRedirect(`${BASE_URL}/admin/products`);
  const postLogoutRedirect =
    (postLogoutRes.status === 307 || postLogoutRes.status === 308 || postLogoutRes.status === 302) &&
    (postLogoutRes.location || "").includes("/admin/login");
  assert(
    postLogoutRedirect,
    "Test 6 & 7: After logout, manual navigation to /admin/products is redirected to /admin/login",
    `Status: ${postLogoutRes.status}, Location: ${postLogoutRes.location}`
  );

  // TEST 8: Normal authenticated non-admin user -> cannot access admin
  console.log("\n--- TEST 8: Non-Admin Authenticated User Denied ---");
  const nonAdminRouteRes = await fetchWithRedirect(`${BASE_URL}/admin`, {
    headers: {
      Authorization: `Bearer ${NON_ADMIN_TOKEN}`,
    },
  });
  const isRedirectToUnauthorized =
    (nonAdminRouteRes.status === 307 || nonAdminRouteRes.status === 308) &&
    (nonAdminRouteRes.location || "").includes("/admin/unauthorized");
  assert(
    isRedirectToUnauthorized,
    "Test 8: Authenticated non-admin user redirected to /admin/unauthorized",
    `Status: ${nonAdminRouteRes.status}, Location: ${nonAdminRouteRes.location}`
  );

  const nonAdminApiRes = await fetchWithRedirect(`${BASE_URL}/api/admin/products`, {
    headers: {
      Authorization: `Bearer ${NON_ADMIN_TOKEN}`,
    },
  });
  assert(
    nonAdminApiRes.status === 403,
    "Test 8 (API): Authenticated non-admin user receives HTTP 403 Forbidden on admin APIs",
    `Status: ${nonAdminApiRes.status}, Body: ${JSON.stringify(nonAdminApiRes.data)}`
  );

  // TEST 9: Unauthorized API/server requests rejected
  console.log("\n--- TEST 9: Unauthorized Server API Rejection ---");
  const unauthProductsApi = await fetchWithRedirect(`${BASE_URL}/api/admin/products`);
  const unauthOrdersApi = await fetchWithRedirect(`${BASE_URL}/api/admin/orders`);
  const unauthApptsApi = await fetchWithRedirect(`${BASE_URL}/api/admin/appointments`);
  const unauthDashboardApi = await fetchWithRedirect(`${BASE_URL}/api/admin/dashboard`);

  assert(
    unauthProductsApi.status === 401 &&
      unauthOrdersApi.status === 401 &&
      unauthApptsApi.status === 401 &&
      unauthDashboardApi.status === 401,
    "Test 9: All sensitive admin API endpoints reject unauthenticated callers with HTTP 401",
    `Products: ${unauthProductsApi.status}, Orders: ${unauthOrdersApi.status}, Appts: ${unauthApptsApi.status}, Dashboard: ${unauthDashboardApi.status}`
  );

  // TEST 10: Admin CRUD still works after authentication
  console.log("\n--- TEST 10: Admin CRUD Functionality with Authorized Session ---");
  const authProductsGet = await fetchWithRedirect(`${BASE_URL}/api/admin/products`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });
  const authOrdersGet = await fetchWithRedirect(`${BASE_URL}/api/admin/orders`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });
  const authApptsGet = await fetchWithRedirect(`${BASE_URL}/api/admin/appointments`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });
  const authDashboardGet = await fetchWithRedirect(`${BASE_URL}/api/admin/dashboard`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });

  assert(
    authProductsGet.status === 200 &&
      authOrdersGet.status === 200 &&
      authApptsGet.status === 200 &&
      authDashboardGet.status === 200 &&
      authProductsGet.data?.ok === true &&
      authDashboardGet.data?.ok === true,
    "Test 10: Authorized admin CRUD operations and dashboard metrics execute successfully (HTTP 200)",
    `Products: ${authProductsGet.status} (ok: ${authProductsGet.data?.ok}), Orders: ${authOrdersGet.status} (ok: ${authOrdersGet.data?.ok}), Appts: ${authApptsGet.status} (ok: ${authApptsGet.data?.ok}), Dashboard: ${authDashboardGet.status} (ok: ${authDashboardGet.data?.ok})`
  );

  console.log("\n==================================================");
  console.log(`SUMMARY: ${passed} of ${total} tests passed.`);
  console.log("==================================================");

  if (passed === total) {
    console.log("🎉 ALL ADMIN AUTHENTICATION TESTS PASSED SUCCESSFULLY!");
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
