"use client"
import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCcw, Plus, Copy, Trash2, RotateCw, Save, 
  Move, CheckCircle2, AlertCircle, Eye, Layers, Grid, Info, DollarSign,
  Maximize2, ArrowRight, ShieldCheck, Sparkles, RefreshCw
} from 'lucide-react';
import { BoothInput, HallDimensions, saveExhibitionFloorplan } from '@/app/actions/floorplan';

interface FloorplanEditorProps {
  exhibitionId: string
  exhibitionTitle: string
  initialHall?: HallDimensions
  initialBooths?: BoothInput[]
  bookedBoothIds?: string[]
  onSaved?: () => void
  onCancel?: () => void
}

export default function FloorplanEditor({
  exhibitionId,
  exhibitionTitle,
  initialHall = { width_m: 40, height_m: 30, total_area_sqm: 1200 },
  initialBooths = [],
  bookedBoothIds = [],
  onSaved,
  onCancel
}: FloorplanEditorProps) {
  // 1. Hall Dimensions State
  const [hall, setHall] = useState<HallDimensions>(initialHall);
  
  // 2. Booths State
  const [booths, setBooths] = useState<BoothInput[]>(() => {
    if (initialBooths.length > 0) return initialBooths;
    // Default initial 10 booths with grid layout
    return generateDefaultBooths(10, initialHall.width_m, initialHall.height_m);
  });

  // Selected booth for sidebar
  const [selectedBoothIndex, setSelectedBoothIndex] = useState<number | null>(0);

  // 3. Number of booths mass-generator state
  const [targetCount, setTargetCount] = useState<number>(booths.length || 10);
  const [defaultBoothWidth, setDefaultBoothWidth] = useState<number>(3);
  const [defaultBoothHeight, setDefaultBoothHeight] = useState<number>(3);
  const [defaultPricePerSqm, setDefaultPricePerSqm] = useState<number>(500);

  // Pricing mode state: uniform | per_sqm | custom
  const [pricingMode, setPricingMode] = useState<'per_sqm' | 'uniform' | 'custom'>('per_sqm');
  const [uniformPrice, setUniformPrice] = useState<number>(4500);

  // 4. Canvas Viewport States
  const [zoom, setZoom] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Dragging State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragBoothIndex, setDragBoothIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Feedback States
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // History for Undo / Redo
  const [history, setHistory] = useState<BoothInput[][]>([]);
  const [redoStack, setRedoStack] = useState<BoothInput[][]>([]);

  const svgRef = useRef<SVGSVGElement>(null);

  // Conversion: Visual scale (pixels per meter inside the canvas SVG)
  // Let canvas inner coordinate system be: 1 meter = 20 pixels
  const PPM = 20; // Pixels Per Meter
  const canvasWidthPx = Math.max(hall.width_m * PPM, 300);
  const canvasHeightPx = Math.max(hall.height_m * PPM, 200);

  const bookedSet = new Set(bookedBoothIds);

  // Save history snapshot before modifications
  const pushHistory = () => {
    setHistory(prev => [...prev.slice(-15), JSON.parse(JSON.stringify(booths))]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack(prev => [...prev, JSON.parse(JSON.stringify(booths))]);
    setBooths(previous);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(booths))]);
    setBooths(next);
    setRedoStack(prev => prev.slice(0, -1));
  };

  // Helper generator for auto-layout
  function generateDefaultBooths(count: number, hWidth: number, hHeight: number): BoothInput[] {
    const list: BoothInput[] = [];
    const bW = defaultBoothWidth;
    const bH = defaultBoothHeight;
    const area = bW * bH;
    const price = pricingMode === 'uniform' ? uniformPrice : area * defaultPricePerSqm;

    // Available space with 2m margins and 2m aisles
    const margin = 2;
    const gap = 2;
    let currX = margin;
    let currY = margin;

    for (let i = 1; i <= count; i++) {
      if (currX + bW > hWidth - margin) {
        currX = margin;
        currY += bH + gap;
      }
      if (currY + bH > hHeight - margin) {
        // Hall full, wrap or stop
        currY = margin;
      }

      list.push({
        booth_number: `B-${i < 10 ? '0' + i : i}`,
        name: `بوث رقم ${i}`,
        width_m: bW,
        height_m: bH,
        size_sqm: area,
        price: price,
        x: Math.round(currX * 10) / 10,
        y: Math.round(currY * 10) / 10,
        rotation: 0,
        operational_status: 'operational'
      });

      currX += bW + gap;
    }
    return list;
  }

  // Handle Mass Generate or Adjust Count
  const handleApplyCount = () => {
    if (targetCount <= 0) return;
    pushHistory();
    // Preserve any booths with active bookings!
    const preserved = booths.filter(b => b.id && bookedSet.has(b.id));
    const generated = generateDefaultBooths(targetCount, hall.width_m, hall.height_m);
    
    // Merge: keep booked ones if present
    const combined = [...preserved];
    for (const gen of generated) {
      if (combined.length >= targetCount) break;
      if (!combined.some(c => c.booth_number === gen.booth_number)) {
        combined.push(gen);
      }
    }
    setBooths(combined);
    setSelectedBoothIndex(0);
    setSuccessMsg(`تم توليد ${combined.length} بوث وتوزيعها بنجاح داخل القاعة.`);
  };

  // Add a single new booth
  const handleAddBooth = () => {
    pushHistory();
    const nextNum = booths.length + 1;
    const bW = defaultBoothWidth;
    const bH = defaultBoothHeight;
    const area = bW * bH;
    const price = pricingMode === 'uniform' ? uniformPrice : area * defaultPricePerSqm;

    // Place at center of hall or next free spot
    const newX = Math.min(Math.max(2, hall.width_m / 2 - bW / 2), hall.width_m - bW);
    const newY = Math.min(Math.max(2, hall.height_m / 2 - bH / 2), hall.height_m - bH);

    const newBooth: BoothInput = {
      booth_number: `A-${nextNum < 10 ? '0' + nextNum : nextNum}`,
      name: `بوث ${nextNum}`,
      width_m: bW,
      height_m: bH,
      size_sqm: area,
      price: price,
      x: Math.round(newX * 10) / 10,
      y: Math.round(newY * 10) / 10,
      rotation: 0,
      operational_status: 'operational'
    };

    setBooths(prev => [...prev, newBooth]);
    setSelectedBoothIndex(booths.length);
  };

  // Duplicate Booth
  const handleDuplicateBooth = (index: number) => {
    const target = booths[index];
    if (!target) return;
    pushHistory();

    const newBooth: BoothInput = {
      ...target,
      id: undefined, // Fresh booth
      booth_number: `${target.booth_number}-نسخة`,
      x: Math.min(target.x + target.width_m + 1, hall.width_m - target.width_m),
      y: Math.min(target.y + 1, hall.height_m - target.height_m),
      operational_status: 'operational'
    };

    setBooths(prev => [...prev, newBooth]);
    setSelectedBoothIndex(booths.length);
  };

  // Delete Booth (Forbidden if booked)
  const handleDeleteBooth = (index: number) => {
    const target = booths[index];
    if (!target) return;
    if (target.id && bookedSet.has(target.id)) {
      setErrorMsg(`لا يمكن حذف البوث (${target.booth_number}) لوجود حجز مؤكد أو جاري عليه!`);
      return;
    }
    pushHistory();
    const updated = booths.filter((_, i) => i !== index);
    setBooths(updated);
    setSelectedBoothIndex(updated.length > 0 ? 0 : null);
  };

  // Rotate Booth 90 degrees
  const handleRotateBooth = (index: number) => {
    const target = booths[index];
    if (!target) return;
    pushHistory();

    // Swap width and height to physically rotate the bounding box inside hall
    const newW = target.height_m;
    const newH = target.width_m;
    const newRot = ((target.rotation || 0) + 90) % 360;

    // Clamp within hall bounds
    const clampedX = Math.min(target.x, Math.max(0, hall.width_m - newW));
    const clampedY = Math.min(target.y, Math.max(0, hall.height_m - newH));

    updateBooth(index, {
      width_m: newW,
      height_m: newH,
      rotation: newRot,
      x: clampedX,
      y: clampedY
    });
  };

  // Update booth properties
  const updateBooth = (index: number, updates: Partial<BoothInput>) => {
    setBooths(prev => {
      const copy = [...prev];
      const cur = copy[index];
      if (!cur) return prev;

      const updated = { ...cur, ...updates };

      // Re-calculate area if width or height changed
      if (updates.width_m !== undefined || updates.height_m !== undefined) {
        updated.size_sqm = Math.round(updated.width_m * updated.height_m * 10) / 10;
        if (pricingMode === 'per_sqm') {
          updated.price = Math.round(updated.size_sqm * defaultPricePerSqm);
        }
      }

      copy[index] = updated;
      return copy;
    });
  };

  // Apply Uniform or Per-Sqm pricing to all unbooked booths
  const handleApplyPricingToAll = () => {
    pushHistory();
    setBooths(prev => prev.map(b => {
      if (b.id && bookedSet.has(b.id)) return b; // Never alter booked booth price
      let newPrice = b.price;
      if (pricingMode === 'uniform') {
        newPrice = uniformPrice;
      } else if (pricingMode === 'per_sqm') {
        newPrice = Math.round(b.size_sqm * defaultPricePerSqm);
      }
      return { ...b, price: newPrice };
    }));
    setSuccessMsg('تم تحديث أسعار البوثات بنجاح وفق آلية التسعير المحددة.');
  };

  // Hall Dimensions update
  const handleHallChange = (key: 'width_m' | 'height_m', value: number) => {
    const val = Math.max(value, 5);
    setHall(prev => {
      const next = { ...prev, [key]: val };
      next.total_area_sqm = next.width_m * next.height_m;
      return next;
    });
  };

  // Dragging logic with SVG coordinates
  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setSelectedBoothIndex(index);
    setIsDragging(true);
    setDragBoothIndex(index);

    if (svgRef.current) {
      const pt = getSvgCoordinates(e);
      const target = booths[index];
      setDragOffset({
        x: pt.x - target.x,
        y: pt.y - target.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || dragBoothIndex === null || !svgRef.current) return;

    const pt = getSvgCoordinates(e);
    let newX = pt.x - dragOffset.x;
    let newY = pt.y - dragOffset.y;

    if (snapToGrid) {
      newX = Math.round(newX); // Snap to nearest 1 meter
      newY = Math.round(newY);
    } else {
      newX = Math.round(newX * 10) / 10;
      newY = Math.round(newY * 10) / 10;
    }

    const currentBooth = booths[dragBoothIndex];
    if (!currentBooth) return;

    // Constrain strictly inside hall boundary
    const clampedX = Math.max(0, Math.min(newX, hall.width_m - currentBooth.width_m));
    const clampedY = Math.max(0, Math.min(newY, hall.height_m - currentBooth.height_m));

    updateBooth(dragBoothIndex, { x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragBoothIndex(null);
    }
  };

  const getSvgCoordinates = (e: React.MouseEvent): { x: number; y: number } => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    // Map pixels to meters
    return {
      x: (clientX / (canvasWidthPx * zoom)) * hall.width_m,
      y: (clientY / (canvasHeightPx * zoom)) * hall.height_m
    };
  };

  // Save handler calling Server Action
  const handleSave = async () => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await saveExhibitionFloorplan({
        exhibitionId,
        hall,
        booths
      });

      if (!res.success) {
        setErrorMsg(res.error || 'فشل حفظ المخطط');
      } else {
        setSuccessMsg(res.message || 'تم حفظ المخطط بنجاح!');
        if (onSaved) {
          setTimeout(() => {
            onSaved();
          }, 1200);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setSaving(false);
    }
  };

  const selectedBooth = selectedBoothIndex !== null ? booths[selectedBoothIndex] : null;

  // Determine booth display status
  const getBoothColor = (b: BoothInput, isSelected: boolean) => {
    const isBooked = b.id && bookedSet.has(b.id);
    if (isSelected) {
      return 'fill-[#0868E9] stroke-[#102E70] stroke-[2.5] filter drop-shadow(0 4px 8px rgba(8,104,233,0.4))';
    }
    if (isBooked) {
      return 'fill-[#FEE2E2] stroke-[#EF4444] stroke-2'; // Red: Booked
    }
    if (b.operational_status === 'disabled' || b.operational_status === 'maintenance') {
      return 'fill-[#F1F5F9] stroke-[#94A3B8] stroke-1.5'; // Gray: Unavailable
    }
    return 'fill-[#DCFCE7] stroke-[#22C55E] stroke-2 hover:fill-[#BBF7D0]'; // Green: Available
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col font-sans text-right select-none" dir="rtl">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0868E9] text-white flex items-center justify-center font-bold">
            <Layers size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#102E70]">محرر مخطط المعرض والبوثات</h1>
              <span className="text-xs bg-[#EDF5FF] text-[#0868E9] px-2.5 py-0.5 rounded-full font-semibold">
                {exhibitionTitle}
              </span>
            </div>
            <p className="text-xs text-[#65789A]">
              تحكم كامل في أبعاد القاعة وتوزيع البوثات ومساحاتها وأسعارها بدقة هندسية بالمتر.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-[#E2E8F0] hover:bg-gray-50 text-[#65789A] rounded-xl text-xs font-semibold transition-colors"
            >
              إلغاء
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0868E9] hover:bg-[#0868E9]/90 text-white rounded-xl text-sm font-bold shadow-md shadow-[#0868E9]/20 transition-all disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>{saving ? 'جاري الحفظ...' : 'حفظ ونشر المخطط'}</span>
          </button>
        </div>
      </header>

      {/* Feedback Messages */}
      {errorMsg && (
        <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-red-500" />
            <span className="font-medium">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {successMsg && (
        <div className="mx-6 mt-4 p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0 text-green-500" />
            <span className="font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-green-400 hover:text-green-600">×</button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-6 gap-6">
        
        {/* Left/Main Column: Canvas + Top Toolbar */}
        <div className="flex-1 flex flex-col bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
          
          {/* Editor Canvas Toolbar */}
          <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddBooth}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0868E9] text-white hover:bg-[#0868E9]/90 rounded-lg font-semibold shadow-sm transition-colors"
              >
                <Plus size={14} />
                <span>إضافة بوث</span>
              </button>

              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className="px-2.5 py-1.5 bg-white border border-[#E2E8F0] text-[#65789A] hover:text-[#102E70] rounded-lg disabled:opacity-40"
                title="تراجع"
              >
                تراجع
              </button>

              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="px-2.5 py-1.5 bg-white border border-[#E2E8F0] text-[#65789A] hover:text-[#102E70] rounded-lg disabled:opacity-40"
                title="إعادة"
              >
                إعادة
              </button>

              <div className="h-4 w-px bg-gray-300 mx-1"></div>

              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors ${
                  showGrid ? 'bg-[#EDF5FF] border-[#0868E9] text-[#0868E9] font-bold' : 'bg-white border-[#E2E8F0] text-[#65789A]'
                }`}
              >
                <Grid size={14} />
                <span>الشبكة</span>
              </button>

              <button
                onClick={() => setSnapToGrid(!snapToGrid)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors ${
                  snapToGrid ? 'bg-[#EDF5FF] border-[#0868E9] text-[#0868E9] font-bold' : 'bg-white border-[#E2E8F0] text-[#65789A]'
                }`}
              >
                <span>محاذاة تلقائية (Snap)</span>
              </button>
            </div>

            {/* Viewport Zoom & Stats */}
            <div className="flex items-center gap-3">
              <span className="text-[#65789A]">
                إجمالي: <strong className="text-[#102E70]">{booths.length}</strong> بوث (
                <span className="text-green-600 font-bold">{booths.filter(b => !bookedSet.has(b.id || '')).length} متاح</span>)
              </span>

              <div className="flex items-center bg-white border border-[#E2E8F0] rounded-lg p-0.5">
                <button
                  onClick={() => setZoom(prev => Math.min(prev + 0.15, 2.5))}
                  className="p-1 hover:bg-gray-100 rounded text-[#65789A]"
                  title="تكبير"
                >
                  <ZoomIn size={14} />
                </button>
                <span className="px-2 font-mono text-[11px] text-[#102E70] font-bold">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.4))}
                  className="p-1 hover:bg-gray-100 rounded text-[#65789A]"
                  title="تصغير"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="p-1 hover:bg-gray-100 rounded text-[#65789A]"
                  title="إعادة ضبط"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Floor Area */}
          <div 
            className="flex-1 overflow-auto bg-[#F1F5F9] relative flex items-center justify-center p-8 select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div 
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease'
              }}
              className="relative shadow-xl rounded-xl bg-white border-4 border-[#0868E9]/30"
            >
              {/* Hall Header & Ruler */}
              <div className="absolute -top-7 right-0 left-0 flex justify-between text-[11px] font-bold text-[#65789A]">
                <span>أبعاد القاعة: {hall.width_m}م عرض × {hall.height_m}م طول</span>
                <span>المساحة الإجمالية: {hall.total_area_sqm} م²</span>
              </div>

              {/* SVG Canvas Map */}
              <svg
                ref={svgRef}
                width={canvasWidthPx}
                height={canvasHeightPx}
                className="bg-[#FAFCFF] cursor-crosshair overflow-hidden rounded-lg"
              >
                <defs>
                  {/* Meter Grid Pattern */}
                  <pattern id="grid-pattern" width={PPM} height={PPM} patternUnits="userSpaceOnUse">
                    <path d={`M ${PPM} 0 L 0 0 0 ${PPM}`} fill="none" stroke="#E2E8F0" strokeWidth="0.8" />
                  </pattern>
                  <pattern id="major-grid-pattern" width={PPM * 5} height={PPM * 5} patternUnits="userSpaceOnUse">
                    <path d={`M ${PPM * 5} 0 L 0 0 0 ${PPM * 5}`} fill="none" stroke="#CBD5E1" strokeWidth="1.2" />
                  </pattern>
                </defs>

                {/* Grid Overlay */}
                {showGrid && (
                  <>
                    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                    <rect width="100%" height="100%" fill="url(#major-grid-pattern)" />
                  </>
                )}

                {/* Hall Walls & Visual Entrances */}
                <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#082B78" strokeWidth="3" />
                
                {/* Main Entrance (Bottom) */}
                <rect 
                  x={canvasWidthPx / 2 - 40} 
                  y={canvasHeightPx - 8} 
                  width="80" 
                  height="8" 
                  fill="#0868E9" 
                  rx="3" 
                />
                <text 
                  x={canvasWidthPx / 2} 
                  y={canvasHeightPx - 14} 
                  textAnchor="middle" 
                  fontSize="10" 
                  fontWeight="bold" 
                  fill="#0868E9"
                >
                  المدخل الرئيسي
                </text>

                {/* Emergency Exit (Top) */}
                <rect 
                  x={canvasWidthPx / 2 - 35} 
                  y="0" 
                  width="70" 
                  height="6" 
                  fill="#FF6D5C" 
                  rx="2" 
                />
                <text 
                  x={canvasWidthPx / 2} 
                  y="16" 
                  textAnchor="middle" 
                  fontSize="9" 
                  fill="#FF6D5C"
                >
                  مخرج طوارئ
                </text>

                {/* Interactive Booths Rendering */}
                {booths.map((booth, idx) => {
                  const isSelected = selectedBoothIndex === idx;
                  const isBooked = booth.id && bookedSet.has(booth.id);
                  const xPx = booth.x * PPM;
                  const yPx = booth.y * PPM;
                  const wPx = booth.width_m * PPM;
                  const hPx = booth.height_m * PPM;

                  return (
                    <g
                      key={booth.id || `booth-${idx}`}
                      onMouseDown={(e) => handleMouseDown(e, idx)}
                      className={`cursor-move transition-shadow ${isSelected ? 'z-20' : 'z-10'}`}
                    >
                      {/* Booth Box */}
                      <rect
                        x={xPx}
                        y={yPx}
                        width={wPx}
                        height={hPx}
                        rx="4"
                        className={getBoothColor(booth, isSelected)}
                      />

                      {/* Booth Number Text */}
                      <text
                        x={xPx + wPx / 2}
                        y={yPx + hPx / 2 - 4}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={Math.max(10, Math.min(13, wPx / 4))}
                        fontWeight="bold"
                        fill={isSelected ? '#ffffff' : (isBooked ? '#991B1B' : '#14532D')}
                        className="pointer-events-none font-mono"
                      >
                        {booth.booth_number}
                      </text>

                      {/* Area and Price text inside booth */}
                      <text
                        x={xPx + wPx / 2}
                        y={yPx + hPx / 2 + 10}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={Math.max(8, Math.min(10, wPx / 5))}
                        fill={isSelected ? '#E0E7FF' : '#475569'}
                        className="pointer-events-none"
                      >
                        {booth.size_sqm}م²
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Color Key / Legend Footer */}
          <div className="bg-white border-t border-[#E2E8F0] px-6 py-3 flex flex-wrap items-center justify-between text-xs text-[#65789A]">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-[#DCFCE7] border border-[#22C55E] rounded"></span>
                <span>أخضر: متاح للحجز</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-[#FEE2E2] border border-[#EF4444] rounded"></span>
                <span>أحمر: محجوز ومؤكد</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-[#FEF3C7] border border-[#F59E0B] rounded"></span>
                <span>برتقالي: قيد المراجعة</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-[#F1F5F9] border border-[#94A3B8] rounded"></span>
                <span>رمادي: غير متاح أو تحت الصيانة</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-[#0868E9] border border-[#102E70] rounded"></span>
                <span>أزرق: محدد حالياً للتعديل</span>
              </div>
            </div>

            <span className="text-[11px] text-gray-400">
              * مقياس الرسم: 1 متر مربع = 1 م × 1 م داخل المخطط
            </span>
          </div>
        </div>

        {/* Right Sidebar: Selected Booth Properties & Mass Generator Controls */}
        <div className="w-full lg:w-84 flex flex-col gap-5 overflow-y-auto shrink-0">
          
          {/* Panel 1: Hall Dimensions Settings */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-[#102E70] mb-3 flex items-center gap-2">
              <Maximize2 size={16} className="text-[#0868E9]" />
              <span>أبعاد قاعة المعرض</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[11px] font-semibold text-[#65789A] block mb-1">عرض القاعة (متر)</label>
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={hall.width_m}
                  onChange={(e) => handleHallChange('width_m', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#102E70] focus:outline-none focus:border-[#0868E9]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#65789A] block mb-1">طول القاعة (متر)</label>
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={hall.height_m}
                  onChange={(e) => handleHallChange('height_m', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#102E70] focus:outline-none focus:border-[#0868E9]"
                />
              </div>
            </div>

            <div className="p-2.5 bg-[#EDF5FF] rounded-xl text-xs flex justify-between items-center text-[#0868E9] font-medium">
              <span>إجمالي مساحة القاعة:</span>
              <strong className="font-bold text-sm">{hall.total_area_sqm} م²</strong>
            </div>
          </div>

          {/* Panel 2: Selected Booth Properties */}
          {selectedBooth && selectedBoothIndex !== null ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm border-r-4 border-r-[#0868E9]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0]">
                <div>
                  <span className="text-[11px] text-[#65789A]">خصائص البوث المحدد</span>
                  <h3 className="font-bold text-lg text-[#102E70] font-mono">{selectedBooth.booth_number}</h3>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleRotateBooth(selectedBoothIndex)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-[#65789A] border border-[#E2E8F0]"
                    title="تدوير 90 درجة"
                  >
                    <RotateCw size={14} />
                  </button>
                  <button
                    onClick={() => handleDuplicateBooth(selectedBoothIndex)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-[#65789A] border border-[#E2E8F0]"
                    title="نسخ البوث"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteBooth(selectedBoothIndex)}
                    disabled={Boolean(selectedBooth.id && bookedSet.has(selectedBooth.id))}
                    className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg border border-red-200 disabled:opacity-30"
                    title="حذف البوث"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Booth Number & Optional Name */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-[#65789A] block mb-1">رقم البوث *</label>
                    <input
                      type="text"
                      value={selectedBooth.booth_number}
                      onChange={(e) => updateBooth(selectedBoothIndex, { booth_number: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#102E70] focus:outline-none focus:border-[#0868E9]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#65789A] block mb-1">اسم/فئة البوث</label>
                    <input
                      type="text"
                      placeholder="اختياري (VIP / قياسي)"
                      value={selectedBooth.name || ''}
                      onChange={(e) => updateBooth(selectedBoothIndex, { name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#102E70] focus:outline-none focus:border-[#0868E9]"
                    />
                  </div>
                </div>

                {/* Dimensions: Width & Height */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-[#65789A] block mb-1">العرض (متر)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="30"
                      value={selectedBooth.width_m}
                      onChange={(e) => updateBooth(selectedBoothIndex, { width_m: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#102E70] focus:outline-none focus:border-[#0868E9]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#65789A] block mb-1">الطول (متر)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="30"
                      value={selectedBooth.height_m}
                      onChange={(e) => updateBooth(selectedBoothIndex, { height_m: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#102E70] focus:outline-none focus:border-[#0868E9]"
                    />
                  </div>
                </div>

                {/* Auto-calculated Area */}
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between">
                  <span className="text-[#65789A]">المساحة الإجمالية:</span>
                  <span className="font-bold text-[#102E70] text-sm font-mono">
                    {selectedBooth.size_sqm} متر مربع
                  </span>
                </div>

                {/* Price in SAR */}
                <div>
                  <label className="text-[11px] font-semibold text-[#65789A] block mb-1">سعر البوث (ريال سعودي) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={selectedBooth.price}
                      onChange={(e) => updateBooth(selectedBoothIndex, { price: Number(e.target.value) })}
                      className="w-full pl-12 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#102E70] focus:outline-none focus:border-[#0868E9]"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[11px]">ر.س</span>
                  </div>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="text-[11px] font-semibold text-[#65789A] block mb-1">حالة توفر البوث</label>
                  <select
                    value={selectedBooth.operational_status || 'operational'}
                    onChange={(e) => updateBooth(selectedBoothIndex, { operational_status: e.target.value as any })}
                    disabled={Boolean(selectedBooth.id && bookedSet.has(selectedBooth.id))}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#102E70] focus:outline-none focus:border-[#0868E9]"
                  >
                    <option value="operational">متاح للحجز (جاهز)</option>
                    <option value="maintenance">تحت الصيانة</option>
                    <option value="disabled">غير متاح للحجز</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 text-center text-xs text-[#65789A] shadow-sm">
              <Info size={24} className="mx-auto mb-2 text-gray-400" />
              <p>اضغط على أي بوث داخل المخطط لتعديل أبعاده ومساحته وسعره.</p>
            </div>
          )}

          {/* Panel 3: Mass Generation & Pricing System */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-[#102E70] mb-3 flex items-center gap-2">
              <DollarSign size={16} className="text-[#FF6D5C]" />
              <span>نظام البوثات والتسعير الذكي</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              {/* Target Booth Count */}
              <div>
                <label className="text-[11px] font-semibold text-[#65789A] block mb-1">عدد البوثات المطلوب</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={targetCount}
                    onChange={(e) => setTargetCount(Number(e.target.value))}
                    className="flex-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#102E70]"
                  />
                  <button
                    onClick={handleApplyCount}
                    className="px-3.5 py-2 bg-[#0868E9] text-white rounded-xl text-xs font-bold hover:bg-[#0868E9]/90 shadow-sm"
                  >
                    توليد وتوزيع
                  </button>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">ينشئ العدد المطلوب تلقائياً مع حماية البوثات المحجوزة.</span>
              </div>

              {/* Pricing Mode Radio */}
              <div className="pt-2 border-t border-[#E2E8F0]">
                <label className="text-[11px] font-semibold text-[#65789A] block mb-2">طريقة التسعير:</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="pricing_mode"
                      checked={pricingMode === 'per_sqm'}
                      onChange={() => setPricingMode('per_sqm')}
                      className="text-[#0868E9] focus:ring-[#0868E9]"
                    />
                    <span>حساب السعر بالمتر المربع (مساحة × سعر المتر)</span>
                  </label>

                  {pricingMode === 'per_sqm' && (
                    <div className="pr-5">
                      <div className="relative">
                        <input
                          type="number"
                          value={defaultPricePerSqm}
                          onChange={(e) => setDefaultPricePerSqm(Number(e.target.value))}
                          placeholder="سعر المتر المربع"
                          className="w-full pl-12 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-bold"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">ر.س/م²</span>
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="pricing_mode"
                      checked={pricingMode === 'uniform'}
                      onChange={() => setPricingMode('uniform')}
                      className="text-[#0868E9] focus:ring-[#0868E9]"
                    />
                    <span>سعر موحد لجميع البوثات</span>
                  </label>

                  {pricingMode === 'uniform' && (
                    <div className="pr-5">
                      <div className="relative">
                        <input
                          type="number"
                          value={uniformPrice}
                          onChange={(e) => setUniformPrice(Number(e.target.value))}
                          placeholder="السعر الموحد"
                          className="w-full pl-12 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-bold"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">ر.س</span>
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="pricing_mode"
                      checked={pricingMode === 'custom'}
                      onChange={() => setPricingMode('custom')}
                      className="text-[#0868E9] focus:ring-[#0868E9]"
                    />
                    <span>تحديد سعر مخصص لكل بوث على حدة</span>
                  </label>
                </div>

                {pricingMode !== 'custom' && (
                  <button
                    onClick={handleApplyPricingToAll}
                    className="w-full mt-3 py-2 bg-[#F8FAFC] hover:bg-gray-100 text-[#102E70] border border-[#E2E8F0] rounded-xl text-xs font-bold transition-colors"
                  >
                    تطبيق على جميع البوثات غير المحجوزة
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
