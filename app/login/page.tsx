"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);
  
  // Mock data pre-filled
  const [email, setEmail] = useState("test@kavict.com");
  const [password, setPassword] = useState("password123");
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Email hoặc mật khẩu không chính xác.");
      } else {
        setError("Có lỗi xảy ra khi đăng nhập.");
      }
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        const provider = new GoogleAuthProvider();
        signInWithRedirect(auth, provider);
      } else {
        setError("Lỗi đăng nhập bằng Google.");
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 flex items-center justify-center p-md w-full min-h-screen"
    >
      <main className="w-full max-w-[460px] bg-surface-container-lowest rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-lg md:p-xl flex flex-col gap-lg mx-auto">
          {/* Header */}
          <header className="flex flex-col items-center text-center gap-md">
            <div className="flex items-center justify-center gap-3 mb-xs">
              <img 
                alt="KAVICT Logo" 
                className="h-16 w-auto" 
                src="/logo-image.png" 
              />
              <img 
                alt="KAVICT Text" 
                className="h-12 w-auto mt-2" 
                src="/logo-text.png" 
              />
            </div>
            <div>
              <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-xs">Đăng nhập</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Chào mừng bạn quay trở lại! Tiếp tục hành trình học tài chính cùng KAVICT.
              </p>
            </div>
          </header>

          {/* Form */}
          <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
            {error && (
              <div className="p-sm bg-error-container text-on-error-container rounded-lg text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}
            
            {/* Email Input */}
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline" style={{fontVariationSettings: "'FILL' 0"}}>mail</span>
                <input 
                  className="w-full h-12 pl-[44px] pr-sm rounded-lg border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all outline-none" 
                  id="email" 
                  name="email" 
                  placeholder="Nhập địa chỉ email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Mật khẩu</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline" style={{fontVariationSettings: "'FILL' 0"}}>lock</span>
                <input 
                  className="w-full h-12 pl-[44px] pr-[44px] rounded-lg border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all outline-none" 
                  id="password" 
                  name="password" 
                  placeholder="Nhập mật khẩu" 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  className="absolute right-sm top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors focus:outline-none flex items-center justify-center" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between mt-[-8px]">
              <label className="flex items-center gap-xs cursor-pointer group">
                <input className="w-4 h-4 rounded border-outline-variant text-primary-container focus:ring-primary-container focus:ring-offset-0 bg-surface-container-lowest transition-all cursor-pointer" type="checkbox" />
                <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Ghi nhớ đăng nhập</span>
              </label>
              <a className="font-label-sm text-label-sm text-primary-container hover:text-primary transition-colors" href="#">Quên mật khẩu?</a>
            </div>

            {/* Submit Button */}
            <button 
              className="w-full h-12 bg-primary-container text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary transition-colors focus:ring-4 focus:ring-primary-container/20 focus:outline-none mt-xs flex items-center justify-center gap-2" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <motion.span 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="material-symbols-outlined text-[20px]"
                  >
                    progress_activity
                  </motion.span>
                  Đang xử lý...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-md">
            <div className="h-px bg-outline-variant flex-1"></div>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">hoặc</span>
            <div className="h-px bg-outline-variant flex-1"></div>
          </div>

          {/* Social Login */}
          <button onClick={handleGoogleSignIn} className="w-full h-12 flex items-center justify-center gap-sm bg-surface-container-lowest border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors focus:ring-4 focus:ring-outline-variant/20 focus:outline-none" type="button">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            <span className="font-label-md text-label-md text-on-surface">Tiếp tục với Google</span>
          </button>

          {/* Footer Link */}
          <p className="text-center font-body-md text-body-md text-on-surface-variant mt-xs">
            Chưa có tài khoản? <a className="text-primary-container font-label-md text-label-md hover:text-primary transition-colors" href="/register">Đăng ký ngay</a>
          </p>
        </main>
    </motion.div>
  );
}
