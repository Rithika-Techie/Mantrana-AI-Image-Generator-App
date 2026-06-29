"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

import Header from "./_components/Header";
import SideNav from "./_components/SideNav";
import EmptyState from "./_components/EmptyState";
import { Card } from "@/components/ui/card";

export default function DashboardHome() {
  const { user } = useUser();
  const router = useRouter();
  const [history, setHistory] = useState<{ prompt: string; url: string; timestamp: string; user_id?: string }[]>([]);
  const [credits, setCredits] = useState<number | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      // 🔹 Stripe session check
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");

      if (sessionId) {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, userId: user.id }),
        });

        if (!res.ok) {
          console.error("❌ Stripe session verification failed", await res.text());
        } else {
          const data = await res.json();
          if (data.success) {
            console.log("✅ Stripe session verified");
          }
        }

        // Remove session_id from URL
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }

      // 🔹 Image history fetched securely bypassing RLS
      const historyRes = await fetch(`/api/user/history?userId=${user.id}`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData.history || []);
      }

      // 🔹 Credits & Pro status
      // Fetching through our secure API route to bypass RLS!
      const creditRes = await fetch(`/api/user/credits?userId=${user.id}`);
      if (creditRes.ok) {
        const creditData = await creditRes.json();
        setCredits(creditData.generations_left);
        setIsPro(creditData.is_pro);
      } else {
        console.error("Failed to fetch credits via API");
      }
    } catch (err) {
      console.error("❌ Fetch data failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  return (
    <div className="flex h-screen">
      <SideNav />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header />

        <main className="p-6 bg-gray-50 h-full">
          <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <h2 className="text-2xl font-bold">Your Image History</h2>
            <div className="mt-4 sm:mt-0 flex items-center gap-4">
              {isPro ? (
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">🌟 Pro Member</span>
              ) : (
                <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm">{credits ?? "-"} Generations Left</span>
              )}
            </div>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : history.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item, index) => (
                <Card key={index} className="overflow-hidden">
                  <img src={item.url} alt={item.prompt} className="w-full h-auto rounded-t-lg" />
                  <div className="p-4">
                    <p className="text-sm text-gray-700 mb-1">Prompt: {item.prompt}</p>
                    <p className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleString()}</p>
                    <a
                      href={`/api/download?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(`${item.prompt.toLowerCase().replace(/\s+/g, "_")}.png`)}`}
                      className="block mt-2 text-sm text-purple-600 hover:underline"
                    >
                      ⬇️ Download
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
