import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  UserCheck, 
  Search, 
  Store, 
  FileCheck2, 
  Activity, 
  PlusCircle, 
  Layers, 
  Users, 
  BarChart3, 
  Sparkles, 
  ArrowLeft 
} from 'lucide-react';

export const metadata = {
  title: 'كيف تعمل المنصة | بوث هب',
  description: 'دليل توضيحي شامل لكيفية عمل منصة بوث هب للعارضين ومنظمي المعارض',
};

export default function HowItWorksPage() {
  const exhibitorSteps = [
    {
      step: 'الخطوة الأولى',
      title: 'إنشاء الحساب',
      desc: 'ابدأ رحلتك بإنشاء حساب عارض وإدخال بياناتك الأساسية، لتتمكن من استكشاف المعارض ومتابعة طلبات الحجز من مكان واحد.',
      icon: UserCheck
    },
    {
      step: 'الخطوة الثانية',
      title: 'استكشاف المعارض',
      desc: 'تصفح المعارض المتاحة، وتعرف على مواقعها ومواعيدها وتصنيفاتها، واختر المعرض الذي يتناسب مع طبيعة نشاطك التجاري.',
      icon: Search
    },
    {
      step: 'الخطوة الثالثة',
      title: 'اختيار البوث المناسب',
      desc: 'استعرض مخطط المعرض التفاعلي، وتعرف على المساحات المتاحة ومواقع البوثات وتفاصيلها، ثم اختر المساحة المناسبة لاحتياجاتك.',
      icon: Store
    },
    {
      step: 'الخطوة الرابعة',
      title: 'تقديم طلب الحجز',
      desc: 'راجع تفاصيل البوث المختار، وأدخل البيانات المطلوبة، ثم أرسل طلب الحجز من خلال المنصة.',
      icon: FileCheck2
    },
    {
      step: 'الخطوة الخامسة',
      title: 'متابعة الطلب',
      desc: 'تابع حالة طلب الحجز من لوحة التحكم الخاصة بك، واطلع على التحديثات المرتبطة بمشاركتك في المعرض.',
      icon: Activity
    }
  ];

  const organizerSteps = [
    {
      step: 'الخطوة الأولى',
      title: 'إنشاء حساب منظم',
      desc: 'أنشئ حسابك بصفتك منظم معارض، وأدخل المعلومات الأساسية المطلوبة لإدارة معارضك من خلال المنصة.',
      icon: UserCheck
    },
    {
      step: 'الخطوة الثانية',
      title: 'إضافة المعرض',
      desc: 'أدخل اسم المعرض ووصفه وموقعه ومواعيده وتصنيفه، وأضف المعلومات التي يحتاج العارضون إلى معرفتها قبل المشاركة.',
      icon: PlusCircle
    },
    {
      step: 'الخطوة الثالثة',
      title: 'تنظيم البوثات',
      desc: 'أضف المساحات والبوثات الخاصة بالمعرض، وحدد مواقعها وأحجامها وأسعارها وحالات توفرها.',
      icon: Layers
    },
    {
      step: 'الخطوة الرابعة',
      title: 'إدارة طلبات الحجز',
      desc: 'استعرض طلبات العارضين وبياناتهم، وتابع حالات الحجز ونظّم المساحات المتاحة والمحجوزة.',
      icon: Users
    },
    {
      step: 'الخطوة الخامسة',
      title: 'متابعة الأداء',
      desc: 'استخدم لوحة التحكم للاطلاع على بيانات المعرض والحجوزات والإحصاءات المتاحة، بما يساعدك على تنظيم مشاركات العارضين.',
      icon: BarChart3
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <Navbar />

      <main className="flex-grow py-12 lg:py-20 relative overflow-hidden bg-gradient-to-b from-[#FFFFFF] via-[#F4F8FE] to-[#EAF3FF]">
        {/* Multi-layered Ambient Background Decorations matching Explore page */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
          {/* 1. Header Title Radiant Glow */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[620px] h-[340px] bg-gradient-to-tr from-[#086BEE]/15 via-[#086BEE]/10 to-[#FF6B61]/5 rounded-full blur-3xl animate-pulse-glow"></div>

          {/* 2. Top-Right Geometric circles & brand motif */}
          <div className="absolute top-16 right-[-4%] w-80 h-80 rounded-full border border-[#086BEE]/15 border-dashed animate-float-slow"></div>
          <div className="absolute top-28 right-[4%] w-48 h-48 rounded-full border border-[#086BEE]/10"></div>
          <div className="absolute top-44 right-[10%] w-3 h-3 rounded-full bg-[#086BEE]/25"></div>
          <div className="absolute top-36 right-[12%] w-2 h-2 rounded-full bg-[#FF6B61]/35"></div>

          {/* 3. Top-Left Geometric circles & subtle coral glow */}
          <div className="absolute top-20 left-[-4%] w-88 h-88 rounded-full border border-[#086BEE]/10 animate-drift-slow"></div>
          <div className="absolute top-32 left-[3%] w-60 h-60 bg-[#FF6B61]/[0.03] rounded-full blur-2xl"></div>
          <div className="absolute top-48 left-[8%] w-3.5 h-3.5 rounded-full bg-[#FF625B]/30"></div>
          <div className="absolute top-56 left-[6%] w-2 h-2 rounded-full bg-[#086BEE]/30"></div>

          {/* 4. Subtle curved contour lines (mesh depth) */}
          <svg
            className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[420px] opacity-40 -z-10"
            viewBox="0 0 1200 420"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M-100 210C150 90 400 320 650 200C900 80 1150 290 1300 180"
              stroke="#086BEE"
              strokeOpacity="0.08"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <path
              d="M-50 280C200 160 450 380 700 270C950 160 1180 340 1350 240"
              stroke="#086BEE"
              strokeOpacity="0.05"
              strokeWidth="1.2"
            />
            <path
              d="M0 140C250 260 500 50 750 170C1000 290 1200 120 1350 200"
              stroke="#FF6B61"
              strokeOpacity="0.04"
              strokeWidth="1.2"
            />
          </svg>

          {/* 5. Ambient mid-page glow */}
          <div className="absolute top-[380px] left-1/2 -translate-x-1/2 w-[850px] h-[180px] bg-[#086BEE]/[0.05] rounded-full blur-3xl"></div>

          {/* 6. Flank geometric shapes & soft glow behind lower sections */}
          <div className="absolute bottom-28 right-[-6%] w-96 h-96 rounded-[3.5rem] border border-[#086BEE]/10 rotate-12 animate-float-slow"></div>
          <div className="absolute bottom-20 right-[2%] w-72 h-72 bg-[#086BEE]/[0.05] rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-[-6%] w-96 h-96 rounded-full border border-[#086BEE]/10 border-dashed animate-drift-slow"></div>
          <div className="absolute bottom-16 left-[2%] w-80 h-80 bg-[#EAF3FF] rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[1100px] h-[360px] bg-gradient-to-t from-[#086BEE]/[0.04] to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-6xl">
          
          {/* Header Title Section */}
          <div className="mb-14 lg:mb-20 text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-[#082B78] via-[#0866E8] to-[#082B78] bg-clip-text text-transparent">
                كيف تعمل منصة بوث هب؟
              </span>
            </h1>
            <p className="text-[#65789A] text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-medium">
              منصة رقمية تجمع منظمي المعارض والعارضين في مكان واحد، لتسهيل استكشاف المعارض وإدارة المساحات وطلبات الحجز.
            </p>
          </div>

          {/* Section 1: How it works for exhibitors */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8 pb-3 border-b border-[#E2E8F0]">
              <span className="w-2.5 h-8 bg-[#0866E8] rounded-full"></span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#082B78]">
                كيف تعمل المنصة للعارض؟
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exhibitorSteps.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div 
                    key={idx}
                    className="bg-white p-7 rounded-3xl border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-xs font-bold px-3 py-1 bg-[#EFF6FF] text-[#0866E8] rounded-full border border-[#0866E8]/15">
                        {item.step}
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-[#0866E8]/10 text-[#0866E8] flex items-center justify-center">
                        <IconComponent size={22} />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-[#082B78] mb-3">
                      {item.title}
                    </h3>
                    <p className="text-[#65789A] text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 2: How it works for organizers */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8 pb-3 border-b border-[#E2E8F0]">
              <span className="w-2.5 h-8 bg-[#FF625B] rounded-full"></span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#082B78]">
                كيف تعمل المنصة للمنظم؟
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizerSteps.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div 
                    key={idx}
                    className="bg-white p-7 rounded-3xl border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-xs font-bold px-3 py-1 bg-[#FFF1F0] text-[#FF625B] rounded-full border border-[#FF625B]/20">
                        {item.step}
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-[#FF625B]/10 text-[#FF625B] flex items-center justify-center">
                        <IconComponent size={22} />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-[#082B78] mb-3">
                      {item.title}
                    </h3>
                    <p className="text-[#65789A] text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 3: Smart Assistant */}
          <section className="mb-20">
            <div className="bg-gradient-to-r from-white via-[#EFF6FF] to-[#EAF3FF] p-8 md:p-10 rounded-3xl border border-[#0866E8]/25 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#0866E8] text-white flex items-center justify-center shadow-lg shadow-[#0866E8]/30 shrink-0">
                  <Sparkles size={28} className="text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#082B78] mb-2">
                    مساعدك الذكي في رحلة اختيار المعرض
                  </h3>
                  <p className="text-[#65789A] text-sm md:text-base leading-relaxed max-w-2xl">
                    يوفر مساعد بوث هب الذكي تجربة تفاعلية تساعد المستخدمين على استكشاف المعارض والمساحات المناسبة، والإجابة عن الاستفسارات المرتبطة بالخدمات والمعلومات المتاحة داخل المنصة.
                  </p>
                </div>
              </div>

              <Link 
                href="/ai-assistant"
                className="px-7 py-3.5 bg-[#0866E8] hover:bg-[#0759cc] text-white rounded-2xl font-bold text-sm shadow-md shadow-[#0866E8]/25 hover:shadow-lg transition-all flex items-center gap-2 shrink-0 self-start md:self-auto"
              >
                <span>استشر المساعد الذكي</span>
                <ArrowLeft size={16} />
              </Link>
            </div>
          </section>

          {/* Section 4: Final CTA */}
          <section className="text-center bg-white p-10 md:p-14 rounded-3xl border border-[#E2E8F0] shadow-sm max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#082B78] mb-4">
              ابدأ رحلتك مع بوث هب
            </h2>
            <p className="text-[#65789A] text-base leading-relaxed mb-8 max-w-xl mx-auto">
              سواء كنت منظمًا تبحث عن أدوات لإدارة معرضك، أو عارضًا يبحث عن فرصة جديدة، توفر لك بوث هب تجربة رقمية تجمع خطواتك في مكان واحد.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link 
                href="/register?type=organizer"
                className="px-7 py-3.5 bg-[#0866E8] hover:bg-[#0759cc] text-white rounded-2xl font-bold text-sm shadow-md shadow-[#0866E8]/20 transition-all"
              >
                إنشاء حساب منظم
              </Link>
              <Link 
                href="/explore"
                className="px-7 py-3.5 bg-[#F4F8FE] hover:bg-[#EAF3FF] text-[#082B78] border border-[#0866E8]/20 rounded-2xl font-bold text-sm transition-all"
              >
                استكشف المعارض
              </Link>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
