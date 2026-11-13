"use client";

import Link from 'next/link';
import { ArrowRight, Loader2, AlertCircle, Mail, KeyRound, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { resetPasswordForEmail } from '@/app/actions/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Read URL error parameters (e.g. redirected from expired recovery link)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const err = params.get('error');
      if (err) {
        setErrorMessage(err);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await resetPasswordForEmail(email);
      if (res.success) {
        setSuccessMessage(res.message || 'إذا كان البريد مسجلاً، فستصلك رسالة تحتوي على رابط استعادة كلمة المرور.');
      } else {
        setErrorMessage(res.error || 'تعذر إرسال رابط استعادة كلمة المرور، يرجى المحاولة لاحقاً');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ غير متوقع أثناء إرسال الرابط');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white" dir="rtl">
      {/* Visual / Brand Panel (Desktop) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#102E70] via-[#0D2559] to-[#0868E9] p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Background Decorative Rings */}
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
            استعادة كلمة المرور
          </h2>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed mb-6 font-normal">
            لا تقلق، يمكنك استعادة إمكانية الوصول إلى حسابك بخطوات بسيطة. أدخل بريدك الإلكتروني وسنرسل لك رابطاً آمناً لتعيين كلمة مرور جديدة.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl text-xs font-semibold border border-white/15">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>حماية وأمان كامل لمعلومات حسابك</span>
          </div>
        </div>

        <div className="relative z-10 text-xs text-blue-200/70">
          منصة بوث هب | جميع الحقوق محفوظة {new Date().getFullYear()} ©
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24">
        <div className="w-full max-w-sm mx-auto">
          {/* Back Link */}
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm text-[#65789A] hover:text-[#0868E9] transition-colors mb-6 group cursor-pointer"
          >
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            <span>العودة لتسجيل الدخول</span>
          </Link>

          {/* Official Booth Hub Logo (Mobile header) */}
          <div className="mb-6 md:hidden">
            <Link href="/" className="inline-block group" aria-label="بوث هب | Booth Hub">
              <img 
                src="/branding/logo.png?v=3" 
                alt="بوث هب | Booth Hub" 
                className="h-11 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-[#102E70] mb-2">نسيت كلمة المرور؟</h1>
          <p className="text-[#65789A] text-sm mb-6 leading-relaxed">
            أدخل عنوان بريدك الإلكتروني المسجل في بوث هب وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
          </p>

          {/* Feedback Messages */}
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
                <span className="font-bold text-emerald-900">تم إرسال الرابط بنجاح!</span>
                <span>{successMessage}</span>
                <span className="text-[11px] text-emerald-700/80 mt-1">يرجى فحص صندوق الوارد (أو مجلد الرسائل غير المرغوب فيها Spam).</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#102E70]">البريد الإلكتروني المسجل</label>
              <div className="relative">
                <input 
                  type="email" 
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-4 pr-10 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0868E9] focus:ring-1 focus:ring-[#0868E9] transition-all text-left"
                  dir="ltr"
                />
                <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
              <span>{isLoading ? 'جاري إرسال الرابط...' : 'إرسال رابط استعادة كلمة المرور'}</span>
            </button>
          </form>

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
