"use client"

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <section className="relative py-24 lg:py-28 text-white overflow-hidden bg-gradient-to-b from-[#086BEE] via-[#0755C5] to-[#091D49]">
      
      {/* Decorative ambient geometric accents inspired by Booth Hub official logo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
        
        {/* Soft Radial Gradient Lighting in center behind texts */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[90%] bg-[radial-gradient(ellipse_at_center,rgba(8,107,238,0.35)_0%,rgba(7,85,197,0.15)_50%,transparent_75%)]"></div>

        {/* Top-Right Geometric Polygonal Accent (Booth Hub faceted crystal) */}
        <div className="absolute -top-12 -right-12 w-80 h-80 rounded-[3rem] bg-white/[0.06] rotate-12 blur-[1px]"></div>
        <div className="absolute top-8 right-16 w-56 h-56 rounded-[2.5rem] border border-white/[0.12] rotate-45 hidden md:block"></div>
        <div className="absolute top-28 right-40 w-36 h-36 rounded-2xl bg-gradient-to-br from-white/[0.08] to-transparent -rotate-12 hidden lg:block"></div>

        {/* Top-Left Subtle Coral Accent */}
        <div className="absolute top-1/4 left-10 w-44 h-44 rounded-full bg-[#FF6257]/[0.08] blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-96 h-96 rounded-[3.5rem] bg-white/[0.05] -rotate-12 blur-[1px]"></div>
        <div className="absolute bottom-12 left-16 w-60 h-60 rounded-[2.5rem] border border-white/[0.10] rotate-12 hidden md:block"></div>

        {/* Subtle geometric lines and rings across the background */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] stroke-white" xmlns="http://www.w3.org/2000/svg" fill="none">
          <circle cx="15%" cy="30%" r="160" strokeWidth="1.5" strokeDasharray="4 6" />
          <circle cx="85%" cy="70%" r="200" strokeWidth="1.5" strokeDasharray="6 8" />
          <line x1="0" y1="20%" x2="100%" y2="40%" strokeWidth="1" strokeDasharray="10 15" />
          <line x1="0" y1="80%" x2="100%" y2="60%" strokeWidth="1" strokeDasharray="8 12" />
        </svg>

        {/* Light beam / glow accent */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10 text-center max-w-3xl">
        
        {/* Top Decorative Indicator: Blue line + Dot + Coral line */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <span className="w-8 h-[3px] bg-white/70 rounded-full"></span>
          <span className="w-2 h-2 rounded-full bg-white"></span>
          <span className="w-8 h-[3px] bg-[#FF6257] rounded-full"></span>
        </motion.div>

        {/* Heading: Alexandria Bold, 44px on desktop */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-[44px] font-bold leading-tight tracking-tight mb-5 drop-shadow-sm"
        >
          <span>جاهز تبدأ تجربتك مع </span>
          <span className="text-[#FF6257]">بوث هب</span>
          <span>؟</span>
        </motion.h2>

        {/* Description */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white/90 text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto font-normal"
        >
          سواء كنت منظمًا أو عارضًا، نوفر لك الأدوات المناسبة لإدارة تجربتك بسهولة.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5"
        >
          {/* Button 1: Explore Exhibitions (White bg, Dark Navy text, RTL arrow) */}
          <Link 
            href="/explore" 
            className="w-full sm:w-auto min-w-[210px] px-8 py-4 bg-white text-[#082B78] rounded-2xl font-bold text-[15px] sm:text-base hover:bg-white/95 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-xl shadow-black/10 flex items-center justify-center gap-3 group"
          >
            <span>استكشف المعارض</span>
            <ArrowLeft size={18} className="transform group-hover:-translate-x-1 transition-transform duration-200" />
          </Link>

          {/* Button 2: Register New Account (Coral #FF6257 bg, White text) */}
          <Link 
            href="/register" 
            className="w-full sm:w-auto min-w-[210px] px-8 py-4 bg-[#FF6257] text-white rounded-2xl font-bold text-[15px] sm:text-base hover:bg-[#FF6257]/90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-xl shadow-[#FF6257]/25 flex items-center justify-center gap-3 group"
          >
            <span>إنشاء حساب جديد</span>
            <ArrowLeft size={18} className="transform group-hover:-translate-x-1 transition-transform duration-200" />
          </Link>
        </motion.div>

      </div>

      {/* Seamless transition element into the dark navy Footer #091D49 */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-b from-transparent to-[#091D49] pointer-events-none"></div>
    </section>
  );
}
