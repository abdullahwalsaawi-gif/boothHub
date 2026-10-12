import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Floorplan from '@/components/Floorplan';
import { MapPin, Calendar, Clock, Info, CheckCircle2, ArrowLeft } from 'lucide-react';
import { getExhibitionById } from '@/app/actions/exhibitions';
import { isUserExhibitionManager } from '@/app/actions/bookings';
import { createClient } from '@/lib/supabase/server';
import { getExhibitionImage } from '@/lib/utils';
import { notFound } from 'next/navigation';

export default async function ExhibitionDetails({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const exhibition = await getExhibitionById(id);

  if (!exhibition) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isOrganizer = user ? await isUserExhibitionManager(user.id, user.email, exhibition.id) : false;

  const imageSrc = getExhibitionImage(exhibition);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Hero Banner */}
      <div className="h-64 md:h-80 bg-primary-dark relative overflow-hidden">
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={exhibition.title}
            fill
            className="object-cover opacity-20"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary-dark/90 to-primary/80"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10 h-full flex flex-col justify-end pb-10">
          <div className="flex items-center gap-2 mb-3">
            <Link href="/explore" className="text-blue-200 hover:text-white text-xs flex items-center gap-1">
              <ArrowLeft size={14} className="rotate-180" />
              <span>العودة للمعارض</span>
            </Link>
            <span className="text-blue-300">•</span>
            <span className="bg-white/20 text-white backdrop-blur-md px-3 py-0.5 rounded-full text-xs font-medium w-fit">
              {exhibition.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">{exhibition.title}</h1>
          <p className="text-blue-100 max-w-2xl text-sm md:text-base leading-relaxed line-clamp-2">
            {exhibition.description}
          </p>
        </div>
      </div>

      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 md:px-6">
          
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 -mt-20 relative z-20">
            <div className="bg-white p-5 rounded-2xl border border-border shadow-md flex items-center gap-4">
              <div className="w-12 h-12 bg-light-blue-bg text-primary rounded-xl flex items-center justify-center shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-xs text-foreground mb-1">الموقع والمدينة</p>
                <p className="font-bold text-primary-dark text-sm">{exhibition.city} - {exhibition.venue}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-border shadow-md flex items-center gap-4">
              <div className="w-12 h-12 bg-light-blue-bg text-primary rounded-xl flex items-center justify-center shrink-0">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-xs text-foreground mb-1">تاريخ المعرض</p>
                <p className="font-bold text-primary-dark text-sm">{exhibition.start_date} إلى {exhibition.end_date}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-border shadow-md flex items-center gap-4">
              <div className="w-12 h-12 bg-light-blue-bg text-primary rounded-xl flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs text-foreground mb-1">أوقات العمل</p>
                <p className="font-bold text-primary-dark text-sm">04:00 م - 11:00 م</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-border shadow-md flex items-center gap-4">
              <div className="w-12 h-12 bg-light-blue-bg text-primary rounded-xl flex items-center justify-center shrink-0">
                <Info size={24} />
              </div>
              <div>
                <p className="text-xs text-foreground mb-1">الجهة المنظمة</p>
                <p className="font-bold text-primary-dark text-sm">{exhibition.organization_name || 'جهة معتمدة'}</p>
              </div>
            </div>
          </div>

          {/* Interactive Floorplan Section */}
          <div className="mb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-primary-dark mb-1">المخطط التفاعلي للبوثات</h2>
                <p className="text-foreground text-sm">اختر البوث الأخضر المتاح لبدء الحجز المباشر.</p>
              </div>
              <Link href="/ai-assistant" className="text-primary text-xs font-semibold hover:underline flex items-center gap-1.5 self-start sm:self-auto">
                <span>هل تحتاج مساعدة في اختيار البوث؟ استشر المساعد الذكي</span>
              </Link>
            </div>
            
            {/* Interactive Floorplan component */}
            <Floorplan exhibitionId={exhibition.id} isOrganizer={isOrganizer} />
          </div>

          {/* Exhibition Details and Guidelines */}
          <div className="bg-white rounded-2xl border border-border p-8 mb-12">
            <h3 className="text-xl font-bold text-primary-dark mb-4">نبذة عن المعرض</h3>
            <p className="text-foreground leading-relaxed mb-8 text-sm">
              {exhibition.description}
            </p>

            <h3 className="text-xl font-bold text-primary-dark mb-4">شروط المشاركة والتجهيزات</h3>
            <ul className="space-y-3 text-sm">
              {[
                "أن تكون الجهة المشاركة ذات نشاط رسمي متوافق مع موضوع المعرض.",
                "الالتزام بأوقات تجهيز البوثات وإخلائها المحددة من المنظم.",
                "يمنع التنازل عن البوث أو تأجيره من الباطن لأي جهة أخرى.",
                "الحفاظ على نظافة وسلامة مرافق القاعة والتجهيزات الكهربائية المسلمة."
              ].map((term, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                  <span className="text-foreground">{term}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
