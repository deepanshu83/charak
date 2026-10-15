import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";

    // Sign out from Supabase Auth if session exists
    if (supabaseUrl && supabaseKey) {
      try {
        const cookieStore = await cookies();
        const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                );
              } catch {
                // Ignore in signout context
              }
            },
          },
        });
        await supabase.auth.signOut();
      } catch {
        // Continue clearing cookies
      }
    }

    const response = NextResponse.json({
      ok: true,
      message: "Administrator session signed out successfully.",
    });

    // Clear server session cookies with matching paths
    response.cookies.set("charak_admin_session", "", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 0,
      secure: process.env.NODE_ENV === "production",
    });

    response.cookies.set("charak_admin_ui", "", {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 0,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Logout error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
