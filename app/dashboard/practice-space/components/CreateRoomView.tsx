import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { createRoom } from "../services/roomService";
import { getErrorMessage } from "@/lib/errors";

interface CreateRoomViewProps {
  onBack: () => void;
  onCreated: (roomCode: string) => void;
}

export default function CreateRoomView({ onBack, onCreated }: CreateRoomViewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, userProfile } = useAuth();

  useEffect(() => {
    const initRoom = async () => {
      if (!user) return;
      
      setIsCreating(true);
      setError(null);
      
      try {
        const name = userProfile?.preferredName || user.displayName || "Người dùng";
        const code = await createRoom(user.uid, name);
        onCreated(code);
      } catch (err: unknown) {
        console.error("Error creating room:", err);
        setError(getErrorMessage(err, "Đã xảy ra lỗi khi tạo phòng."));
        setIsCreating(false);
      }
    };

    initRoom();
  }, [user, userProfile, onCreated]);

  return (
    <div className="flex flex-col text-center">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          disabled={isCreating}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface-variant transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="font-headline-md text-headline-md text-on-surface flex-1 text-center -ml-10">Tạo phòng mới</h2>
      </div>

      <div className="flex flex-col items-center justify-center py-8">
        {isCreating ? (
          <>
            <div className="w-12 h-12 border-4 border-tertiary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-on-surface-variant font-medium">Đang khởi tạo phòng chơi...</p>
          </>
        ) : error ? (
          <>
            <div className="w-16 h-16 bg-error-container rounded-full flex items-center justify-center text-error mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">error</span>
            </div>
            <p className="text-error font-medium mb-6">{error}</p>
            <button 
              onClick={onBack}
              className="px-6 py-2 bg-surface-container text-on-surface rounded-full font-bold hover:bg-surface-container-high transition-colors"
            >
              Thử lại
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
