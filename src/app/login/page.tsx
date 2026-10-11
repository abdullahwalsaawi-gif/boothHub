"use client"
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Phone, Mail, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, sendPhoneOtp, verifyPhoneOtp } from '@/app/actions/auth';

export default function Login() {
  const router = useRouter();
  
  // Login Method: 'phone' (Default requested by user) or 'email'
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  
  // Phone OTP States
  const [phone, setPhone] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  // Password State
  const [showPassword, setShowPassword] = useState(false);
  
  // UI Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await sendPhoneOtp(phone);
      if (!res.success) {
        setErrorMessage(res.error || 'فشل إرسال رمز التحقق');
      } else {
        setOtpSent(true);
        setSuccessMessage(res.message || 'تم إرسال رمز التحقق بنجاح');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP & Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await verifyPhoneOtp(phone, otpToken);
      if (!res.success) {
        setErrorMessage(res.error || 'رمز التحقق غير صحيح');
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
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-light-blue-bg to-primary/10 relative overflow-hidden items-center justify-center p-12 text-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 border-[40px] border-primary rounded-full"></div>
          <div className="absolute bottom-20 -left-10 w-40 h-40 border-[20px] border-coral rounded-full"></div>
        </div>
        <div className="relative z-10 max-w-md">
          <div className="w-16 h-16 bg-primary text-white text-3xl font-bold flex items-center justify-center rounded-2xl mx-auto mb-6 shadow-xl">B</div>
          <h2 className="text-3xl font-bold text-primary-dark mb-4">مرحباً بك في بوث هب</h2>
          <p className="text-foreground text-lg leading-relaxed mb-6">
            تسجيل دخول آمن وسريع عبر رمز التحقق المباشر إلى رقم جوالك.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-semibold text-primary-dark border border-primary/20">
            <ShieldCheck size={16} className="text-primary" />
            <span>تسجيل دخول محمي برمز تحقق SMS</span>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24">
        <div className="w-full max-w-sm mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors mb-8">
            <ArrowRight size={16} />
            <span>العودة للرئيسية</span>
          </Link>

          <div className="md:hidden w-12 h-12 bg-primary text-white text-2xl font-bold flex items-center justify-center rounded-xl mb-6">B</div>

          <h1 className="text-2xl font-bold text-primary-dark mb-2">تسجيل الدخول</h1>
          <p className="text-foreground text-sm mb-6">
            {loginMethod === 'phone' 
              ? (otpSent ? 'أدخل رمز التحقق المرسل إلى هاتفك' : 'أدخل رقم جوالك لتلقي رمز التحقق السريع')
              : 'أدخل بريدك الإلكتروني وكلمة المرور'}
          </p>

          {/* Login Method Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-secondary-bg rounded-xl border border-border mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('phone');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                loginMethod === 'phone' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-foreground hover:text-primary'
              }`}
            >
              <Phone size={14} />
              <span>رقم الجوال (رمز تحقق)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('email');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                loginMethod === 'email' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-foreground hover:text-primary'
              }`}
            >
              <Mail size={14} />
              <span>البريد الإلكتروني</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-xs leading-relaxed">
              <AlertCircle size={18} className="shrink-0 text-red-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-start gap-3 text-xs leading-relaxed">
              <CheckCircle2 size={18} className="shrink-0 text-green-500 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* METHOD 1: PHONE OTP LOGIN */}
          {loginMethod === 'phone' && (
            <>
              {!otpSent ? (
                // Step 1: Enter Phone Number
                <form className="flex flex-col gap-4" onSubmit={handleSendOtp}>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-primary-dark">رقم الجوال</label>
                    <div className="relative">
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="05XXXXXXXX"
                        className="w-full px-4 py-3 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-left"
                        dir="ltr"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                        🇸🇦 +966
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400">سيتم إرسال رمز تأكيد مكون من 6 أرقام إلى هذا الرقم.</span>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading || !phone.trim()}
                    className={`w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 mt-2 flex items-center justify-center gap-2 text-sm ${
                      isLoading || !phone.trim() ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading && <Loader2 size={18} className="animate-spin" />}
                    <span>{isLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}</span>
                  </button>
                </form>
              ) : (
                // Step 2: Enter OTP Code
                <form className="flex flex-col gap-4" onSubmit={handleVerifyOtp}>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-primary-dark">رمز التحقق (OTP)</label>
                      <button 
                        type="button" 
                        onClick={() => { setOtpSent(false); setOtpToken(''); }} 
                        className="text-xs text-primary hover:underline"
                      >
                        تغيير الرقم
                      </button>
                    </div>
                    <input 
                      type="text" 
                      required
                      maxLength={6}
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value)}
                      placeholder="• • • • • •"
                      className="w-full px-4 py-3 bg-secondary-bg border border-border rounded-xl text-center text-lg font-mono font-bold tracking-widest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      dir="ltr"
                      autoFocus
                    />
                    <span className="text-[11px] text-gray-400">أدخل الرمز المكون من 6 أرقام المرسل لرقمك.</span>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading || otpToken.length < 4}
                    className={`w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 mt-2 flex items-center justify-center gap-2 text-sm ${
                      isLoading || otpToken.length < 4 ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading && <Loader2 size={18} className="animate-spin" />}
                    <span>{isLoading ? 'جاري التحقق...' : 'تأكيد وتسجيل الدخول'}</span>
                  </button>

                  <div className="text-center mt-2">
                    <button 
                      type="button" 
                      disabled={isLoading}
                      onClick={handleSendOtp} 
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      لم يصلك الرمز؟ إعادة الإرسال
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* METHOD 2: EMAIL & PASSWORD LOGIN */}
          {loginMethod === 'email' && (
            <form className="flex flex-col gap-5" onSubmit={handleEmailSubmit}>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-primary-dark">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  dir="ltr"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-primary-dark">كلمة المرور</label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">نسيت كلمة المرور؟</Link>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    dir="ltr"
                  />
                  <button 
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 mt-2 flex items-center justify-center gap-2 text-sm ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading && <Loader2 size={18} className="animate-spin" />}
                <span>{isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول بالبريد'}</span>
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-sm text-foreground">
            ليس لديك حساب بعد؟{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">إنشاء حساب جديد</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
