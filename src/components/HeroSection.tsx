"use client"
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Sparkles, Users, Settings, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#F6F9FF] to-[#EEF5FF] pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#E2E8F0]/70">
      
      {/* Decorative ambient background accents - clean and uncluttered */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-10 right-[-4%] w-80 h-80 rounded-full bg-[#086BEE]/5 blur-3xl"></div>
        <div className="absolute bottom-12 left-[-4%] w-96 h-96 rounded-full bg-[#FF6257]/5 blur-3xl"></div>
        {/* Subtle geometric grid / dots overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#086BEE_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        
        {/* 
          Hero Layout:
          Desktop: 47% Text on the RIGHT, 53% Image on the LEFT.
          Mobile: Texts on top, Image below.
          In RTL (dir="rtl"):
          flex-col (mobile) renders Child 1 (Text) on top, Child 2 (Image) below.
          lg:flex-row (desktop) renders Child 1 (Text) on the RIGHT, Child 2 (Image) on the LEFT.
        */}
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          
          {/* RIGHT SIDE (in RTL): Typography & Buttons (47% width on Desktop) */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-[47%] text-right flex flex-col items-start"
          >
            
            {/* Small Top Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2.5 bg-[#F4F8FF] border border-[#086BEE]/20 px-4 py-1.5 rounded-full text-xs sm:text-[13px] font-bold text-[#086BEE] mb-5 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#086BEE] animate-pulse shrink-0"></span>
              <span>المنصة الذكية لإدارة وحجز بوثات المعارض في المملكة</span>
            </motion.div>

            {/* Main Heading: Alexandria Bold */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-[1.25] mb-5 tracking-tight"
            >
              <span className="text-[#082B78] block">مساحتك في</span>
              <span className="text-[#082B78] block">المعرض القادم</span>
              <span className="text-[#086BEE] block">تبدأ من هنا</span>
            </motion.h1>

            {/* Description Paragraph */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-[15px] sm:text-[16px] md:text-[17px] text-[#65789A] leading-[1.8] max-w-xl mb-8 font-normal"
            >
              اكتشف المعارض القادمة، استعرض البوثات المتاحة، واحجز مساحتك بسهولة مع توصيات ذكية مدعومة بنماذج Gemini.
            </motion.p>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
            >
              
              {/* Primary Button: Explore Exhibitions */}
              <Link 
                href="/explore" 
                className="group px-7 py-3.5 sm:px-8 sm:py-4 bg-[#086BEE] text-white rounded-2xl font-bold text-[15px] hover:bg-[#0759c9] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-lg shadow-[#086BEE]/25 flex items-center justify-center gap-3"
              >
                <span>استكشف المعارض</span>
                <ArrowLeft size={18} className="transform group-hover:-translate-x-1 transition-transform duration-200" />
              </Link>

              {/* Secondary Button: Smart AI Assistant */}
              <Link 
                href="/ai-assistant" 
                className="px-6 py-3.5 sm:px-7 sm:py-4 bg-white text-[#082B78] border border-[#086BEE]/40 rounded-2xl font-bold text-[15px] hover:border-[#086BEE] hover:bg-[#F4F8FF] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm flex items-center justify-center gap-2.5"
              >
                <Sparkles size={18} className="text-[#FF6257] shrink-0" />
                <span>المساعد الذكي</span>
              </Link>
            </motion.div>

          </motion.div>

          {/* LEFT SIDE (in RTL): Branded Exhibition Photography (53% width on Desktop) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-[53%] relative flex justify-center items-center"
          >
            {/* Background geometric accents behind image */}
            <div className="absolute -top-4 -left-4 w-28 h-28 rounded-3xl bg-gradient-to-tr from-[#086BEE]/15 to-[#082B78]/10 rotate-6 -z-10 hidden sm:block"></div>
            <div className="absolute -bottom-5 -right-4 w-32 h-32 rounded-3xl bg-gradient-to-br from-[#FF6257]/15 to-[#FF8A80]/10 -rotate-6 -z-10 hidden sm:block"></div>
            <div className="absolute top-1/3 -right-6 w-12 h-12 rounded-2xl border-2 border-[#086BEE]/20 rotate-45 -z-10 hidden lg:block"></div>
            <div className="absolute bottom-6 left-6 w-5 h-5 rounded-full bg-[#FF6257]/30 -z-10"></div>

            {/* Image Card Container */}
            <div className="relative w-full overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-[#082B78]/10 border border-white/90 bg-white">
              
              <div className="relative aspect-[4/3] w-full">
                <Image 
                  src="/hero-exhibition.jpg" 
                  alt="قاعة معارض سعودية حديثة بهوية بوث هب - Booth Hub"
                  fill
                  priority
                  className="object-cover object-center transform hover:scale-[1.02] transition-transform duration-700 ease-out"
                  sizes="(max-width: 1024px) 100vw, 53vw"
                />
                
                {/* Soft natural edge lighting */}
                <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] ring-1 ring-inset ring-black/5 pointer-events-none"></div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Feature Cards Section: 3 equal horizontal cards directly below Hero (Preserved) */}
        <div className="mt-16 lg:mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Card 1: Seamless Experience */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="bg-white rounded-2xl p-6 lg:p-7 border border-[#E2E8F0] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col text-right group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F4F8FF] text-[#086BEE] flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-[#086BEE] group-hover:text-white transition-all duration-300">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#082B78] mb-2">
                تجربة سلسة للمستخدم
              </h3>
              <p className="text-sm text-[#65789A] leading-relaxed mt-auto">
                تواصل، احجز، ووسع فرصك في عالم المعارض.
              </p>
            </motion.div>

            {/* Card 2: Integrated Management */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="bg-white rounded-2xl p-6 lg:p-7 border border-[#E2E8F0] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col text-right group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F4F8FF] text-[#086BEE] flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-[#086BEE] group-hover:text-white transition-all duration-300">
                <Settings size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#082B78] mb-2">
                إدارة احترافية ومتكاملة
              </h3>
              <p className="text-sm text-[#65789A] leading-relaxed mt-auto">
                أدوات قوية للمنظم لإدارة المعارض والمخططات والحجوزات.
              </p>
            </motion.div>

            {/* Card 3: All Exhibitions in One Place */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="bg-white rounded-2xl p-6 lg:p-7 border border-[#E2E8F0] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col text-right group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F4F8FF] text-[#086BEE] flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-[#086BEE] group-hover:text-white transition-all duration-300">
                <Calendar size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#082B78] mb-2">
                جميع المعارض في مكان واحد
              </h3>
              <p className="text-sm text-[#65789A] leading-relaxed mt-auto">
                ابحث في مختلف الفئات والمناطق واعثر على مساحتك بسهولة.
              </p>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}
