import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, MapPin, Calendar, Filter, ArrowLeft, Store, Sparkles } from 'lucide-react';
import { getExhibitions } from '@/app/actions/exhibitions';

export default async function Explore({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined;
  const city = typeof resolvedParams.city === 'string' ? resolvedParams.city : undefined;
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;

  const exhibitions = await getExhibitions({
    search,
    city,
    category
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-dark mb-4">استكشف المعارض</h1>
            <p className="text-foreground">اكتشف الفرص المتاحة واختر المعرض الذي يناسب نشاطك التجاري من قاعدة بيانات المنصة الحقيقية.</p>
          </div>

          {/* Search & Filters Form */}
          <form method="GET" action="/explore" className="bg-white p-4 rounded-2xl border border-border shadow-sm mb-10 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                name="search"
                defaultValue={search || ''}
                placeholder="ابحث باسم المعرض..." 
                className="w-full pl-4 pr-12 py-3 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex gap-4">
              <select 
                name="city"
                defaultValue={city || 'المدينة'}
                className="px-4 py-3 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary outline-none min-w-[120px]"
              >
                <option value="المدينة">كل المدن</option>
                <option value="الرياض">الرياض</option>
                <option value="جدة">جدة</option>
                <option value="الدمام">الدمام</option>
              </select>
              <select 
                name="category"
                defaultValue={category || 'النوع'}
                className="px-4 py-3 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary outline-none min-w-[120px]"
              >
                <option value="النوع">كل التصنيفات</option>
                <option value="تقنية">تقنية</option>
                <option value="ثقافة">ثقافة</option>
                <option value="عقارات">عقارات</option>
                <option value="أغذية">أغذية</option>
              </select>
              <button 
                type="submit" 
                className="px-6 py-3 bg-primary text-white rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                <Filter size={18} />
                <span>تصفية</span>
              </button>
            </div>
          </form>

          {/* Banner link to AI Assistant */}
          <div className="mb-10 bg-gradient-to-r from-light-blue-bg to-white p-6 rounded-2xl border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary text-white rounded-xl shadow-md">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="font-bold text-primary-dark text-base">هل تحتاج مساعدة في اختيار المعرض أو البوث المناسب؟</h3>
                <p className="text-foreground text-xs">اسأل مساعد بوث هب الذكي لتحصل على توصيات فورية مبنية على ميزانيتك ونشاطك.</p>
              </div>
            </div>
            <Link href="/ai-assistant" className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shrink-0">
              تحدث مع المساعد
            </Link>
          </div>

          {/* Results Grid */}
          {exhibitions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-border">
              <Store size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="font-bold text-lg text-primary-dark mb-2">لا توجد معارض مطابقة</h3>
              <p className="text-foreground text-sm mb-6">جرب تغيير معايير البحث أو تصفية المدن والتصنيفات.</p>
              <Link href="/explore" className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium">
                إعادة ضبط البحث
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {exhibitions.map((ex) => (
                <div key={ex.id} className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col">
                  <div className="h-44 bg-gradient-to-tr from-primary-dark to-primary relative p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="bg-white/20 text-white backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-medium">
                        {ex.category}
                      </span>
                      {ex.available_booths === 0 ? (
                        <span className="bg-coral text-white px-2.5 py-1 rounded-md text-xs font-medium">مكتمل</span>
                      ) : (
                        <span className="bg-green-600 text-white px-2.5 py-1 rounded-md text-xs font-medium">
                          {ex.available_booths ? `${ex.available_booths} بوث متاح` : 'متاح للحجز'}
                        </span>
                      )}
                    </div>
                    <div className="text-white text-xs opacity-90">
                      {ex.organization_name || 'جهة معتمدة'}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg text-primary-dark mb-3 line-clamp-2">{ex.title}</h3>
                    <div className="flex flex-col gap-2 mb-6 mt-auto">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <MapPin size={16} className="text-primary shrink-0" />
                        <span className="truncate">{ex.city} - {ex.venue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Calendar size={16} className="text-primary shrink-0" />
                        <span className="truncate">{ex.start_date} إلى {ex.end_date}</span>
                      </div>
                    </div>
                    <Link href={`/explore/${ex.id}`} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary-bg text-primary font-medium rounded-xl group-hover:bg-primary group-hover:text-white transition-colors text-sm">
                      <span>استعرض البوثات والتفاصيل</span>
                      <ArrowLeft size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
