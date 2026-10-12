import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Target, Compass, Award, Lightbulb, ShieldCheck, Zap, Eye, Building2, Store } from 'lucide-react';

export const metadata = {
  title: 'من نحن | بوث هب',
  description: 'تعرف على رؤية ورسالة وأهداف منصة بوث هب لتطوير قطاع المعارض والبوثات',
};

export default function AboutPage() {
  const goals = [
    {
      num: '01',
      title: 'تسهيل الوصول إلى المعارض',
      desc: 'توفير تجربة رقمية تساعد العارضين على استكشاف المعارض المناسبة والتعرف على تفاصيلها والمساحات المتاحة فيها.',
      icon: Target
    },
    {
      num: '02',
      title: 'تبسيط إدارة الحجوزات',
      desc: 'تقديم أدوات تساعد على تنظيم طلبات حجز البوثات ومتابعة حالاتها بطريقة واضحة.',
      icon: Compass
    },
    {
      num: '03',
      title: 'تمكين منظمي المعارض',
      desc: 'مساعدة المنظمين على عرض معارضهم وإدارة المساحات والطلبات من خلال لوحة تحكم موحدة.',
      icon: Building2
    },
    {
      num: '04',
      title: 'دعم التحول الرقمي',
      desc: 'المساهمة في تطوير الخدمات الرقمية المرتبطة بقطاع المعارض والفعاليات في المملكة العربية السعودية.',
      icon: Award
    }
  ];

  const values = [
    {
      title: 'الابتكار',
      desc: 'نسعى إلى تطوير تجربة المعارض باستخدام حلول رقمية حديثة.',
      icon: Lightbulb
    },
    {
      title: 'الوضوح',
      desc: 'نؤمن بأهمية توفير معلومات واضحة تساعد المستخدمين على اتخاذ قرارات مناسبة.',
      icon: Eye
    },
    {
      title: 'الكفاءة',
      desc: 'نعمل على تبسيط الإجراءات وتقليل الخطوات غير الضرورية.',
      icon: Zap
    },
    {
      title: 'الثقة',
      desc: 'نحرص على تقديم تجربة منظمة وواضحة تعزز الثقة بين أطراف المنصة.',
      icon: ShieldCheck
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
            <span className="inline-block text-sm font-bold text-[#0866E8] bg-[#EFF6FF] px-4 py-1.5 rounded-full border border-[#0866E8]/15 mb-3">
              من نحن؟
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-5 tracking-tight">
              <span className="bg-gradient-to-r from-[#082B78] via-[#0866E8] to-[#082B78] bg-clip-text text-transparent">
                بوث هب.. حيث تلتقي الفرص بالمساحات
              </span>
            </h1>
            <div className="space-y-4 text-[#65789A] text-base md:text-lg leading-relaxed text-right bg-white p-7 md:p-9 rounded-3xl border border-[#E2E8F0] shadow-sm">
              <p>
                بوث هب منصة رقمية سعودية تهدف إلى تطوير تجربة إدارة المعارض وحجز البوثات، من خلال توفير بيئة موحدة تربط منظمي المعارض بالعارضين وتسهّل الوصول إلى الفرص والمساحات المتاحة.
              </p>
              <p>
                جاءت فكرة بوث هب استجابة للحاجة إلى تجربة أكثر تنظيمًا ووضوحًا في قطاع المعارض، حيث نسعى إلى تبسيط رحلة المستخدم من استكشاف المعرض المناسب وحتى إدارة طلبات الحجز والمشاركة.
              </p>
              <p>
                نعمل على توظيف الحلول الرقمية والتكنولوجيا الحديثة لتسهيل الإجراءات، وتحسين الوصول إلى المعلومات، ودعم تجربة أكثر كفاءة للمنظمين والعارضين.
              </p>
            </div>
          </div>

          {/* Vision and Mission Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <div className="bg-gradient-to-br from-white to-[#EFF6FF] p-8 md:p-10 rounded-3xl border border-[#0866E8]/20 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-[#0866E8] text-white flex items-center justify-center mb-5 shadow-md shadow-[#0866E8]/20">
                <Compass size={24} />
              </div>
              <h2 className="text-2xl font-bold text-[#082B78] mb-3">
                رؤيتنا
              </h2>
              <p className="text-[#65789A] text-base leading-relaxed">
                أن تصبح بوث هب منصة رقمية رائدة في تسهيل إدارة المعارض وحجز المساحات في المملكة العربية السعودية، والمساهمة في تطوير تجربة المشاركة في قطاع المعارض والفعاليات.
              </p>
            </div>

            <div className="bg-gradient-to-br from-white to-[#FFF5F4] p-8 md:p-10 rounded-3xl border border-[#FF625B]/20 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-[#FF625B] text-white flex items-center justify-center mb-5 shadow-md shadow-[#FF625B]/20">
                <Target size={24} />
              </div>
              <h2 className="text-2xl font-bold text-[#082B78] mb-3">
                رسالتنا
              </h2>
              <p className="text-[#65789A] text-base leading-relaxed">
                تمكين منظمي المعارض والعارضين من الاستفادة من حلول رقمية ذكية تجمع المعلومات والمساحات وطلبات الحجز في منصة واحدة، بما يساهم في تبسيط الإجراءات وتحسين تجربة المستخدم.
              </p>
            </div>
          </section>

          {/* Our Goals */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8 pb-3 border-b border-[#E2E8F0]">
              <span className="w-2.5 h-8 bg-[#0866E8] rounded-full"></span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#082B78]">
                أهدافنا
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {goals.map((goal, idx) => {
                const IconComponent = goal.icon;
                return (
                  <div 
                    key={idx}
                    className="bg-white p-7 rounded-3xl border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-extrabold text-[#0866E8]/30">
                        {goal.num}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#0866E8] flex items-center justify-center">
                        <IconComponent size={20} />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-[#082B78] mb-2">
                      {goal.title}
                    </h3>
                    <p className="text-[#65789A] text-sm leading-relaxed">
                      {goal.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Our Values */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8 pb-3 border-b border-[#E2E8F0]">
              <span className="w-2.5 h-8 bg-[#FF625B] rounded-full"></span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#082B78]">
                قيمنا
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((val, idx) => {
                const IconComponent = val.icon;
                return (
                  <div 
                    key={idx}
                    className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-sm flex flex-col"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#082B78]/5 text-[#082B78] flex items-center justify-center mb-4">
                      <IconComponent size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-[#082B78] mb-2">
                      {val.title}
                    </h3>
                    <p className="text-[#65789A] text-sm leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Beneficiaries */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8 pb-3 border-b border-[#E2E8F0]">
              <span className="w-2.5 h-8 bg-[#0866E8] rounded-full"></span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#082B78]">
                الفئات المستفيدة
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-[#E2E8F0] shadow-sm flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#0866E8] flex items-center justify-center shrink-0">
                  <Store size={26} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#082B78] mb-2">العارضون</h3>
                  <p className="text-[#65789A] text-base leading-relaxed">
                    المنشآت ورواد الأعمال والعلامات التجارية الباحثون عن فرص للمشاركة في المعارض.
                  </p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-[#E2E8F0] shadow-sm flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF1F0] text-[#FF625B] flex items-center justify-center shrink-0">
                  <Building2 size={26} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#082B78] mb-2">المنظمون</h3>
                  <p className="text-[#65789A] text-base leading-relaxed">
                    الشركات والجهات المسؤولة عن تنظيم المعارض وإدارة الأجنحة والمساحات.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="text-center bg-gradient-to-br from-white to-[#F4F8FE] p-10 md:p-14 rounded-3xl border border-[#0866E8]/20 shadow-sm max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#082B78] mb-3">
              مع بوث هب، تبدأ الفرص من مساحة
            </h2>
            <p className="text-[#65789A] text-base leading-relaxed mb-8 max-w-xl mx-auto">
              نسعى إلى بناء تجربة رقمية تجعل اكتشاف المعارض وإدارة المشاركة فيها أكثر سهولة وتنظيمًا.
            </p>
            <Link 
              href="/explore"
              className="px-8 py-3.5 bg-[#0866E8] hover:bg-[#0759cc] text-white rounded-2xl font-bold text-sm shadow-md shadow-[#0866E8]/25 transition-all inline-block"
            >
              استكشف المعارض الآن
            </Link>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
