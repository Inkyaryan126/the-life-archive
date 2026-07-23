import assert from "node:assert";

// Helper functions testing route inclusion & exclusion rules and active state matching

export function isRouteAuthenticatedMobileNavIncluded(
  pathname: string,
  isSignedIn: boolean
): boolean {
  if (!isSignedIn) {
    return false;
  }

  // Explicit excluded routes even when signed in
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/legacy-question") ||
    pathname.startsWith("/legacy-prologue") ||
    pathname.startsWith("/claim/") ||
    pathname.startsWith("/delivery/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/")
  ) {
    return false;
  }

  // Explicit included routes
  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/archive/") ||
    pathname === "/member-card" ||
    pathname === "/keepsakes"
  ) {
    return true;
  }

  return false;
}

export function getActiveItemLabel(pathname: string): string {
  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/settings")
  ) {
    return "DASHBOARD";
  }
  if (pathname.includes("/add-memory")) {
    return "ADD MEMORY";
  }
  if (pathname.startsWith("/archive/") && pathname.includes("/memories")) {
    return "MEMORIES";
  }
  if (pathname.startsWith("/dashboard/time-capsules")) {
    return "TIME CAPSULES";
  }
  if (pathname === "/member-card") {
    return "MEMBER CARD";
  }

  return "DASHBOARD";
}

export function resolveNavHrefs(slug?: string | null): {
  memoriesHref: string;
  addMemoryHref: string;
} {
  return {
    memoriesHref: slug ? `/archive/${slug}/memories` : "/create",
    addMemoryHref: slug ? `/archive/${slug}/add-memory` : "/create"
  };
}

console.log("Running mobile-navigation tests...");

// 1. Inclusion tests
assert.strictEqual(
  isRouteAuthenticatedMobileNavIncluded("/dashboard", true),
  true,
  "/dashboard should include nav when signed in"
);
assert.strictEqual(
  isRouteAuthenticatedMobileNavIncluded("/dashboard/time-capsules", true),
  true,
  "/dashboard/time-capsules should include nav when signed in"
);
assert.strictEqual(
  isRouteAuthenticatedMobileNavIncluded("/dashboard/settings", true),
  true,
  "/dashboard/settings should include nav when signed in"
);
assert.strictEqual(
  isRouteAuthenticatedMobileNavIncluded("/archive/dustin-archive", true),
  true,
  "/archive/[slug] should include nav when signed in"
);
assert.strictEqual(
  isRouteAuthenticatedMobileNavIncluded(
    "/archive/dustin-archive/memories",
    true
  ),
  true,
  "/archive/[slug]/memories should include nav when signed in"
);
assert.strictEqual(
  isRouteAuthenticatedMobileNavIncluded("/member-card", true),
  true,
  "/member-card should include nav when signed in"
);
assert.strictEqual(
  isRouteAuthenticatedMobileNavIncluded("/keepsakes", true),
  true,
  "/keepsakes should include nav when signed in"
);

// 2. Exclusion tests
assert.strictEqual(
  isRouteAuthenticatedMobileNavIncluded("/", true),
  false,
  "homepage should exclude nav"
);
assert.strictEqual(
  isRouteAuthenticatedMobileNavIncluded("/login", true),
  false,
  "/login should exclude nav"
);
assert.strictEqual(
  isRouteAuthenticatedMobileNavIncluded("/legacy-question", true),
  false,
  "/legacy-question should exclude nav"
);
assert.strictEqual(
  isRouteAuthenticatedMobileNavIncluded("/claim/sample-token", true),
  false,
  "/claim/[token] should exclude nav"
);
assert.strictEqual(
  isRouteAuthenticatedMobileNavIncluded("/admin/users", true),
  false,
  "/admin routes should exclude nav"
);
assert.strictEqual(
  isRouteAuthenticatedMobileNavIncluded("/dashboard", false),
  false,
  "unauthenticated users should exclude nav"
);

// 3. Active item mapping tests
assert.strictEqual(
  getActiveItemLabel("/dashboard"),
  "DASHBOARD",
  "/dashboard should activate DASHBOARD"
);
assert.strictEqual(
  getActiveItemLabel("/dashboard/settings"),
  "DASHBOARD",
  "/dashboard/settings should activate DASHBOARD"
);
assert.strictEqual(
  getActiveItemLabel("/archive/my-slug/memories"),
  "MEMORIES",
  "/archive/[slug]/memories should activate MEMORIES"
);
assert.strictEqual(
  getActiveItemLabel("/archive/my-slug/add-memory"),
  "ADD MEMORY",
  "/archive/[slug]/add-memory should activate ADD MEMORY"
);
assert.strictEqual(
  getActiveItemLabel("/dashboard/time-capsules"),
  "TIME CAPSULES",
  "/dashboard/time-capsules should activate TIME CAPSULES"
);
assert.strictEqual(
  getActiveItemLabel("/dashboard/time-capsules/new"),
  "TIME CAPSULES",
  "/dashboard/time-capsules/new should activate TIME CAPSULES"
);
assert.strictEqual(
  getActiveItemLabel("/member-card"),
  "MEMBER CARD",
  "/member-card should activate MEMBER CARD"
);

// 4. Slug resolution and fallback tests
const resolvedWithSlug = resolveNavHrefs("dustin-sigley-archive");
assert.strictEqual(
  resolvedWithSlug.memoriesHref,
  "/archive/dustin-sigley-archive/memories"
);
assert.strictEqual(
  resolvedWithSlug.addMemoryHref,
  "/archive/dustin-sigley-archive/add-memory"
);

const resolvedWithoutSlug = resolveNavHrefs(null);
assert.strictEqual(resolvedWithoutSlug.memoriesHref, "/create");
assert.strictEqual(resolvedWithoutSlug.addMemoryHref, "/create");

console.log("mobile-navigation tests passed cleanly!");
