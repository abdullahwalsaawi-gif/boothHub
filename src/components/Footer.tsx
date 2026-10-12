"use client"

import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowLeft, ArrowUp, ChevronLeft, CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { subscribeNewsletter } from '@/app/actions/newsletter';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    setStatus('loading');
    try {
      const res = await subscribeNewsletter(email);
      if (res.success) {
        setStatus('success');
        setMessage(res.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(res.message);
      }
    } catch {
      setStatus('error');
      setMessage('حدث خطأ أثناء الاشتراك، يرجى المحاولة لاحقاً');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative text-white overflow-hidden" dir="rtl">
      {/* 1. Seamless Top Wave Divider */}
      <div className="w-full overflow-hidden leading-none pointer-events-none -mb-[1px] bg-transparent">
        <svg
          className="relative block w-full h-10 sm:h-14 lg:h-18 text-[#071B46]"
          viewBox="0 0 1440 90"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path d="M0,32L48,37.3C96,43,192,53,288,64C384,75,480,85,576,74.7C672,64,768,32,864,26.7C960,21,1056,43,1152,53.3C1248,64,1344,64,1392,64L1440,64L1440,90L1392,90C1344,90,1248,90,1152,90C1056,90,960,90,864,90C768,90,672,90,576,90C480,90,384,90,288,90C192,90,96,90,48,90L0,90Z"></path>
        </svg>
      </div>

      {/* 2. Main Footer Body with Deep Gradient & Ambient Lighting */}
      <div className="relative bg-gradient-to-b from-[#071B46] via-[#05173B] to-[#04132F] pt-12 sm:pt-16 pb-10">
        
        {/* Geometric motifs & atmospheric effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
          {/* Luminous soft glowing auras */}
          <div className="absolute top-10 right-[-6%] w-[520px] h-[520px] rounded-full bg-[#1685FF]/[0.09] blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-10 left-[-6%] w-[480px] h-[480px] rounded-full bg-[#0866E8]/[0.10] blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-[350px] h-[350px] rounded-full bg-[#FF625B]/[0.035] blur-3xl" />

          {/* Cube-inspired geometric motifs from Booth Hub brand */}
          <div className="absolute top-16 right-16 w-36 h-36 rounded-3xl border border-[#1685FF]/15 rotate-12 bg-gradient-to-br from-[#1685FF]/[0.05] to-transparent hidden md:block" />
          <div className="absolute top-44 right-32 w-20 h-20 rounded-2xl border border-[#FF625B]/15 -rotate-6 bg-gradient-to-br from-[#FF625B]/[0.04] to-transparent hidden lg:block" />
          <div className="absolute bottom-24 left-16 w-44 h-44 rounded-[2.5rem] border border-[#1685FF]/15 -rotate-12 bg-gradient-to-tr from-[#0866E8]/[0.07] to-transparent hidden md:block" />
          <div className="absolute bottom-36 left-48 w-16 h-16 rounded-xl border border-[#1685FF]/10 rotate-45 hidden lg:block" />

          {/* Faint subtle exhibition hall geometric line-art in the left corner */}
          <div className="absolute bottom-0 left-0 w-[500px] h-[320px] opacity-[0.05] mix-blend-screen pointer-events-none hidden lg:block">
            <svg viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#1685FF]">
              <rect x="50" y="160" width="140" height="180" rx="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
              <rect x="230" y="120" width="160" height="220" rx="8" stroke="currentColor" strokeWidth="2" />
              <rect x="430" y="180" width="130" height="160" rx="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="0" y1="340" x2="600" y2="340" stroke="currentColor" strokeWidth="3" />
              <circle cx="120" cy="110" r="24" stroke="currentColor" strokeWidth="2" />
              <circle cx="310" cy="70" r="30" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-7xl">
          
          {/* Main 4 Columns Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-14 items-start text-right">
            
            {/* Column 1: Booth Hub Brand Identity (Right in RTL) */}
            <div className="flex flex-col">
              <Link href="/" className="inline-block mb-5 group self-start">
                <div className="inline-flex items-center bg-white px-4 py-2.5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
                  <img
                    src="/branding/logo.png"
                    alt="بوث هب | Booth Hub"
                    className="h-9 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>

              <p className="text-[#D5E2F5] text-sm sm:text-[15px] leading-relaxed mb-6 font-normal max-w-sm">
                منصة ذكية متكاملة لإدارة المعارض وحجز البوثات، تربط المنظمين بالعارضين لتجربة رقمية سلسة.
              </p>

              {/* Interactive Social Media Icons in subtle glowing circular frames */}
              <div className="flex items-center gap-3">
                {/* WhatsApp */}
                <a
                  href="https://wa.me/966543833308"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="تواصل عبر واتساب"
                  className="w-10 h-10 rounded-full border border-[#1685FF]/30 bg-white/5 flex items-center justify-center text-[#D5E2F5] hover:text-white hover:bg-[#0866E8] hover:border-[#1685FF] hover:shadow-lg hover:shadow-[#0866E8]/35 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <MessageCircle size={18} />
                </a>

                {/* X / Twitter */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="حساب تويتر / إكس"
                  className="w-10 h-10 rounded-full border border-[#1685FF]/30 bg-white/5 flex items-center justify-center text-[#D5E2F5] hover:text-white hover:bg-[#0866E8] hover:border-[#1685FF] hover:shadow-lg hover:shadow-[#0866E8]/35 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span className="font-bold text-sm">𝕏</span>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="حساب انستغرام"
                  className="w-10 h-10 rounded-full border border-[#1685FF]/30 bg-white/5 flex items-center justify-center text-[#D5E2F5] hover:text-white hover:bg-[#FF625B] hover:border-[#FF625B] hover:shadow-lg hover:shadow-[#FF625B]/35 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* Website */}
                <a
                  href="/"
                  aria-label="الموقع الإلكتروني"
                  className="w-10 h-10 rounded-full border border-[#1685FF]/30 bg-white/5 flex items-center justify-center text-[#D5E2F5] hover:text-white hover:bg-[#0866E8] hover:border-[#1685FF] hover:shadow-lg hover:shadow-[#0866E8]/35 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Platform Links */}
            <div className="flex flex-col">
              <div className="mb-5 inline-block">
                <h3 className="text-lg font-bold text-white mb-2">المنصة</h3>
                <span className="block w-8 h-[3px] bg-[#FF625B] rounded-full"></span>
              </div>

              <ul className="flex flex-col gap-3.5 text-sm sm:text-[15px]">
                <li>
                  <Link href="/explore" className="text-[#D5E2F5] hover:text-white flex items-center gap-2 group transition-colors duration-200">
                    <ChevronLeft size={14} className="text-[#1685FF] transform group-hover:-translate-x-1 transition-transform duration-200 shrink-0" />
                    <span>استكشف المعارض</span>
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="text-[#D5E2F5] hover:text-white flex items-center gap-2 group transition-colors duration-200">
                    <ChevronLeft size={14} className="text-[#1685FF] transform group-hover:-translate-x-1 transition-transform duration-200 shrink-0" />
                    <span>كيف تعمل المنصة</span>
                  </Link>
                </li>
                <li>
                  <Link href="/ai-assistant" className="text-[#D5E2F5] hover:text-white flex items-center gap-2 group transition-colors duration-200">
                    <ChevronLeft size={14} className="text-[#1685FF] transform group-hover:-translate-x-1 transition-transform duration-200 shrink-0" />
                    <span>المساعد الذكي</span>
                  </Link>
                </li>
                <li>
                  <Link href="/#about" className="text-[#D5E2F5] hover:text-white flex items-center gap-2 group transition-colors duration-200">
                    <ChevronLeft size={14} className="text-[#1685FF] transform group-hover:-translate-x-1 transition-transform duration-200 shrink-0" />
                    <span>من نحن</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Support Links */}
            <div className="flex flex-col">
              <div className="mb-5 inline-block">
                <h3 className="text-lg font-bold text-white mb-2">الدعم</h3>
                <span className="block w-8 h-[3px] bg-[#FF625B] rounded-full"></span>
              </div>

              <ul className="flex flex-col gap-3.5 text-sm sm:text-[15px]">
                <li>
                  <Link href="/#faq" className="text-[#D5E2F5] hover:text-white flex items-center gap-2 group transition-colors duration-200">
                    <ChevronLeft size={14} className="text-[#1685FF] transform group-hover:-translate-x-1 transition-transform duration-200 shrink-0" />
                    <span>الأسئلة الشائعة</span>
                  </Link>
                </li>
                <li>
                  <Link href="/ai-assistant" className="text-[#D5E2F5] hover:text-white flex items-center gap-2 group transition-colors duration-200">
                    <ChevronLeft size={14} className="text-[#1685FF] transform group-hover:-translate-x-1 transition-transform duration-200 shrink-0" />
                    <span>تواصل معنا</span>
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-[#D5E2F5] hover:text-white flex items-center gap-2 group transition-colors duration-200">
                    <ChevronLeft size={14} className="text-[#1685FF] transform group-hover:-translate-x-1 transition-transform duration-200 shrink-0" />
                    <span>الشروط والأحكام</span>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-[#D5E2F5] hover:text-white flex items-center gap-2 group transition-colors duration-200">
                    <ChevronLeft size={14} className="text-[#1685FF] transform group-hover:-translate-x-1 transition-transform duration-200 shrink-0" />
                    <span>سياسة الخصوصية</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Newsletter Subscription */}
            <div className="flex flex-col">
              <div className="mb-5 inline-block">
                <h3 className="text-lg font-bold text-white mb-2">النشرة البريدية</h3>
                <span className="block w-8 h-[3px] bg-[#FF625B] rounded-full"></span>
              </div>

              <p className="text-[#D5E2F5] text-sm leading-relaxed mb-4 font-normal">
                اشترك ليصلك جديد المعارض والفعاليات والعروض الحصرية.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status !== 'idle') setStatus('idle');
                    }}
                    placeholder="أدخل بريدك الإلكتروني..."
                    disabled={status === 'loading'}
                    className="w-full bg-[#0B255E]/80 border border-[#1685FF]/35 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder-[#89A1CC] focus:outline-none focus:border-[#1685FF] focus:ring-2 focus:ring-[#1685FF]/25 transition-all"
                    dir="rtl"
                  />
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#89A1CC] pointer-events-none" />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0866E8] to-[#1685FF] hover:from-[#0759cc] hover:to-[#0866E8] text-white font-bold rounded-xl text-sm shadow-lg shadow-[#0866E8]/25 hover:shadow-xl hover:shadow-[#1685FF]/40 active:translate-y-0 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {status === 'loading' ? 'جاري الاشتراك...' : 'اشترك الآن'}
                </button>

                {/* Status Messages */}
                {status === 'success' && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-lg mt-1">
                    <CheckCircle2 size={15} className="shrink-0" />
                    <span>{message}</span>
                  </div>
                )}

                {status === 'error' && (
                  <div className="flex items-center gap-2 text-xs text-[#FF857F] bg-red-950/40 border border-[#FF625B]/30 p-2.5 rounded-lg mt-1">
                    <AlertCircle size={15} className="shrink-0 text-[#FF625B]" />
                    <span>{message}</span>
                  </div>
                )}
              </form>
            </div>

          </div>

          {/* Bottom Bar: Horizontal Divider, Copyright, Policy Links, and Scroll To Top */}
          <div className="border-t border-[#1685FF]/20 pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#D5E2F5] relative">
            <p className="order-2 sm:order-1 text-[#D5E2F5]">
              © 2026 بوث هب. جميع الحقوق محفوظة.
            </p>

            <div className="flex items-center gap-4 order-1 sm:order-2">
              <Link href="/privacy" className="hover:text-white transition-colors text-[#D5E2F5]">
                سياسة الخصوصية
              </Link>
              <span className="text-[#1685FF]/40">|</span>
              <Link href="/terms" className="hover:text-white transition-colors text-[#D5E2F5]">
                الشروط والأحكام
              </Link>

              {/* Smooth Scroll To Top Button */}
              <button
                onClick={scrollToTop}
                aria-label="العودة لأعلى الصفحة"
                className="w-9 h-9 rounded-full bg-[#0866E8]/25 hover:bg-[#0866E8] border border-[#1685FF]/40 text-[#D5E2F5] hover:text-white flex items-center justify-center shadow-md shadow-[#0866E8]/20 hover:shadow-[#1685FF]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ml-2 cursor-pointer"
                title="العودة لأعلى الصفحة"
              >
                <ArrowUp size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
