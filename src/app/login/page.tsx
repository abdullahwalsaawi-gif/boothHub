"use client"
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Mail, Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/app/actions/auth';

export default function Login() {
  const router = useRouter();
  
  // Password State
  const [showPassword, setShowPassword] = useState(false);
  
  // UI Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email Password Login
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await signIn(formData);
      if (!res.success) {
        setErrorMessage(res.error || 'فشل تسجيل الدخول');
      } else if (res.redirectUrl) {
        router.push(res.redirectUrl);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Visual Side */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#FFFFFF] via-[#F4F8FE] to-[#EAF3FF] relative overflow-hidden items-center justify-center p-12 text-center border-l border-slate-100">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-[#0868E9]/15 via-[#0868E9]/8 to-[#FF6D5C]/5 rounded-full blur-3xl"></div>
          <div className="absolute top-16 right-[-8%] w-72 h-72 rounded-full border border-[#0868E9]/15 border-dashed"></div>
          <div className="absolute bottom-16 left-[-8%] w-80 h-80 rounded-full border border-[#0868E9]/10"></div>
          <div className="absolute top-36 right-[12%] w-2.5 h-2.5 rounded-full bg-[#0868E9]/30"></div>
          <div className="absolute bottom-28 left-[10%] w-3 h-3 rounded-full bg-[#FF6D5C]/30"></div>
        </div>
        <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 text-center">
          <Link href="/" className="inline-block mb-6 group" aria-label="بوث هب | Booth Hub">
            <img 
              src="/branding/logo.png?v=3" 
              alt="بوث هب | Booth Hub" 
              className="h-16 w-auto object-contain mx-auto transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
            />
          </Link>
          <h2 className="text-3xl font-extrabold text-[#102E70] mb-4 tracking-tight">مرحباً بك في بوث هب</h2>
          <p className="text-[#65789A] text-base leading-relaxed mb-6 font-normal">
            سجّل دخولك لمتابعة معارضك وحجوزاتك بكل سهولة وأمان عبر بريدك الإلكتروني.
          </p>
          <div className="inline-flex items-center gap-2 bg-[#F8FAFC] px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#102E70] border border-[#0868E9]/15 shadow-sm">
            <ShieldCheck size={16} className="text-[#0868E9]" />
            <span>منصة موثوقة لحجز وإدارة المعارض والبوثات</span>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24">
        <div className="w-full max-w-sm mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#65789A] hover:text-[#0868E9] transition-colors mb-6">
            <ArrowRight size={16} />
            <span>العودة للرئيسية</span>
          </Link>

          {/* Official Booth Hub Logo above form title (visible on all screen sizes) */}
          <div className="mb-6">
            <Link href="/" className="inline-block group" aria-label="بوث هب | Booth Hub">
              <img 
                src="/branding/logo.png?v=3" 
                alt="بوث هب | Booth Hub" 
                className="h-11 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-[#102E70] mb-2">تسجيل الدخول</h1>
          <p className="text-[#65789A] text-sm mb-6">
            أدخل بريدك الإلكتروني وكلمة المرور للدخول إلى حسابك
          </p>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-xs leading-relaxed">
              <AlertCircle size={18} className="shrink-0 text-red-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* EMAIL & PASSWORD LOGIN FORM */}
          <form className="flex flex-col gap-5" onSubmit={handleEmailSubmit}>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#102E70]">البريد الإلكتروني</label>
              <div className="relative">
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-4 pr-10 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0868E9] focus:ring-1 focus:ring-[#0868E9] transition-all text-left"
                  dir="ltr"
                />
                <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#102E70]">كلمة المرور</label>
                <Link href="/forgot-password" className="text-xs text-[#0868E9] hover:underline">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0868E9] focus:ring-1 focus:ring-[#0868E9] transition-all text-left"
                  dir="ltr"
                />
                <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <button 
                  type="button"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#102E70]"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full bg-[#0868E9] text-white py-3.5 rounded-xl font-bold hover:bg-[#0868E9]/90 transition-colors shadow-lg shadow-[#0868E9]/20 mt-2 flex items-center justify-center gap-2 text-sm ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              <span>{isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}</span>
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[#65789A]">
            ليس لديك حساب بعد؟{' '}
            <Link href="/register" className="text-[#0868E9] font-bold hover:underline">
              إنشاء حساب جديد
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
