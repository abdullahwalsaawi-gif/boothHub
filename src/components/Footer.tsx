"use client"

import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
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

  return (
    <footer className="relative bg-gradient-to-b from-[#091D49] to-[#0B2558] text-white pt-16 pb-10 overflow-hidden">
      
      {/* Decorative subtle ambient lights in footer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#086BEE]/[0.04] blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-[#FF6257]/[0.03] blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        
        {/* Main Footer 4 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-16 items-start">
          
          {/* Column 1: Platform Brand Identity (Rightmost in RTL) */}
          <div className="flex flex-col text-right">
            <Link href="/" className="inline-block mb-5 group">
              <img
                src="/branding/logo.png"
                alt="بوث هب | Booth Hub"
                className="h-10 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            <p className="text-[#A2B4D6] text-[15px] leading-relaxed mb-6 font-normal max-w-sm">
              منصة ذكية متكاملة لإدارة المعارض وحجز البوثات، تربط المنظمين بالعارضين لتجربة رقمية سلسة.
            </p>

            {/* Social Icons within subtle circular borders */}
            <div className="flex items-center gap-3">
              {/* WhatsApp / Chat */}
              <a
                href="https://wa.me/966543833308"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="تواصل عبر واتساب"
                className="w-9 h-9 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white/80 hover:text-white hover:bg-[#086BEE] hover:border-[#086BEE] transition-all duration-200"
              >
                <MessageCircle size={16} />
              </a>

              {/* X / Twitter */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="حساب تويتر / إكس"
                className="w-9 h-9 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white/80 hover:text-white hover:bg-[#086BEE] hover:border-[#086BEE] transition-all duration-200"
              >
                <span className="font-bold text-xs">𝕏</span>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="حساب انستغرام"
                className="w-9 h-9 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white/80 hover:text-white hover:bg-[#FF6257] hover:border-[#FF6257] transition-all duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* Website / Globe */}
              <a
                href="/"
                aria-label="الموقع الإلكتروني"
                className="w-9 h-9 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white/80 hover:text-white hover:bg-[#086BEE] hover:border-[#086BEE] transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div className="flex flex-col text-right">
            <div className="mb-5 inline-block">
              <h3 className="text-lg font-bold text-white mb-2">المنصة</h3>
              <span className="block w-6 h-[2.5px] bg-[#FF6257] rounded-full"></span>
            </div>

            <ul className="flex flex-col gap-3 text-[15px] text-[#A2B4D6]">
              <li>
                <Link href="/explore" className="hover:text-white hover:translate-x-[-3px] transition-all duration-200 inline-block">
                  استكشف المعارض
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white hover:translate-x-[-3px] transition-all duration-200 inline-block">
                  كيف تعمل المنصة
                </Link>
              </li>
              <li>
                <Link href="/ai-assistant" className="hover:text-white hover:translate-x-[-3px] transition-all duration-200 inline-block">
                  المساعد الذكي Gemini
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-white hover:translate-x-[-3px] transition-all duration-200 inline-block">
                  من نحن
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support Links */}
          <div className="flex flex-col text-right">
            <div className="mb-5 inline-block">
              <h3 className="text-lg font-bold text-white mb-2">الدعم</h3>
              <span className="block w-6 h-[2.5px] bg-[#FF6257] rounded-full"></span>
            </div>

            <ul className="flex flex-col gap-3 text-[15px] text-[#A2B4D6]">
              <li>
                <Link href="/#faq" className="hover:text-white hover:translate-x-[-3px] transition-all duration-200 inline-block">
                  الأسئلة الشائعة
                </Link>
              </li>
              <li>
                <Link href="/ai-assistant" className="hover:text-white hover:translate-x-[-3px] transition-all duration-200 inline-block">
                  تواصل معنا
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white hover:translate-x-[-3px] transition-all duration-200 inline-block">
                  الشروط والأحكام
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white hover:translate-x-[-3px] transition-all duration-200 inline-block">
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter Subscription */}
          <div className="flex flex-col text-right">
            <div className="mb-5 inline-block">
              <h3 className="text-lg font-bold text-white mb-2">النشرة البريدية</h3>
              <span className="block w-6 h-[2.5px] bg-[#FF6257] rounded-full"></span>
            </div>

            <p className="text-[#A2B4D6] text-[15px] mb-4 font-normal">
              اشترك ليصلك جديد المعارض والفعاليات.
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
                  placeholder="البريد الإلكتروني"
                  disabled={status === 'loading'}
                  className="w-full bg-[#122A63]/70 border border-white/15 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder-[#7893C4] focus:outline-none focus:border-[#086BEE] focus:ring-1 focus:ring-[#086BEE] transition-all"
                  dir="rtl"
                />
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7893C4] pointer-events-none" />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 px-4 bg-[#086BEE] text-white font-bold rounded-xl text-sm hover:bg-[#0759c9] hover:shadow-lg hover:shadow-[#086BEE]/30 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'جاري الاشتراك...' : 'اشترك الآن'}
              </button>

              {/* Status Message */}
              {status === 'success' && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-lg mt-1">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-center gap-2 text-xs text-coral bg-red-950/40 border border-[#FF6257]/30 p-2.5 rounded-lg mt-1">
                  <AlertCircle size={14} className="shrink-0 text-[#FF6257]" />
                  <span className="text-[#FFA49C]">{message}</span>
                </div>
              )}
            </form>
          </div>

        </div>

        {/* Bottom Bar: Divider & Copyright */}
        <div className="border-t border-white/10 pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#89A1CC]">
          <p className="order-2 sm:order-1">
            جميع الحقوق محفوظة © 2026 بوث هب
          </p>

          <div className="flex items-center gap-3 order-1 sm:order-2">
            <Link href="/privacy" className="hover:text-white transition-colors">
              سياسة الخصوصية
            </Link>
            <span className="text-white/20">|</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              الشروط والأحكام
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
