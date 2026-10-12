import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import { ArrowLeft, Calendar, MapPin, Store, LayoutDashboard, MousePointerClick, BarChart3, Sparkles } from "lucide-react";
import { getExhibitions } from "@/app/actions/exhibitions";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const exhibitions = await getExhibitions();
  const featuredExhibitions = exhibitions.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section & Feature Cards */}
        <HeroSection />


        {/* Available Exhibitions */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-primary-dark mb-4">اكتشف المعارض المتاحة</h2>
              <p className="text-foreground">تصفح المعارض الحالية واختر المساحة التي تناسب نشاطك التجاري.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredExhibitions.map((ex) => (
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
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-bold text-xl text-primary-dark mb-2 line-clamp-1">{ex.title}</h3>
                    <div className="flex flex-col gap-2 mb-6 mt-auto">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <MapPin size={16} className="text-primary shrink-0" />
                        <span className="truncate">{ex.city} - {ex.venue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Calendar size={16} className="text-primary shrink-0" />
                        <span className="truncate">{ex.start_date} إلى {ex.end_date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Store size={16} className="text-primary shrink-0" />
                        <span>{ex.available_booths ?? 10} بوث متاح</span>
                      </div>
                    </div>
                    <Link href={`/explore/${ex.id}`} className="w-full block text-center px-4 py-2.5 bg-secondary-bg text-primary font-medium rounded-xl group-hover:bg-primary group-hover:text-white transition-colors text-sm">
                      استعراض المخطط والتفاصيل
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/explore" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
                <span>عرض جميع المعارض المتاحة</span>
                <ArrowLeft size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 bg-secondary-bg">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-primary-dark mb-4">احجز بوثك في خطوات بسيطة</h2>
              <p className="text-foreground">رحلة سلسة من الاستكشاف إلى تأكيد الحجز.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-border -translate-y-1/2 z-0"></div>
              
              <div className="bg-white p-6 rounded-2xl border border-border relative z-10 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto bg-light-blue-bg text-primary rounded-2xl flex items-center justify-center mb-4 border border-primary/10">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="font-bold text-lg text-primary-dark mb-2">استكشف المعارض</h3>
                <p className="text-sm text-foreground">تصفح المعارض المتاحة حسب المدينة أو النشاط التجاري.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-border relative z-10 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto bg-light-blue-bg text-primary rounded-2xl flex items-center justify-center mb-4 border border-primary/10">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="font-bold text-lg text-primary-dark mb-2">اختر المعرض</h3>
                <p className="text-sm text-foreground">اطلع على تفاصيل المعرض وتجهيزاته وشروط المشاركة.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-border relative z-10 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto bg-light-blue-bg text-primary rounded-2xl flex items-center justify-center mb-4 border border-primary/10">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="font-bold text-lg text-primary-dark mb-2">حدد البوث</h3>
                <p className="text-sm text-foreground">اختر موقعك المفضل من المخطط الهندسي التفاعلي الحي.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-border relative z-10 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto bg-coral/10 text-coral rounded-2xl flex items-center justify-center mb-4 border border-coral/20">
                  <span className="text-2xl font-bold">4</span>
                </div>
                <h3 className="font-bold text-lg text-primary-dark mb-2">أكمل الحجز</h3>
                <p className="text-sm text-foreground">سجل بياناتك واستلم التأكيد الفوري ورقم الحجز المرجعي.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Beneficiaries */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-light-blue-bg to-white p-10 rounded-3xl border border-border hover:shadow-xl transition-shadow relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-primary text-white rounded-xl flex items-center justify-center mb-6 shadow-md">
                    <Store size={28} />
                  </div>
                  <h2 className="text-2xl font-bold text-primary-dark mb-4">اعثر على المساحة المناسبة لعلامتك التجارية</h2>
                  <p className="text-foreground mb-8">
                    استكشف المعارض، قارن البوثات، اختر الموقع المناسب من المخطط التفاعلي، وتابع حجوزاتك وفواتيرك بسهولة.
                  </p>
                  <Link href="/register?type=exhibitor" className="inline-flex px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors">
                    ابدأ الحجز الآن
                  </Link>
                </div>
              </div>

              <div className="bg-gradient-to-br from-coral/5 to-white p-10 rounded-3xl border border-border hover:shadow-xl transition-shadow relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-coral text-white rounded-xl flex items-center justify-center mb-6 shadow-md">
                    <LayoutDashboard size={28} />
                  </div>
                  <h2 className="text-2xl font-bold text-primary-dark mb-4">أدر معرضك من منصة واحدة</h2>
                  <p className="text-foreground mb-8">
                    أنشئ المعارض، نظّم البوثات والمخططات التفاعلية، تابع الحجوزات والمستأجرين، واطلع على تقارير الأداء الفورية.
                  </p>
                  <Link href="/register?type=organizer" className="inline-flex px-6 py-3 bg-coral text-white font-medium rounded-xl hover:bg-coral/90 transition-colors">
                    أنشئ معرضك كمنظم
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-secondary-bg">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-primary-dark mb-4">مميزات المنصة</h2>
              <p className="text-foreground">أدوات متكاملة تجعل إدارة المعارض وحجزها أسهل من أي وقت مضى.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-border flex items-start gap-4 hover:-translate-y-1 hover:shadow-lg transition-all">
                <div className="p-3 bg-light-blue-bg text-primary rounded-xl shrink-0">
                  <LayoutDashboard size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-primary-dark mb-2">إدارة المعارض من مكان واحد</h3>
                  <p className="text-sm text-foreground leading-relaxed">لوحة تحكم متكاملة للمنظمين تتيح إضافة تفاصيل المعرض، الأوقات، وسياسات الحجز بسهولة.</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-border flex items-start gap-4 hover:-translate-y-1 hover:shadow-lg transition-all">
                <div className="p-3 bg-coral/10 text-coral rounded-xl shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-primary-dark mb-2">مخططات تفاعلية للبوثات</h3>
                  <p className="text-sm text-foreground leading-relaxed">استعراض حي لقاعة المعرض، اختيار البوث بالنقر، ومعرفة حالات التوفر فوراً دون جداول معقدة.</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-border flex items-start gap-4 hover:-translate-y-1 hover:shadow-lg transition-all">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl shrink-0">
                  <MousePointerClick size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-primary-dark mb-2">تجربة حجز رقمية سلسة</h3>
                  <p className="text-sm text-foreground leading-relaxed">مسار حجز واضح يبدأ من اختيار البوث وينتهي بتأكيد الحجز الذري دون ازدواجية.</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-border flex items-start gap-4 hover:-translate-y-1 hover:shadow-lg transition-all">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-primary-dark mb-2">تقارير وقرارات مبنية على البيانات</h3>
                  <p className="text-sm text-foreground leading-relaxed">إحصائيات دقيقة لنسب الإشغال، الإيرادات، والمساعد الذكي المدعوم بـ Gemini لتقديم التوصيات.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-br from-primary to-primary-dark text-white relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">جاهز تبدأ تجربتك مع بوث هب؟</h2>
            <p className="text-blue-100 text-lg mb-10">
              سواء كنت منظمًا أو عارضًا، نوفر لك الأدوات المناسبة لإدارة تجربتك بسهولة.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/explore" className="w-full sm:w-auto px-8 py-3.5 bg-white text-primary-dark rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-lg">
                استكشف المعارض
              </Link>
              <Link href="/register" className="w-full sm:w-auto px-8 py-3.5 bg-primary-dark text-white border border-white/20 rounded-xl font-bold hover:bg-white/10 transition-colors">
                إنشاء حساب جديد
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
