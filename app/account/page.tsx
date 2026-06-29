'use client';

import { UserProfile } from '@clerk/nextjs';

export default function AccountPage() {
  return (
    <div className="p-6">
      <UserProfile path="/account" routing="path" />
    </div>
  );
}
