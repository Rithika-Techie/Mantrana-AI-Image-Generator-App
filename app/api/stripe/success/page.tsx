"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StripeSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after 1s
    const timer = setTimeout(() => {
      router.replace("/dashboard?success=true");
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Payment Successful!</h1>
      <p className="text-gray-600">Redirecting you to your dashboard...</p>
    </div>
  );
}
