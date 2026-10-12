import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'سياسة الخصوصية | بوث هب',
  description: 'سياسة الخصوصية وحماية البيانات الشخصية في منصة بوث هب',
};

export default function PrivacyPage() {
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
              <Shield size={28} />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#082B78] mb-4">
              سياسة الخصوصية
            </h1>
            <p className="text-xs sm:text-sm text-[#FF625B] bg-[#FFF1F0] border border-[#FF625B]/20 py-2 px-4 rounded-full inline-flex items-center gap-2 font-medium">
              <AlertTriangle size={15} />
              <span>[مسودة استرشادية تتطلب استكمال البيانات النظامية والاعتماد القانوني النهائي قبل النشر الرسمي]</span>
            </p>
          </div>

          {/* Privacy Document Body */}
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-10 text-[#082B78] leading-relaxed">
            
            {/* Introduction */}
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0]">
              <p className="text-base font-medium text-[#082B78]">
                نولي في منصة بوث هب أهمية كبيرة لخصوصية مستخدمينا وحماية بياناتهم الشخصية. وتهدف هذه السياسة إلى توضيح طبيعة البيانات التي قد نجمعها عند استخدام المنصة، وأغراض معالجتها، والجهات التي قد تُشارك معها، والحقوق المتاحة لأصحاب البيانات، وذلك بما يتوافق مع نظام حماية البيانات الشخصية المعمول به في المملكة العربية السعودية ولوائحه التنفيذية.
              </p>
            </div>

            {/* Section 1 */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                1. نطاق تطبيق سياسة الخصوصية
              </h2>
              <p className="text-[#65789A] text-sm leading-relaxed">
                تنطبق هذه السياسة على كافة المستخدمين والزوار لمنصة بوث هب الإلكترونية وتطبيقاتها وخدماتها الرقمية، سواء كانوا عارضين، منظمي معارض، أو زواراً مستكشفين للمنصة.
              </p>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                2. هوية الجهة المسؤولة عن معالجة البيانات
              </h2>
              <p className="text-[#65789A] text-sm leading-relaxed">
                الجهة المسؤولة عن تشغيل المنصة ومعالجة البيانات هي منصة بوث هب | Booth Hub <span className="text-[#FF625B] font-semibold">[يتطلب استكمال البيانات واعتمادها قبل النشر]</span>.
              </p>
            </div>

            {/* Section 3 & 4: Data Collected */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                3. البيانات الشخصية التي تجمعها المنصة فعليًا
              </h2>
              <p className="text-[#65789A] text-sm leading-relaxed mb-3">
                تجمع المنصة البيانات الضرورية لتقديم خدمات استعراض المعارض وحجز المساحات وإدارتها:
              </p>
              <ul className="list-disc list-inside text-sm text-[#65789A] space-y-1.5 pr-2">
                <li>بيانات إنشاء الحساب: الاسم الكامل، البريد الإلكتروني، رقم الهاتف، ونوع الحساب (عارض أو منظم).</li>
                <li>بيانات تسجيل الدخول: بيانات الاعتماد ورموز الجلسة المشفرة.</li>
              </ul>
            </div>

            {/* Section 5 & 6 */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                4. بيانات المنظمين والعارضين والمنشآت
              </h2>
              <ul className="list-disc list-inside text-sm text-[#65789A] space-y-1.5 pr-2">
                <li>بيانات المنشأة أو العلامة التجارية: اسم المنشأة، المجال التجاري، ومعلومات التواصل المسجلة.</li>
                <li>بيانات المعارض وطلبات الحجز: المعارض المضافة، تفاصيل البوثات، التواريخ، طلبات الحجز المرفوعة، وحالات المعالجة.</li>
              </ul>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                5. البيانات التقنية وملفات تعريف الارتباط
              </h2>
              <p className="text-[#65789A] text-sm leading-relaxed">
                قد تجمع المنصة تلقائيًا بيانات تقنية محدودة تتعلق بنوع المتصفح، نظام التشغيل، وملفات تعريف الارتباط الضرورية لتشغيل الجلسات وحفظ تفضيلات التصفح وتحسين الأداء الرقمي.
              </p>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                6. أغراض معالجة البيانات والأسس النظامية
              </h2>
              <p className="text-[#65789A] text-sm leading-relaxed mb-2">
                تُعالج البيانات الشخصية بناءً على موافقة صاحب البيانات والضرورة التشغيلية لتنفيذ خدمات المنصة، وتشمل الأغراض:
              </p>
              <ul className="list-disc list-inside text-sm text-[#65789A] space-y-1.5 pr-2">
                <li>إدارة الحسابات وتقديم خدمات حجز البوثات.</li>
                <li>تمكين منظمي المعارض من استعراض طلبات الحجز المرتبطة بمعارضهم والتواصل مع العارضين.</li>
                <li>إرسال التحديثات والإشعارات التشغيلية والنشرة البريدية (في حال الاشتراك الاختياري).</li>
              </ul>
            </div>

            {/* Section 9 & 10: Integrations */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                7. مشاركة البيانات ومزودو الخدمات السحابية
              </h2>
              <p className="text-[#65789A] text-sm leading-relaxed mb-3">
                لا نقوم ببيع أو تأجير البيانات الشخصية. تتم مشاركة البيانات فقط في الحدود اللازمة لتشغيل الخدمة:
              </p>
              <ul className="list-disc list-inside text-sm text-[#65789A] space-y-2 pr-2">
                <li>
                  <strong>منظمو المعارض:</strong> يتلقى المنظم بيانات العارض المرتبطة بطلب حجز بوث في معرضه لإتمام عملية التنسيق والتأكيد.
                </li>
                <li>
                  <strong>مقدمو الخدمات التقنية (Supabase):</strong> تُستخدم البنية التحتية السحابية لـ Supabase لاستضافة قاعدة البيانات وإدارة التوثيق بأمان.
                </li>
                <li>
                  <strong>خدمات الذكاء الاصطناعي (Gemini):</strong> عند تفاعل المستخدم مع المساعد الذكي، تُرسل نصوص الاستفسار لتحليلها وتقديم التوصيات، دون تزويد النموذج ببيانات حساسة غير مطلوبة للاستفسار.
                </li>
              </ul>
            </div>

            {/* Section 11 & 12 */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                8. الإجراءات المتبعة لحماية البيانات
              </h2>
              <p className="text-[#65789A] text-sm leading-relaxed">
                تتخذ المنصة تدابير تنظيمية وتقنية مناسبة لمنع الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف العرضي للبيانات، مع عزل بيانات المنظمين عبر سياسات أمان صارمة على مستوى قاعدة البيانات (Row-Level Security).
              </p>
            </div>

            {/* Section 13 */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                9. مدة الاحتفاظ بالبيانات
              </h2>
              <p className="text-[#65789A] text-sm leading-relaxed">
                تُحفظ البيانات طوال فترة نشاط حساب المستخدم وبالقدر اللازم لتحقيق الأغراض التي جُمعت من أجلها أو للامتثال للمتطلبات النظامية <span className="text-[#FF625B] font-semibold">[يتطلب استكمال البيانات واعتمادها قبل النشر]</span>.
              </p>
            </div>

            {/* Section 14 */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                10. حقوق أصحاب البيانات الشخصية
              </h2>
              <p className="text-[#65789A] text-sm leading-relaxed mb-2">
                وفقًا لنظام حماية البيانات الشخصية السعودي، يحق لصاحب البيانات:
              </p>
              <ul className="list-disc list-inside text-sm text-[#65789A] space-y-1.5 pr-2">
                <li>حق العلم بالمسوغ النظامي والغرض من جمع البيانات.</li>
                <li>حق الوصول إلى بياناته الشخصية وطلب نسخة منها.</li>
                <li>حق طلب تصحيح البيانات غير الدقيقة أو استكمالها.</li>
                <li>حق طلب إتلاف البيانات عند انتهاء الغرض من جمعها وفق الضوابط النظامية.</li>
              </ul>
            </div>

            {/* Section 15, 16, 17 */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0866E8] rounded-full inline-block"></span>
                11. نقل البيانات وتحديثات السياسة والتواصل
              </h2>
              <p className="text-[#65789A] text-sm leading-relaxed mb-3">
                يخضع أي نقل للبيانات خارج المملكة للضوابط والاشتراطات التي ينص عليها نظام حماية البيانات الشخصية ولائحته التنفيذية لنقل البيانات الشخصية خارج المملكة.
              </p>
              <p className="text-[#65789A] text-sm leading-relaxed mb-3">
                تحتفظ المنصة بالحق في تحديث هذه السياسة دوريًا عند الحاجة، وسيتم نشر التعديلات في هذه الصفحة.
              </p>
              <div className="bg-[#EFF6FF] p-4 rounded-xl border border-[#0866E8]/20">
                <p className="text-sm font-semibold text-[#082B78]">
                  لأي استفسارات أو لممارسة حقوقك المتعلقة ببياناتك الشخصية:
                </p>
                <p className="text-xs text-[#FF625B] mt-1 font-medium">
                  [يتطلب استكمال البيانات وقنوات التواصل واعتمادها قبل النشر]
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
