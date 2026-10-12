import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { Search, MapPin, Calendar, Filter, ArrowLeft, Store, Sparkles, Settings, UtensilsCrossed, BookOpen, Layers } from 'lucide-react';
import { getExhibitions, Exhibition } from '@/app/actions/exhibitions';
import { getExhibitionImage } from '@/lib/utils';

// Helper for category icon matching the homepage
const getCategoryIcon = (category: string) => {
  if (category.includes('تقنية')) return <Settings size={13} className="text-[#086BEE]" />;
  if (category.includes('أغذية')) return <UtensilsCrossed size={13} className="text-[#086BEE]" />;
  if (category.includes('ثقافة')) return <BookOpen size={13} className="text-[#086BEE]" />;
  return <Layers size={13} className="text-[#086BEE]" />;
};

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
      
      <main className="flex-grow py-12 lg:py-16 relative overflow-hidden bg-gradient-to-b from-white via-[#F6F9FF] to-[#EEF5FF]">
        {/* Decorative ambient background accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
          <div className="absolute top-10 right-[-5%] w-96 h-96 rounded-full bg-[#086BEE]/[0.05] blur-3xl"></div>
          <div className="absolute top-1/3 left-[-5%] w-96 h-96 rounded-full bg-[#FF6257]/[0.03] blur-3xl"></div>
          <div className="absolute bottom-10 right-[15%] w-80 h-80 rounded-full bg-[#086BEE]/[0.04] blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-7xl">
          
          {/* Header Title Section */}
          <div className="mb-10 lg:mb-12 text-center max-w-3xl mx-auto">
            {/* Top decorative element from brand identity */}
            <div className="inline-flex items-center justify-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/80 border border-[#086BEE]/15 shadow-sm backdrop-blur-sm">
              <span className="w-6 h-[3px] bg-[#086BEE] rounded-full"></span>
              <span className="w-2 h-2 rounded-full bg-[#FF6257]"></span>
              <span className="text-xs font-bold text-[#082B78] tracking-wide">منصة بوث هب</span>
              <span className="w-2 h-2 rounded-full bg-[#FF6257]"></span>
              <span className="w-6 h-[3px] bg-[#086BEE] rounded-full"></span>
            </div>

            {/* Gradient Title */}
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-[#082B78] via-[#086BEE] to-[#082B78] bg-clip-text text-transparent">
                استكشف المعارض
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-[#71809D] text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-medium">
              اكتشف المعارض القادمة، واستعرض المساحات المتاحة، واختر البوث المناسب لنشاطك التجاري.
            </p>
          </div>

          {/* Search & Filters Form Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow duration-300 mb-8 max-w-5xl mx-auto">
            <form method="GET" action="/explore" className="flex flex-col md:flex-row gap-3 sm:gap-4">
              {/* Search input */}
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71809D]" size={20} />
                <input 
                  type="text" 
                  name="search"
                  defaultValue={search || ''}
                  placeholder="ابحث باسم المعرض..." 
                  className="w-full pl-4 pr-12 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl sm:rounded-2xl text-sm focus:outline-none focus:border-[#086BEE] focus:bg-white focus:ring-2 focus:ring-[#086BEE]/15 transition-all text-right font-medium text-[#082B78] placeholder:text-[#94A3B8]"
                />
              </div>

              {/* Select filters & Button */}
              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                <select 
                  name="city"
                  defaultValue={city || 'المدينة'}
                  className="px-4 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl sm:rounded-2xl text-sm focus:outline-none focus:border-[#086BEE] focus:bg-white focus:ring-2 focus:ring-[#086BEE]/15 transition-all min-w-[130px] font-semibold text-[#082B78] cursor-pointer"
                >
                  <option value="المدينة">كل المدن</option>
                  <option value="الرياض">الرياض</option>
                  <option value="جدة">جدة</option>
                  <option value="القصيم">القصيم</option>
                  <option value="الدمام">الدمام</option>
                </select>

                <select 
                  name="category"
                  defaultValue={category || 'النوع'}
                  className="px-4 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl sm:rounded-2xl text-sm focus:outline-none focus:border-[#086BEE] focus:bg-white focus:ring-2 focus:ring-[#086BEE]/15 transition-all min-w-[130px] font-semibold text-[#082B78] cursor-pointer"
                >
                  <option value="النوع">كل التصنيفات</option>
                  <option value="تقنية">تقنية</option>
                  <option value="أغذية">أغذية</option>
                  <option value="تراث وثقافة">تراث وثقافة</option>
                  <option value="ثقافة">ثقافة وكتب</option>
                  <option value="عقارات">عقارات</option>
                </select>

                <button 
                  type="submit" 
                  className="px-8 py-3.5 bg-[#086BEE] hover:bg-[#0759c9] text-white rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 font-bold text-sm shadow-md shadow-[#086BEE]/25 hover:shadow-lg hover:shadow-[#086BEE]/35 active:scale-[0.98] shrink-0"
                >
                  <Filter size={18} />
                  <span>تصفية</span>
                </button>
              </div>
            </form>
          </div>

          {/* AI Assistant Banner Card */}
          <div className="mb-12 max-w-5xl mx-auto bg-gradient-to-r from-[#EDF5FF] via-[#F4F9FF] to-[#EBF3FF] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#086BEE]/25 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-4 text-right">
              <div className="w-12 h-12 rounded-2xl bg-[#086BEE] text-white flex items-center justify-center shadow-md shadow-[#086BEE]/25 shrink-0">
                <Sparkles size={22} className="text-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-[#082B78] text-base sm:text-lg mb-1">
                  تحتاج مساعدة في اختيار المعرض المناسب؟
                </h3>
                <p className="text-[#71809D] text-xs sm:text-sm font-medium leading-relaxed">
                  يساعدك مساعد بوث هب الذكي في اكتشاف المعارض والمساحات التي تناسب نشاطك التجاري.
                </p>
              </div>
            </div>

            <Link 
              href="/ai-assistant" 
              className="px-6 py-3 bg-[#086BEE] hover:bg-[#0759c9] text-white rounded-xl sm:rounded-2xl text-sm font-bold shadow-md shadow-[#086BEE]/20 hover:shadow-lg hover:shadow-[#086BEE]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2.5 shrink-0 group"
            >
              <Sparkles size={16} className="text-[#FF6257] group-hover:rotate-12 transition-transform" />
              <span>تحدث مع المساعد</span>
            </Link>
          </div>

          {/* Results Grid - 3 cards in one row on large screens */}
          {exhibitions.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-[#E2E8F0] shadow-sm max-w-lg mx-auto">
              <Store size={48} className="mx-auto text-[#71809D] mb-4 opacity-50" />
              <h3 className="font-bold text-xl text-[#082B78] mb-2">لا توجد معارض مطابقة</h3>
              <p className="text-[#71809D] text-sm mb-6">جرب تغيير معايير البحث أو اختيار مدينة وتصنيف مختلفين.</p>
              <Link href="/explore" className="px-6 py-3 bg-[#086BEE] text-white rounded-xl text-sm font-bold shadow-sm inline-block">
                إعادة ضبط البحث
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {exhibitions.map((ex, index) => {
                const imageSrc = getExhibitionImage(ex, index);
                const available = ex.available_booths ?? 0;
                const isSoldOut = available === 0;

                return (
                  <div 
                    key={ex.id} 
                    className="bg-white border border-[#E2E8F0] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#086BEE]/10 hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full text-right"
                  >
                    {/* Top Image Section (250px height) */}
                    <div className="relative h-[250px] w-full overflow-hidden bg-slate-100">
                      <Image
                        src={imageSrc}
                        alt={ex.title}
                        fill
                        className="object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />

                      {/* Gradient shade overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent pointer-events-none"></div>

                      {/* Top Right Badge (RTL): Category */}
                      <div className="absolute top-4 right-4 z-10">
                        <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-[#082B78] border border-white/70 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md shadow-black/5">
                          {getCategoryIcon(ex.category)}
                          <span>{ex.category}</span>
                        </span>
                      </div>

                      {/* Top Left Badge (RTL): Available Booths */}
                      <div className="absolute top-4 left-4 z-10">
                        {isSoldOut ? (
                          <span className="inline-flex items-center gap-1.5 bg-[#FF6257] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md shadow-[#FF6257]/30">
                            <span>مكتمل الحجز</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-[#10B981] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md shadow-[#10B981]/30">
                            <Store size={13} className="shrink-0" />
                            <span>{available} بوث متاح</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content Details */}
                    <div className="p-6 sm:p-7 flex flex-col flex-grow">
                      
                      {/* Exhibition Title */}
                      <h3 className="text-xl sm:text-[22px] font-bold text-[#082B78] mb-5 tracking-tight group-hover:text-[#086BEE] transition-colors line-clamp-1">
                        {ex.title}
                      </h3>

                      {/* Key Attributes */}
                      <div className="space-y-3 mb-6 mt-auto">
                        
                        {/* Location */}
                        <div className="flex items-center gap-2.5 text-sm text-[#71809D]">
                          <MapPin size={17} className="text-[#086BEE] shrink-0" />
                          <span className="truncate font-medium">{ex.city} - {ex.venue}</span>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center gap-2.5 text-sm text-[#71809D]">
                          <Calendar size={17} className="text-[#086BEE] shrink-0" />
                          <span className="truncate font-medium">{ex.start_date} إلى {ex.end_date}</span>
                        </div>

                        {/* Booths Count */}
                        <div className="flex items-center gap-2.5 text-sm text-[#71809D]">
                          <Store size={17} className="text-[#086BEE] shrink-0" />
                          <span className="font-medium">
                            {isSoldOut ? 'مكتمل الحجز' : `${available} بوث متاح`}
                          </span>
                        </div>
                      </div>

                      {/* Action Button: Explore Floorplan & Details */}
                      <Link
                        href={`/explore/${ex.id}`}
                        className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#086BEE] text-white font-bold rounded-2xl text-sm sm:text-base hover:bg-[#0759c9] hover:shadow-lg hover:shadow-[#086BEE]/30 active:translate-y-0 hover:-translate-y-0.5 transition-all duration-200 group/btn mt-auto"
                      >
                        <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0 group-hover/btn:bg-white/25 transition-colors">
                          <ArrowLeft size={14} className="transform group-hover/btn:-translate-x-0.5 transition-transform" />
                        </span>
                        <span>استعراض المخطط والتفاصيل</span>
                      </Link>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
