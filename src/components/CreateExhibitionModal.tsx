"use client"
import { useState } from 'react';
import { Plus, X, Loader2, CheckCircle2, AlertCircle, MapPin, Layers, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createExhibition } from '@/app/actions/exhibitions';
import { SAUDI_REGIONS } from '@/lib/saudi-regions';
import FloorplanEditor from '@/components/FloorplanEditor';
import ImageUploadArea from '@/components/ImageUploadArea';

export default function CreateExhibitionModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Wizard Step: 'basic' (Step 1) or 'floorplan' (Step 2)
  const [step, setStep] = useState<'basic' | 'floorplan'>('basic');
  const [createdExhibitionId, setCreatedExhibitionId] = useState<string | null>(null);
  const [createdExhibitionTitle, setCreatedExhibitionTitle] = useState<string>('');

  // Region and City States
  const [selectedRegionId, setSelectedRegionId] = useState<string>('qassim');
  const currentRegion = SAUDI_REGIONS.find((r) => r.id === selectedRegionId) || SAUDI_REGIONS[0];
  const [selectedCity, setSelectedCity] = useState<string>('بريدة');

  const handleRegionChange = (newRegionId: string) => {
    setSelectedRegionId(newRegionId);
    const reg = SAUDI_REGIONS.find((r) => r.id === newRegionId);
    if (reg && reg.cities.length > 0) {
      setSelectedCity(reg.cities[0]);
    }
  };

  const handleBasicSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('city', selectedCity);
    formData.set('region', currentRegion.shortName);

    const titleVal = (formData.get('title') as string) || 'معرض جديد';

    try {
      const res = await createExhibition(formData);
      if (!res.success) {
        setError(res.error || 'فشل حفظ بيانات المعرض الأساسية');
      } else if (res.exhibitionId) {
        setCreatedExhibitionId(res.exhibitionId);
        setCreatedExhibitionTitle(titleVal);
        // Advance to Step 2: Interactive Floorplan Design
        setStep('floorplan');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep('basic');
    setCreatedExhibitionId(null);
    setError(null);
    setSuccess(false);
  };

  const handleFloorplanSaved = () => {
    setSuccess(true);
    setTimeout(() => {
      handleClose();
      window.location.reload();
    }, 1200);
  };

  return (
    <>
      <button 
        onClick={() => {
          setIsOpen(true);
          setStep('basic');
        }}
        className="flex items-center gap-2 bg-[#0868E9] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0868E9]/90 transition-all shadow-md shadow-[#0868E9]/20"
      >
        <Plus size={16} />
        <span>إنشاء معرض جديد</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {step === 'basic' ? (
            /* STEP 1: Basic Exhibition Information */
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-[#E2E8F0] relative animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto text-right" dir="rtl">
              <button 
                onClick={handleClose}
                className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={20} />
              </button>

              {/* Progress Steps Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#0868E9] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  1
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#102E70]">الخطوة 1: البيانات الأساسية للمعرض</h2>
                  <p className="text-xs text-[#65789A]">أدخل تفاصيل المعرض أولاً، ثم سننتقل إلى تصميم وتوزيع مخطط البوثات.</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleBasicSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#102E70] block mb-1">اسم المعرض *</label>
                  <input 
                    type="text" 
                    name="title" 
                    required 
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
                    placeholder="نبذة شاملة عن أهداف المعرض والفئات المستهدفة للمستأجرين والزوار..."
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0868E9] resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#102E70] block mb-1">التصنيف *</label>
                  <select 
                    name="category" 
                    required
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
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0868E9]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#102E70] block mb-1">تاريخ النهاية *</label>
                    <input 
                      type="date" 
                      name="endDate" 
                      required
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0868E9]"
                    />
                  </div>
                </div>

                {/* Cover Image Upload */}
                <ImageUploadArea name="cover_image" />

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#0868E9] text-white rounded-xl font-bold hover:bg-[#0868E9]/90 transition-all shadow-lg shadow-[#0868E9]/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>جاري حفظ البيانات الأساسية...</span>
                    </>
                  ) : (
                    <>
                      <span>التالي: الانتقال لتصميم مخطط المعرض والبوثات</span>
                      <ArrowLeft size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* STEP 2: Interactive Floor Plan Designer (Embedded full modal view) */
            <div className="bg-white rounded-3xl w-full max-w-7xl h-[94vh] shadow-2xl border border-[#E2E8F0] relative overflow-hidden flex flex-col text-right animate-in fade-in duration-200" dir="rtl">
              <FloorplanEditor
                exhibitionId={createdExhibitionId!}
                exhibitionTitle={createdExhibitionTitle}
                initialHall={{ width_m: 40, height_m: 30, total_area_sqm: 1200 }}
                onSaved={handleFloorplanSaved}
                onCancel={handleClose}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
