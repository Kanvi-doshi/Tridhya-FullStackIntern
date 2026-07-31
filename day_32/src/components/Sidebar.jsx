"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
export default function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    alert("Logged Out Successfully!");
    router.push("/login");
  };
  return (
    <div className="w-64 h-screen bg-sky-300 text-black p-6">
      <h1 className="text-3xl font-bold mb-10">Employee Portal</h1>

      <div className="flex flex-col gap-5  ">
        <Link href="/dashboard" className="hover:text-white ">
          Dashboard
        </Link>

        <Link href="/profile" className="hover:text-white">
          Profile
        </Link>

        <Link href="/employees" className="hover:text-white">
          Employees
        </Link>

        <Link href="/admin" className="hover:text-white">
          Admin
        </Link>

        <Link href="/settings" className="hover:text-white">
          Settings
        </Link>

        <button
          onClick={handleLogout}
          className="text-left text-black-200 hover:text-white"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
