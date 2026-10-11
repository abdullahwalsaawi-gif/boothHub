"use client"
import { useState } from 'react';
import { Plus, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { createExhibition } from '@/app/actions/exhibitions';

export default function CreateExhibitionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await createExhibition(formData);
      if (!res.success) {
        setError(res.error || 'فشل إنشاء المعرض');
      } else {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          window.location.reload();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
      >
        <Plus size={16} />
        <span>إنشاء معرض جديد</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-border relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold text-primary-dark mb-1">إنشاء معرض جديد</h2>
            <p className="text-xs text-foreground mb-6">أدخل البيانات الأساسية لنشر المعرض وإتاحة حجز البوثات للمستأجرين.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0 text-green-500" />
                <span>تم إنشاء المعرض وإضافة البوثات الافتراضية بنجاح!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-right">
              <div>
                <label className="text-xs font-bold text-primary-dark block mb-1">اسم المعرض *</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  placeholder="مثال: معرض الابتكار والذكاء الاصطناعي 2026"
                  className="w-full px-4 py-2.5 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-primary-dark block mb-1">وصف المعرض *</label>
                <textarea 
                  name="description" 
                  rows={3}
                  required 
                  placeholder="نبذة شاملة عن أهداف المعرض والفئات المستهدفة..."
                  className="w-full px-4 py-2.5 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-primary-dark block mb-1">التصنيف *</label>
                  <select 
                    name="category" 
                    required
                    className="w-full px-4 py-2.5 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="تقنية">تقنية</option>
                    <option value="ثقافة">ثقافة</option>
                    <option value="عقارات">عقارات</option>
                    <option value="أغذية">أغذية</option>
                    <option value="صحة">صحة</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-primary-dark block mb-1">المدينة *</label>
                  <select 
                    name="city" 
                    required
                    className="w-full px-4 py-2.5 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="الرياض">الرياض</option>
                    <option value="جدة">جدة</option>
                    <option value="الدمام">الدمام</option>
                    <option value="مكة المكرمة">مكة المكرمة</option>
                    <option value="المدينة المنورة">المدينة المنورة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-primary-dark block mb-1">موقع القاعة أو المركز *</label>
                <input 
                  type="text" 
                  name="venue" 
                  required 
                  placeholder="مثال: واجهة الرياض للمعارض"
                  className="w-full px-4 py-2.5 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-primary-dark block mb-1">تاريخ البداية *</label>
                  <input 
                    type="date" 
                    name="startDate" 
                    required
                    className="w-full px-4 py-2.5 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-primary-dark block mb-1">تاريخ النهاية *</label>
                  <input 
                    type="date" 
                    name="endDate" 
                    required
                    className="w-full px-4 py-2.5 bg-secondary-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-4"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                <span>{loading ? 'جاري الحفظ والنشر...' : 'حفظ ونشر المعرض'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
