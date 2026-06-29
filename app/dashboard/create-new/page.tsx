"use client";

import { useEffect, useState } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "../_components/DashboardLayout";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export default function CreateNewPage() {
  const { user } = useUser();
  const { toast } = useToast();

  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [history, setHistory] = useState<any[]>([]);


  const fetchUserStatus = async () => {
    if (!user?.id) return;

    try {
      const res = await fetch(`/api/user/credits?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setCredits(data.generations_left ?? 0);
        setIsPro(data.is_pro ?? false);
      }

      // Fetch user's generation history securely bypassing RLS
      const historyRes = await fetch(`/api/user/history?userId=${user.id}`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData.history || []);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  useEffect(() => {
    fetchUserStatus();

    const interval = setInterval(fetchUserStatus, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    if (!isPro && credits !== null && credits <= 0) {
      toast({
        title: "Limit Reached",
        description: "You've used all your free generations. Upgrade to Pro to continue generating images.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, userId: user?.id }),
      });

      if (!response.ok) throw new Error("Image generation failed");

      const data = await response.json();
      setImage(data.imageUrl);

      // The server API route handles decrementing credits and saving history securely.
      // Refresh history and credits to show the new state instantly.
      await fetchUserStatus();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Something went wrong during generation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-purple-800 mb-2 flex justify-center gap-2">
              <Wand2 className="h-8 w-8 text-purple-600" />
              Mantrana AI
            </h1>
            {isPro ? (
              <p className="text-gray-600">✨ You are a Pro user. Unlimited generations!</p>
            ) : credits === 0 ? (
              <div className="text-red-500 font-medium bg-red-50 p-4 rounded-lg inline-block border border-red-200">
                You've used all your free generations. <br/> Upgrade to Pro to continue generating images.
              </div>
            ) : (
              <p className="text-gray-600">You have {credits ?? "-"} free generations left</p>
            )}
          </div>

          <div className="flex gap-4 mb-8">
            <Input
              placeholder="Describe the image you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-white border-gray-300 text-black"
              disabled={!isPro && credits === 0}
            />
            {!isPro && credits === 0 ? (
              <Button
                onClick={() => window.location.href = '/dashboard/upgrade'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Upgrade to Pro
              </Button>
            ) : (
              <Button
                onClick={generateImage}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? "Generating..." : "Generate"}
              </Button>
            )}
          </div>

          {image ? (
            <Card className="overflow-hidden bg-white border-gray-300">
              <img
                src={image}
                alt={prompt}
                className="w-full h-auto rounded-lg shadow-lg"
              />
              <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-gray-600">Prompt: {prompt}</p>
                <a
                  href={`/api/download?url=${encodeURIComponent(image)}&filename=${encodeURIComponent(`${prompt.trim().toLowerCase().replace(/\s+/g, "_")}.png`)}`}
                  className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
                >
                  ⬇️ Download Image
                </a>
              </div>
            </Card>
          ) : (
            !loading && (
              <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-600">
                  Your generated image will appear here
                </p>
              </div>
            )
          )}

          {/* User History Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Recent Generations</h2>
            {history.length === 0 ? (
              <p className="text-gray-500 italic">No generations yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item, index) => (
                  <Card key={index} className="overflow-hidden bg-white border-gray-200 shadow-sm">
                    <img
                      src={item.url}
                      alt={item.prompt}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="p-4">
                      <p className="text-sm font-medium text-gray-800 mb-1 truncate" title={item.prompt}>
                        {item.prompt}
                      </p>
                      <p className="text-xs text-gray-400 mb-3">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                      <a
                        href={`/api/download?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(`${item.prompt.toLowerCase().replace(/\s+/g, "_")}.png`)}`}
                        className="block text-center px-4 py-2 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 text-sm font-medium transition"
                      >
                        ⬇️ Download
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
