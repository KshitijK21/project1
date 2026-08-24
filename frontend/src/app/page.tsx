"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";

export default function RootPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(isAuthenticated ? "/dashboard" : "/login");
  }, [loading, isAuthenticated, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-bg">
      <Spinner />
    </div>
  );
}
