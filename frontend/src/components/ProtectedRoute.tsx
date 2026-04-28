"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: "ADMIN" | "USER" }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.push("/login");
    }

    if (!loading && user && role && user.cargo !== role && user.cargo !== "ADMIN") {
      router.push("/");
    }
  }, [user, loading, router, pathname, role]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-slate-200/50 flex items-center justify-center border border-slate-100">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Autenticando...</p>
      </div>
    );
  }

  if (!user && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
}
