"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();

  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    // Role restriction
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Send user to their own dashboard
      if (user.role === "admin") {
        router.replace("/dashboard/admin");
      } else if (user.role === "organizer") {
        router.replace("/dashboard/organizer");
      } else {
        router.replace("/dashboard/user");
      }
    }
  }, [user, loading, allowedRoles, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  return children;
}
