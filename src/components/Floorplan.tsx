"use client"
import { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, CheckCircle2, AlertCircle, Loader2, Store, X } from 'lucide-react';
import Link from 'next/link';
import { getExhibitionBooths, createBooking, BoothData } from '@/app/actions/bookings';
import { createClient } from '@/lib/supabase/client';

export default function Floorplan({ exhibitionId }: { exhibitionId: string }) {
  const [booths, setBooths] = useState<BoothData[]>([]);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [selectedBooth, setSelectedBooth] = useState<BoothData | null>(null);

  // Booking modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [orgName, setOrgName] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getExhibitionBooths(exhibitionId);
        setBooths(data);

        // Pre-fill user data if logged in
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
          setContactName(user.user_metadata?.full_name || '');
          setContactPhone(user.user_metadata?.phone || '');
          setOrgName(user.user_metadata?.organization_name || '');
        }
      } catch (e) {
        console.error('Error loading booths:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [exhibitionId]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.6));
  const handleReset = () => setScale(1);

  const getStatusColor = (status: string, isSelected: boolean) => {
    if (isSelected) return 'fill-primary stroke-primary-dark stroke-[3] filter drop-shadow(0 4px 6px rgba(8,104,233,0.3))';
    switch (status) {
      case 'available': return 'fill-green-100 stroke-green-500 hover:fill-green-200 cursor-pointer transition-all';
      case 'booked': return 'fill-red-100 stroke-coral cursor-not-allowed opacity-90';
      case 'unavailable': return 'fill-gray-200 stroke-gray-400 cursor-not-allowed';
      default: return 'fill-white stroke-gray-300';
    }
  };

  const handleStartBooking = () => {
    setBookingError(null);
    setBookingSuccess(null);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooth) return;

    setBookingLoading(true);
    setBookingError(null);

    try {
      const res = await createBooking({
        boothId: selectedBooth.id,
        exhibitionId,
        organizationName: orgName,
        contactName,
        contactPhone
      });

      if (!res.success) {
        if (res.requireAuth) {
          setBookingError('يرجى تسجيل الدخول أولاً لحجز هذا البوث.');
        } else {
          setBookingError(res.error || 'فشل إتمام الحجز');
        }
      } else {
        setBookingSuccess({
          reference: res.bookingReference,
          boothNumber: selectedBooth.number,
          price: selectedBooth.price
        });
        // Update local status of the booked booth
        setBooths(prev => prev.map(b => b.id === selectedBooth.id ? { ...b, status: 'booked' } : b));
        setSelectedBooth(prev => prev ? { ...prev, status: 'booked' } : null);
      }
    } catch (err: any) {
      setBookingError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative">
      {/* Floorplan Viewer */}
      <div className="flex-1 bg-white border border-border rounded-2xl overflow-hidden relative shadow-sm flex flex-col h-[520px]">
        {/* Toolbar */}
        <div className="bg-secondary-bg p-3 border-b border-border flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-primary-dark">المخطط الهندسي التفاعلي</span>
            <span className="text-xs bg-light-blue-bg text-primary px-2.5 py-0.5 rounded-full font-medium">
              {booths.filter(b => b.status === 'available').length} بوث متاح
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleZoomIn} className="p-1.5 bg-white border border-border rounded-lg hover:bg-gray-50 text-foreground" title="تكبير">
              <ZoomIn size={18} />
            </button>
            <button onClick={handleZoomOut} className="p-1.5 bg-white border border-border rounded-lg hover:bg-gray-50 text-foreground" title="تصغير">
              <ZoomOut size={18} />
            </button>
            <button onClick={handleReset} className="p-1.5 bg-white border border-border rounded-lg hover:bg-gray-50 text-foreground" title="إعادة ضبط">
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 overflow-auto relative bg-[#F8FAFC] flex items-center justify-center p-8 select-none">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-foreground">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm">جاري تحميل مخطط القاعة...</p>
            </div>
          ) : (
            <div 
              className="relative transition-transform duration-200 origin-center"
              style={{ transform: `scale(${scale})` }}
            >
              {/* Floorplan SVG Hall */}
              {(() => {
                // Determine hall meter bounds
                const firstBooth = booths[0];
                const hallMetersW = firstBooth?.hallWidth ? Number(firstBooth.hallWidth) : 40;
                const hallMetersH = firstBooth?.hallHeight ? Number(firstBooth.hallHeight) : 30;

                // Check if booths are stored in meters (e.g. max x < 200) or pixels
                const maxX = Math.max(...booths.map(b => b.x + b.width), 0);
                const isMeterScale = maxX <= hallMetersW + 5;
                const ppm = isMeterScale ? 16 : 1; // Pixels per unit

                const svgWidth = isMeterScale ? Math.max(hallMetersW * ppm, 420) : 420;
                const svgHeight = isMeterScale ? Math.max(hallMetersH * ppm, 350) : 420;

                return (
                  <svg width={svgWidth} height={svgHeight} className="bg-white border-2 border-slate-300 shadow-md rounded-xl">
                    {/* Hall Walls & Outline */}
                    <rect x="10" y="10" width={svgWidth - 20} height={svgHeight - 20} fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="6,4" />
                    
                    {/* Main Entrance */}
                    <rect x={svgWidth / 2 - 50} y={svgHeight - 16} width="100" height="10" fill="#0868E9" rx="3" />
                    <text x={svgWidth / 2} y={svgHeight - 22} fontSize="11" fontWeight="bold" fill="#0868E9" textAnchor="middle">المدخل الرئيسي</text>

                    {/* Emergency Exit */}
                    <rect x={svgWidth / 2 - 40} y="8" width="80" height="8" fill="#FF6D5C" rx="2" />
                    <text x={svgWidth / 2} y="26" fontSize="10" fill="#FF6D5C" textAnchor="middle">مخرج طوارئ</text>

                    {/* Booths */}
                    {booths.map((booth) => {
                      const isSelected = selectedBooth?.id === booth.id;
                      const bx = isMeterScale ? (booth.x * ppm) + 10 : booth.x;
                      const by = isMeterScale ? (booth.y * ppm) + 10 : booth.y;
                      const bw = isMeterScale ? booth.width * ppm : booth.width;
                      const bh = isMeterScale ? booth.height * ppm : booth.height;

                      return (
                        <g 
                          key={booth.id} 
                          onClick={() => {
                            if (booth.status === 'available') {
                              setSelectedBooth(booth);
                            }
                          }}
                          className="cursor-pointer"
                        >
                          <rect
                            x={bx}
                            y={by}
                            width={bw}
                            height={bh}
                            rx="6"
                            className={getStatusColor(booth.status, isSelected)}
                          />
                          <text
                            x={bx + bw / 2}
                            y={by + bh / 2 - 4}
                            fontSize={Math.max(10, Math.min(13, bw / 4))}
                            fontWeight="bold"
                            fill={isSelected ? '#ffffff' : (booth.status === 'available' ? '#15803D' : (booth.status === 'booked' ? '#DC2626' : '#64748B'))}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="pointer-events-none"
                          >
                            {booth.number}
                          </text>
                          <text
                            x={bx + bw / 2}
                            y={by + bh / 2 + 10}
                            fontSize={Math.max(8, Math.min(10, bw / 5))}
                            fill={isSelected ? '#E0E7FF' : '#64748B'}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="pointer-events-none"
                          >
                            {booth.size_sqm}م²
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="bg-white p-3 border-t border-border flex flex-wrap justify-center gap-6 text-xs text-foreground z-10">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-100 border border-green-500 rounded-sm inline-block"></span>
            متاح للحجز
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-100 border border-coral rounded-sm inline-block"></span>
            محجوز
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-gray-200 border border-gray-400 rounded-sm inline-block"></span>
            تحت الصيانة
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-primary rounded-sm inline-block"></span>
            محدد حالياً
          </div>
        </div>
      </div>

      {/* Selected Booth Details Card */}
      <div className="lg:w-80 flex-shrink-0">
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm sticky top-24">
          {selectedBooth ? (
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div>
                  <span className="text-xs text-gray-500">تفاصيل الموقع</span>
                  <h3 className="font-bold text-2xl text-primary-dark">بوث {selectedBooth.number}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedBooth.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {selectedBooth.status === 'available' ? 'متاح للحجز' : 'محجوز'}
                </span>
              </div>
              
              <div className="space-y-3.5 mb-6 text-sm">
                <div className="flex justify-between pb-2 border-b border-border/60">
                  <span className="text-foreground">المساحة الإجمالية</span>
                  <span className="font-bold text-primary-dark">{selectedBooth.size_sqm} متر مربع</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-border/60">
                  <span className="text-foreground">سعر الحجز</span>
                  <span className="font-bold text-primary text-lg">{selectedBooth.price.toLocaleString()} ريال</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-border/60">
                  <span className="text-foreground">حالة التأكيد</span>
                  <span className="font-medium text-gray-700">فوري ومؤكد</span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-xs text-primary-dark mb-2 uppercase text-gray-400">التجهيزات المشمولة:</h4>
                <ul className="text-xs text-foreground space-y-1.5">
                  {(selectedBooth.amenities && selectedBooth.amenities.length > 0 ? selectedBooth.amenities : ['طاقة كهربائية', 'طاولة وكراسي', 'اسم الشركة على الواجهة']).map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedBooth.status === 'available' ? (
                <button 
                  onClick={handleStartBooking}
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm"
                >
                  احجز هذا البوث الآن
                </button>
              ) : (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-center text-xs font-medium">
                  هذا البوث محجوز ولا يمكن إتمام الحجز عليه
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-16">
              <Store size={44} className="mb-4 opacity-25" />
              <p className="font-medium text-sm text-primary-dark mb-1">اختر بوثاً من المخطط</p>
              <p className="text-xs text-foreground">انقر على أي بوث أخضر لعرض سعره ومساحته وتجهيزاته وبدء الحجز.</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Form Modal */}
      {isModalOpen && selectedBooth && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-border relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-bold text-primary-dark mb-2">تم تأكيد طلب الحجز بنجاح!</h3>
                <p className="text-foreground text-sm mb-6">
                  تم تسجيل حجز البوث رقم <span className="font-bold text-primary">{bookingSuccess.boothNumber}</span>.
                </p>
                <div className="bg-secondary-bg p-4 rounded-2xl border border-border mb-6 text-right text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">رقم الحجز المرجعي:</span>
                    <span className="font-mono font-bold text-primary-dark">{bookingSuccess.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">المبلغ الإجمالي:</span>
                    <span className="font-bold text-primary">{bookingSuccess.price} ريال</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">الحالة:</span>
                    <span className="text-amber-600 font-medium">قيد المراجعة</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link 
                    href="/dashboard/exhibitor"
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 text-center"
                  >
                    عرض في لوحة حجوزاتي
                  </Link>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 border border-border rounded-xl font-medium text-sm text-foreground hover:bg-gray-50"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-primary-dark mb-1">إكمال طلب حجز بوث {selectedBooth.number}</h3>
                <p className="text-xs text-foreground mb-6">يرجى تأكيد بيانات الاتصال الخاصة بالعارض لإتمام حجز البوث.</p>

                {bookingError && (
                  <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0 text-red-500" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {!currentUser && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center justify-between">
                    <span>لإتمام الحجز، يلزم تسجيل الدخول أو إنشاء حساب عارض.</span>
                    <Link href="/login" className="font-bold text-primary hover:underline">تسجيل الدخول</Link>
                  </div>
                )}

                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-primary-dark block mb-1">اسم الشركة أو الجهة العارضة</label>
                    <input 
                      type="text" 
                      value={orgName} 
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="مثال: شركة الحلول المتقدمة"
                      className="w-full px-4 py-2.5 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-primary-dark block mb-1">اسم مسؤول التواصل *</label>
                      <input 
                        type="text" 
                        required
                        value={contactName} 
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="الاسم الثلاثي"
                        className="w-full px-4 py-2.5 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-primary-dark block mb-1">رقم الجوال *</label>
                      <input 
                        type="tel" 
                        required
                        value={contactPhone} 
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="05xxxxxxxx"
                        dir="ltr"
                        className="w-full px-4 py-2.5 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-light-blue-bg/60 rounded-2xl border border-primary/10 text-xs space-y-1.5 text-primary-dark">
                    <div className="flex justify-between font-bold">
                      <span>قيمة البوث المستحقة:</span>
                      <span className="text-primary text-sm">{selectedBooth.price.toLocaleString()} ريال سعودي</span>
                    </div>
                    <p className="text-gray-500">يشمل الحجز التجهيزات الأساسية والدعم الفني طيلة أيام المعرض.</p>
                  </div>

                  <button 
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {bookingLoading && <Loader2 size={16} className="animate-spin" />}
                    <span>{bookingLoading ? 'جاري تأكيد الحجز...' : 'تأكيد إرسال طلب الحجز'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
