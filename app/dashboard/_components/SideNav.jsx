"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelsTopLeft, FileVideo, ShieldPlus, CircleUser } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

const menuOptions = [
  { id: 1, name: 'Dashboard', path: '/dashboard', icon: PanelsTopLeft },
  { id: 2, name: 'Create New', path: '/dashboard/create-new', icon: FileVideo },
  { id: 3, name: 'Upgrade', path: '/upgrade', icon: ShieldPlus },
  { id: 4, name: 'Account', path: '/account', icon: CircleUser },
];

function SideNav() {
  const path = usePathname();
  const { user } = useUser();
  const [creditsLeft, setCreditsLeft] = useState(null);


  useEffect(() => {
    const fetchCredits = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from("user_credits")
          .select("generations_left")
          .eq("user_id", user.id)
          .single();

        if (!error && data) {
          setCreditsLeft(data.generations_left);
        }
      }
    };

    fetchCredits();
  }, [user?.id]);

  return (
    <div className="w-64 h-screen shadow-md p-5 border-r bg-white">
      <h2 className="font-bold text-xl mb-6">Mantrana</h2>
      <nav className="flex flex-col gap-4">
        {menuOptions.map((item) => {
          const Icon = item.icon;
          const isActive = path === item.path;

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`flex items-center gap-3 transition 
                ${isActive ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
        {user?.primaryEmailAddress?.emailAddress === "rithikashree76@gmail.com" && (
          <Link
            href="/dashboard/admin"
            className={`flex items-center gap-3 transition 
              ${path === "/dashboard/admin" ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'}
            `}
          >
            <ShieldPlus className="w-5 h-5" />
            <span className="text-sm">Admin Panel</span>
          </Link>
        )}
      </nav>

    </div>
  );
}

export default SideNav;
