"use client"
import Link from 'next/link';
import { Mail, MessageCircle, Globe, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0b2052] text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary font-bold text-xl">B</div>
              <span className="font-bold text-xl text-white">بوث هب</span>
            </Link>
            <p className="text-blue-200 text-sm leading-relaxed mb-6">
              منصة ذكية متكاملة لإدارة المعارض وحجز البوثات. نربط المنظمين بالعرضين لتجربة رقمية سلسة.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Globe size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Mail size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <MessageCircle size={16} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">المنصة</h3>
            <ul className="flex flex-col gap-3 text-sm text-blue-200">
              <li><Link href="/explore" className="hover:text-white transition-colors">استكشف المعارض</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">كيف تعمل المنصة</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">الباقات والأسعار</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">من نحن</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">الدعم</h3>
            <ul className="flex flex-col gap-3 text-sm text-blue-200">
              <li><Link href="/faq" className="hover:text-white transition-colors">الأسئلة الشائعة</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">تواصل معنا</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">الشروط والأحكام</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">النشرة البريدية</h3>
            <p className="text-blue-200 text-sm mb-4">اشترك ليصلك جديد المعارض والفعاليات</p>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="البريد الإلكتروني" 
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-white placeholder-blue-300 focus:outline-none focus:border-white w-full"
              />
              <button className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
                اشترك الآن
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-blue-300">
          <p>جميع الحقوق محفوظة © 2026 بوث هب</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">الشروط والأحكام</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
