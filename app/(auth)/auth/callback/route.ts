import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Google URL mein ek temporary "code" bhej kar wapas bhejta hai

  if (code) {
    const supabase = await createClient();
    // temporary code ko asal session (cookie) mein convert karte hain
    await supabase.auth.exchangeCodeForSession(code);
  }

  // login ke baad user ko dashboard par bhej do
  return NextResponse.redirect(`${origin}/dashboard`);
}