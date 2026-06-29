import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  // Use service_role key to safely bypass RLS
  const { data: creditData } = await supabase
    .from("user_credits")
    .select("generations_left, is_pro")
    .eq("user_id", userId)
    .maybeSingle();

  if (!creditData) {
    // Insert default credits if they don't exist yet
    await supabase.from("user_credits").insert([{ user_id: userId, generations_left: 5, is_pro: false }]);
    return NextResponse.json({ generations_left: 5, is_pro: false });
  }

  return NextResponse.json(creditData);
}
