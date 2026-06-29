"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const navItems = [
  { name: "Home", path: "/dashboard" },
  { name: "Create New", path: "/dashboard/create-new" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "rithikashree76@gmail.com";

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-purple-700 text-white p-6 space-y-4">
        <h2 className="text-2xl font-bold mb-4">Mantrana AI</h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-3 py-2 rounded hover:bg-purple-600 ${
                pathname === item.path ? "bg-purple-600" : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/dashboard/admin"
              className={`block px-3 py-2 rounded hover:bg-purple-600 ${
                pathname === "/dashboard/admin" ? "bg-purple-600" : ""
              }`}
            >
              Admin Panel
            </Link>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        {/* Header */}
        <header className="bg-purple-50 border-b border-purple-200 px-6 py-4 shadow-sm">
          <h1 className="text-xl font-semibold text-purple-800">Dashboard</h1>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
