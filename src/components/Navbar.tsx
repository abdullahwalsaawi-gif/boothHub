"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/actions/auth';

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const userDropdownRef = useRef<HTMLDivElement>(null);

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

  // Close menus on route change
  useEffect(() => {
    setIsUserDropdownOpen(false);
    setIsMenuOpen(false);
  }, [pathname]);

  // Handle click outside, touch outside, and Escape key for user dropdown
  useEffect(() => {
    if (!isUserDropdownOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsUserDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserDropdownOpen]);

  // Resolve dashboard URL and role label
  const isOrganizer = profile?.account_type === 'organizer' || user?.user_metadata?.account_type === 'organizer';
  const dashboardUrl = isOrganizer ? '/dashboard/organizer' : '/dashboard/exhibitor';
  const roleLabel = (profile?.role === 'admin' || profile?.account_type === 'admin') 
    ? 'مسؤول المنصة' 
    : isOrganizer 
      ? 'منظم معارض' 
      : 'عارض';

  // Handle clean sign out
  const handleSignOut = async () => {
    setIsUserDropdownOpen(false);
    setIsMenuOpen(false);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Client signOut error:', err);
    }
    try {
      await signOut();
    } catch {
      // server action redirect handled
    }
    setUser(null);
    setProfile(null);
    window.location.href = '/';
  };

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
        <div className="flex items-center gap-2 sm:gap-3.5">
          {!loading && user ? (
            <>
              {/* Notification icon */}
              <button 
                type="button"
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-[#65789A] hover:text-[#086BEE] hover:bg-[#F4F8FF] rounded-xl border border-[#E2E8F0] transition-colors relative cursor-pointer" 
                title="الإشعارات"
                aria-label="الإشعارات"
              >
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF6257] rounded-full ring-2 ring-white"></span>
              </button>
              
              {/* User Account Menu with interactive Click & Touch */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                  aria-expanded={isUserDropdownOpen}
                  aria-haspopup="true"
                  aria-controls="user-account-dropdown"
                  aria-label="قائمة حساب المستخدم"
                  className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 bg-[#F4F8FF] hover:bg-[#EAF2FF] active:bg-[#E2EDFF] rounded-xl border border-[#E2E8F0] transition-all duration-150 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#086BEE]/40"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#082B78] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {profile?.full_name ? profile.full_name.charAt(0) : <User size={14} />}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#082B78] max-w-[85px] sm:max-w-[130px] md:max-w-[180px] truncate">
                    {profile?.full_name || 'حسابي'}
                  </span>
                  <ChevronDown 
                    size={14} 
                    className={`text-[#65789A] transition-transform duration-200 shrink-0 ${isUserDropdownOpen ? 'rotate-180 text-[#086BEE]' : ''}`} 
                  />
                </button>
                
                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div
                    id="user-account-dropdown"
                    role="menu"
                    aria-orientation="vertical"
                    className="absolute left-0 mt-2 w-56 sm:w-64 max-w-[calc(100vw-2rem)] bg-white border border-[#E2E8F0] rounded-2xl shadow-xl shadow-[#082B78]/10 py-2 z-[100] animate-in fade-in zoom-in-95 duration-150 origin-top-left"
                    dir="rtl"
                  >
                    {/* User profile card in dropdown */}
                    <div className="px-4 py-2.5 border-b border-[#E2E8F0]/80 mb-1">
                      <p className="text-xs text-[#65789A]">مرحباً بك</p>
                      <p className="text-sm font-bold text-[#082B78] truncate mt-0.5">
                        {profile?.full_name || user?.user_metadata?.full_name || 'مستخدم بوث هب'}
                      </p>
                      {user?.email && (
                        <p className="text-xs text-[#65789A] truncate mt-0.5" dir="ltr">
                          {user.email}
                        </p>
                      )}
                      <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#F4F8FF] text-[#086BEE] border border-[#086BEE]/20">
                        {roleLabel}
                      </span>
                    </div>

                    <div className="p-1.5 flex flex-col gap-1">
                      <Link 
                        href={dashboardUrl} 
                        role="menuitem"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[#082B78] hover:bg-[#F4F8FF] rounded-xl text-sm font-medium transition-colors"
                      >
                        <Settings size={16} className="text-[#086BEE]" />
                        <span>لوحة التحكم</span>
                      </Link>
                      
                      <button 
                        type="button"
                        role="menuitem"
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 px-3 py-2 text-[#FF6257] hover:bg-red-50 rounded-xl text-sm font-medium w-full text-right transition-colors cursor-pointer"
                      >
                        <LogOut size={16} />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : !loading ? (
            <>
              {/* Notification icon */}
              <button 
                type="button"
                className="w-9 h-9 sm:w-10 sm:h-10 hidden sm:flex items-center justify-center text-[#65789A] hover:text-[#086BEE] hover:bg-[#F4F8FF] rounded-xl border border-[#E2E8F0] transition-colors" 
                title="الإشعارات"
                aria-label="الإشعارات"
              >
                <Bell size={18} />
              </button>

              {/* Login button: White with blue border */}
              <Link 
                href="/login" 
                className="hidden sm:inline-flex px-3.5 sm:px-5 py-2 sm:py-2.5 bg-white text-[#082B78] border border-[#086BEE] rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#F4F8FF] hover:border-[#082B78] transition-all duration-200 shadow-sm"
              >
                تسجيل الدخول
              </Link>

              {/* Register button: Coral with white text */}
              <Link 
                href="/register" 
                className="hidden sm:inline-flex px-3.5 sm:px-5 py-2 sm:py-2.5 bg-[#FF6257] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#FF6257]/90 transition-all duration-200 shadow-sm shadow-[#FF6257]/20"
              >
                إنشاء حساب
              </Link>
            </>
          ) : null}

          {/* Mobile menu hamburger */}
          <button 
            type="button"
            className="lg:hidden p-2 text-[#082B78] hover:bg-[#F4F8FF] rounded-xl transition-colors cursor-pointer" 
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              setIsUserDropdownOpen(false);
            }}
            aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-[#E2E8F0] bg-white px-5 py-6 flex flex-col gap-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
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
              <div className="flex items-center gap-3 p-3 bg-[#F4F8FF] rounded-2xl border border-[#E2E8F0] mb-1">
                <div className="w-10 h-10 rounded-xl bg-[#082B78] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  {profile?.full_name ? profile.full_name.charAt(0) : <User size={18} />}
                </div>
                <div className="flex flex-col overflow-hidden text-right flex-1">
                  <span className="text-sm font-bold text-[#082B78] truncate">
                    {profile?.full_name || 'حسابي'}
                  </span>
                  {user?.email && (
                    <span className="text-xs text-[#65789A] truncate" dir="ltr">
                      {user.email}
                    </span>
                  )}
                  <span className="inline-block mt-1 text-[10px] font-bold text-[#086BEE]">
                    {roleLabel}
                  </span>
                </div>
              </div>
              <Link 
                href={dashboardUrl} 
                onClick={() => setIsMenuOpen(false)}
                className="py-2.5 px-4 bg-[#F4F8FF] hover:bg-[#EAF2FF] text-[#082B78] font-bold rounded-xl text-center border border-[#E2E8F0] flex items-center justify-center gap-2 text-sm transition-colors"
              >
                <Settings size={16} className="text-[#086BEE]" />
                <span>لوحة التحكم</span>
              </Link>
              <button 
                type="button"
                onClick={handleSignOut} 
                className="w-full py-2.5 px-4 text-[#FF6257] hover:bg-red-50 rounded-xl font-bold text-center transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <LogOut size={16} />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <Link 
                href="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="py-2.5 text-center bg-white text-[#082B78] border border-[#086BEE] rounded-xl font-semibold hover:bg-[#F4F8FF] transition-colors"
              >
                تسجيل الدخول
              </Link>
              <Link 
                href="/register" 
                onClick={() => setIsMenuOpen(false)}
                className="py-2.5 text-center bg-[#FF6257] text-white rounded-xl font-semibold shadow-sm hover:bg-[#FF6257]/90 transition-colors"
              >
                إنشاء حساب
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
