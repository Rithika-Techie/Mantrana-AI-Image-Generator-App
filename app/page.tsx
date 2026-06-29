'use client';

import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const params = useSearchParams();
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (params.get('success') === 'true') {
      setShowSuccess(true);
      const timeout = setTimeout(() => {
        setShowSuccess(false);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('success');
        router.replace(newUrl.pathname);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [params, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
      <h1 className="text-5xl font-bold mb-6 text-purple-700">Welcome to Mantrana AI</h1>
      <p className="text-lg text-gray-700 mb-6 max-w-xl">
        Your personal AI-powered creative assistant.
      </p>

      {showSuccess && (
        <div className="mb-6 bg-green-100 text-green-800 px-4 py-2 rounded shadow font-medium animate-slide-down">
          ✅ Upgradation Successful! You’re now a Pro user.
        </div>
      )}

      <SignedOut>
        <Link
          href="/sign-in"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Sign in to Continue →
        </Link>
      </SignedOut>

      <SignedIn>
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Go to Dashboard →
        </Link>
      </SignedIn>
    </div>
  );
}
