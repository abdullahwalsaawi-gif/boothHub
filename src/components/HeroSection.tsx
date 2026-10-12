"use client"
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Sparkles, Users, Settings, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#F4F8FF] to-white pt-10 pb-16 lg:pt-14 lg:pb-24 border-b border-[#E2E8F0]/60">
      
      {/* Decorative ambient background accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-12 right-[-5%] w-80 h-80 rounded-full bg-[#086BEE]/5 blur-3xl"></div>
        <div className="absolute bottom-10 left-[-5%] w-96 h-96 rounded-full bg-[#FF6257]/5 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        
        {/* Main Hero Grid: 47% Text (Right) vs 53% Image (Left) */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-14">
          
          {/* Left Side: Exhibition Image (53% width on Desktop) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-[53%] relative flex justify-center items-center"
          >
            {/* Geometric accents around the image */}
            <div className="absolute -top-4 -right-4 w-28 h-28 rounded-3xl bg-gradient-to-tr from-[#086BEE] to-[#082B78] opacity-15 rotate-12 -z-10 hidden sm:block"></div>
            <div className="absolute -bottom-5 -left-4 w-32 h-32 rounded-3xl bg-gradient-to-br from-[#FF6257] to-[#FF8A80] opacity-20 -rotate-12 -z-10 hidden sm:block"></div>
            <div className="absolute top-1/2 -left-6 w-12 h-12 rounded-2xl border-4 border-[#086BEE]/30 rotate-45 -z-10 hidden lg:block"></div>
            <div className="absolute bottom-8 right-8 w-6 h-6 rounded-full bg-[#FF6257]/40 -z-10"></div>

            {/* Main Image Container */}
            <div className="relative w-full overflow-hidden rounded-[2.5rem] shadow-2xl shadow-[#082B78]/12 border border-white/80 bg-white">
              
              {/* Soft geometric cutting & subtle gradient overlay at the right edge where image meets text */}
              <div className="relative aspect-[4/3] w-full">
                <Image 
                  src="/hero-exhibition.jpg" 
                  alt="معرض أعمال سعودي حديث - بوث هب"
                  fill
                  priority
                  className="object-cover object-center transform hover:scale-[1.02] transition-transform duration-700 ease-out"
                  sizes="(max-width: 1024px) 100vw, 53vw"
                />
                
                {/* Gentle gradient blend towards the right text edge */}
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white/20 to-transparent pointer-events-none hidden lg:block"></div>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Typography & Buttons (47% width on Desktop) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-[47%] text-right flex flex-col items-start lg:items-start"
          >
            
            {/* Top Small Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-[#F4F8FF] border border-[#086BEE]/20 px-4 py-1.5 rounded-full text-xs font-bold text-[#086BEE] mb-6 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#086BEE] animate-pulse"></span>
              <span>المنصة الذكية لإدارة وحجز بوثات المعارض في المملكة</span>
            </motion.div>

            {/* Main Heading: Alexandria Bold */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.25] text-[#082B78] mb-6 tracking-tight">
              <span>مساحتك في</span>
              <br />
              <span>المعرض القادم</span>
              <br />
              <span className="text-[#086BEE]">تبدأ من هنا</span>
            </h1>

            {/* Description Paragraph */}
            <p className="text-[16px] sm:text-[17px] text-[#65789A] leading-[1.8] max-w-xl mb-8">
              اكتشف المعارض القادمة، استعرض البوثات المتاحة، واحجز مساحتك بسهولة مع توصيات ذكية مدعومة بنماذج Gemini.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              
              {/* Button 1: Explore Exhibitions (Bright Blue, White Text with RTL Arrow) */}
              <Link 
                href="/explore" 
                className="group px-8 py-4 bg-[#086BEE] text-white rounded-2xl font-bold text-[15px] hover:bg-[#086BEE]/90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-250 shadow-lg shadow-[#086BEE]/25 flex items-center justify-center gap-3"
              >
                <span>استكشف المعارض</span>
                <ArrowLeft size={18} className="transform group-hover:-translate-x-1 transition-transform duration-250" />
              </Link>

              {/* Button 2: Smart AI Assistant (White, Thin Blue Border, Navy Text with Coral Icon) */}
              <Link 
                href="/ai-assistant" 
                className="px-7 py-4 bg-white text-[#082B78] border border-[#086BEE]/50 rounded-2xl font-bold text-[15px] hover:border-[#086BEE] hover:bg-[#F4F8FF] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-250 shadow-sm flex items-center justify-center gap-2.5"
              >
                <Sparkles size={18} className="text-[#FF6257] shrink-0" />
                <span>المساعد الذكي</span>
              </Link>
            </div>

          </motion.div>

        </div>

        {/* Feature Cards Section: 3 equal horizontal cards directly below Hero */}
        <div className="mt-16 lg:mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Card 1 - Right Side: Seamless Experience */}
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

            {/* Card 2 - Center: Integrated Management */}
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

            {/* Card 3 - Left Side: All Exhibitions in One Place */}
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
                استكشف المعارض واحجز البوثات بسهولة ومن أي مكان.
              </p>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}
