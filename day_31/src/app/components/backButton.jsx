"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="mb-6 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
    >
      ← Back
    </button>
  );
}
