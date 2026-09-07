import { CheckCircle2, PlusSquare, Share, X, Smartphone, Compass } from 'lucide-react'
import { useEffect, useRef } from 'react'

/**
 * دالة فحص أجهزة iOS (iPhone, iPad, iPod)
 */
export function isIosDevice() {
  if (typeof window === 'undefined') return false
  const userAgent = window.navigator.userAgent.toLowerCase()
  return (
    /iphone|ipad|ipod/.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

/**
 * نافذة إرشادية أنيقة ومخصصة لمستخدمي أجهزة iOS (آيفون وآيباد)
 * تشرح بالخطوات كيفية تثبيت الـ PWA عبر متصفح Safari
 */
export default function IosInstallModal({ isOpen, onClose }) {
  const backdropRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose()
  }

  return (
    <div
      ref={backdropRef}
      className="modal-backdrop transition-opacity duration-300"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <section
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-100/80 bg-white p-6 shadow-2xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ios-modal-title"
      >
        {/* خلفية جمالية خفيفة */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl" />

        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          aria-label="إغلاق"
        >
          <X size={18} />
        </button>

        {/* رأس النافذة */}
        <div className="text-right">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Smartphone size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>خاص بمستخدمي iPhone & iPad</span>
          </div>

          <h2
            id="ios-modal-title"
            className="mt-2.5 text-xl font-extrabold text-ink dark:text-white sm:text-2xl"
          >
            تثبيت التطبيق على الآيفون 📲
          </h2>

          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
            نظام iOS يتطلب خطوات بسيطة من متصفح <strong>Safari</strong> لإضافة التطبيق لشاشتك الرئيسية:
          </p>
        </div>

        {/* خطوات التثبيت الثلاث المصممة بدقة */}
        <div className="mt-5 space-y-3.5 text-right">
          
          {/* الخطوة 1 */}
          <div className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 transition-all dark:border-slate-800/80 dark:bg-slate-800/40">
            <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/20">
              <Share size={20} className="stroke-[2.2]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 font-bold text-ink dark:text-white">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-blue-100 text-[11px] font-extrabold text-blue-700 dark:bg-blue-950 dark:text-blue-300">١</span>
                <span className="text-sm">اضغط زر المشاركة (Share)</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                في شريط متصفح <strong>Safari</strong> بالأسفل (أو بالأعلى على الآيباد)، اضغط على أيقونة المشاركة مربع به سهم للأعلى (<span className="font-sans font-bold">⎋</span>).
              </p>
            </div>
          </div>

          {/* الخطوة 2 */}
          <div className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 transition-all dark:border-slate-800/80 dark:bg-slate-800/40">
            <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/20">
              <PlusSquare size={20} className="stroke-[2.2]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 font-bold text-ink dark:text-white">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-[11px] font-extrabold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">٢</span>
                <span className="text-sm">اختر «إضافة إلى الشاشة الرئيسية»</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                مرّر الخيارات لأسفل في القائمة واختر <strong>(Add to Home Screen)</strong>.
              </p>
            </div>
          </div>

          {/* الخطوة 3 */}
          <div className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 transition-all dark:border-slate-800/80 dark:bg-slate-800/40">
            <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-amber-500/20">
              <CheckCircle2 size={20} className="stroke-[2.2]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 font-bold text-ink dark:text-white">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-amber-100 text-[11px] font-extrabold text-amber-700 dark:bg-amber-950 dark:text-amber-300">٣</span>
                <span className="text-sm">اضغط على «إضافة» (Add)</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                في الزاوية العلوية اضغط <strong>Add</strong> وسيُثبَّت التطبيق على شاشتك كأي تطبيق أصلي ويعمل بسرعة فائقة وبدون أشرطة المتصفح!
              </p>
            </div>
          </div>

        </div>

        {/* تنبيه متصفح سفاري */}
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50/80 px-3.5 py-2.5 text-right text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <Compass size={16} className="flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <span>تنبيه: تأكد من فتح الرابط داخل متصفح <strong>Safari</strong> لتفعيل خيار التثبيت.</span>
        </div>

        {/* زر الإغلاق / التأكيد */}
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition-all hover:scale-[1.01] hover:shadow-emerald-700/30 active:scale-95"
        >
          فهمت الخطوات، شكراً ✨
        </button>
      </section>
    </div>
  )
}
