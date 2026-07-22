"use client";

import { useAuth } from "@/features/auth/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!userProfile?.onboarded && !pathname.startsWith("/dashboard/onboarding")) {
        router.push("/dashboard/onboarding");
      }
    }
  }, [user, userProfile, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
        <motion.span 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="material-symbols-outlined text-[48px] text-primary"
        >
          progress_activity
        </motion.span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
