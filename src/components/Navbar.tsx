"use client"
import Link from 'next/link';
import { Menu, X, Bell, User, LogOut, Settings, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/actions/auth';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">B</div>
            <span className="font-bold text-xl text-primary-dark">بوث هب</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <Link href="/explore" className="hover:text-primary transition-colors">استكشف المعارض</Link>
            <Link href="/ai-assistant" className="hover:text-primary transition-colors flex items-center gap-1.5 text-primary font-semibold">
              <Sparkles size={16} className="text-coral" />
              <span>المساعد الذكي</span>
            </Link>
            <Link href="/how-it-works" className="hover:text-primary transition-colors">كيف تعمل المنصة</Link>
            <Link href="/about" className="hover:text-primary transition-colors">من نحن</Link>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {!loading && user ? (
            <>
              <button className="p-2 text-foreground hover:bg-secondary-bg rounded-full transition-colors relative" title="الإشعارات">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-coral rounded-full"></span>
              </button>
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 pl-3 bg-secondary-bg rounded-full border border-border">
                  <div className="w-8 h-8 rounded-full bg-primary-dark flex items-center justify-center text-white font-bold text-xs">
                    {profile?.full_name ? profile.full_name.charAt(0) : <User size={16} />}
                  </div>
                  <span className="text-sm font-medium">{profile?.full_name || 'حسابي'}</span>
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-white border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-2 flex flex-col gap-1">
                    <Link href={dashboardUrl} className="flex items-center gap-2 p-2 hover:bg-secondary-bg rounded-lg text-sm">
                      <Settings size={16} />
                      <span>لوحة التحكم</span>
                    </Link>
                    <form action={signOut}>
                      <button type="submit" className="flex items-center gap-2 p-2 hover:bg-red-50 text-red-600 rounded-lg text-sm w-full text-right">
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
              <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                تسجيل الدخول
              </Link>
              <Link href="/register" className="text-sm font-medium bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                إنشاء حساب
              </Link>
            </>
          ) : null}
        </div>

        <button className="md:hidden p-2 text-foreground" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-white p-4 flex flex-col gap-4">
          <Link href="/" className="p-2 hover:bg-secondary-bg rounded-lg">الرئيسية</Link>
          <Link href="/explore" className="p-2 hover:bg-secondary-bg rounded-lg">استكشف المعارض</Link>
          <Link href="/ai-assistant" className="p-2 hover:bg-secondary-bg rounded-lg flex items-center gap-2 text-primary font-medium">
            <Sparkles size={16} className="text-coral" />
            <span>المساعد الذكي (Gemini)</span>
          </Link>
          <Link href="/how-it-works" className="p-2 hover:bg-secondary-bg rounded-lg">كيف تعمل المنصة</Link>
          <Link href="/about" className="p-2 hover:bg-secondary-bg rounded-lg">من نحن</Link>
          <div className="h-px w-full bg-border my-2"></div>
          {user ? (
            <div className="flex flex-col gap-2">
              <Link href={dashboardUrl} className="p-2 bg-primary/10 text-primary font-medium rounded-lg text-center">لوحة التحكم</Link>
              <form action={signOut}>
                <button type="submit" className="p-2 text-red-600 hover:bg-red-50 rounded-lg text-center w-full">تسجيل الخروج</button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" className="p-2 text-center border border-border rounded-lg font-medium">تسجيل الدخول</Link>
              <Link href="/register" className="p-2 text-center bg-primary text-white rounded-lg font-medium">إنشاء حساب</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
