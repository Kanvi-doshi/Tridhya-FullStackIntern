"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";

export default function DashboardPage() {
  const router = useRouter();

  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role === "admin") {
      router.replace("/dashboard/admin");
    } else if (user.role === "organizer") {
      router.replace("/dashboard/organizer");
    } else {
      router.replace("/dashboard/user");
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      Loading dashboard...
    </div>
  );
}
