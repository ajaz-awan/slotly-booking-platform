"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

function getIsolatedClient() {
  return createSupabaseJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function sendBusinessEmailOtp(email: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You need to be signed in." };

  const isolated = getIsolatedClient();
  const { error } = await isolated.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  if (error) return { error: error.message };
  return { error: null };
}

export async function verifyBusinessEmailAndCreate(params: {
  email: string;
  token: string;
  name: string;
  slug: string;
  category: string;
  accentColor: string;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You need to be signed in." };

  const isolated = getIsolatedClient();
  const { error: verifyError } = await isolated.auth.verifyOtp({
    email: params.email,
    token: params.token,
    type: "email",
  });

  if (verifyError) {
    return { error: "Invalid or expired code." };
  }

  const { error: insertError } = await supabase.from("businesses").insert({
    owner_id: user.id,
    name: params.name,
    slug: params.slug,
    category: params.category,
    accent_color: params.accentColor,
    business_email: params.email,
  });

  if (insertError) {
    return {
      error:
        insertError.code === "23505"
          ? "That URL is already taken, try a different name."
          : insertError.message,
    };
  }

  return { error: null };
}