"use client";

import Link from 'next/link';
import { ArrowRight, Loader2, AlertCircle, Lock, KeyRound, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updatePassword, checkResetSession, exchangeRecoveryCode } from '@/app/actions/auth';

export default function ResetPassword() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Validation States
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize and verify the reset session or query parameters
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      if (typeof window === 'undefined') return;

      const params = new URLSearchParams(window.location.search);
      const urlError = params.get('error_description') || params.get('error');
      const code = params.get('code');

      if (urlError) {
        if (isMounted) {
          setErrorMessage(
            urlError.includes('expired') 
              ? 'انتهت صلاحية رابط استعادة كلمة المرور، يرجى طلب رابط جديد.'
              : urlError
          );
          setIsCheckingSession(false);
          setHasValidSession(false);
        }
        return;
      }

      // If a code is present in query parameters (e.g. direct PKCE redirect), exchange it first
      if (code) {
        const exchangeRes = await exchangeRecoveryCode(code);
        if (!exchangeRes.success) {
          if (isMounted) {
            setErrorMessage(exchangeRes.error || 'رمز الاستعادة غير صالح أو منتهي الصلاحية');
            setIsCheckingSession(false);
            setHasValidSession(false);
          }
          return;
        }
      }

      // Check if the user currently holds an authenticated recovery session
      const sessionCheck = await checkResetSession();
      if (isMounted) {
        if (sessionCheck.valid) {
          setHasValidSession(true);
          setUserEmail(sessionCheck.email || null);
        } else {
          setHasValidSession(false);
          setErrorMessage('لا توجد جلسة استعادة كلمة مرور صالحة. قد يكون الرابط قد انتهى أو تم استخدامه مسبقاً.');
        }
        setIsCheckingSession(false);
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setErrorMessage('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('كلمتا المرور غير متطابقتين، يرجى التأكد');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await updatePassword(formData);

      if (res.success) {
        setSuccessMessage('تم تحديث كلمة المرور بنجاح! جاري تحويلك لتسجيل الدخول...');
        setTimeout(() => {
          router.push(res.redirectUrl || '/login');
        }, 1500);
      } else {
        setErrorMessage(res.error || 'فشل تحديث كلمة المرور');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ غير متوقع أثناء تحديث كلمة المرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white" dir="rtl">
      {/* Visual / Brand Panel (Desktop) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#102E70] via-[#0D2559] to-[#0868E9] p-12 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF6D5C]/10 rounded-full blur-2xl pointer-events-none transform -translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10">
          <Link href="/" className="inline-block group" aria-label="بوث هب | Booth Hub">
            <img 
              src="/branding/logo.png?v=3" 
              alt="بوث هب | Booth Hub" 
              className="h-14 w-auto object-contain brightness-0 invert drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        </div>

        <div className="relative z-10 max-w-md my-auto">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#FF6D5C] mb-6 shadow-inner">
            <KeyRound size={28} />
          </div>
          <h2 className="text-3xl font-extrabold mb-4 tracking-tight leading-tight">
            تعيين كلمة مرور جديدة
          </h2>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed mb-6 font-normal">
            اختر كلمة مرور قوية وسهلة التذكر بالنسبة لك، تتكون من 6 أحرف أو أرقام على الأقل لضمان حماية حسابك.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl text-xs font-semibold border border-white/15">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>تشفير وحماية لكلمات المرور بأعلى المعايير</span>
          </div>
        </div>

        <div className="relative z-10 text-xs text-blue-200/70">
          منصة بوث هب | جميع الحقوق محفوظة {new Date().getFullYear()} ©
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24">
        <div className="w-full max-w-sm mx-auto">
          {/* Back to Login */}
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm text-[#65789A] hover:text-[#0868E9] transition-colors mb-6 group cursor-pointer"
          >
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            <span>العودة لتسجيل الدخول</span>
          </Link>

          {/* Official Booth Hub Logo (Mobile) */}
          <div className="mb-6 md:hidden">
            <Link href="/" className="inline-block group" aria-label="بوث هب | Booth Hub">
              <img 
                src="/branding/logo.png?v=3" 
                alt="بوث هب | Booth Hub" 
                className="h-11 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-[#102E70] mb-2">تعيين كلمة المرور الجديدة</h1>
          <p className="text-[#65789A] text-sm mb-6 leading-relaxed">
            {userEmail 
              ? `إعادة تعيين كلمة المرور للحساب المرتبط بـ (${userEmail})` 
              : 'أدخل كلمة المرور الجديدة لحسابك في بوث هب'}
          </p>

          {/* Checking Session Loading State */}
          {isCheckingSession && (
            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-center flex flex-col items-center justify-center gap-3">
              <Loader2 size={28} className="animate-spin text-[#0868E9]" />
              <span className="text-xs text-[#65789A] font-medium">جاري التحقق من صلاحية رابط الاستعادة...</span>
            </div>
          )}

          {/* Invalid / Expired Session View */}
          {!isCheckingSession && !hasValidSession && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-xs leading-relaxed">
                <AlertCircle size={20} className="shrink-0 text-red-500 mt-0.5" />
                <span>{errorMessage || 'انتهت صلاحية جلسة الاستعادة أو تم استخدام الرابط مسبقاً.'}</span>
              </div>

              <Link
                href="/forgot-password"
                className="w-full bg-[#0868E9] text-white py-3.5 rounded-xl font-bold hover:bg-[#0868E9]/90 transition-colors shadow-lg shadow-[#0868E9]/20 flex items-center justify-center gap-2 text-sm text-center"
              >
                <span>طلب رابط استعادة جديد</span>
              </Link>
            </div>
          )}

          {/* Valid Session Form */}
          {!isCheckingSession && hasValidSession && (
            <>
              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-xs leading-relaxed animate-in fade-in">
                  <AlertCircle size={18} className="shrink-0 text-red-500 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 text-xs leading-relaxed animate-in fade-in">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-emerald-900">تم التحديث بنجاح!</span>
                    <span>{successMessage}</span>
                  </div>
                </div>
              )}

              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#102E70]">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0868E9] focus:ring-1 focus:ring-[#0868E9] transition-all text-left"
                      dir="ltr"
                    />
                    <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <button 
                      type="button"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#102E70] cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#102E70]">تأكيد كلمة المرور الجديدة</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0868E9] focus:ring-1 focus:ring-[#0868E9] transition-all text-left"
                      dir="ltr"
                    />
                    <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <button 
                      type="button"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#102E70] cursor-pointer"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || Boolean(successMessage)}
                  className={`w-full bg-[#0868E9] text-white py-3.5 rounded-xl font-bold hover:bg-[#0868E9]/90 transition-colors shadow-lg shadow-[#0868E9]/20 mt-2 flex items-center justify-center gap-2 text-sm cursor-pointer ${
                    isLoading || successMessage ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading && <Loader2 size={18} className="animate-spin" />}
                  <span>{isLoading ? 'جاري الحفظ...' : 'حفظ كلمة المرور الجديدة'}</span>
                </button>
              </form>
            </>
          )}

          {/* Footer Navigation */}
          <div className="mt-8 text-center text-sm text-[#65789A]">
            تذكرت كلمة المرور؟{' '}
            <Link href="/login" className="text-[#0868E9] font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
