import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeaturedExhibitions from "@/components/FeaturedExhibitions";
import CTASection from "@/components/CTASection";
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


        {/* Featured Exhibitions Section */}
        <FeaturedExhibitions exhibitions={exhibitions} />

        {/* How it works */}
        <section id="how-it-works" className="py-20 bg-secondary-bg">
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

        {/* Beneficiaries / About */}
        <section id="about" className="py-20 bg-white">
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

        {/* CTA Section */}
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
