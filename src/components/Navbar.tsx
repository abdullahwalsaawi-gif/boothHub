"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Bell, User, LogOut, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/actions/auth';

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const navLinks = [
    { href: '/', label: 'الرئيسية', isActive: pathname === '/' },
    { href: '/explore', label: 'استكشاف المعارض', isActive: pathname === '/explore' || pathname.startsWith('/explore/') },
    { href: '/how-it-works', label: 'كيف تعمل المنصة؟', isActive: pathname === '/how-it-works' || pathname.startsWith('/how-it-works/') },
    { href: '/about', label: 'من نحن', isActive: pathname === '/about' || pathname.startsWith('/about/') },
  ];

  useEffect(() => {
    const supabase = createClient();
    
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          setProfile(profile);
        }
      } catch (e) {
        console.error('Error fetching user:', e);
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const dashboardUrl = (profile?.account_type === 'organizer' || user?.user_metadata?.account_type === 'organizer') 
    ? '/dashboard/organizer' 
    : '/dashboard/exhibitor';

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E2E8F0]/80 shadow-[0_2px_10px_rgba(8,43,120,0.03)]">
      <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        
        {/* Right side (RTL): Booth Hub Official Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center group py-1" aria-label="بوث هب | Booth Hub">
            <img 
              src="/branding/logo.png?v=3" 
              alt="بوث هب | Booth Hub" 
              className="h-10 sm:h-11 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.isActive ? 'page' : undefined}
              className={`relative py-2 transition-colors ${
                link.isActive
                  ? 'text-[#082B78] font-bold'
                  : 'text-[#65789A] hover:text-[#086BEE] font-medium'
              }`}
            >
              {link.label}
              {link.isActive && (
                <span className="absolute bottom-0 right-0 left-0 h-[2.5px] bg-[#FF6257] rounded-full"></span>
              )}
            </Link>
          ))}
        </nav>

        {/* Left side (RTL): Auth / Profile & Notifications */}
        <div className="hidden md:flex items-center gap-3.5">
          {!loading && user ? (
            <>
              <button 
                className="w-10 h-10 flex items-center justify-center text-[#65789A] hover:text-[#086BEE] hover:bg-[#F4F8FF] rounded-xl border border-[#E2E8F0] transition-colors relative" 
                title="الإشعارات"
              >
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#FF6257] rounded-full ring-2 ring-white"></span>
              </button>
              
              <div className="relative group">
                <button className="flex items-center gap-2.5 px-3 py-1.5 bg-[#F4F8FF] hover:bg-[#EAF2FF] rounded-xl border border-[#E2E8F0] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#082B78] text-white flex items-center justify-center font-bold text-xs">
                    {profile?.full_name ? profile.full_name.charAt(0) : <User size={15} />}
                  </div>
                  <span className="text-sm font-semibold text-[#082B78]">
                    {profile?.full_name || 'حسابي'}
                  </span>
                </button>
                
                <div className="absolute left-0 mt-2 w-48 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl shadow-[#082B78]/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2 flex flex-col gap-1">
                    <Link href={dashboardUrl} className="flex items-center gap-2.5 px-3 py-2 text-[#082B78] hover:bg-[#F4F8FF] rounded-xl text-sm font-medium transition-colors">
                      <Settings size={16} />
                      <span>لوحة التحكم</span>
                    </Link>
                    <form action={signOut}>
                      <button type="submit" className="flex items-center gap-2.5 px-3 py-2 text-[#FF6257] hover:bg-red-50 rounded-xl text-sm font-medium w-full text-right transition-colors">
                        <LogOut size={16} />
                        <span>تسجيل الخروج</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </>
          ) : !loading ? (
            <>
              {/* Notification icon */}
              <button 
                className="w-10 h-10 flex items-center justify-center text-[#65789A] hover:text-[#086BEE] hover:bg-[#F4F8FF] rounded-xl border border-[#E2E8F0] transition-colors" 
                title="الإشعارات"
              >
                <Bell size={18} />
              </button>

              {/* Login button: White with blue border */}
              <Link 
                href="/login" 
                className="px-5 py-2.5 bg-white text-[#082B78] border border-[#086BEE] rounded-xl text-sm font-semibold hover:bg-[#F4F8FF] hover:border-[#082B78] transition-all duration-200 shadow-sm"
              >
                تسجيل الدخول
              </Link>

              {/* Register button: Coral with white text */}
              <Link 
                href="/register" 
                className="px-5 py-2.5 bg-[#FF6257] text-white rounded-xl text-sm font-semibold hover:bg-[#FF6257]/90 transition-all duration-200 shadow-sm shadow-[#FF6257]/20"
              >
                إنشاء حساب
              </Link>
            </>
          ) : null}
        </div>

        {/* Mobile menu hamburger */}
        <button 
          className="lg:hidden p-2 text-[#082B78] hover:bg-[#F4F8FF] rounded-xl transition-colors" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-[#E2E8F0] bg-white px-5 py-6 flex flex-col gap-3 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              aria-current={link.isActive ? 'page' : undefined}
              className={`px-3 py-2 rounded-xl transition-colors ${
                link.isActive
                  ? 'text-[#082B78] font-bold bg-[#F4F8FF]'
                  : 'text-[#65789A] hover:text-[#086BEE]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          <div className="h-px w-full bg-[#E2E8F0] my-2"></div>
          
          {user ? (
            <div className="flex flex-col gap-2">
              <Link href={dashboardUrl} className="py-2.5 px-4 bg-[#F4F8FF] text-[#082B78] font-bold rounded-xl text-center border border-[#E2E8F0]">
                لوحة التحكم
              </Link>
              <form action={signOut}>
                <button type="submit" className="w-full py-2.5 px-4 text-[#FF6257] hover:bg-red-50 rounded-xl font-bold text-center transition-colors">
                  تسجيل الخروج
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <Link href="/login" className="py-2.5 text-center bg-white text-[#082B78] border border-[#086BEE] rounded-xl font-semibold">
                تسجيل الدخول
              </Link>
              <Link href="/register" className="py-2.5 text-center bg-[#FF6257] text-white rounded-xl font-semibold shadow-sm">
                إنشاء حساب
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
