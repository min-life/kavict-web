import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { joinRoom } from "../services/roomService";

interface JoinRoomViewProps {
  onBack: () => void;
  onJoined: (roomCode: string) => void;
}

export default function JoinRoomView({ onBack, onJoined }: JoinRoomViewProps) {
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, userProfile } = useAuth();

  useEffect(() => {
    // Focus the input when component mounts
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }, []);

  const handleJoin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (code.length !== 8) {
      setError("Mã phòng phải gồm 8 số.");
      return;
    }

    if (!user) {
      setError("Vui lòng đăng nhập để chơi.");
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const name = userProfile?.preferredName || user.displayName || "Người dùng";
      await joinRoom(code, user.uid, name);
      onJoined(code);
    } catch (err: any) {
      console.error("Error joining room:", err);
      setError(err.message || "Không thể tham gia phòng.");
      setIsJoining(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and max 8 chars
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 8);
    setCode(value);
    if (error) setError(null);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          disabled={isJoining}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface-variant transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="font-headline-md text-headline-md text-on-surface flex-1 text-center -ml-10">Vào phòng</h2>
      </div>

      <form onSubmit={handleJoin} className="flex flex-col gap-6">
        <div className="flex flex-col items-center">
          <p className="text-on-surface-variant mb-4 text-center">Nhập mã phòng gồm 8 số để tham gia</p>
          
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={handleInputChange}
            placeholder="00000000"
            className="w-48 text-center text-[32px] font-display font-bold text-primary bg-surface-container-lowest border-2 border-primary-fixed-dim rounded-2xl p-3 focus:outline-none focus:border-primary transition-colors tracking-widest"
            maxLength={8}
            disabled={isJoining}
          />
          
          {error && (
            <p className="text-error text-sm mt-3 animate-shake">{error}</p>
          )}
        </div>

        <button 
          type="submit"
          disabled={isJoining || code.length !== 8}
          className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-fixed-variant transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isJoining ? (
            <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              Vào phòng <span className="material-symbols-outlined">login</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
