"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function UpgradePage() {
  const { user } = useUser();
  const router = useRouter();

  const [isMVJ, setIsMVJ] = useState(false);
  const [principalName, setPrincipalName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user?.id || !user?.primaryEmailAddress?.emailAddress) {
      alert("User info is incomplete.");
      return;
    }

    setLoading(true);

    const basePrice = 100; // ₹100
    const finalPrice =
      isMVJ && principalName.toLowerCase().trim() === "ajayan"
        ? basePrice / 2
        : basePrice;

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: finalPrice,
          userId: user.id,
          userEmail: user.primaryEmailAddress.emailAddress, 
        }),
      });

      const { url, error } = await res.json();
      setLoading(false);

      if (error) {
        alert("Subscription failed: " + error);
      } else if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setLoading(false);
      console.error("❌ Error during upgrade:", err);
      alert("Something went wrong during upgrade.");
    }
  };

  return (
    <div className="max-w-lg mx-auto py-16 px-6">
      <h2 className="text-3xl font-bold text-purple-700 mb-6">Upgrade to Pro</h2>

      <p className="text-lg mb-6">Base Price: ₹100</p>

      <label className="flex items-center gap-3 mb-4">
        <input
          type="checkbox"
          checked={isMVJ}
          onChange={() => setIsMVJ(!isMVJ)}
          className="h-4 w-4"
        />
        <span>I'm from MVJ College of Engineering (50% discount)</span>
      </label>

      {isMVJ && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">Principal's Name</label>
          <input
            type="text"
            value={principalName}
            onChange={(e) => setPrincipalName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          {principalName &&
            principalName.toLowerCase().trim() !== "ajayan" && (
              <p className="mt-1 text-sm text-red-500">
                Incorrect principal name — no discount applied.
              </p>
            )}
        </div>
      )}

      <Button
        onClick={handleUpgrade}
        disabled={loading}
        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
      >
        {loading
          ? "Processing..."
          : `Pay ₹${
              isMVJ &&
              principalName.toLowerCase().trim() === "ajayan"
                ? 50
                : 100
            }`}
      </Button>
    </div>
  );
}
