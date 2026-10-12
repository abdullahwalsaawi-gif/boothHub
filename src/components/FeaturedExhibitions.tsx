"use client"

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, Calendar, Store, Settings, UtensilsCrossed, BookOpen, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { Exhibition } from '@/app/actions/exhibitions';

interface FeaturedExhibitionsProps {
  exhibitions: Exhibition[];
}

export default function FeaturedExhibitions({ exhibitions }: FeaturedExhibitionsProps) {
  // Take top 3 exhibitions or display empty message
  const featured = exhibitions.slice(0, 3);

  // Helper to determine the best matching realistic exhibition image
  const getExhibitionImage = (ex: Exhibition, index: number) => {
    if (ex.cover_image_url && ex.cover_image_url.startsWith('http')) {
      return ex.cover_image_url;
    }
    const title = ex.title?.toLowerCase() || '';
    const cat = ex.category?.toLowerCase() || '';
    if (title.includes('تقنية') || cat.includes('تقنية')) {
      return '/images/exhibition-tech.jpg';
    }
    if (title.includes('كليجا') || cat.includes('أغذية')) {
      return '/images/exhibition-kleija.jpg';
    }
    if (title.includes('كتاب') || cat.includes('ثقافة')) {
      return '/images/exhibition-book.jpg';
    }
    // Default matching by position
    if (index === 0) return '/images/exhibition-tech.jpg';
    if (index === 1) return '/images/exhibition-kleija.jpg';
    return '/images/exhibition-book.jpg';
  };

  // Helper for category icon
  const getCategoryIcon = (category: string) => {
    if (category.includes('تقنية')) return <Settings size={13} className="text-[#086BEE]" />;
    if (category.includes('أغذية')) return <UtensilsCrossed size={13} className="text-[#086BEE]" />;
    if (category.includes('ثقافة')) return <BookOpen size={13} className="text-[#086BEE]" />;
    return <Layers size={13} className="text-[#086BEE]" />;
  };

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-white via-[#F6F9FF] to-white border-b border-[#E2E8F0]/60">
      
      {/* Decorative ambient geometric accents inspired by Booth Hub official logo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-16 right-[-6%] w-96 h-96 rounded-full bg-[#086BEE]/4 blur-3xl"></div>
        <div className="absolute bottom-16 left-[-6%] w-96 h-96 rounded-full bg-[#FF6257]/4 blur-3xl"></div>
        {/* Subtle geometric crystal / hexagonal accent */}
        <div className="absolute top-1/4 left-10 w-24 h-24 rounded-3xl border border-[#086BEE]/10 rotate-12 hidden xl:block"></div>
        <div className="absolute bottom-1/4 right-10 w-28 h-28 rounded-3xl border border-[#FF6257]/10 -rotate-12 hidden xl:block"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          
          {/* Top Decorative Element: Blue line + Blue dot + Coral line */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-8 h-[3px] bg-[#086BEE] rounded-full"></span>
            <span className="w-2 h-2 rounded-full bg-[#086BEE]"></span>
            <span className="w-8 h-[3px] bg-[#FF6257] rounded-full"></span>
          </div>

          {/* Heading: Alexandria Bold */}
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold leading-tight tracking-tight mb-3">
            <span className="text-[#082B78]">اكتشف المعارض </span>
            <span className="text-[#086BEE]">المتاحة</span>
          </h2>

          {/* Subtitle */}
          <p className="text-[#71809D] text-base sm:text-[17px] leading-relaxed">
            تصفح المعارض الحالية واختر المساحة التي تناسب نشاطك التجاري.
          </p>
        </div>

        {/* Exhibitions Cards Grid */}
        {featured.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#E2E8F0] rounded-3xl p-8 max-w-md mx-auto shadow-sm">
            <Store className="w-12 h-12 text-[#65789A] mx-auto mb-3 opacity-60" />
            <p className="text-lg font-bold text-[#082B78] mb-1">لا توجد معارض متاحة حاليًا.</p>
            <p className="text-sm text-[#71809D]">يرجى معاودة التحقق لاحقًا أو استكشاف أرشيف الفعاليات.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
            {featured.map((ex, index) => {
              const imageSrc = getExhibitionImage(ex, index);
              const available = ex.available_booths ?? 0;
              const isSoldOut = available === 0;

              return (
                <motion.div
                  key={ex.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.12 }}
                  className="bg-white border border-[#E2E8F0] rounded-[1.75rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col h-full"
                >
                  {/* Top Image Section (240px height) */}
                  <div className="relative h-[240px] w-full overflow-hidden bg-slate-100">
                    <Image
                      src={imageSrc}
                      alt={ex.title}
                      fill
                      className="object-cover object-center transform group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Gradient shade overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>

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
                  <div className="p-6 sm:p-7 flex flex-col flex-grow text-right">
                    
                    {/* Exhibition Title */}
                    <h3 className="text-xl sm:text-[22px] font-bold text-[#082B78] mb-5 tracking-tight line-clamp-1">
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
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#086BEE] text-white font-bold rounded-2xl text-sm sm:text-[15px] hover:bg-[#0759c9] hover:shadow-lg hover:shadow-[#086BEE]/25 active:translate-y-0 hover:-translate-y-0.5 transition-all duration-200 group/btn mt-auto"
                    >
                      <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0 group-hover/btn:bg-white/25 transition-colors">
                        <ArrowLeft size={14} className="transform group-hover/btn:-translate-x-0.5 transition-transform" />
                      </span>
                      <span>استعراض المخطط والتفاصيل</span>
                    </Link>

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Bottom Link: View all available exhibitions */}
        <div className="mt-14 flex items-center justify-center">
          <div className="flex items-center gap-4 w-full max-w-xl justify-center">
            <span className="h-px bg-gradient-to-l from-[#086BEE]/25 to-transparent flex-grow"></span>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 text-[#086BEE] hover:text-[#082B78] font-semibold text-base transition-colors group shrink-0"
            >
              <span>عرض جميع المعارض المتاحة</span>
              <ArrowLeft size={17} className="transform group-hover:-translate-x-1 transition-transform duration-200" />
            </Link>
            <span className="h-px bg-gradient-to-r from-[#086BEE]/25 to-transparent flex-grow"></span>
          </div>
        </div>

      </div>
    </section>
  );
}
