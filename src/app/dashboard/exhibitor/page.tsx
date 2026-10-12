import Link from 'next/link';
import { Home, Calendar as CalendarIcon, FileText, Bell, Settings, LogOut, Store, CreditCard, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';
import { getUserBookings } from '@/app/actions/bookings';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function ExhibitorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const bookings = await getUserBookings();

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-right" dir="rtl">
      {/* Sidebar */}
      <aside className="w-68 bg-white border-l border-slate-200/80 shrink-0 hidden md:flex flex-col shadow-xs z-20">
        {/* Brand / Logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-100 bg-gradient-to-l from-white via-white to-blue-50/40">
          <Link href="/" className="flex items-center group py-1" aria-label="بوث هب | Booth Hub">
            <img 
              src="/branding/logo.png?v=3" 
              alt="بوث هب | Booth Hub" 
              className="h-9 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <p className="text-[11px] font-bold text-slate-400 mb-3 px-3 uppercase tracking-wider">لوحة التحكم (عارض)</p>
          <nav className="space-y-1.5">
            <Link href="/dashboard/exhibitor" className="flex items-center gap-3 px-3.5 py-2.5 bg-[#EDF5FF] text-[#0868E9] rounded-2xl font-bold text-xs shadow-xs transition-colors">
              <Home size={18} />
              <span>نظرة عامة</span>
            </Link>
            <Link href="/explore" className="flex items-center gap-3 px-3.5 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-[#102E70] rounded-2xl text-xs font-semibold transition-colors">
              <Store size={18} className="text-slate-400" />
              <span>استكشف المعارض</span>
            </Link>
            <Link href="/ai-assistant" className="flex items-center gap-3 px-3.5 py-2.5 text-[#0868E9] hover:bg-blue-50/60 rounded-2xl text-xs font-semibold transition-colors">
              <Sparkles size={18} className="text-[#FF6D5C]" />
              <span>المساعد الذكي (AI)</span>
            </Link>
          </nav>

          <p className="text-[11px] font-bold text-slate-400 mb-3 mt-7 px-3 uppercase tracking-wider">الحساب</p>
          <nav className="space-y-1.5">
            <Link href="#" className="flex items-center gap-3 px-3.5 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-[#102E70] rounded-2xl text-xs font-semibold transition-colors">
              <Bell size={18} className="text-slate-400" />
              <span>الإشعارات</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3.5 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-[#102E70] rounded-2xl text-xs font-semibold transition-colors">
              <Settings size={18} className="text-slate-400" />
              <span>الإعدادات</span>
            </Link>
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <form action={signOut}>
              <button type="submit" className="w-full flex items-center gap-3 px-3.5 py-2.5 text-red-600 hover:bg-red-50 rounded-2xl text-xs font-bold transition-colors text-right cursor-pointer">
                <LogOut size={18} />
                <span>تسجيل الخروج</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-[#FFFFFF] via-[#F4F8FE] to-[#EAF3FF] min-h-screen">
        
        {/* Multi-layered Ambient Background Decorations matching Explore */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
          {/* Header Title Radiant Glow */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[620px] h-[340px] bg-gradient-to-tr from-[#0868E9]/15 via-[#0868E9]/10 to-[#FF6D5C]/5 rounded-full blur-3xl"></div>

          {/* Top-Right Geometric circles & brand motif */}
          <div className="absolute top-16 right-[-4%] w-80 h-80 rounded-full border border-[#0868E9]/15 border-dashed"></div>
          <div className="absolute top-28 right-[4%] w-48 h-48 rounded-full border border-[#0868E9]/10"></div>
          <div className="absolute top-44 right-[10%] w-3 h-3 rounded-full bg-[#0868E9]/25"></div>
          <div className="absolute top-36 right-[12%] w-2 h-2 rounded-full bg-[#FF6D5C]/35"></div>

          {/* Top-Left Geometric circles & subtle coral glow */}
          <div className="absolute top-20 left-[-4%] w-88 h-88 rounded-full border border-[#0868E9]/10"></div>
          <div className="absolute top-32 left-[3%] w-60 h-60 bg-[#FF6D5C]/[0.03] rounded-full blur-2xl"></div>
          <div className="absolute top-48 left-[8%] w-3.5 h-3.5 rounded-full bg-[#FF6D5C]/30"></div>
          <div className="absolute top-56 left-[6%] w-2 h-2 rounded-full bg-[#0868E9]/30"></div>

          {/* Subtle curved contour lines (mesh depth) */}
          <svg
            className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[420px] opacity-40 -z-10"
            viewBox="0 0 1200 420"
            fill="none"
          >
            <path
              d="M-100 210C150 90 400 320 650 200C900 80 1150 290 1300 180"
              stroke="#0868E9"
              strokeOpacity="0.08"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <path
              d="M-50 280C200 160 450 380 700 270C950 160 1180 340 1350 240"
              stroke="#0868E9"
              strokeOpacity="0.05"
              strokeWidth="1.2"
            />
            <path
              d="M0 140C250 260 500 50 750 170C1000 290 1200 120 1350 200"
              stroke="#FF6D5C"
              strokeOpacity="0.04"
              strokeWidth="1.2"
            />
          </svg>

          {/* Ambient glow behind Cards section */}
          <div className="absolute bottom-28 right-[-6%] w-96 h-96 rounded-[3.5rem] border border-[#0868E9]/10 rotate-12"></div>
          <div className="absolute bottom-20 right-[2%] w-72 h-72 bg-[#0868E9]/[0.05] rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 left-[2%] w-80 h-80 bg-[#EAF3FF] rounded-full blur-2xl"></div>
        </div>

        {/* Top Header Bar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-6 sm:px-8 z-10 sticky top-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <Link href="/" aria-label="بوث هب | Booth Hub">
                <img 
                  src="/branding/logo.png?v=3" 
                  alt="بوث هب | Booth Hub" 
                  className="h-8 w-auto object-contain"
                />
              </Link>
            </div>
            <h1 className="font-extrabold text-base sm:text-lg text-[#102E70] hidden md:block">لوحة تحكم العارض</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left text-xs">
              <p className="font-bold text-[#102E70] line-clamp-1">{profile?.full_name || user.email}</p>
              <p className="text-[11px] text-slate-400 font-medium">عارض معتمد</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#102E70] to-[#0868E9] text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-blue-500/20">
              {profile?.full_name ? profile.full_name.charAt(0) : 'ع'}
            </div>
          </div>
        </header>

        {/* Main Viewport Content */}
        <div className="p-6 sm:p-8 space-y-6 relative z-10 overflow-auto flex-1">
          
          {/* Welcome Card & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#EDF5FF] text-[#0868E9] px-3 py-1 rounded-full text-xs font-bold mb-2">
                <span>مرحباً بك مجدداً</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#102E70]">
                {profile?.full_name ? `أهلاً، ${profile.full_name}` : 'مرحباً بك في لوحة تحكمك'}
              </h2>
              <p className="text-xs text-[#65789A] mt-1 font-medium">
                تابع حجوزات بوثاتك وحالات التأكيد والمدفوعات مباشرة من هنا.
              </p>
            </div>
            
            <Link 
              href="/explore" 
              className="px-5 py-3 bg-[#0868E9] hover:bg-[#0868E9]/90 text-white rounded-2xl text-xs font-bold shadow-md shadow-[#0868E9]/20 flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
            >
              <Store size={16} />
              <span>حجز بوث جديد</span>
              <ArrowUpRight size={14} className="opacity-75" />
            </Link>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: Total Requests */}
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-[#EDF5FF] text-[#0868E9] flex items-center justify-center shrink-0">
                <CalendarIcon size={24} />
              </div>
              <div>
                <p className="text-xs text-[#65789A] font-semibold mb-1">إجمالي طلبات الحجز</p>
                <p className="text-2xl font-extrabold text-[#102E70]">{totalBookings}</p>
              </div>
            </div>

            {/* Card 2: Confirmed Bookings */}
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Store size={24} />
              </div>
              <div>
                <p className="text-xs text-[#65789A] font-semibold mb-1">حجوزات مؤكدة</p>
                <p className="text-2xl font-extrabold text-emerald-600">{confirmedBookings}</p>
              </div>
            </div>

            {/* Card 3: Pending Review */}
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-xs text-[#65789A] font-semibold mb-1">قيد المراجعة</p>
                <p className="text-2xl font-extrabold text-amber-600">{pendingBookings}</p>
              </div>
            </div>

          </div>

          {/* Bookings Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-[#102E70]">قائمة حجوزاتي</h3>
              <span className="text-xs text-slate-400 font-semibold">{bookings.length} حجز مسجل</span>
            </div>

            <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              {bookings.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#0868E9] flex items-center justify-center mx-auto mb-4">
                    <Store size={32} />
                  </div>
                  <h4 className="font-extrabold text-base text-[#102E70] mb-1">لا توجد حجوزات مسجلة حتى الآن</h4>
                  <p className="text-xs text-[#65789A] max-w-sm mx-auto mb-5 leading-relaxed font-medium">
                    استكشف المعارض المقامة واحجز موقعك الأفضل بين كبرى الشركات والعارضين.
                  </p>
                  <Link 
                    href="/explore" 
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0868E9] hover:bg-[#0868E9]/90 text-white rounded-xl text-xs font-bold shadow-md shadow-[#0868E9]/20 transition-all"
                  >
                    <Store size={14} />
                    <span>استكشف المعارض المتاحة</span>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#F8FAFC] border-b border-slate-100 text-[#65789A]">
                      <tr>
                        <th className="p-4 font-bold">الرقم المرجعي</th>
                        <th className="p-4 font-bold">اسم المعرض</th>
                        <th className="p-4 font-bold">رقم البوث</th>
                        <th className="p-4 font-bold">المبلغ الإجمالي</th>
                        <th className="p-4 font-bold">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="p-4 font-mono font-bold text-xs text-[#0868E9]">
                            {booking.booking_reference}
                          </td>
                          <td className="p-4 font-bold text-[#102E70]">
                            {booking.exhibition_title}
                          </td>
                          <td className="p-4 font-bold text-slate-700">
                            <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-mono">
                              {booking.booth_number}
                            </span>
                          </td>
                          <td className="p-4 font-extrabold text-[#102E70]">
                            {booking.total_amount?.toLocaleString() || 0} {booking.currency || 'SAR'}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              booking.status === 'confirmed' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' :
                              booking.status === 'pending' 
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/60' :
                                'bg-red-50 text-red-700 border border-red-200/60'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                booking.status === 'confirmed' ? 'bg-emerald-500' :
                                booking.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                              }`} />
                              <span>
                                {booking.status === 'confirmed' ? 'مؤكد' :
                                 booking.status === 'pending' ? 'قيد المراجعة' : 
                                 booking.status === 'cancelled' ? 'ملغي' :
                                 booking.status === 'rejected' ? 'مرفوض' : booking.status}
                              </span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
