import React from 'react';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import { Button } from '../../../components/ui/button'; // ✅ Correct relative path

function Header() {
  return (
    <div className="p-3 px-5 flex items-center justify-between border-b">
      {/* Left: Logo and Title */}
      <div className="flex gap-3 items-center">
        <Image src="/next.svg" alt="logo" width={40} height={40} />
        <h2 className="font-bold text-xl">Mantrana Creator</h2>
      </div>

      {/* Right: Dashboard button and User */}
      <div className="flex gap-4 items-center">
        <Button variant="secondary">Dashboard</Button>
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
}

export default Header;
