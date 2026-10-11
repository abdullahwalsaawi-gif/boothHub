"use client"
import Link from 'next/link';
import { ArrowRight, Store, LayoutDashboard, Loader2, CheckCircle2, AlertCircle, Phone, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUpWithPhoneOtp, verifySignUpPhoneOtp, signUp } from '@/app/actions/auth';

export default function Register() {
  const router = useRouter();
  
  // Registration Method: 'phone' (Default requested by user) or 'email'
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [accountType, setAccountType] = useState<'exhibitor' | 'organizer'>('exhibitor');
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  
  // Phone OTP Flow States
  const [otpSent, setOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  
  // Email Flow States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Send OTP for Registration
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAgreed) {
      setErrorMessage('يرجى الموافقة على الشروط والأحكام أولاً');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await signUpWithPhoneOtp({
        phone,
        fullName,
        accountType,
        organizationName: accountType === 'organizer' ? organizationName : undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'فشل إرسال رمز التحقق');
      } else {
        setOtpSent(true);
        setSuccessMessage(res.message || 'تم إرسال رمز التحقق إلى رقم جوالك');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP & Create Account
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await verifySignUpPhoneOtp({
        phone,
        token: otpToken,
        fullName,
        accountType,
        organizationName: accountType === 'organizer' ? organizationName : undefined,
      });

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

  // Fallback Email Registration
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set('accountType', accountType);

    try {
      const res = await signUp(formData);
      if (!res.success) {
        setErrorMessage(res.error || 'حدث خطأ أثناء إنشاء الحساب');
      } else if (res.message) {
        setSuccessMessage(res.message);
      } else if (res.redirectUrl) {
        router.push(res.redirectUrl);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24">
        <div className="w-full max-w-lg mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors mb-6">
            <ArrowRight size={16} />
            <span>العودة للرئيسية</span>
          </Link>

          <h1 className="text-2xl font-bold text-primary-dark mb-2">انضم إلى بوث هب</h1>
          <p className="text-foreground text-sm mb-6">أنشئ حسابك فوراً برمز تحقق يصل إلى جوالك دون انتظار رسائل البريد.</p>

          {/* Account Type Selector */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              type="button"
              disabled={otpSent}
              onClick={() => setAccountType('exhibitor')}
              className={`p-4 rounded-2xl border-2 text-right transition-all flex flex-col gap-2 ${
                accountType === 'exhibitor' 
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                  : 'border-border bg-white hover:border-primary/30'
              } ${otpSent ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accountType === 'exhibitor' ? 'bg-primary text-white' : 'bg-secondary-bg text-foreground'}`}>
                <Store size={20} />
              </div>
              <h3 className={`font-bold ${accountType === 'exhibitor' ? 'text-primary-dark' : 'text-foreground'}`}>عارض</h3>
              <p className="text-xs text-foreground/70">استكشاف وحجز البوثات</p>
            </button>

            <button 
              type="button"
              disabled={otpSent}
              onClick={() => setAccountType('organizer')}
              className={`p-4 rounded-2xl border-2 text-right transition-all flex flex-col gap-2 ${
                accountType === 'organizer' 
                  ? 'border-coral bg-coral/5 shadow-md shadow-coral/10' 
                  : 'border-border bg-white hover:border-coral/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accountType === 'organizer' ? 'bg-coral text-white' : 'bg-secondary-bg text-foreground'}`}>
                <LayoutDashboard size={20} />
              </div>
              <h3 className={`font-bold ${accountType === 'organizer' ? 'text-primary-dark' : 'text-foreground'}`}>منظم معرض</h3>
              <p className="text-xs text-foreground/70">إدارة المعارض والبوثات</p>
            </button>
          </div>

          {/* Registration Method Switcher */}
          {!otpSent && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-secondary-bg rounded-xl border border-border mb-6">
              <button
                type="button"
                onClick={() => { setMethod('phone'); setErrorMessage(null); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  method === 'phone' ? 'bg-white text-primary shadow-sm' : 'text-foreground hover:text-primary'
                }`}
              >
                <Phone size={14} />
                <span>برمز تحقق الجوال (موصى به)</span>
              </button>
              <button
                type="button"
                onClick={() => { setMethod('email'); setErrorMessage(null); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  method === 'email' ? 'bg-white text-primary shadow-sm' : 'text-foreground hover:text-primary'
                }`}
              >
                <Mail size={14} />
                <span>البريد الإلكتروني</span>
              </button>
            </div>
          )}

          {/* Feedback Alerts */}
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

          {/* METHOD 1: PHONE OTP SIGNUP (DEFAULT) */}
          {method === 'phone' && (
            <>
              {!otpSent ? (
                // Step 1: User info & Phone
                <form className="flex flex-col gap-4" onSubmit={handleSendOtp}>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-primary-dark">الاسم الكامل *</label>
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="مثال: عبدالله السعد"
                      className="w-full px-4 py-3 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-primary-dark">رقم الجوال *</label>
                    <div className="relative">
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="05XXXXXXXX"
                        className="w-full px-4 py-3 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-left"
                        dir="ltr"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                        🇸🇦 +966
                      </span>
                    </div>
                  </div>

                  {accountType === 'organizer' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-primary-dark">اسم الجهة أو الشركة المنظمة *</label>
                      <input 
                        type="text" 
                        required
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        placeholder="شركة تنظيم المعارض الدولية"
                        className="w-full px-4 py-3 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  )}

                  <div className="flex items-start gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="terms-phone" 
                      required 
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" 
                    />
                    <label htmlFor="terms-phone" className="text-xs text-foreground">
                      أوافق على <Link href="/terms" className="text-primary hover:underline">الشروط والأحكام</Link> و <Link href="/privacy" className="text-primary hover:underline">سياسة الخصوصية</Link>.
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading || !phone.trim() || !fullName.trim()}
                    className={`w-full text-white py-3.5 rounded-xl font-bold transition-all shadow-lg mt-2 flex items-center justify-center gap-2 text-sm ${
                      accountType === 'organizer' 
                        ? 'bg-coral hover:bg-coral/90 shadow-coral/20' 
                        : 'bg-primary hover:bg-primary/90 shadow-primary/20'
                    } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isLoading && <Loader2 size={18} className="animate-spin" />}
                    <span>{isLoading ? 'جاري إرسال الرمز...' : 'إرسال رمز التحقق إلى الجوال'}</span>
                  </button>
                </form>
              ) : (
                // Step 2: OTP Code Verification
                <form className="flex flex-col gap-4" onSubmit={handleVerifyOtp}>
                  <div className="p-3 bg-light-blue-bg/70 border border-primary/20 rounded-xl text-xs text-primary-dark flex items-center justify-between">
                    <span>الرمز مرسل إلى: <strong className="font-mono">{phone}</strong></span>
                    <button 
                      type="button" 
                      onClick={() => setOtpSent(false)} 
                      className="text-primary hover:underline font-bold"
                    >
                      تغيير الرقم
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-primary-dark">أدخل رمز التحقق (OTP) *</label>
                    <input 
                      type="text" 
                      required
                      maxLength={6}
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value)}
                      placeholder="• • • • • •"
                      className="w-full px-4 py-3 bg-secondary-bg border border-border rounded-xl text-center text-xl font-mono font-bold tracking-widest focus:outline-none focus:border-primary text-primary-dark"
                      dir="ltr"
                      autoFocus
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading || otpToken.length < 4}
                    className={`w-full text-white py-3.5 rounded-xl font-bold transition-all shadow-lg mt-2 flex items-center justify-center gap-2 text-sm ${
                      accountType === 'organizer' 
                        ? 'bg-coral hover:bg-coral/90 shadow-coral/20' 
                        : 'bg-primary hover:bg-primary/90 shadow-primary/20'
                    } ${isLoading || otpToken.length < 4 ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isLoading && <Loader2 size={18} className="animate-spin" />}
                    <span>{isLoading ? 'جاري التحقق وإنشاء الحساب...' : 'تأكيد وإنشاء الحساب'}</span>
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

          {/* METHOD 2: EMAIL PASSWORD SIGNUP */}
          {method === 'email' && (
            <form className="flex flex-col gap-4" onSubmit={handleEmailSubmit}>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-primary-dark">الاسم الكامل *</label>
                <input 
                  type="text" 
                  name="fullName"
                  required
                  placeholder="محمد أحمد"
                  className="w-full px-4 py-2.5 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-primary-dark">البريد الإلكتروني *</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                  dir="ltr"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-primary-dark">رقم الجوال</label>
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="05xxxxxxxx"
                  className="w-full px-4 py-2.5 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                  dir="ltr"
                />
              </div>

              {accountType === 'organizer' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-primary-dark">اسم الجهة المنظمة *</label>
                  <input 
                    type="text" 
                    name="organizationName"
                    required
                    placeholder="شركة المعارض الوطنية"
                    className="w-full px-4 py-2.5 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-primary-dark">كلمة المرور *</label>
                  <input 
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                    dir="ltr"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-primary-dark">تأكيد كلمة المرور *</label>
                  <input 
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 mt-2">
                <input type="checkbox" id="terms-email" required className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <label htmlFor="terms-email" className="text-xs text-foreground">
                  أوافق على <Link href="/terms" className="text-primary hover:underline">الشروط والأحكام</Link>.
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg text-sm mt-2"
              >
                {isLoading ? 'جاري الإنشاء...' : 'إنشاء الحساب بالبريد'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-sm text-foreground">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">تسجيل الدخول</Link>
          </div>
        </div>
      </div>

      {/* Visual Side */}
      <div className="hidden md:flex flex-1 bg-gradient-to-tl from-light-blue-bg to-white relative overflow-hidden items-center justify-center p-12 text-center border-r border-border/50">
        <div className="relative z-10 w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-border">
          <div className="w-16 h-16 bg-primary text-white text-3xl font-bold flex items-center justify-center rounded-2xl mx-auto mb-6 shadow-xl">B</div>
          <h2 className="text-2xl font-bold text-primary-dark mb-4">انضم إلى مجتمع بوث هب</h2>
          <p className="text-foreground text-sm leading-relaxed mb-6">
            سواء كنت عارضاً يبحث عن أفضل موقع في المعارض أو منظماً يسعى لأتمتة حجوزات البوثات، بوث هب هي المنصة الأمثل لك.
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs font-medium text-foreground">
            <div className="p-3 bg-secondary-bg rounded-xl border border-border">
              <p className="font-bold text-primary-dark mb-1">رمز تحقق فوري</p>
              <p className="text-gray-500">مباشرة على هاتفك SMS</p>
            </div>
            <div className="p-3 bg-secondary-bg rounded-xl border border-border">
              <p className="font-bold text-primary-dark mb-1">مخطط تفاعلي</p>
              <p className="text-gray-500">رؤية كاملة لمواقع البوثات</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
