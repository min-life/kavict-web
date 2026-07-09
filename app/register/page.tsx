"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function RegisterPage() {
  const router = useRouter();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullname || !email || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp.");
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    if (!terms) {
      setError("Bạn cần đồng ý với các điều khoản.");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: fullname,
      });
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Email này đã được sử dụng.");
      } else if (err.code === 'auth/weak-password') {
        setError("Mật khẩu quá yếu.");
      } else {
        setError("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err) {
      setError("Lỗi đăng nhập bằng Google.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 flex items-center justify-center p-md w-full min-h-screen"
    >
      <main className="w-full max-w-[460px] bg-surface-container-lowest rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-md md:p-lg flex flex-col gap-lg mx-auto">
        {/* Header & Brand */}
        <header className="flex flex-col items-center text-center gap-sm">
          <Link href="/" className="flex items-center justify-center gap-3 mb-sm hover:scale-105 transition-transform cursor-pointer">
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
          </Link>
          <h1 className="font-headline-md text-headline-lg-mobile md:text-headline-md text-on-surface">Tạo tài khoản</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Bắt đầu hành trình quản lý tài chính cá nhân cùng KAVICT.</p>
        </header>

        {/* Sign Up Form */}
        <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-sm bg-error-container text-on-error-container rounded-lg text-body-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </motion.div>
          )}

          {/* Họ và tên */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="fullname">Họ và tên</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">person</span>
              <input 
                className="w-full h-12 pl-10 pr-4 bg-surface-bright border border-outline-variant rounded-lg focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all font-body-md text-on-surface placeholder:text-outline outline-none" 
                id="fullname" 
                name="fullname" 
                placeholder="Nguyễn Văn A" 
                type="text" 
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">mail</span>
              <input 
                className="w-full h-12 pl-10 pr-4 bg-surface-bright border border-outline-variant rounded-lg focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all font-body-md text-on-surface placeholder:text-outline outline-none" 
                id="email" 
                name="email" 
                placeholder="name@example.com" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">Mật khẩu</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">lock</span>
              <input 
                className="w-full h-12 pl-10 pr-10 bg-surface-bright border border-outline-variant rounded-lg focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all font-body-md text-on-surface placeholder:text-outline outline-none" 
                id="password" 
                name="password" 
                placeholder="••••••••" 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                className="absolute right-sm top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="confirm_password">Xác nhận mật khẩu</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">lock</span>
              <input 
                className="w-full h-12 pl-10 pr-10 bg-surface-bright border border-outline-variant rounded-lg focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all font-body-md text-on-surface placeholder:text-outline outline-none" 
                id="confirm_password" 
                name="confirm_password" 
                placeholder="••••••••" 
                type={showPassword ? "text" : "password"} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-sm mt-xs">
            <div className="flex items-center h-5">
              <input 
                className="w-4 h-4 border border-outline-variant rounded bg-surface-bright defaultChecked:bg-primary-container defaultChecked:border-primary-container focus:ring-primary-container/20 text-primary-container transition-colors cursor-pointer" 
                id="terms" 
                type="checkbox" 
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
              />
            </div>
            <label className="font-label-md text-label-md text-on-surface-variant cursor-pointer" htmlFor="terms">
              Tôi đồng ý với <a className="text-primary hover:underline font-medium" href="#">Điều khoản sử dụng</a> và <a className="text-primary hover:underline font-medium" href="#">Chính sách bảo mật</a>.
            </label>
          </div>

          {/* Submit Button */}
          <button 
            className="w-full h-12 mt-sm bg-primary-container hover:bg-primary text-on-primary rounded-lg font-label-md text-label-md font-semibold flex items-center justify-center gap-xs transition-all shadow-sm" 
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
              <>
                Tạo tài khoản
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Social Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-outline-variant"></div>
          <span className="flex-shrink-0 mx-4 font-label-sm text-label-sm text-outline uppercase tracking-wider">Hoặc</span>
          <div className="flex-grow border-t border-outline-variant"></div>
        </div>

        {/* Social Login */}
        <button onClick={handleGoogleSignIn} className="w-full h-12 bg-surface-bright border border-outline-variant hover:border-outline hover:bg-surface-container-low text-on-surface rounded-lg font-label-md text-label-md font-medium flex items-center justify-center gap-sm transition-all" type="button">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
          </svg>
          Tiếp tục với Google
        </button>

        {/* Footer Link */}
        <div className="text-center mt-xs">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Đã có tài khoản? 
            <Link className="text-primary hover:text-primary-container font-medium hover:underline transition-colors ml-1" href="/login">Đăng nhập</Link>
          </p>
        </div>
      </main>
    </motion.div>
  );
}
