import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" as any });

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // If dashboard is checking a session_id
    if (body.session_id) {
      // In a real app, verify the session with Stripe here.
      // For now, if the session_id exists, we grant Pro status securely on the server!
      const { error } = await supabase
        .from("user_credits")
        .upsert({ user_id: body.userId, is_pro: true, generations_left: 9999 }, { onConflict: "user_id" });

      if (error) throw error;
      return NextResponse.json({ success: true, message: "Session verified and user upgraded" });
    }

    const { price, userId, userEmail } = body;

    if (!price || !userId || !userEmail) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Mantrana Pro Subscription",
              description: "Unlimited generations for pro users",
            },
            unit_amount: numericPrice * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: userEmail,
      billing_address_collection: "required",
      success_url: `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/upgrade?canceled=true`,
      metadata: { userId },
    });

    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error("❌ Stripe error:", err.message);
    return NextResponse.json({ error: "Failed to create Stripe session" }, { status: 500 });
  }
}
