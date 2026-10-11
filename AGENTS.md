<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# قواعد العمل والتطوير الدائمة لمشروع بوث هب | Booth Hub

## 1. حماية واستقرار المشروع
* **الحفاظ على المشروع الحالي**: يُمنع منعاً باتاً حذف ملفات المشروع أو البدء بمشروع جديد من الصفر.
* **الحفاظ على التصميم والهوية**: الالتزام الصارم بهوية بوث هب بالألوان (الأزرق الأساسي `#0868E9`، الأزرق الداكن `#102E70`، الأزرق الفاتح `#EDF5FF`، المرجاني `#FF6D5C`) واللغة العربية واتجاه RTL وخط Alexandria.
* **سلامة المسارات والوظائف**: عدم تغيير أسماء المسارات أو تعطيل تسجيل الدخول أو المخطط التفاعلي أو قاعدة البيانات.
* **منع العمليات المدمرة**: تجنب أي تعديل يحذف بيانات الجداول أو يعطل سياسات الـ RLS دون موافقة مسبقة صريحة.

## 2. معايير الأمان والسرية
* **عدم تسريب المفاتيح السرية**: لا تضع أي مفاتيح API أو كلمات مرور داخل الكود المصدري، أو ملف README، أو سجلات Git.
* **استخدام `.env.local`**: المفاتيح تُقرأ حصراً من متغيرات البيئة عبر `process.env`.
* **فصل الصلاحيات**: مفتاح Service Role و Gemini API يُستدعيان فقط في بيئة الخادم (Server Actions / Server Components)، والمفتاح العام فقط يُستخدم في المتصفح.

## 3. الفحص والجودة الإلزامية قبل كل Commit
قبل اعتماد أي تعديل ورفعه إلى المستودع:
1. تشغيل فحص الأنواع: `npx tsc --noEmit` والتأكد من عدم وجود أخطاء.
2. تشغيل فحص البناء: `npm run build` للتحقق من سلامة جميع المسارات.
3. معالجة أي أخطاء برمجية فوراً قبل الرفع.

## 4. سير العمل مع GitHub و Vercel
عند استلام أي طلب تعديل:
1. فحص حالة المشروع الحالية.
2. تنفيذ التعديل المطلوب واختباره محلياً.
3. التأكد من سلامة ملفات `.gitignore` واستبعاد `node_modules`, `.next`, `.env.local`.
4. إنشاء Commit برسالة وصفية واضحة ودقيقة.
5. رفع التغييرات إلى الفرع الرئيسي `main` على GitHub دون استخدام `--force`.
6. التحقق من بدء Vercel للبناء والنشر التلقائي واستخراج رابط النشر والتأكد من استجابته.
7. لا تدّعِ نجاح أي عملية نشر أو اختبار قبل التحقق الفعلي منها.
