"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useSyncExternalStore } from "react";
import { getLocalMultiplayerMessage } from "@/features/games/localGameCapabilities";
import { runtimeMode } from "@/features/runtime/config";

const MultiplayerModal = dynamic(() => import("./components/MultiplayerModal"), {
  ssr: false,
});

function subscribeToRoomStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function hasSavedRoom() {
  return Boolean(sessionStorage.getItem("kavict_game_room"));
}

export default function GamesPage() {
  const [modalPreference, setModalPreference] = useState<"default" | "open" | "closed">("default");
  const [multiplayerNotice, setMultiplayerNotice] = useState<string | null>(null);
  const isFirebaseMode = runtimeMode === "firebase";
  const savedRoomExists = useSyncExternalStore(subscribeToRoomStorage, hasSavedRoom, () => false);
  const isModalOpen = modalPreference === "open"
    || (modalPreference === "default" && savedRoomExists);

  const handleMultiplayerClick = () => {
    if (isFirebaseMode) {
      setModalPreference("open");
      return;
    }
    setMultiplayerNotice(getLocalMultiplayerMessage());
  };

  return (
    <>
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in">
      <div className="text-center mb-12 w-full">
        <span className="material-symbols-outlined text-[64px] text-primary mb-4 block">target</span>
        <h1 className="font-headline-lg text-[32px] font-bold text-on-surface mb-2">Practice Space</h1>
        <p className="text-on-surface-variant text-lg max-w-[600px] mx-auto">
          Luyện tập kiến thức tài chính, thử thách bản thân và nhận thêm XP.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        {/* Solo Card */}
        <Link 
          href="/dashboard/practice-space/solo"
          className="group relative overflow-hidden bg-surface-container-lowest rounded-3xl border border-surface-variant shadow-ambient hover:shadow-hover transition-all duration-300 p-8 flex flex-col items-center text-center cursor-pointer hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
          
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-[40px]">person</span>
          </div>
          
          <h2 className="font-headline-md text-headline-md text-on-surface mb-3">Chơi đơn</h2>
          <p className="text-on-surface-variant mb-8 flex-grow">
            Thử thách bản thân, vượt qua các câu hỏi để rèn luyện kỹ năng cá nhân.
          </p>
          
          <div className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold w-full transition-colors group-hover:bg-primary-fixed-variant shadow-sm flex items-center justify-center gap-2">
            Bắt đầu <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </div>
        </Link>

        {/* Multiplayer Card */}
        <div 
          onClick={handleMultiplayerClick}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") handleMultiplayerClick();
          }}
          className="group relative overflow-hidden bg-surface-container-lowest rounded-3xl border border-surface-variant shadow-ambient hover:shadow-hover transition-all duration-300 p-8 flex flex-col items-center text-center cursor-pointer hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-tertiary/10 transition-colors"></div>
          
          <div className="w-20 h-20 bg-tertiary/10 rounded-2xl flex items-center justify-center text-tertiary mb-6 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-[40px]">group</span>
          </div>
          
          <h2 className="font-headline-md text-headline-md text-on-surface mb-3">Chơi cùng bạn</h2>
          <p className="text-on-surface-variant mb-8 flex-grow">
            Tạo phòng, mời bạn bè cùng chơi và giao lưu trực tiếp qua camera/mic.
          </p>
          
          <div className="px-8 py-3 bg-tertiary text-on-tertiary rounded-full font-bold w-full transition-colors group-hover:bg-tertiary-fixed-variant shadow-sm flex items-center justify-center gap-2">
            Tìm phòng <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </div>
        </div>
      </div>
      {multiplayerNotice && (
        <p
          className="mt-6 max-w-2xl rounded-2xl border border-tertiary/30 bg-tertiary/10 px-5 py-4 text-center text-on-surface"
          role="status"
        >
          {multiplayerNotice}
        </p>
      )}
      </div>

      {isFirebaseMode && isModalOpen && (
        <MultiplayerModal onClose={() => setModalPreference("closed")} />
      )}
    </>
  );
}
