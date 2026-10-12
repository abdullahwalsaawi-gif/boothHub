import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'الشروط والأحكام | بوث هب',
  description: 'الشروط والأحكام المنظمة لاستخدام منصة بوث هب لحجز وإدارة البوثات والمعارض',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <Navbar />

      <main className="flex-grow py-12 lg:py-20 relative overflow-hidden bg-gradient-to-b from-[#FFFFFF] via-[#F4F8FE] to-[#EAF3FF]">
        {/* Ambient lighting */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
          <div className="absolute top-10 right-[-5%] w-96 h-96 rounded-full bg-[#0866E8]/[0.05] blur-3xl"></div>
          <div className="absolute bottom-10 left-[-5%] w-96 h-96 rounded-full bg-[#FF625B]/[0.03] blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-4xl">
          
          {/* Header Title */}
          <div className="mb-10 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0866E8]/10 text-[#0866E8] flex items-center justify-center mb-4">
              <FileText size={28} />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#082B78] mb-4">
              الشروط والأحكام
            </h1>
            <p className="text-xs sm:text-sm text-[#FF625B] bg-[#FFF1F0] border border-[#FF625B]/20 py-2 px-4 rounded-full inline-flex items-center gap-2 font-medium">
              <AlertTriangle size={15} />
              <span>[مسودة تنظيمية استرشادية تتطلب المراجعة والاعتماد القانوني والتجاري قبل النشر الرسمي]</span>
            </p>
          </div>

          {/* Terms Document Body */}
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-10 text-[#082B78] leading-relaxed">
            
            {/* Introduction */}
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0]">
              <p className="text-base font-medium text-[#082B78]">
                مرحبًا بك في منصة بوث هب. تنظم هذه الشروط والأحكام استخدام المنصة والخدمات المتاحة من خلالها، بما في ذلك استكشاف المعارض وإنشاء الحسابات وإدارة المعارض وتقديم طلبات حجز البوثات. يرجى قراءة هذه الشروط بعناية قبل استخدام خدمات المنصة.
              </p>
            </div>

            {/* Section 1 */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                1. التعريفات والمصطلحات الأساسية
              </h2>
              <ul className="text-sm text-[#65789A] space-y-2 pr-2">
                <li><strong>المنصة:</strong> منصة بوث هب | Booth Hub المتاحة عبر الويب.</li>
                <li><strong>المنظم:</strong> المستخدم المسجل بصلاحية منظم معارض لإنشاء وإدارة المعارض وتخصيص البوثات.</li>
                <li><strong>العارض:</strong> المستخدم أو المنشأة المسجلة لاستكشاف المعارض وتقديم طلبات حجز المساحات.</li>
                <li><strong>البوث:</strong> المساحة المخصصة للعارض داخل قاعة المعرض وفق المخطط التفاعلي.</li>
                <li><strong>طلب الحجز:</strong> الطلب الرقمي المرفوع من العارض لحجز بوث محدد في معرض معلن.</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                2. نطاق الخدمات التي تقدمها بوث هب
              </h2>
              <p className="text-[#65789A] text-sm leading-relaxed">
                تعمل بوث هب كمنصة وسيطة رقمية تسهل عرض المعارض وتصفحها وربط المنظمين بالعارضين من خلال مخططات هندسية تفاعلية وإدارة طلبات الحجز. لا تعد المنصة طرفاً في عقد الإيجار أو الفعالية الفعلي إلا بالقدر الذي تحدده السياسات المعتمدة.
              </p>
            </div>

            {/* Section 3 & 4 */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                3. شروط إنشاء الحساب وحماية بيانات الدخول
              </h2>
              <ul className="list-disc list-inside text-sm text-[#65789A] space-y-1.5 pr-2">
                <li>يجب تقديم بيانات دقيقة وكاملة عند إنشاء الحساب والالتزام بتحديثها عند أي تغيير.</li>
                <li>يتحمل المستخدم كامل المسؤولية عن سرية بيانات حسابه وكلمة المرور وكافة الأنشطة التي تتم من خلاله.</li>
                <li>يمنع استخدام الحساب لأي أغراض غير مصرح بها أو انتحال شخصية أو صفة أي جهة أخرى.</li>
              </ul>
            </div>

            {/* Section 5 & 6 */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                4. التزامات العارضين والمنظمين
              </h2>
              <div className="space-y-3 text-sm text-[#65789A]">
                <p>
                  <strong>التزامات العارض:</strong> الالتزام بالنشاط التجاري المحدد، وتقديم مستندات نظامية للمشاركة عند الطلب، واحترام شروط وتعليمات كل معرض محددة من قبل المنظم.
                </p>
                <p>
                  <strong>التزامات المنظم:</strong> الالتزام بالحصول على كافة التراخيص والموافقات النظامية اللازمة لإقامة المعرض من الجهات المختصة في المملكة العربية السعودية، وتوفير معلومات صحيحة ودقيقة ومحدثة عن المعرض ومخطط البوثات.
                </p>
              </div>
            </div>

            {/* Section 7, 8, 9, 10, 11 */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                5. آلية استعراض البوثات وطلبات الحجز والقبول
              </h2>
              <ul className="list-disc list-inside text-sm text-[#65789A] space-y-1.5 pr-2">
                <li>يتم استعراض البوثات وتفاصيلها وحالات توفرها عبر المخطط التفاعلي للمنصة.</li>
                <li>يعد تقديم طلب الحجز إبداء رغبة في استئجار البوث المحدد، ويخضع للقبول أو الرفض أو التعديل من قبل منظم المعرض وفق الشروط والضوابط المعتمدة.</li>
                <li>يتحمل المنظم المسؤولية الكاملة عن صحة تفاصيل المعرض وتجهيزاته ومساحاته.</li>
              </ul>
            </div>

            {/* Section 12, 13, 14: Pricing, Payments, Refund (Clearly marked requiring commercial review) */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                6. الأسعار، والمدفوعات، وسياسة الإلغاء والاسترداد
              </h2>
              <div className="space-y-2 text-sm text-[#65789A]">
                <p className="bg-[#FFF1F0] p-4 rounded-xl border border-[#FF625B]/25 text-[#FF625B] font-medium">
                  [يتطلب مراجعة واعتماد تجاري وقانوني قبل النشر: تحديد رسوم الخدمات، نسب العمولات إن وجدت، وسائل الدفع الإلكتروني المعتمدة، وضوابط الإلغاء والاسترداد وفق الأنظمة السعودية المعمول بها].
                </p>
                <p>
                  في الوقت الراهن، يتم تحديد أسعار البوثات وإجراءات تسوية المبالغ ومطابقتها بالتنسيق المباشر بين العارض ومنظم المعرض وفق شروط كل فعالية.
                </p>
              </div>
            </div>

            {/* Section 15 */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                7. استخدام المساعد الذكي وحدود التوصيات
              </h2>
              <p className="text-[#65789A] text-sm leading-relaxed">
                يُقدم المساعد الذكي في منصة بوث هب توصيات وتحليلات استرشادية بناءً على البيانات المتاحة ونماذج الذكاء الاصطناعي. تقع على عاتق المستخدم مسؤولية التحقق النهائي من ملاءمة المعرض وموقعه وتفاصيله لنشاطه التجاري قبل اتخاذ قرارات الحجز.
              </p>
            </div>

            {/* Section 16 & 17 */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                8. حقوق الملكية الفكرية والاستخدامات المحظورة
              </h2>
              <p className="text-[#65789A] text-sm leading-relaxed mb-2">
                جميع حقوق الملكية الفكرية المرتبطة بالمنصة وشعارها وتصاميمها ومحتواها مملوكة لمنصة بوث هب. ويحظر على المستخدم:
              </p>
              <ul className="list-disc list-inside text-sm text-[#65789A] space-y-1.5 pr-2">
                <li>استخدام المنصة بأي طريقة تنتهك الأنظمة واللوائح السارية في المملكة العربية السعودية.</li>
                <li>محاولة اختراق المنصة أو تعطيل أمنها أو الوصول غير المصرح به لقواعد البيانات.</li>
                <li>نسخ أو إعادة نشر محتوى المنصة ومخططاتها دون موافقة كتابية مسبقة.</li>
              </ul>
            </div>

            {/* Section 18 & 19 */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                9. تعليق الحسابات والمسؤوليات النظامية
              </h2>
              <p className="text-[#65789A] text-sm leading-relaxed">
                تحتفظ المنصة بالحق في تعليق أو إنهاء وصول أي مستخدم ينتهك هذه الشروط والأحكام أو يثبت تقديمه لمعلومات مضللة أو أنشطة تخالف الأنظمة والتعليمات المعمول بها.
              </p>
            </div>

            {/* Section 20, 21, 22 */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                10. الأنظمة المعمول بها وتسوية النزاعات والتواصل
              </h2>
              <p className="text-[#65789A] text-sm leading-relaxed mb-3">
                تخضع هذه الشروط والأحكام وتُفسر وفقًا للأنظمة واللوائح المعمول بها في المملكة العربية السعودية، وتختص الجهات القضائية في المملكة بالنظر في أي نزاع ينشأ عنها.
              </p>
              <p className="text-[#65789A] text-sm leading-relaxed mb-3">
                تحتفظ المنصة بالحق في تعديل هذه الشروط دوريًا، ويعد استمرار استخدام المنصة بعد نشر التعديلات قبولًا صريحًا بها.
              </p>
              <div className="bg-[#EFF6FF] p-4 rounded-xl border border-[#0866E8]/20">
                <p className="text-sm font-semibold text-[#082B78]">
                  للتواصل بشأن الشروط والأحكام والاستفسارات التنظيمية:
                </p>
                <p className="text-xs text-[#FF625B] mt-1 font-medium">
                  [يتطلب استكمال البيانات وقنوات التواصل الرسمية واعتمادها قبل النشر]
                </p>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
