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
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#EDF5FF] to-[#0868E9]/10 relative overflow-hidden items-center justify-center p-12 text-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 border-[40px] border-[#0868E9] rounded-full"></div>
          <div className="absolute bottom-20 -left-10 w-40 h-40 border-[20px] border-[#FF6D5C] rounded-full"></div>
        </div>
        <div className="relative z-10 max-w-md">
          <div className="w-16 h-16 bg-[#0868E9] text-white text-3xl font-bold flex items-center justify-center rounded-2xl mx-auto mb-6 shadow-xl">
            B
          </div>
          <h2 className="text-3xl font-bold text-[#102E70] mb-4">مرحباً بك في بوث هب</h2>
          <p className="text-[#65789A] text-lg leading-relaxed mb-6">
            سجّل دخولك لمتابعة معارضك وحجوزاتك بكل سهولة وأمان عبر بريدك الإلكتروني.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-semibold text-[#102E70] border border-[#0868E9]/20 shadow-sm">
            <ShieldCheck size={16} className="text-[#0868E9]" />
            <span>منصة موثوقة لحجز وإدارة المعارض والبوثات</span>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24">
        <div className="w-full max-w-sm mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#65789A] hover:text-[#0868E9] transition-colors mb-8">
            <ArrowRight size={16} />
            <span>العودة للرئيسية</span>
          </Link>

          <div className="md:hidden w-12 h-12 bg-[#0868E9] text-white text-2xl font-bold flex items-center justify-center rounded-xl mb-6">
            B
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
