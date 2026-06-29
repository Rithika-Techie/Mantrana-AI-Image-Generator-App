'use client';

import Image from 'next/image';
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="flex flex-col md:flex-row w-full max-w-5xl">
        
        {/* Left: Image */}
        <div className="w-full md:w-1/2 flex justify-center items-center p-6">
          <Image
            src="/ai logo-new.png"
            alt="Login Illustration"
            width={400}
            height={400}
            className="w-full h-auto object-contain max-w-xs"
            priority
          />
        </div>

        {/* Right: Clerk SignIn */}
        <div className="w-full md:w-1/2 flex justify-center items-center p-6">
          <div className="w-full max-w-sm">
            <SignIn
              path="/sign-in"
              routing="path"
              appearance={{
                elements: {
                  card: 'shadow-lg border rounded-xl w-full',
                  formButtonPrimary: 'bg-purple-600 hover:bg-purple-700',
                },
              }}
            />
          </div>
        </div>
        
      </div>
    </div>
  );
}
