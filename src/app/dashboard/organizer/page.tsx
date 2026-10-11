import Link from 'next/link';
import { Home, LayoutDashboard, Store, Users, BarChart3, Bell, Settings, LogOut, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/actions/auth';
import { getExhibitions } from '@/app/actions/exhibitions';
import { getOrganizerBookings } from '@/app/actions/bookings';
import CreateExhibitionModal from '@/components/CreateExhibitionModal';
import { redirect } from 'next/navigation';

export default async function OrganizerDashboard() {
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

  const exhibitions = await getExhibitions();
  const bookings = await getOrganizerBookings();

  // Metrics
  const activeExhibitions = exhibitions.length;
  const totalBooths = exhibitions.reduce((acc, curr) => acc + (curr.total_booths || 9), 0);
  const bookedBooths = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
  const occupancyRate = totalBooths > 0 ? Math.round((bookedBooths / totalBooths) * 100) : 0;
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'pending')
    .reduce((acc, b) => acc + b.total_amount, 0);

  return (
    <div className="min-h-screen bg-secondary-bg flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-dark text-blue-100 flex-shrink-0 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10 bg-black/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary-dark font-bold text-xl">B</div>
            <span className="font-bold text-xl text-white">بوث هب</span>
          </Link>
        </div>
        
        <div className="p-6">
          <p className="text-xs font-bold text-blue-400/70 mb-4 uppercase">إدارة المنظم</p>
          <nav className="space-y-1">
            <Link href="/dashboard/organizer" className="flex items-center gap-3 px-3 py-2.5 bg-white/10 text-white rounded-lg font-medium">
              <Home size={18} />
              <span>نظرة عامة</span>
            </Link>
            <Link href="/explore" className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
              <Store size={18} />
              <span>معارض المنصة</span>
            </Link>
            <Link href="/ai-assistant" className="flex items-center gap-3 px-3 py-2.5 text-coral hover:bg-white/5 rounded-lg transition-colors font-medium">
              <Sparkles size={18} />
              <span>المساعد الذكي (Gemini)</span>
            </Link>
          </nav>

          <p className="text-xs font-bold text-blue-400/70 mb-4 mt-8 uppercase">النظام</p>
          <nav className="space-y-1">
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
              <Bell size={18} />
              <span>الإشعارات</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
              <Settings size={18} />
              <span>إعدادات الجهة</span>
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/10 bg-black/10">
          <form action={signOut}>
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 text-coral hover:bg-white/5 rounded-lg transition-colors text-right">
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
          <h1 className="font-bold text-primary-dark">لوحة تحكم منظم المعارض</h1>
          <div className="flex items-center gap-4">
            <CreateExhibitionModal />
            <div className="w-px h-6 bg-border mx-2"></div>
            <div className="text-left text-xs">
              <p className="font-bold text-primary-dark">{profile?.full_name || 'المنظم'}</p>
              <p className="text-gray-400">حساب منظم</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary-dark text-white flex items-center justify-center font-bold text-xs">
              {profile?.full_name ? profile.full_name.charAt(0) : 'م'}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 overflow-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-primary-dark">مركز إدارة المعارض والبوثات</h2>
              <p className="text-xs text-foreground">بيانات تشغيلية حية محسوبة من قاعدة بيانات النظام.</p>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-border shadow-sm">
              <p className="text-xs text-foreground mb-1">المعارض النشطة</p>
              <p className="text-3xl font-bold text-primary-dark mb-2">{activeExhibitions}</p>
              <p className="text-xs text-green-600">منشورة ومتاحة للحجز</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-border shadow-sm">
              <p className="text-xs text-foreground mb-1">إجمالي البوثات</p>
              <p className="text-3xl font-bold text-primary-dark mb-2">{totalBooths}</p>
              <p className="text-xs text-foreground">في مختلف القاعات</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-border shadow-sm">
              <p className="text-xs text-foreground mb-1">نسبة الإشغال</p>
              <p className="text-3xl font-bold text-primary-dark mb-2">{occupancyRate}%</p>
              <p className="text-xs text-primary font-medium">{bookedBooths} بوث محجوز</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-border shadow-sm">
              <p className="text-xs text-foreground mb-1">إجمالي الإيرادات المتوقعة</p>
              <p className="text-3xl font-bold text-primary-dark mb-2">{totalRevenue.toLocaleString()} <span className="text-sm font-normal">ريال</span></p>
              <p className="text-xs text-green-600">من الحجوزات النشطة</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h3 className="font-bold text-lg text-primary-dark mb-4">أحدث طلبات الحجز</h3>
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                {bookings.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <p className="text-sm font-medium text-primary-dark mb-1">لا توجد طلبات حجز حالياً</p>
                    <p className="text-xs text-gray-500">عندما يقوم العارضون بحجز بوثات ستظهر الطلبات وتفاصيلها هنا فوراً.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-secondary-bg border-b border-border text-foreground">
                        <tr>
                          <th className="p-4 font-medium">المرجع</th>
                          <th className="p-4 font-medium">اسم العارض / الجهة</th>
                          <th className="p-4 font-medium">رقم البوث</th>
                          <th className="p-4 font-medium">المبلغ</th>
                          <th className="p-4 font-medium">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-mono font-bold text-xs text-primary">{booking.booking_reference}</td>
                            <td className="p-4 font-medium text-primary-dark">{booking.organization_name || booking.contact_name}</td>
                            <td className="p-4 font-bold">{booking.booth_number}</td>
                            <td className="p-4 text-foreground">{booking.total_amount} {booking.currency}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
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

            <div>
              <h3 className="font-bold text-lg text-primary-dark mb-4">أدوات الذكاء الاصطناعي للمنظم</h3>
              <div className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-4">
                <div className="p-4 bg-light-blue-bg/70 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
                    <Sparkles size={16} className="text-coral" />
                    <span>مساعد Gemini للمنظم</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed mb-3">
                    يمكن للمساعد الذكي اقتراح صياغة احترافية لوصف معرضك وتحديد الأسعار والتجهيزات المناسبة لمساحات البوثات.
                  </p>
                  <Link 
                    href="/ai-assistant"
                    className="w-full inline-block text-center py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    فتح المساعد الذكي
                  </Link>
                </div>

                <div className="p-4 bg-secondary-bg rounded-xl border border-border">
                  <h4 className="font-bold text-xs text-primary-dark mb-1">معارضي النشطة</h4>
                  <p className="text-xs text-gray-500 mb-3">{exhibitions.length} معارض مسجلة في المنصة</p>
                  <Link 
                    href="/explore"
                    className="w-full inline-block text-center py-2 bg-white border border-border text-xs font-medium rounded-lg hover:border-primary text-primary transition-colors"
                  >
                    استعراض المعارض كما يراها الزوار
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
