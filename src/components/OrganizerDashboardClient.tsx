"use client"

import { useState, useMemo, useTransition, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Store, 
  Layers, 
  CalendarCheck2, 
  Users, 
  BarChart3, 
  Sparkles, 
  Bell, 
  Settings, 
  LogOut, 
  MapPin, 
  Calendar, 
  Eye, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronRight, 
  ExternalLink, 
  Phone, 
  Mail, 
  Building2, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  X, 
  Loader2, 
  Menu,
  TrendingUp,
  DollarSign,
  PackageCheck,
  AlertTriangle,
  Info,
  MoreVertical,
  Trash2,
  EyeOff,
  Edit3
} from 'lucide-react';
import { Exhibition, deleteExhibition, toggleExhibitionVisibility, getOrganizerExhibitions } from '@/app/actions/exhibitions';
import { BookingRecord, OrganizerBoothRecord, updateBookingStatus } from '@/app/actions/bookings';
import { signOut } from '@/app/actions/auth';
import { getExhibitionImage } from '@/lib/utils';
import CreateExhibitionModal from '@/components/CreateExhibitionModal';
import EditExhibitionModal from '@/components/EditExhibitionModal';

type TabType = 'overview' | 'exhibitions' | 'booths' | 'bookings' | 'exhibitors' | 'analytics' | 'ai' | 'notifications' | 'settings';

interface OrganizerDashboardClientProps {
  initialExhibitions: Exhibition[];
  initialBookings: BookingRecord[];
  initialBooths: OrganizerBoothRecord[];
  profile: any;
}

