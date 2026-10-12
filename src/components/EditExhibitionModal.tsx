"use client"
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, AlertCircle, CheckCircle2, MapPin, Edit3, Trash2 } from 'lucide-react';
import { Exhibition, updateExhibition } from '@/app/actions/exhibitions';
import { SAUDI_REGIONS } from '@/lib/saudi-regions';
import ImageUploadArea from '@/components/ImageUploadArea';

interface EditExhibitionModalProps {
  exhibition: Exhibition | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDelete?: (exhibition: Exhibition) => void;
}

export default function EditExhibitionModal({
  exhibition,
  isOpen,
  onClose,
  onSuccess,
  onDelete
}: EditExhibitionModalProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Region and City States
  const [selectedRegionId, setSelectedRegionId] = useState<string>('qassim');
  const [selectedCity, setSelectedCity] = useState<string>('بريدة');

  useEffect(() => {
    if (exhibition) {
      // Find matching region for exhibition.city
      let foundRegionId = 'riyadh';
      for (const reg of SAUDI_REGIONS) {
        if (reg.cities.some(c => c === exhibition.city || exhibition.city?.includes(c))) {
          foundRegionId = reg.id;
          break;
        }
      }
      setSelectedRegionId(foundRegionId);
      setSelectedCity(exhibition.city || 'الرياض');
      setError(null);
      setSuccess(false);
    }
  }, [exhibition]);

  const currentRegion = SAUDI_REGIONS.find((r) => r.id === selectedRegionId) || SAUDI_REGIONS[0];

  const handleRegionChange = (newRegionId: string) => {
    setSelectedRegionId(newRegionId);
    const reg = SAUDI_REGIONS.find((r) => r.id === newRegionId);
    if (reg && reg.cities.length > 0) {
      setSelectedCity(reg.cities[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('id', exhibition?.id || '');
    formData.set('city', selectedCity);

    try {
      const res = await updateExhibition(formData);
      if (!res.success) {
        setError(res.error || 'فشل تحديث بيانات المعرض');
      } else {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !exhibition || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto text-right my-auto"
        dir="rtl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
            <Edit3 size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#102E70]">تعديل بيانات المعرض</h2>
            <p className="text-xs text-[#65789A]">تعديل التفاصيل الأساسية والصورة الرئيسية للمعرض</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
            <span>تم حفظ التعديلات بنجاح!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#102E70] block mb-1">اسم المعرض *</label>
            <input 
              type="text" 
              name="title" 
              required 
              defaultValue={exhibition.title}
              placeholder="مثال: معرض الابتكار والذكاء الاصطناعي 2026"
              className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0868E9]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#102E70] block mb-1">وصف المعرض *</label>
            <textarea 
              name="description" 
              rows={3}
              required 
              defaultValue={exhibition.description}
              placeholder="نبذة شاملة عن أهداف المعرض..."
              className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0868E9] resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#102E70] block mb-1">التصنيف *</label>
            <select 
              name="category" 
              required
              defaultValue={exhibition.category}
              className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0868E9] font-medium"
            >
              <option value="تقنية">تقنية</option>
              <option value="عقارات">عقارات</option>
              <option value="أغذية">أغذية</option>
              <option value="تراث وثقافة">تراث وثقافة</option>
              <option value="ثقافة">ثقافة وكتب</option>
              <option value="صحة">صحة</option>
            </select>
          </div>

          {/* Saudi Region & City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
            <div>
              <label className="text-xs font-bold text-[#102E70] flex items-center gap-1.5 mb-1">
                <MapPin size={14} className="text-[#0868E9]" />
                <span>المنطقة *</span>
              </label>
              <select 
                value={selectedRegionId} 
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0868E9] font-medium text-[#102E70]"
              >
                {SAUDI_REGIONS.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#102E70] flex items-center gap-1.5 mb-1">
                <MapPin size={14} className="text-[#FF6D5C]" />
                <span>المدينة / المحافظة *</span>
              </label>
              <select 
                name="city"
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0868E9] font-medium text-[#102E70]"
              >
                <optgroup label={currentRegion.name}>
                  {currentRegion.cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#102E70] block mb-1">موقع القاعة أو المركز *</label>
            <input 
              type="text" 
              name="venue" 
              required 
              defaultValue={exhibition.venue}
              placeholder="مثال: مركز القصيم الدولي للمؤتمرات والمعارض - بريدة"
              className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0868E9]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#102E70] block mb-1">تاريخ البداية *</label>
              <input 
                type="date" 
                name="startDate" 
                required
                defaultValue={exhibition.start_date?.split('T')[0]}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0868E9]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#102E70] block mb-1">تاريخ النهاية *</label>
              <input 
                type="date" 
                name="endDate" 
                required
                defaultValue={exhibition.end_date?.split('T')[0]}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0868E9]"
              />
            </div>
          </div>

          {/* Image Upload Area */}
          <ImageUploadArea 
            name="cover_image" 
            initialImageUrl={exhibition.cover_image_url} 
          />

          <div className="flex items-center gap-3 pt-3">
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#0868E9] text-white rounded-xl font-bold hover:bg-[#0868E9]/90 transition-all shadow-md shadow-[#0868E9]/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <span>حفظ التعديلات</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>

          {onDelete && (
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-red-600 block">إجراءات متقدمة</span>
                <span className="text-[11px] text-slate-400">حذف هذا المعرض نهائياً مع كافة الصالات والبوثات التابعة</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(exhibition);
                }}
                className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>حذف المعرض</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>,
    document.body
  );
}
