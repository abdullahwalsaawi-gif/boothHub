import Link from 'next/link';
import { Home, Calendar as CalendarIcon, FileText, Bell, Settings, LogOut, Store, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-secondary-bg flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-border flex-shrink-0 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">B</div>
            <span className="font-bold text-xl text-primary-dark">بوث هب</span>
          </Link>
        </div>
        
        <div className="p-6">
          <p className="text-xs font-bold text-gray-400 mb-4 uppercase">لوحة التحكم (عارض)</p>
          <nav className="space-y-1">
            <Link href="/dashboard/exhibitor" className="flex items-center gap-3 px-3 py-2.5 bg-primary/10 text-primary rounded-lg font-medium">
              <Home size={18} />
              <span>نظرة عامة</span>
            </Link>
            <Link href="/explore" className="flex items-center gap-3 px-3 py-2.5 text-foreground hover:bg-secondary-bg hover:text-primary-dark rounded-lg transition-colors">
              <Store size={18} />
              <span>استكشف المعارض</span>
            </Link>
            <Link href="/ai-assistant" className="flex items-center gap-3 px-3 py-2.5 text-primary hover:bg-light-blue-bg rounded-lg transition-colors font-medium">
              <Sparkles size={18} className="text-coral" />
              <span>المساعد الذكي (AI)</span>
            </Link>
          </nav>

          <p className="text-xs font-bold text-gray-400 mb-4 mt-8 uppercase">الحساب</p>
          <nav className="space-y-1">
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 text-foreground hover:bg-secondary-bg hover:text-primary-dark rounded-lg transition-colors">
              <Bell size={18} />
              <span>الإشعارات</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 text-foreground hover:bg-secondary-bg hover:text-primary-dark rounded-lg transition-colors">
              <Settings size={18} />
              <span>الإعدادات</span>
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-border">
          <form action={signOut}>
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-right">
              <LogOut size={18} />
              <span>تسجيل الخروج</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6">
          <h1 className="font-bold text-primary-dark">لوحة تحكم العارض</h1>
          <div className="flex items-center gap-4">
            <div className="text-left text-xs">
              <p className="font-bold text-primary-dark">{profile?.full_name || user.email}</p>
              <p className="text-gray-400">عارض معتمد</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
              {profile?.full_name ? profile.full_name.charAt(0) : 'ع'}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 overflow-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary-dark">مرحباً {profile?.full_name || 'بك'}،</h2>
              <p className="text-xs text-foreground">تابع حجوزات بوثاتك وحالات التأكيد مباشرة من هنا.</p>
            </div>
            <Link href="/explore" className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 flex items-center gap-2 self-start sm:self-auto">
              <Store size={16} />
              <span>حجز بوث جديد</span>
            </Link>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-light-blue-bg text-primary flex items-center justify-center">
                <CalendarIcon size={24} />
              </div>
              <div>
                <p className="text-xs text-foreground mb-1">إجمالي طلبات الحجز</p>
                <p className="text-2xl font-bold text-primary-dark">{totalBookings}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <Store size={24} />
              </div>
              <div>
                <p className="text-xs text-foreground mb-1">حجوزات مؤكدة</p>
                <p className="text-2xl font-bold text-primary-dark">{confirmedBookings}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-xs text-foreground mb-1">قيد المراجعة</p>
                <p className="text-2xl font-bold text-primary-dark">{pendingBookings}</p>
              </div>
            </div>
          </div>

          <h3 className="font-bold text-lg text-primary-dark mb-4">قائمة حجوزاتي</h3>
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            {bookings.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Store size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="font-bold text-primary-dark mb-1">لا توجد حجوزات مسجلة حتى الآن</p>
                <p className="text-xs text-foreground mb-4">استكشف المعارض واختر البوث الأنسب لعلامتك التجارية.</p>
                <Link href="/explore" className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-medium">
                  استكشف المعارض المتاحة
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-secondary-bg border-b border-border text-foreground">
                    <tr>
                      <th className="p-4 font-medium">الرقم المرجعي</th>
                      <th className="p-4 font-medium">اسم المعرض</th>
                      <th className="p-4 font-medium">رقم البوث</th>
                      <th className="p-4 font-medium">المبلغ الإجمالي</th>
                      <th className="p-4 font-medium">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-mono font-bold text-xs text-primary">{booking.booking_reference}</td>
                        <td className="p-4 font-medium text-primary-dark">{booking.exhibition_title}</td>
                        <td className="p-4 font-bold">{booking.booth_number}</td>
                        <td className="p-4 text-foreground">{booking.total_amount} {booking.currency}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {booking.status === 'confirmed' ? 'مؤكد' :
                             booking.status === 'pending' ? 'قيد المراجعة' : booking.status}
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
      </main>
    </div>
  );
}
