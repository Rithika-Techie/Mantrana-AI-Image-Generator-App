import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_EMAIL = "rithikashree76@gmail.com";

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await clerkClient.users.getUser(userId);
    const email = user?.emailAddresses[0]?.emailAddress;

    if (email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // Fetch all generations across all users, sorted by latest first
    const { data, error } = await supabase
      .from("image_history")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }

    return NextResponse.json({ history: data });
  } catch (error: any) {
    console.error("Admin history error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
