"use client"
import Link from 'next/link';
import { ArrowRight, Store, LayoutDashboard, Loader2, CheckCircle2, AlertCircle, Mail, Lock, Phone, User, Building2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/app/actions/auth';

export default function Register() {
  const router = useRouter();
  
  const [accountType, setAccountType] = useState<'exhibitor' | 'organizer'>('exhibitor');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-20 overflow-y-auto">
        <div className="w-full max-w-lg mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#65789A] hover:text-[#0868E9] transition-colors mb-6">
            <ArrowRight size={16} />
            <span>العودة للرئيسية</span>
          </Link>

          <h1 className="text-2xl font-bold text-[#102E70] mb-2">انضم إلى بوث هب</h1>
          <p className="text-[#65789A] text-sm mb-6">
            أنشئ حسابك الجديد بالبريد الإلكتروني ورقم الجوال للبدء فوراً.
          </p>

          {/* Account Type Selector */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              type="button"
              onClick={() => setAccountType('exhibitor')}
              className={`p-4 rounded-2xl border-2 text-right transition-all flex flex-col gap-2 ${
                accountType === 'exhibitor' 
                  ? 'border-[#0868E9] bg-[#0868E9]/5 shadow-md shadow-[#0868E9]/10' 
                  : 'border-[#E2E8F0] bg-white hover:border-[#0868E9]/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accountType === 'exhibitor' ? 'bg-[#0868E9] text-white' : 'bg-[#F8FAFC] text-[#65789A]'}`}>
                <Store size={20} />
              </div>
              <h3 className={`font-bold ${accountType === 'exhibitor' ? 'text-[#102E70]' : 'text-[#65789A]'}`}>عارض</h3>
              <p className="text-xs text-[#65789A]">استكشاف وحجز البوثات في المعارض</p>
            </button>

            <button 
              type="button"
              onClick={() => setAccountType('organizer')}
              className={`p-4 rounded-2xl border-2 text-right transition-all flex flex-col gap-2 ${
                accountType === 'organizer' 
                  ? 'border-[#FF6D5C] bg-[#FF6D5C]/5 shadow-md shadow-[#FF6D5C]/10' 
                  : 'border-[#E2E8F0] bg-white hover:border-[#FF6D5C]/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accountType === 'organizer' ? 'bg-[#FF6D5C] text-white' : 'bg-[#F8FAFC] text-[#65789A]'}`}>
                <LayoutDashboard size={20} />
              </div>
              <h3 className={`font-bold ${accountType === 'organizer' ? 'text-[#102E70]' : 'text-[#65789A]'}`}>منظم معرض</h3>
              <p className="text-xs text-[#65789A]">إدارة المعارض والمخططات والبوثات</p>
            </button>
          </div>

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

          {/* Registration Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#102E70]">الاسم الكامل *</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="fullName"
                  required
                  placeholder="محمد أحمد"
                  className="w-full pl-4 pr-10 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0868E9] focus:ring-1 focus:ring-[#0868E9] transition-all"
                />
                <User size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#102E70]">البريد الإلكتروني *</label>
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
              <span className="text-[11px] text-[#65789A]">يُستخدم هذا البريد لتسجيل الدخول إلى حسابك.</span>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#102E70]">رقم الجوال *</label>
              <div className="relative">
                <input 
                  type="tel" 
                  name="phone"
                  required
                  placeholder="05XXXXXXXX"
                  className="w-full pl-20 pr-10 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0868E9] focus:ring-1 focus:ring-[#0868E9] transition-all text-left"
                  dir="ltr"
                />
                <Phone size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">
                  🇸🇦 +966
                </span>
              </div>
              <span className="text-[11px] text-[#65789A]">يُسجّل رقم الجوال للتواصل الرسمي وإشعارات الحجوزات.</span>
            </div>

            {/* Organization Name (If organizer) */}
            {accountType === 'organizer' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#102E70]">اسم الجهة أو الشركة المنظمة *</label>
                <div className="relative">
                  <input 
                    type="text" 
                    name="organizationName"
                    required
                    placeholder="شركة المعارض الوطنية"
                    className="w-full pl-4 pr-10 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0868E9] focus:ring-1 focus:ring-[#0868E9] transition-all"
                  />
                  <Building2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            )}

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#102E70]">كلمة المرور *</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    minLength={6}
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

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#102E70]">تأكيد كلمة المرور *</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0868E9] focus:ring-1 focus:ring-[#0868E9] transition-all text-left"
                    dir="ltr"
                  />
                  <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <button 
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#102E70]"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 mt-2">
              <input 
                type="checkbox" 
                id="terms" 
                required 
                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#0868E9] focus:ring-[#0868E9]" 
              />
              <label htmlFor="terms" className="text-xs text-[#65789A]">
                أوافق على <Link href="/terms" className="text-[#0868E9] hover:underline font-semibold">الشروط والأحكام</Link> و <Link href="/privacy" className="text-[#0868E9] hover:underline font-semibold">سياسة الخصوصية</Link>.
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full text-white py-3.5 rounded-xl font-bold transition-all shadow-lg mt-2 flex items-center justify-center gap-2 text-sm ${
                accountType === 'organizer' 
                  ? 'bg-[#FF6D5C] hover:bg-[#FF6D5C]/90 shadow-[#FF6D5C]/20' 
                  : 'bg-[#0868E9] hover:bg-[#0868E9]/90 shadow-[#0868E9]/20'
              } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              <span>{isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}</span>
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[#65789A]">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-[#0868E9] font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>

      {/* Visual Side */}
      <div className="hidden md:flex flex-1 bg-gradient-to-tl from-[#EDF5FF] to-white relative overflow-hidden items-center justify-center p-12 text-center border-r border-[#E2E8F0]">
        <div className="relative z-10 w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-[#E2E8F0]">
          <div className="w-16 h-16 bg-[#0868E9] text-white text-3xl font-bold flex items-center justify-center rounded-2xl mx-auto mb-6 shadow-xl">
            B
          </div>
          <h2 className="text-2xl font-bold text-[#102E70] mb-4">انضم إلى مجتمع بوث هب</h2>
          <p className="text-[#65789A] text-sm leading-relaxed mb-6">
            سواء كنت عارضاً تبحث عن أفضل موقع في المعارض أو منظماً يسعى لأتمتة حجوزات البوثات، بوث هب هي المنصة الأمثل لك.
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs font-medium text-[#65789A]">
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <p className="font-bold text-[#102E70] mb-1">تسجيل موحد</p>
              <p className="text-gray-500">بالبريد الإلكتروني والجوال</p>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <p className="font-bold text-[#102E70] mb-1">مخطط تفاعلي</p>
              <p className="text-gray-500">رؤية كاملة لمواقع البوثات</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