export default function OrganizerDashboardClient({
  initialExhibitions,
  initialBookings,
  initialBooths,
  profile,
}: OrganizerDashboardClientProps) {
  // Navigation State
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Data State
  const [exhibitions, setExhibitions] = useState<Exhibition[]>(initialExhibitions);
  const [bookings, setBookings] = useState<BookingRecord[]>(initialBookings);
  const [booths, setBooths] = useState<OrganizerBoothRecord[]>(initialBooths);

  // Selected Booking Drawer State
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Bookings Filter State
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected' | 'cancelled'>('all');
  const [bookingExhFilter, setBookingExhFilter] = useState<string>('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingSort, setBookingSort] = useState<'newest' | 'oldest' | 'price_high' | 'price_low'>('newest');

  // Booths Filter State
  const [boothStatusFilter, setBoothStatusFilter] = useState<'all' | 'available' | 'pending' | 'booked' | 'unavailable'>('all');
  const [boothExhFilter, setBoothExhFilter] = useState<string>('all');
  const [boothSearch, setBoothSearch] = useState('');

  // Exhibitors Search State
  const [exhibitorSearch, setExhibitorSearch] = useState('');

  // Exhibition Management State (Safe Delete, Hide/Show, Edit, Dropdown)
  const [openMenuExhId, setOpenMenuExhId] = useState<string | null>(null);
  const [editingExhibition, setEditingExhibition] = useState<Exhibition | null>(null);
  const [hidingExhibition, setHidingExhibition] = useState<Exhibition | null>(null);
  const [deleteExhibitionModal, setDeleteExhibitionModal] = useState<Exhibition | null>(null);
  const [deleteConfirmTitleInput, setDeleteConfirmTitleInput] = useState('');
  const [deleteModalError, setDeleteModalError] = useState<string | null>(null);
  const [exhibitionFilterTab, setExhibitionFilterTab] = useState<'all' | 'published' | 'hidden'>('all');
  const [isExhibitionActionLoading, setIsExhibitionActionLoading] = useState(false);

  // Transitions
  const [isPending, startTransition] = useTransition();

  // Metrics Calculations
  const activeExhibitionsCount = exhibitions.filter(e => e.status === 'published').length;
  const hiddenExhibitionsCount = exhibitions.filter(e => e.status === 'hidden' || e.status === 'draft').length;
  const totalBoothsCount = booths.length > 0 
    ? booths.length 
    : exhibitions.reduce((acc, curr) => acc + (curr.total_booths || 0), 0);
  
  const confirmedBoothsCount = booths.filter(b => b.status === 'booked').length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookingsCount = bookings.filter(b => b.status === 'confirmed').length;

  const occupancyRate = totalBoothsCount > 0 
    ? Math.round((confirmedBoothsCount / totalBoothsCount) * 100) 
    : 0;

  // Revenue strictly from confirmed bookings
  const confirmedRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((acc, b) => acc + b.total_amount, 0);

  // Exhibition action handlers
  const handleToggleHide = async (ex: Exhibition) => {
    setIsExhibitionActionLoading(true);
    const newStatus = ex.status === 'published' ? 'hidden' : 'published';
    const res = await toggleExhibitionVisibility(ex.id, newStatus);
    setIsExhibitionActionLoading(false);
    setHidingExhibition(null);
    setOpenMenuExhId(null);
    if (!res.success) {
      setActionMessage({ text: res.error || 'فشل تحديث حالة المعرض', type: 'error' });
    } else {
      setExhibitions(prev => prev.map(item => item.id === ex.id ? { ...item, status: newStatus } : item));
      setActionMessage({
        text: newStatus === 'hidden' ? `تم إخفاء المعرض "${ex.title}" بنجاح` : `تم نشر المعرض "${ex.title}" بنجاح`,
        type: 'success'
      });
    }
  };

  const handleDeleteRequest = (ex: Exhibition) => {
    setOpenMenuExhId(null);
    setDeleteModalError(null);
    setDeleteConfirmTitleInput('');
    setDeleteExhibitionModal(ex);
  };

  const handleConfirmDelete = async () => {
    if (!deleteExhibitionModal) return;

    const targetEx = deleteExhibitionModal;
    setDeleteModalError(null);
    setIsExhibitionActionLoading(true);
    const res = await deleteExhibition(targetEx.id);
    setIsExhibitionActionLoading(false);

    if (!res.success) {
      setDeleteModalError(res.error || 'فشل حذف المعرض من قاعدة البيانات');
      setActionMessage({ text: res.error || 'فشل حذف المعرض', type: 'error' });
    } else {
      const deletedTitle = targetEx.title;
      // Optimistic instant state update
      setExhibitions(prev => prev.filter(e => e.id !== targetEx.id));
      setDeleteExhibitionModal(null);
      setDeleteModalError(null);
      setActionMessage({ text: `تم حذف المعرض "${deletedTitle}" وكافة بياناته بنجاح`, type: 'success' });
    }
  };

  const handleRefreshExhibitions = async () => {
    const updated = await getOrganizerExhibitions();
    if (updated) {
      setExhibitions(updated);
    }
  };

  const displayedExhibitions = useMemo(() => {
    if (exhibitionFilterTab === 'published') {
      return exhibitions.filter(e => e.status === 'published');
    }
    if (exhibitionFilterTab === 'hidden') {
      return exhibitions.filter(e => e.status === 'hidden' || e.status === 'draft');
    }
    return exhibitions;
  }, [exhibitions, exhibitionFilterTab]);

  // Potential pipeline from pending bookings
  const pendingRevenue = bookings
    .filter(b => b.status === 'pending')
    .reduce((acc, b) => acc + b.total_amount, 0);

  // Action: Accept / Confirm Booking
  const handleUpdateStatus = async (bookingId: string, status: 'confirmed' | 'rejected') => {
    setActionLoading(bookingId);
    setActionMessage(null);

    try {
      const res = await updateBookingStatus(bookingId, status);
      if (res.success) {
        // Update local state smoothly
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status, payment_status: status === 'confirmed' ? 'paid' : 'unpaid' } : b));
        
        // Update booth state if confirming or rejecting
        setBooths(prev => prev.map(booth => {
          if (booth.booking?.id === bookingId) {
            return {
              ...booth,
              status: status === 'confirmed' ? 'booked' : 'available',
              booking: status === 'confirmed' ? { ...booth.booking, status: 'confirmed' } : undefined
            };
          }
          return booth;
        }));

        if (selectedBooking && selectedBooking.id === bookingId) {
          setSelectedBooking(prev => prev ? { ...prev, status, payment_status: status === 'confirmed' ? 'paid' : 'unpaid' } : null);
        }

        setActionMessage({
          text: status === 'confirmed' ? 'تم تأكيد طلب الحجز بنجاح وحجز البوث' : 'تم رفض طلب الحجز',
          type: 'success'
        });
      } else {
        setActionMessage({
          text: res.error || 'حدث خطأ أثناء تحديث حالة الحجز',
          type: 'error'
        });
      }
    } catch (e: any) {
      setActionMessage({ text: e.message || 'فشل الاتصال بالخادم', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // Status filter
      if (bookingStatusFilter !== 'all' && b.status !== bookingStatusFilter) return false;
      // Exhibition filter
      if (bookingExhFilter !== 'all' && b.exhibition_id !== bookingExhFilter) return false;
      // Search query
      if (bookingSearch.trim()) {
        const q = bookingSearch.toLowerCase();
        const matches = 
          b.booking_reference.toLowerCase().includes(q) ||
          b.contact_name.toLowerCase().includes(q) ||
          (b.organization_name && b.organization_name.toLowerCase().includes(q)) ||
          (b.exhibition_title && b.exhibition_title.toLowerCase().includes(q)) ||
          (b.booth_number && b.booth_number.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => {
      if (bookingSort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (bookingSort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (bookingSort === 'price_high') return b.total_amount - a.total_amount;
      if (bookingSort === 'price_low') return a.total_amount - b.total_amount;
      return 0;
    });
  }, [bookings, bookingStatusFilter, bookingExhFilter, bookingSearch, bookingSort]);

  // Filtered Booths
  const filteredBooths = useMemo(() => {
    return booths.filter(b => {
      if (boothStatusFilter !== 'all' && b.status !== boothStatusFilter) return false;
      if (boothExhFilter !== 'all' && b.exhibition_id !== boothExhFilter) return false;
      if (boothSearch.trim()) {
        const q = boothSearch.toLowerCase();
        const matches = 
          b.booth_number.toLowerCase().includes(q) ||
          b.exhibition_title.toLowerCase().includes(q) ||
          (b.booking?.contact_name && b.booking.contact_name.toLowerCase().includes(q)) ||
          (b.booking?.organization_name && b.booking.organization_name.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [booths, boothStatusFilter, boothExhFilter, boothSearch]);

  // Extracted Exhibitors List
  const exhibitorsList = useMemo(() => {
    const map = new Map<string, {
      name: string;
      orgName: string;
      phone: string;
      email?: string;
      bookingsCount: number;
      confirmedCount: number;
      totalSpent: number;
      exhibitions: Set<string>;
      lastBookingDate: string;
    }>();

    bookings.forEach(b => {
      const key = (b.contact_phone || b.contact_name).trim().toLowerCase();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          name: b.contact_name,
          orgName: b.organization_name || 'عارض فردي',
          phone: b.contact_phone,
          email: b.contact_email,
          bookingsCount: 1,
          confirmedCount: b.status === 'confirmed' ? 1 : 0,
          totalSpent: b.status === 'confirmed' ? b.total_amount : 0,
          exhibitions: new Set([b.exhibition_title || 'معرض']),
          lastBookingDate: b.created_at
        });
      } else {
        existing.bookingsCount += 1;
        if (b.status === 'confirmed') {
          existing.confirmedCount += 1;
          existing.totalSpent += b.total_amount;
        }
        if (b.exhibition_title) existing.exhibitions.add(b.exhibition_title);
        if (new Date(b.created_at) > new Date(existing.lastBookingDate)) {
          existing.lastBookingDate = b.created_at;
        }
      }
    });

    return Array.from(map.values()).filter(ex => {
      if (!exhibitorSearch.trim()) return true;
      const q = exhibitorSearch.toLowerCase();
      return ex.name.toLowerCase().includes(q) || ex.orgName.toLowerCase().includes(q) || ex.phone.includes(q);
    });
  }, [bookings, exhibitorSearch]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-800">
      
      {/* ━━━━━━━━━━━━━━━━━━━━ Sidebar (Modern Light SaaS) ━━━━━━━━━━━━━━━━━━━━ */}
      <aside className={`
        fixed inset-y-0 right-0 z-40 w-64 bg-white border-l border-slate-200/90 shadow-sm flex flex-col transition-transform duration-300 md:static md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Brand / Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 bg-gradient-to-l from-white via-white to-blue-50/40">
          <Link href="/" className="flex items-center group py-1" aria-label="بوث هب | Booth Hub">
            <img 
              src="/branding/logo.png?v=3" 
              alt="بوث هب | Booth Hub" 
              className="h-9 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-600 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          <p className="text-[11px] font-bold text-slate-400 px-3 mb-2 uppercase tracking-wider">الإدارة المركزية</p>
          
          {[
            { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
            { id: 'exhibitions', label: 'معارضي', icon: Store, badge: exhibitions.length },
            { id: 'booths', label: 'إدارة البوثات', icon: Layers, badge: booths.length },
            { id: 'bookings', label: 'إدارة الحجوزات', icon: CalendarCheck2, badge: pendingBookingsCount, badgeColor: 'bg-amber-500' },
            { id: 'exhibitors', label: 'العارضون', icon: Users, badge: exhibitorsList.length },
            { id: 'analytics', label: 'التقارير والإحصائيات', icon: BarChart3 },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as TabType);
                  setMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all text-right
                  ${isActive 
                    ? 'bg-[#EDF5FF] text-[#102E70] font-bold shadow-xs border-r-4 border-[#FF6D5C]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#102E70]'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-[#0868E9]' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-bold ${item.badgeColor || 'bg-[#0868E9]'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <p className="text-[11px] font-bold text-slate-400 px-3 pt-4 mb-2 uppercase tracking-wider">الأدوات والدعم</p>
          
          <button
            onClick={() => {
              setActiveTab('ai');
              setMobileMenuOpen(false);
            }}
            className={`
              w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all text-right
              ${activeTab === 'ai' 
                ? 'bg-[#EDF5FF] text-[#102E70] font-bold border-r-4 border-[#FF6D5C]' 
                : 'text-slate-600 hover:bg-slate-50'}
            `}
          >
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="text-[#FF6D5C]" />
              <span>المساعد الذكي (Gemini)</span>
            </div>
            <span className="text-[9px] bg-coral/10 text-coral font-bold px-1.5 py-0.5 rounded-md">AI</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('notifications');
              setMobileMenuOpen(false);
            }}
            className={`
              w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all text-right
              ${activeTab === 'notifications' 
                ? 'bg-[#EDF5FF] text-[#102E70] font-bold border-r-4 border-[#FF6D5C]' 
                : 'text-slate-600 hover:bg-slate-50'}
            `}
          >
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-slate-400" />
              <span>الإشعارات</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab('settings');
              setMobileMenuOpen(false);
            }}
            className={`
              w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all text-right
              ${activeTab === 'settings' 
                ? 'bg-[#EDF5FF] text-[#102E70] font-bold border-r-4 border-[#FF6D5C]' 
                : 'text-slate-600 hover:bg-slate-50'}
            `}
          >
            <div className="flex items-center gap-3">
              <Settings size={18} className="text-slate-400" />
              <span>إعدادات الجهة</span>
            </div>
          </button>
        </div>

        {/* User Footer & Sign Out */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <form action={signOut}>
            <button 
              type="submit" 
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-right"
            >
              <LogOut size={16} />
              <span>تسجيل الخروج</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Backdrop for mobile menu */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ Main Layout Area ━━━━━━━━━━━━━━━━━━━━ */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Modern SaaS Header */}
        <header className="h-20 bg-white border-b border-slate-200/90 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#102E70]">لوحة تحكم المنظم</h1>
              <p className="text-xs text-slate-400 hidden sm:block">كل ما تحتاجه لإدارة معارضك وبوثاتك وحجوزاتك في مكان واحد</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Single Prominent Create Exhibition Button */}
            <CreateExhibitionModal />

            {/* Notification Bell */}
            <button 
              onClick={() => setActiveTab('notifications')}
              className="p-2.5 text-slate-500 hover:text-[#0868E9] hover:bg-[#EDF5FF] rounded-xl transition-colors relative"
              title="الإشعارات"
            >
              <Bell size={19} />
              {pendingBookingsCount > 0 && (
                <span className="w-2.5 h-2.5 bg-[#FF6D5C] rounded-full absolute top-2 right-2 ring-2 ring-white"></span>
              )}
            </button>

            {/* Divider */}
            <div className="w-px h-7 bg-slate-200 hidden sm:block"></div>

            {/* Organizer Profile Info */}
            <div className="flex items-center gap-3">
              <div className="text-left hidden sm:block">
                <p className="font-bold text-xs text-[#102E70]">{profile?.full_name || 'جهة تنظيم معتمدة'}</p>
                <p className="text-[10px] text-slate-400">حساب منظم</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#102E70] to-[#0868E9] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {profile?.full_name ? profile.full_name.charAt(0) : 'م'}
              </div>
            </div>
          </div>
        </header>

        {/* Global Feedback Banner */}
        {actionMessage && (
          <div className={`mx-6 mt-4 p-3.5 rounded-2xl text-xs flex items-center justify-between border ${
            actionMessage.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {actionMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{actionMessage.text}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="p-1 hover:opacity-75">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Page Content View */}
        <div className="p-4 md:p-8 space-y-8">
          
          {/* ━━━━━━━━━━━━━━━━━━━━ 6 Interactive Metric Cards ━━━━━━━━━━━━━━━━━━━━ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            
            {/* 1. معارضي النشطة */}
            <div 
              onClick={() => setActiveTab('exhibitions')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#0868E9]/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500">معارضي النشطة</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0868E9] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Store size={18} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-[#102E70] mb-1">{activeExhibitionsCount}</p>
              <p className="text-[11px] text-green-600 font-medium flex items-center gap-1">
                <span>عرض قائمة المعارض</span>
                <span className="rotate-180 text-[9px]">←</span>
              </p>
            </div>

            {/* 2. إجمالي البوثات */}
            <div 
              onClick={() => {
                setBoothStatusFilter('all');
                setActiveTab('booths');
              }}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#0868E9]/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500">إجمالي البوثات</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Layers size={18} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-[#102E70] mb-1">{totalBoothsCount}</p>
              <p className="text-[11px] text-purple-600 font-medium flex items-center gap-1">
                <span>إدارة جميع البوثات</span>
                <span className="rotate-180 text-[9px]">←</span>
              </p>
            </div>

            {/* 3. البوثات المحجوزة */}
            <div 
              onClick={() => {
                setBoothStatusFilter('booked');
                setActiveTab('booths');
              }}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#0868E9]/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500">البوثات المحجوزة</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PackageCheck size={18} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-[#102E70] mb-1">{confirmedBoothsCount}</p>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <span>عرض البوثات المحجوزة</span>
                <span className="rotate-180 text-[9px]">←</span>
              </p>
            </div>

            {/* 4. طلبات الحجز الجديدة */}
            <div 
              onClick={() => {
                setBookingStatusFilter('pending');
                setActiveTab('bookings');
              }}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500">طلبات الحجز الجديدة</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock size={18} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-amber-600 mb-1">{pendingBookingsCount}</p>
              <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                <span>بانتظار المراجعة</span>
                <span className="rotate-180 text-[9px]">←</span>
              </p>
            </div>

            {/* 5. نسبة إشغال البوثات */}
            <div 
              onClick={() => setActiveTab('analytics')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#0868E9]/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500">نسبة الإشغال</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0868E9] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp size={18} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-[#102E70] mb-1">{occupancyRate}%</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-[#0868E9] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                />
              </div>
            </div>

            {/* 6. إيرادات الحجوزات */}
            <div 
              onClick={() => setActiveTab('analytics')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#0868E9]/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500">إيرادات الحجوزات</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign size={18} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-[#102E70] mb-1">
                {confirmedRevenue.toLocaleString()} <span className="text-xs font-normal text-slate-400">ريال</span>
              </p>
              <p className="text-[10px] text-slate-400">
                المحصلة فعلياً من الحجوزات المؤكدة
              </p>
            </div>

          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━ Tab 1: نظرة عامة (Overview) ━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Quick Summary: Recent Bookings & AI Assistant */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recent Bookings Box */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-base text-[#102E70]">أحدث طلبات الحجز</h3>
                      <p className="text-xs text-slate-400">طلبات واردة لمعارضك تتطلب اتخاذ إجراء أو مراجعة</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('bookings')}
                      className="text-xs font-bold text-[#0868E9] hover:underline flex items-center gap-1"
                    >
                      <span>عرض جميع الحجوزات ({bookings.length})</span>
                      <span className="rotate-180">←</span>
                    </button>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <CalendarCheck2 size={36} className="text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-sm text-[#102E70]">لا توجد طلبات حجز بعد</p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                        سيظهر هنا كل طلب حجز جديد يقدمه العارضون في معارضك مع تفاصيل التواصل لإجراء التأكيد أو الرفض.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-semibold pb-3">
                            <th className="pb-3 pr-2">رقم الحجز</th>
                            <th className="pb-3">العارض</th>
                            <th className="pb-3">المعرض</th>
                            <th className="pb-3">البوث</th>
                            <th className="pb-3">المبلغ</th>
                            <th className="pb-3">الحالة</th>
                            <th className="pb-3 text-center">الإجراء</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {bookings.slice(0, 5).map(b => (
                            <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 pr-2 font-mono font-bold text-[#0868E9]">{b.booking_reference}</td>
                              <td className="py-3.5">
                                <span className="font-bold text-[#102E70] block">{b.contact_name}</span>
                                <span className="text-[10px] text-slate-400">{b.organization_name || 'عارض فردي'}</span>
                              </td>
                              <td className="py-3.5 text-slate-600">{b.exhibition_title}</td>
                              <td className="py-3.5 font-bold text-slate-700">بوث {b.booth_number}</td>
                              <td className="py-3.5 font-semibold text-slate-800">{b.total_amount.toLocaleString()} ريال</td>
                              <td className="py-3.5">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                  b.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {b.status === 'confirmed' ? 'مؤكد' : b.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                                </span>
                              </td>
                              <td className="py-3.5 text-center">
                                <button
                                  onClick={() => setSelectedBooking(b)}
                                  className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-[#0868E9] hover:text-white rounded-lg text-xs font-medium transition-colors"
                                >
                                  التفاصيل
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* AI & Quick Links Box */}
                <div className="space-y-6">
                  {/* Gemini Card */}
                  <div className="bg-gradient-to-br from-[#102E70] to-[#0868E9] text-white rounded-3xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-10 -translate-y-10 blur-xl"></div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={20} className="text-[#FF6D5C]" />
                      <span className="font-bold text-sm">مساعد بوث هب الذكي للمنظم</span>
                    </div>
                    <p className="text-xs text-blue-100 leading-relaxed mb-5">
                      استخدم ذكاء Google Gemini لتحسين صياغة وصف معرضك، وتحديد الأسعار المثالية للبوثات، وكتابة شروط مشاركة احترافية.
                    </p>
                    <Link
                      href="/ai-assistant"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[#102E70] font-bold text-xs rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
                    >
                      <Sparkles size={14} className="text-[#FF6D5C]" />
                      <span>بدء استشارة الذكاء الاصطناعي</span>
                    </Link>
                  </div>

                  {/* Floorplan Editor Direct Shortcut */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-sm text-[#102E70]">محرر المخططات الهندسية</h4>
                      <Layers size={18} className="text-[#0868E9]" />
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      تحكم بمقاسات الصالات، وسحب البوثات، وضبط الأسعار بمقياس المتر الحقيقي في أي وقت.
                    </p>
                    {exhibitions.length > 0 ? (
                      <Link
                        href={`/dashboard/organizer/exhibitions/${exhibitions[0].id}/floorplan`}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-[#EDF5FF] text-[#0868E9] hover:bg-[#0868E9] hover:text-white rounded-xl text-xs font-bold transition-all text-center"
                      >
                        <span>فتح محرر المخطط لأول معرض</span>
                        <ExternalLink size={14} />
                      </Link>
                    ) : (
                      <p className="text-xs text-slate-400">قم بإنشاء معرض أولاً لتفعيل محرر المخطط</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Exhibitions Grid Preview */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-base text-[#102E70]">معارضي النشطة</h3>
                    <p className="text-xs text-slate-400">نظرة عامة على الصالات ونسب الإشغال</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('exhibitions')}
                    className="text-xs font-bold text-[#0868E9] hover:underline"
                  >
                    إدارة جميع المعارض ({exhibitions.length})
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {exhibitions.map(ex => {
                    const exBooths = booths.filter(b => b.exhibition_id === ex.id);
                    const exTotal = exBooths.length || ex.total_booths || 0;
                    const exBooked = exBooths.filter(b => b.status === 'booked').length;
                    const exRate = exTotal > 0 ? Math.round((exBooked / exTotal) * 100) : 0;

                    return (
                      <div key={ex.id} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group">
                        <div className="relative h-32 w-full bg-slate-100 overflow-hidden">
                          <img
                            src={getExhibitionImage(ex)}
                            alt={ex.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          <div className="absolute top-2.5 right-2.5 left-2.5 flex items-center justify-between">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${
                              ex.status === 'published' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'
                            }`}>
                              {ex.status === 'published' ? 'منشور' : 'مخفي'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-800 bg-white/90 px-2 py-0.5 rounded-full backdrop-blur-sm">
                              {ex.category}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                          <h4 className="font-bold text-base text-[#102E70] line-clamp-1 mb-2" title={ex.title}>{ex.title}</h4>

                          <div className="text-xs text-slate-500 space-y-1 mb-4">
                            <div className="flex items-center gap-1.5">
                              <MapPin size={13} className="text-slate-400 shrink-0" />
                              <span className="line-clamp-1">{ex.city} - {ex.venue}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-slate-400 shrink-0" />
                              <span>{ex.start_date?.split('T')[0]} إلى {ex.end_date?.split('T')[0]}</span>
                            </div>
                          </div>

                          {/* Occupancy bar */}
                          <div className="bg-slate-50 p-3 rounded-2xl mb-4 mt-auto">
                            <div className="flex justify-between text-xs font-bold mb-1.5">
                              <span className="text-slate-600">نسبة الإشغال</span>
                              <span className="text-[#0868E9]">{exRate}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div className="bg-[#0868E9] h-full rounded-full transition-all" style={{ width: `${exRate}%` }}></div>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                              <span>{exBooked} بوث محجوز</span>
                              <span>{exTotal} إجمالي البوثات</span>
                            </div>
                          </div>

                          {/* Action links */}
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/organizer/exhibitions/${ex.id}/floorplan`}
                              className="flex-1 py-2 bg-[#0868E9] text-white text-xs font-bold rounded-xl text-center hover:bg-[#0868E9]/90 transition-colors shadow-xs flex items-center justify-center gap-1.5"
                            >
                              <Layers size={13} />
                              <span>المخطط</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => setEditingExhibition(ex)}
                              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-colors cursor-pointer"
                              title="تعديل بيانات المعرض"
                            >
                              <Edit3 size={15} />
                            </button>
                            <Link
                              href={`/explore/${ex.id}`}
                              className="p-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs transition-colors"
                              title="معاينة المعرض"
                            >
                              <Eye size={15} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteRequest(ex)}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs transition-colors cursor-pointer"
                              title="حذف المعرض"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━ Tab 2: معارضي (My Exhibitions) ━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'exhibitions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#102E70]">قائمة معارضي الرسمية</h2>
                  <p className="text-xs text-slate-400">إدارة معارضك المنشورة وتفاصيل البوثات والمخططات الهندسية</p>
                </div>
                <CreateExhibitionModal />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto">
                <button
                  onClick={() => setExhibitionFilterTab('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    exhibitionFilterTab === 'all'
                      ? 'bg-[#0868E9] text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  الكل ({exhibitions.length})
                </button>
                <button
                  onClick={() => setExhibitionFilterTab('published')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    exhibitionFilterTab === 'published'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  المنشورة ({activeExhibitionsCount})
                </button>
                <button
                  onClick={() => setExhibitionFilterTab('hidden')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    exhibitionFilterTab === 'hidden'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  المخفية ({hiddenExhibitionsCount})
                </button>
              </div>

              {/* Backdrop to close 3-dots dropdown */}
              {openMenuExhId && (
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setOpenMenuExhId(null)} 
                />
              )}

              {displayedExhibitions.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                  <Store size={48} className="text-slate-300 mx-auto mb-3" />
                  <h3 className="font-bold text-base text-[#102E70] mb-1">
                    {exhibitionFilterTab === 'published' 
                      ? 'لا توجد معارض منشورة حالياً' 
                      : exhibitionFilterTab === 'hidden'
                      ? 'لا توجد معارض مخفية حالياً'
                      : 'لم تقم بإضافة أي معارض بعد'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                    {exhibitionFilterTab === 'all' 
                      ? 'ابدأ بإنشاء معرض جديد لإضافة الصالات وتوليد البوثات واستقبال الحجوزات.'
                      : 'يمكنك إدارة ظهور معارضك في أي وقت عبر قائمة الإجراءات.'}
                  </p>
                  {exhibitionFilterTab === 'all' && <CreateExhibitionModal />}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedExhibitions.map(ex => {
                    const exBooths = booths.filter(b => b.exhibition_id === ex.id);
                    const exTotal = exBooths.length || ex.total_booths || 0;
                    const exBooked = exBooths.filter(b => b.status === 'booked').length;
                    const exPending = bookings.filter(b => b.exhibition_id === ex.id && b.status === 'pending').length;
                    const exRate = exTotal > 0 ? Math.round((exBooked / exTotal) * 100) : 0;

                    return (
                      <div key={ex.id} className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group">
                        
                        {/* Exhibition Cover Image */}
                        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                          <img
                            src={getExhibitionImage(ex)}
                            alt={ex.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                          
                          {/* Top Badges */}
                          <div className="absolute top-3 right-3 left-3 flex items-center justify-between pointer-events-none">
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs ${
                              ex.status === 'published'
                                ? 'bg-emerald-500/95 text-white'
                                : 'bg-amber-500/95 text-white'
                            }`}>
                              {ex.status === 'published' ? 'منشور للعامة' : 'مخفي عن العارضين'}
                            </span>
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-slate-800 backdrop-blur-md shadow-xs">
                              {ex.category}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex-1 flex flex-col">
                          
                          {/* Title & 3-dots Menu */}
                          <div className="flex items-start justify-between gap-2 mb-3 relative">
                            <h3 className="font-extrabold text-base text-[#102E70] line-clamp-1 flex-1" title={ex.title}>
                              {ex.title}
                            </h3>

                            {/* 3-dots Trigger Button */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setOpenMenuExhId(openMenuExhId === ex.id ? null : ex.id)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                aria-label="خيارات المعرض"
                              >
                                <MoreVertical size={18} />
                              </button>

                              {/* 3-dots Dropdown Menu */}
                              {openMenuExhId === ex.id && (
                                <div 
                                  className="absolute left-0 top-8 z-30 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 text-right animate-in fade-in zoom-in-95 duration-150"
                                  dir="rtl"
                                >
                                  {/* 1. View Exhibition */}
                                  <Link
                                    href={`/explore/${ex.id}`}
                                    onClick={() => setOpenMenuExhId(null)}
                                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0868E9] transition-colors"
                                  >
                                    <Eye size={14} className="text-slate-400" />
                                    <span>عرض المعرض</span>
                                  </Link>

                                  {/* 2. Edit Exhibition */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingExhibition(ex);
                                      setOpenMenuExhId(null);
                                    }}
                                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0868E9] transition-colors w-full text-right cursor-pointer"
                                  >
                                    <Edit3 size={14} className="text-slate-400" />
                                    <span>تعديل بيانات المعرض</span>
                                  </button>

                                  {/* 3. Manage Booths */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setBoothExhFilter(ex.id);
                                      setActiveTab('booths');
                                      setOpenMenuExhId(null);
                                    }}
                                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0868E9] transition-colors w-full text-right cursor-pointer"
                                  >
                                    <Store size={14} className="text-slate-400" />
                                    <span>إدارة البوثات</span>
                                  </button>

                                  {/* 4. Manage Bookings */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setBookingExhFilter(ex.id);
                                      setActiveTab('bookings');
                                      setOpenMenuExhId(null);
                                    }}
                                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0868E9] transition-colors w-full text-right cursor-pointer"
                                  >
                                    <CalendarCheck2 size={14} className="text-slate-400" />
                                    <span>إدارة الحجوزات</span>
                                  </button>

                                  {/* 5. Hide / Show Toggle */}
                                  {ex.status === 'published' ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setHidingExhibition(ex);
                                        setOpenMenuExhId(null);
                                      }}
                                      className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors w-full text-right cursor-pointer"
                                    >
                                      <EyeOff size={14} className="text-amber-500" />
                                      <span>إخفاء المعرض</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleHide(ex)}
                                      className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors w-full text-right cursor-pointer"
                                    >
                                      <Eye size={14} className="text-emerald-500" />
                                      <span>إظهار المعرض</span>
                                    </button>
                                  )}

                                  <div className="border-t border-slate-100 my-1" />

                                  {/* 6. Delete Exhibition */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRequest(ex)}
                                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors w-full text-right cursor-pointer"
                                  >
                                    <Trash2 size={14} className="text-red-500" />
                                    <span>حذف المعرض</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Location & Dates */}
                          <div className="text-xs text-slate-500 space-y-1.5 mb-5">
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-slate-400 shrink-0" />
                              <span className="line-clamp-1">{ex.city} - {ex.venue}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-slate-400 shrink-0" />
                              <span>{ex.start_date?.split('T')[0]} إلى {ex.end_date?.split('T')[0]}</span>
                            </div>
                          </div>

                          {/* Occupancy card */}
                          <div className="bg-slate-50 p-4 rounded-2xl mb-5 mt-auto">
                            <div className="flex justify-between items-center text-xs font-bold mb-2">
                              <span className="text-slate-600">نسبة الإشغال</span>
                              <span className="text-[#0868E9] font-extrabold text-sm">{exRate}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
                              <div className="bg-[#0868E9] h-full rounded-full transition-all duration-500" style={{ width: `${exRate}%` }}></div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                              <div className="bg-white p-2 rounded-xl border border-slate-100">
                                <span className="text-slate-400 block text-[10px]">الإجمالي</span>
                                <span className="font-bold text-slate-700">{exTotal}</span>
                              </div>
                              <div className="bg-white p-2 rounded-xl border border-slate-100">
                                <span className="text-slate-400 block text-[10px]">المحجوز</span>
                                <span className="font-bold text-emerald-600">{exBooked}</span>
                              </div>
                              <div className="bg-white p-2 rounded-xl border border-slate-100">
                                <span className="text-slate-400 block text-[10px]">معلقة</span>
                                <span className="font-bold text-amber-600">{exPending}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Link
                                href={`/dashboard/organizer/exhibitions/${ex.id}/floorplan`}
                                className="py-2.5 bg-[#0868E9] text-white text-xs font-bold rounded-xl text-center hover:bg-[#0868E9]/90 transition-colors shadow-xs flex items-center justify-center gap-1.5"
                              >
                                <Layers size={14} />
                                <span>إدارة المخطط</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => setEditingExhibition(ex)}
                                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Edit3 size={14} />
                                <span>تعديل البيانات</span>
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-1.5">
                              <button
                                onClick={() => {
                                  setBoothExhFilter(ex.id);
                                  setActiveTab('booths');
                                }}
                                className="py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-xl text-center transition-colors cursor-pointer"
                              >
                                البوثات
                              </button>
                              <button
                                onClick={() => {
                                  setBookingExhFilter(ex.id);
                                  setActiveTab('bookings');
                                }}
                                className="py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-xl text-center transition-colors cursor-pointer"
                              >
                                الحجوزات
                              </button>
                              <Link
                                href={`/explore/${ex.id}`}
                                className="py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-xl text-center transition-colors flex items-center justify-center"
                              >
                                معاينة
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDeleteRequest(ex)}
                                className="py-2 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                title="حذف المعرض"
                              >
                                <Trash2 size={12} />
                                <span>حذف</span>
                              </button>
                            </div>
                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━ Tab 3: إدارة البوثات (Booths Management) ━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'booths' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#102E70]">إدارة بوثات المعارض</h2>
                  <p className="text-xs text-slate-400">متابعة جاهزية وتوافر وحجوزات البوثات عبر جميع صالاتك</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
                    {booths.filter(b => b.status === 'available').length} متاح
                  </span>
                  <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold">
                    {booths.filter(b => b.status === 'pending').length} قيد المراجعة
                  </span>
                  <span className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold">
                    {booths.filter(b => b.status === 'booked').length} محجوز
                  </span>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[180px]">
                    <Search size={16} className="absolute right-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ابحث برقم البوث أو اسم العارض..."
                      value={boothSearch}
                      onChange={e => setBoothSearch(e.target.value)}
                      className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0868E9]"
                    />
                  </div>

                  {/* Exhibition Dropdown */}
                  <select
                    value={boothExhFilter}
                    onChange={e => setBoothExhFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#0868E9]"
                  >
                    <option value="all">جميع المعارض</option>
                    {exhibitions.map(e => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>

                {/* Status Pills */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'available', label: 'متاح' },
                    { id: 'pending', label: 'قيد المراجعة' },
                    { id: 'booked', label: 'محجوز' },
                    { id: 'unavailable', label: 'غير متاح' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setBoothStatusFilter(p.id as any)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                        boothStatusFilter === p.id 
                          ? 'bg-[#102E70] text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Booths Table */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                {filteredBooths.length === 0 ? (
                  <div className="text-center py-12">
                    <Layers size={36} className="text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-sm text-[#102E70]">لا توجد بوثات مطابقة للبحث</p>
                    <p className="text-xs text-slate-400 mt-1">جرّب تغيير فلاتر البحث أو المعرض المحدد.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold">
                        <tr>
                          <th className="p-4">رقم البوث</th>
                          <th className="p-4">المعرض</th>
                          <th className="p-4">المساحة</th>
                          <th className="p-4">السعر</th>
                          <th className="p-4">حالة البوث</th>
                          <th className="p-4">العارض المرتبط</th>
                          <th className="p-4 text-center">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBooths.map(b => (
                          <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 font-bold text-[#102E70] text-sm">
                              بوث {b.booth_number}
                            </td>
                            <td className="p-4 text-slate-600 font-medium">
                              {b.exhibition_title}
                            </td>
                            <td className="p-4 font-semibold text-slate-700">
                              {b.size_sqm} م²
                            </td>
                            <td className="p-4 font-bold text-[#0868E9]">
                              {b.price.toLocaleString()} ريال
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                b.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                                b.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                b.status === 'booked' ? 'bg-red-100 text-red-700' :
                                'bg-slate-200 text-slate-600'
                              }`}>
                                {b.status === 'available' ? 'متاح للحجز' :
                                 b.status === 'pending' ? 'قيد المراجعة' :
                                 b.status === 'booked' ? 'محجوز مؤكد' : 'غير متاح'}
                              </span>
                            </td>
                            <td className="p-4">
                              {b.booking ? (
                                <div>
                                  <span className="font-bold text-[#102E70] block">{b.booking.contact_name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{b.booking.booking_reference}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[11px]">—</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <Link
                                  href={`/dashboard/organizer/exhibitions/${b.exhibition_id}/floorplan`}
                                  className="px-2.5 py-1 bg-blue-50 text-[#0868E9] hover:bg-[#0868E9] hover:text-white rounded-lg text-[11px] font-medium transition-colors"
                                >
                                  عرض المخطط
                                </Link>
                                {b.booking && (
                                  <button
                                    onClick={() => {
                                      const found = bookings.find(item => item.id === b.booking?.id);
                                      if (found) setSelectedBooking(found);
                                    }}
                                    className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-[11px] font-medium transition-colors"
                                  >
                                    الحجز
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━ Tab 4: إدارة الحجوزات (Bookings Management) ━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#102E70]">إدارة طلبات الحجز</h2>
                  <p className="text-xs text-slate-400">مراجعة طلبات العارضين، وقبول أو رفض الحجوزات مع منع التعارض الذري</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">
                    إجمالي {filteredBookings.length} طلب
                  </span>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                
                {/* Search & Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative sm:col-span-1">
                    <Search size={16} className="absolute right-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ابحث بالاسم، المعرض، رقم البوث، أو المرجع..."
                      value={bookingSearch}
                      onChange={e => setBookingSearch(e.target.value)}
                      className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0868E9]"
                    />
                  </div>

                  <div>
                    <select
                      value={bookingExhFilter}
                      onChange={e => setBookingExhFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#0868E9]"
                    >
                      <option value="all">جميع المعارض</option>
                      {exhibitions.map(e => (
                        <option key={e.id} value={e.id}>{e.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={bookingSort}
                      onChange={e => setBookingSort(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#0868E9]"
                    >
                      <option value="newest">الترتيب: الأحدث أولاً</option>
                      <option value="oldest">الترتيب: الأقدم أولاً</option>
                      <option value="price_high">الترتيب: الأعلى سعراً</option>
                      <option value="price_low">الترتيب: الأقل سعراً</option>
                    </select>
                  </div>
                </div>

                {/* Status Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-bold ml-2">الحالة:</span>
                  {[
                    { id: 'all', label: 'جميع الحجوزات' },
                    { id: 'pending', label: 'قيد المراجعة', count: pendingBookingsCount },
                    { id: 'confirmed', label: 'مؤكدة', count: confirmedBookingsCount },
                    { id: 'rejected', label: 'مرفوضة' },
                    { id: 'cancelled', label: 'ملغاة' },
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setBookingStatusFilter(p.id as any)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1.5 ${
                        bookingStatusFilter === p.id 
                          ? 'bg-[#0868E9] text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{p.label}</span>
                      {p.count !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                          bookingStatusFilter === p.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {p.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bookings Table */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-16">
                    <CalendarCheck2 size={40} className="text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-sm text-[#102E70]">لا توجد طلبات حجز مطابقة</p>
                    <p className="text-xs text-slate-400 mt-1">جرّب إلغاء أو تغيير فلاتر البحث الحالية.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold">
                        <tr>
                          <th className="p-4">رقم الحجز</th>
                          <th className="p-4">العارض والمنشأة</th>
                          <th className="p-4">المعرض</th>
                          <th className="p-4">البوث والمساحة</th>
                          <th className="p-4">سعر الحجز</th>
                          <th className="p-4">تاريخ الطلب</th>
                          <th className="p-4">حالة الحجز</th>
                          <th className="p-4">حالة الدفع</th>
                          <th className="p-4 text-center">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBookings.map(b => (
                          <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 font-mono font-bold text-[#0868E9]">
                              {b.booking_reference}
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-[#102E70] block">{b.contact_name}</span>
                              <span className="text-[10px] text-slate-400">{b.organization_name || 'عارض فردي'}</span>
                            </td>
                            <td className="p-4 text-slate-600 font-medium">
                              {b.exhibition_title}
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-slate-800 block">بوث {b.booth_number}</span>
                              {b.booth_size_sqm && (
                                <span className="text-[10px] text-slate-400">{b.booth_size_sqm} م²</span>
                              )}
                            </td>
                            <td className="p-4 font-bold text-[#102E70]">
                              {b.total_amount.toLocaleString()} {b.currency}
                            </td>
                            <td className="p-4 text-slate-500">
                              {new Date(b.created_at).toLocaleDateString('ar-SA', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                b.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                b.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {b.status === 'confirmed' ? 'مؤكد' :
                                 b.status === 'pending' ? 'قيد المراجعة' :
                                 b.status === 'rejected' ? 'مرفوض' : 'ملغى'}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`text-[11px] font-medium ${
                                b.payment_status === 'paid' ? 'text-green-600' : 'text-slate-400'
                              }`}>
                                {b.payment_status === 'paid' ? 'مدفوع' : 'في انتظار السداد'}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setSelectedBooking(b)}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-[#0868E9] hover:text-white rounded-lg font-bold text-[11px] transition-colors"
                                >
                                  التفاصيل
                                </button>
                                {b.status === 'pending' && (
                                  <>
                                    <button
                                      disabled={actionLoading === b.id}
                                      onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                                      className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors"
                                      title="قبول وتأكيد الحجز"
                                    >
                                      {actionLoading === b.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                    </button>
                                    <button
                                      disabled={actionLoading === b.id}
                                      onClick={() => handleUpdateStatus(b.id, 'rejected')}
                                      className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                                      title="رفض الحجز"
                                    >
                                      <X size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━ Tab 5: العارضون (Exhibitors) ━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'exhibitors' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#102E70]">دليل العارضين</h2>
                  <p className="text-xs text-slate-400">قائمة الشركاء والعارضين المشاركين في معارضك وتاريخ حجوزاتهم</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search size={16} className="absolute right-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ابحث باسم العارض أو الهاتف..."
                    value={exhibitorSearch}
                    onChange={e => setExhibitorSearch(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0868E9]"
                  />
                </div>
              </div>

              {exhibitorsList.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                  <Users size={40} className="text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-sm text-[#102E70]">لا توجد بيانات عارضين مسجلة بعد</p>
                  <p className="text-xs text-slate-400 mt-1">ستظهر هنا تفاصيل كل عارض يقدم طلب حجز في معارضك.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exhibitorsList.map((ex, idx) => (
                    <div key={idx} className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#102E70] to-[#0868E9] text-white flex items-center justify-center font-bold text-base shadow-sm">
                          {ex.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#102E70]">{ex.name}</h4>
                          <span className="text-xs text-slate-400 block">{ex.orgName}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3.5 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-slate-400" />
                          <span dir="ltr">{ex.phone}</span>
                        </div>
                        {ex.email && (
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-slate-400" />
                            <span>{ex.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Store size={14} className="text-slate-400" />
                          <span className="line-clamp-1">المعارض: {Array.from(ex.exhibitions).join('، ')}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block">إجمالي الحجوزات</span>
                          <span className="font-bold text-[#102E70]">{ex.bookingsCount} طلب ({ex.confirmedCount} مؤكد)</span>
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] text-slate-400 block">إجمالي المستحق</span>
                          <span className="font-bold text-[#0868E9]">{ex.totalSpent.toLocaleString()} ريال</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━ Tab 6: التقارير والإحصائيات (Analytics & Reports) ━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-[#102E70]">التقارير والإحصائيات التفاعلية</h2>
                <p className="text-xs text-slate-400">تحليل فوري لمعدلات إشغال الصالات والإيرادات المحققة</p>
              </div>

              {/* Analytics Breakdown Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Booth Status Distribution */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
                  <h3 className="font-bold text-base text-[#102E70] mb-1">توزيع حالات البوثات</h3>
                  <p className="text-xs text-slate-400 mb-6">نسبة توفر البوثات عبر جميع صالات معارضك</p>

                  <div className="space-y-4">
                    {[
                      { 
                        label: 'متاحة للحجز', 
                        count: booths.filter(b => b.status === 'available').length, 
                        color: 'bg-emerald-500', 
                        textColor: 'text-emerald-700',
                        bgSoft: 'bg-emerald-50' 
                      },
                      { 
                        label: 'محجوزة مؤكدة', 
                        count: booths.filter(b => b.status === 'booked').length, 
                        color: 'bg-[#0868E9]', 
                        textColor: 'text-[#0868E9]',
                        bgSoft: 'bg-blue-50' 
                      },
                      { 
                        label: 'قيد المراجعة (معلقة)', 
                        count: booths.filter(b => b.status === 'pending').length, 
                        color: 'bg-amber-500', 
                        textColor: 'text-amber-700',
                        bgSoft: 'bg-amber-50' 
                      },
                      { 
                        label: 'تحت الصيانة / غير متاحة', 
                        count: booths.filter(b => b.status === 'unavailable').length, 
                        color: 'bg-slate-400', 
                        textColor: 'text-slate-600',
                        bgSoft: 'bg-slate-100' 
                      },
                    ].map((item, i) => {
                      const pct = totalBoothsCount > 0 ? Math.round((item.count / totalBoothsCount) * 100) : 0;
                      return (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-700 flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                              <span>{item.label}</span>
                            </span>
                            <span className={item.textColor}>{item.count} بوث ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Financial Summary */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-[#102E70] mb-1">المؤشرات المالية للحجوزات</h3>
                    <p className="text-xs text-slate-400 mb-6">تفصيل الإيرادات المحققة فعلياً والقيمة قيد المعالجة</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                        <span className="text-xs text-emerald-800 font-bold block mb-1">الإيرادات المؤكدة</span>
                        <p className="text-2xl font-extrabold text-emerald-700">
                          {confirmedRevenue.toLocaleString()} <span className="text-xs font-normal">ريال</span>
                        </p>
                        <p className="text-[10px] text-emerald-600 mt-1">من {confirmedBookingsCount} حجز مؤكد</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                        <span className="text-xs text-amber-800 font-bold block mb-1">قيمة الطلبات المعلقة</span>
                        <p className="text-2xl font-extrabold text-amber-700">
                          {pendingRevenue.toLocaleString()} <span className="text-xs font-normal">ريال</span>
                        </p>
                        <p className="text-[10px] text-amber-600 mt-1">من {pendingBookingsCount} طلب قيد المراجعة</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 leading-relaxed">
                    <span className="font-bold text-[#102E70] block mb-1">ملاحظة الشفافية المالية:</span>
                    لا يتم احتساب مبالغ طلبات الحجز المعلقة كإيراد محصل إلا بعد تأكيد وقبول الطلب رسمياً من قبلك كمنظم.
                  </div>
                </div>

              </div>

              {/* Occupancy per Exhibition */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
                <h3 className="font-bold text-base text-[#102E70] mb-4">معدل الإشغال حسب كل معرض</h3>
                <div className="space-y-4">
                  {exhibitions.map(ex => {
                    const exBooths = booths.filter(b => b.exhibition_id === ex.id);
                    const total = exBooths.length || ex.total_booths || 0;
                    const booked = exBooths.filter(b => b.status === 'booked').length;
                    const rate = total > 0 ? Math.round((booked / total) * 100) : 0;

                    return (
                      <div key={ex.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="min-w-[200px]">
                          <h4 className="font-bold text-sm text-[#102E70]">{ex.title}</h4>
                          <span className="text-xs text-slate-400">{ex.city} - {ex.venue}</span>
                        </div>
                        <div className="flex-1 max-w-md">
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-slate-500">{booked} من {total} بوث</span>
                            <span className="text-[#0868E9]">{rate}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#0868E9] h-full rounded-full" style={{ width: `${rate}%` }}></div>
                          </div>
                        </div>
                        <Link
                          href={`/dashboard/organizer/exhibitions/${ex.id}/floorplan`}
                          className="px-3.5 py-1.5 bg-white border border-slate-200 text-[#0868E9] hover:bg-[#0868E9] hover:text-white rounded-xl text-xs font-bold transition-all text-center shrink-0"
                        >
                          المخطط
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━ Tab 7: المساعد الذكي (AI Assistant) ━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'ai' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs max-w-4xl mx-auto space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#102E70] to-[#0868E9] text-white flex items-center justify-center font-bold">
                  <Sparkles size={24} className="text-[#FF6D5C]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#102E70]">مستشار المنظم الذكي (Google Gemini)</h2>
                  <p className="text-xs text-slate-400">تحليل ذكي لمعارضك وبوثاتك واقتراح استراتيجيات تسعير وشروط مشاركة</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: 'صياغة وصف احترافي',
                    desc: 'توليد نبذة تسويقية جذابة لمعرضك لجذب أكبر عدد من العارضين والشركات.',
                    action: 'صياغة الوصف'
                  },
                  {
                    title: 'اقتراح تسعير البوثات',
                    desc: 'تحليل المساحات والمواقع الاستراتيجية قرب المداخل لاقتراح أسعار عادلة وتنافسية.',
                    action: 'اقتراح الأسعار'
                  },
                  {
                    title: 'شروط وبنود المشاركة',
                    desc: 'صياغة بنود تنظيمية متوافقة مع لوائح المعارض والمؤتمرات السعودية.',
                    action: 'توليد الشروط'
                  }
                ].map((c, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#102E70] mb-2">{c.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">{c.desc}</p>
                    </div>
                    <Link
                      href="/ai-assistant"
                      className="w-full py-2 bg-white border border-[#0868E9] text-[#0868E9] hover:bg-[#0868E9] hover:text-white rounded-xl text-xs font-bold text-center transition-all"
                    >
                      {c.action}
                    </Link>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-[#102E70] mb-1">هل لديك استفسار محدد حول إدارة المعارض؟</h4>
                  <p className="text-xs text-slate-600">المساعد الذكي مبرمج بالكامل على بيانات منصة بوث هب وأنظمتها.</p>
                </div>
                <Link
                  href="/ai-assistant"
                  className="px-5 py-2.5 bg-[#0868E9] text-white rounded-xl text-xs font-bold hover:bg-[#0868E9]/90 transition-colors shadow-sm shrink-0 text-center"
                >
                  فتح المحادثة الذكية
                </Link>
              </div>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━ Tab 8: الإشعارات (Notifications) ━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-[#0868E9]" />
                  <h2 className="text-lg font-bold text-[#102E70]">إشعارات النظام</h2>
                </div>
                <span className="text-xs text-slate-400">تحديثات فورية</span>
              </div>

              <div className="space-y-3">
                {bookings.slice(0, 8).map(b => (
                  <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#0868E9] flex items-center justify-center shrink-0 mt-0.5">
                      <CalendarCheck2 size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#102E70]">
                        طلب حجز جديد للبوث ({b.booth_number}) في {b.exhibition_title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        العارض: {b.contact_name} ({b.organization_name || 'فردي'}) • القيمة: {b.total_amount} ريال
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {new Date(b.created_at).toLocaleString('ar-SA')}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="text-xs text-[#0868E9] font-bold hover:underline shrink-0"
                    >
                      معاينة
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━ Tab 9: الإعدادات (Settings) ━━━━━━━━━━━━━━━━━━━━ */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <Settings size={20} className="text-[#0868E9]" />
                <h2 className="text-lg font-bold text-[#102E70]">إعدادات حساب المنظم</h2>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    disabled
                    value={profile?.full_name || ''}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">البريد الإلكتروني المعتمد</label>
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ''}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الجوال</label>
                  <input
                    type="tel"
                    disabled
                    value={profile?.phone || 'غير مسجل'}
                    dir="ltr"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نوع الحساب</label>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl font-bold">
                    <ShieldCheck size={14} />
                    <span>منظم معارض معتمد</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ━━━━━━━━━━━━━━━━━━━━ Slide-over Drawer: تفاصيل الحجز ━━━━━━━━━━━━━━━━━━━━ */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[11px] font-mono font-bold text-[#0868E9] block">
                  {selectedBooking.booking_reference}
                </span>
                <h3 className="font-bold text-base text-[#102E70]">تفاصيل طلب الحجز</h3>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              
              {/* Status Badge Alert */}
              <div className={`p-4 rounded-2xl flex items-center justify-between border ${
                selectedBooking.status === 'confirmed' ? 'bg-green-50 border-green-200 text-green-800' :
                selectedBooking.status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span className="font-bold">
                    حالة الطلب: {selectedBooking.status === 'confirmed' ? 'حجز مؤكد' : selectedBooking.status === 'pending' ? 'بانتظار المراجعة والقبول' : 'مرفوض'}
                  </span>
                </div>
              </div>

              {/* 1. Exhibitor Details */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">بيانات العارض</span>
                <div className="flex justify-between">
                  <span className="text-slate-500">اسم العارض:</span>
                  <span className="font-bold text-[#102E70]">{selectedBooking.contact_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">المنشأة / الشركة:</span>
                  <span className="font-bold text-slate-700">{selectedBooking.organization_name || 'فردي'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم الجوال:</span>
                  <span className="font-bold text-slate-700" dir="ltr">{selectedBooking.contact_phone}</span>
                </div>
                {selectedBooking.contact_email && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">البريد الإلكتروني:</span>
                    <span className="font-bold text-slate-700 font-mono">{selectedBooking.contact_email}</span>
                  </div>
                )}
              </div>

              {/* 2. Exhibition Details */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">بيانات المعرض</span>
                <div className="flex justify-between">
                  <span className="text-slate-500">اسم المعرض:</span>
                  <span className="font-bold text-[#102E70]">{selectedBooking.exhibition_title}</span>
                </div>
                {selectedBooking.exhibition_city && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">الموقع والمقر:</span>
                    <span className="font-bold text-slate-700">{selectedBooking.exhibition_city} - {selectedBooking.exhibition_venue}</span>
                  </div>
                )}
                {selectedBooking.exhibition_dates && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">الفترة:</span>
                    <span className="font-bold text-slate-700">{selectedBooking.exhibition_dates}</span>
                  </div>
                )}
              </div>

              {/* 3. Booth Details */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">بيانات البوث</span>
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم البوث:</span>
                  <span className="font-bold text-[#0868E9] text-sm">بوث {selectedBooking.booth_number}</span>
                </div>
                {selectedBooking.booth_size_sqm && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">المساحة الإجمالية:</span>
                    <span className="font-bold text-slate-700">{selectedBooking.booth_size_sqm} م²</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">سعر الحجز المعتمد:</span>
                  <span className="font-bold text-slate-700">{selectedBooking.total_amount.toLocaleString()} ريال</span>
                </div>
                <div className="pt-2 border-t border-slate-200/60">
                  <Link
                    href={`/dashboard/organizer/exhibitions/${selectedBooking.exhibition_id}/floorplan`}
                    className="w-full py-2 bg-white border border-slate-200 text-[#0868E9] hover:bg-[#EDF5FF] rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Layers size={14} />
                    <span>معاينة موقع البوث على المخطط</span>
                  </Link>
                </div>
              </div>

              {/* 4. Financial Status */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">المبلغ والسداد</span>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-semibold">المبلغ الإجمالي:</span>
                  <span className="font-extrabold text-[#102E70]">{selectedBooking.total_amount.toLocaleString()} {selectedBooking.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">حالة السداد:</span>
                  <span className="font-bold text-emerald-600">
                    {selectedBooking.payment_status === 'paid' ? 'مدفوع' : 'في انتظار السداد'}
                  </span>
                </div>
              </div>

            </div>

            {/* Drawer Actions */}
            <div className="p-6 border-t border-slate-100 bg-white space-y-2">
              {selectedBooking.status === 'pending' ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    disabled={actionLoading === selectedBooking.id}
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}
                    className="py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm text-xs disabled:opacity-50"
                  >
                    {actionLoading === selectedBooking.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    <span>قبول وتأكيد الحجز</span>
                  </button>
                  <button
                    disabled={actionLoading === selectedBooking.id}
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'rejected')}
                    className="py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                  >
                    <X size={16} />
                    <span>رفض الطلب</span>
                  </button>
                </div>
              ) : selectedBooking.status === 'confirmed' ? (
                <div className="p-3 bg-green-50 text-green-700 text-center rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>هذا الحجز مؤكد ولا يوجد تعارض</span>
                </div>
              ) : (
                <div className="p-3 bg-slate-100 text-slate-500 text-center rounded-xl font-bold text-xs">
                  تم رفض هذا الطلب مسبقاً
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ Modals: Edit, Hide, Safe Delete ━━━━━━━━━━━━━━━━━━━━ */}

      {/* 1. Edit Exhibition Modal */}
      <EditExhibitionModal
        exhibition={editingExhibition}
        isOpen={!!editingExhibition}
        onClose={() => setEditingExhibition(null)}
        onSuccess={handleRefreshExhibitions}
        onDelete={(ex) => {
          setEditingExhibition(null);
          handleDeleteRequest(ex);
        }}
      />

      {/* 2. Hide Confirmation Modal */}
      {mounted && hidingExhibition && createPortal(
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right animate-in fade-in zoom-in-95 duration-200" dir="rtl">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <EyeOff size={24} />
            </div>

            <h3 className="text-lg font-bold text-[#102E70] mb-2">إخفاء المعرض</h3>
            <p className="text-xs text-slate-500 font-bold mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {hidingExhibition.title}
            </p>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              هل تريد إخفاء هذا المعرض؟ لن يظهر المعرض للعارضين أثناء فترة الإخفاء، وستبقى بياناته وبوثاتك وحجوزاته محفوظة.
            </p>

            {bookings.some(b => b.exhibition_id === hidingExhibition.id && ['pending', 'confirmed'].includes(b.status)) && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0 text-amber-600" />
                <span>تنبيه: توجد حجوزات نشطة في هذا المعرض وستبقى التزاماتها قائمة.</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isExhibitionActionLoading}
                onClick={() => handleToggleHide(hidingExhibition)}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isExhibitionActionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                <span>تأكيد الإخفاء</span>
              </button>
              <button
                type="button"
                disabled={isExhibitionActionLoading}
                onClick={() => setHidingExhibition(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 3. Safe Delete Confirmation Modal (Direct & Reliable Confirmation) */}
      {mounted && deleteExhibitionModal && createPortal(
        <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-right animate-in fade-in zoom-in-95 duration-200 relative my-auto" dir="rtl">
            <button
              onClick={() => setDeleteExhibitionModal(null)}
              disabled={isExhibitionActionLoading}
              className="absolute top-5 left-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>

            <h3 className="text-lg font-bold text-[#102E70] mb-1">تأكيد حذف المعرض</h3>
            <p className="text-xs text-red-600 font-medium mb-4">
              تحذير: سيتم حذف هذا المعرض نهائياً مع كافة الصالات والبوثات وسجلات الحجز المرتبطة به.
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">اسم المعرض:</span>
                <span className="font-extrabold text-[#102E70]">{deleteExhibitionModal.title}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">المدينة والمقر:</span>
                <span className="font-medium text-slate-700">{deleteExhibitionModal.city} - {deleteExhibitionModal.venue}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">إجمالي البوثات التابعة:</span>
                <span className="font-bold text-slate-700">
                  {booths.filter(b => b.exhibition_id === deleteExhibitionModal.id).length || deleteExhibitionModal.total_booths || 0} بوث
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">سجلات الحجز المرتبطة:</span>
                <span className="font-bold text-slate-700">
                  {bookings.filter(b => b.exhibition_id === deleteExhibitionModal.id).length} حجز
                </span>
              </div>
            </div>

            {deleteModalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{deleteModalError}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isExhibitionActionLoading}
                onClick={handleConfirmDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-600/20 disabled:opacity-50"
              >
                {isExhibitionActionLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>نعم، تأكيد حذف المعرض نهائياً</span>
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={isExhibitionActionLoading}
                onClick={() => setDeleteExhibitionModal(null)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
