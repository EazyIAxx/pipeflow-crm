import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Signs out the current session and redirects to /login with email pre-filled.
// Used by the invite page when the wrong account is logged in.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/login";
  const email = searchParams.get("email") ?? "";

  const supabase = await createClient();
  await supabase.auth.signOut();

  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("next", next);
  if (email) loginUrl.searchParams.set("email", email);

  return NextResponse.redirect(loginUrl);
}
