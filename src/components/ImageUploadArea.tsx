"use client"
import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadAreaProps {
  name?: string;
  initialImageUrl?: string;
  onChange?: (file: File | null, previewUrl: string | null) => void;
  label?: string;
  helperText?: string;
}

export default function ImageUploadArea({
  name = 'cover_image',
  initialImageUrl,
  onChange,
  label = 'الصورة الرئيسية للمعرض',
  helperText = 'الصيغ المدعومة: JPG, PNG, WebP — الحجم الأقصى: 5 ميجابايت'
}: ImageUploadAreaProps) {
  const [preview, setPreview] = useState<string | null>(initialImageUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialImageUrl && !selectedFile) {
      setPreview(initialImageUrl);
    }
  }, [initialImageUrl, selectedFile]);

  const validateAndHandleFile = (file: File) => {
    setError(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('صيغة الملف غير مدعومة. يرجى اختيار صورة بصيغة JPG أو PNG أو WebP');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('حجم الصورة يتجاوز الحد المسموح به (5 ميجابايت)');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    if (onChange) {
      onChange(file, objectUrl);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndHandleFile(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndHandleFile(file);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (onChange) {
      onChange(null, null);
    }
  };

  const handleOpenPicker = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-blue-600" />
          {label}
        </label>
        <span className="text-xs text-slate-400 font-medium">اختياري</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hidden input for existing image URL if not replacing */}
      {preview && !selectedFile && (
        <input type="hidden" name="cover_image_url" value={preview} />
      )}
      {/* Hidden input to indicate image removal if initially had image */}
      {!preview && initialImageUrl && (
        <input type="hidden" name="cover_image_url" value="" />
      )}

      {preview ? (
        <div className="relative group overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-900 aspect-video max-h-52 w-full shadow-inner flex items-center justify-center">
          {/* Preview Image */}
          <img
            src={preview}
            alt="معاينة صورة المعرض"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleOpenPicker}
              className="px-3.5 py-2 bg-white text-slate-800 text-xs font-bold rounded-xl shadow-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              تغيير الصورة
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3.5 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-lg hover:bg-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              حذف
            </button>
          </div>

          {/* File info pill */}
          <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[11px] text-white/90 font-medium pointer-events-none">
            {selectedFile ? `${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)` : 'الصورة الحالية'}
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleOpenPicker}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/60 scale-[0.99]'
              : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/30 bg-slate-50/50'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800 mb-1">
            اسحب وأفلت صورة المعرض هنا، أو <span className="text-blue-600 underline">تصفح من جهازك</span>
          </p>
          <p className="text-xs text-slate-500">{helperText}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium bg-red-50 p-2.5 rounded-xl border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
