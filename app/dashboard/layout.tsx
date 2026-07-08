"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  const isOnboarding = pathname.startsWith("/dashboard/onboarding");
  const isSoloGame = pathname.startsWith("/dashboard/games/solo");
  const isFullScreen = isOnboarding || isSoloGame;

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [pathname]);

  return (
    <ProtectedRoute>
      <div className={`h-screen overflow-hidden bg-background ${isFullScreen ? "block w-screen" : "flex w-full"}`}>
        {!isFullScreen && <Sidebar />}
        <main
          ref={mainRef}
          className={`h-full overflow-y-auto transition-all duration-200 ${!isFullScreen ? "flex-1 p-8" : "w-full block"}`}
          id="main-content"
        >
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
