import { useState, useEffect } from 'react'
import { Smartphone, Download, Share, PlusSquare, MoreVertical, X, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'

export default function InstallModal({ isOpen, onClose, installPrompt, onInstallSuccess }) {
  const [platform, setPlatform] = useState('android')
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Detect standalone mode (already installed)
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    setIsStandalone(isRunningStandalone)

    // Detect device platform
    const userAgent = window.navigator.userAgent || window.navigator.vendor || window.opera
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      setPlatform('ios')
    } else if (/android/i.test(userAgent)) {
      setPlatform('android')
    } else {
      setPlatform('desktop')
    }
  }, [])

  if (!isOpen) return null

  const handleNativeInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') {
        if (onInstallSuccess) onInstallSuccess()
        onClose()
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all dark:bg-slate-900 border border-emerald-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="إغلاق"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mt-2 mb-6">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/30">
            <Smartphone size={32} />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            تثبيت تطبيق <span className="text-emerald-600 dark:text-emerald-400">صدقة جارية</span>
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            استمتع بتجربة تطبيق كامل وسريع على هاتفك وبدون استهلاك للإنترنت
          </p>
        </div>

        {/* Features list */}
        <div className="mb-6 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-2.5 text-emerald-800 dark:text-emerald-300 font-medium">
            <Sparkles size={16} className="text-emerald-600 shrink-0" />
            <span>وصول فوري من الشاشة</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-2.5 text-emerald-800 dark:text-emerald-300 font-medium">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>يعمل بدون إنترنت (PWA)</span>
          </div>
        </div>

        {/* Platform-specific content */}
        {isStandalone ? (
          <div className="rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/60 p-4 text-center">
            <CheckCircle2 size={32} className="mx-auto text-emerald-600 mb-2" />
            <p className="font-bold text-emerald-900 dark:text-emerald-200">التطبيق مثبت بالفعل على جهازك!</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">يمكنك فتحه من الشاشة الرئيسية في أي وقت</p>
          </div>
        ) : platform === 'ios' ? (
          /* iOS Instructions */
          <div className="space-y-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">خطوات التثبيت على أجهزة iPhone / iPad:</div>
            
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">1</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 flex-wrap">
                اضغط على زر المشاركة
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 shadow-sm border text-blue-600 font-bold">
                  <Share size={13} className="inline ml-1" /> مشاركة (Share)
                </span>
                أسفل متصفح Safari.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">2</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 flex-wrap">
                اختر من القائمة
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 shadow-sm border font-bold text-slate-800 dark:text-white">
                  <PlusSquare size={13} className="inline ml-1" /> إضافة إلى الشاشة الرئيسية (Add to Home Screen)
                </span>
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">3</div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                اضغط على <strong>إضافة (Add)</strong> في أعلى الزاوية.
              </p>
            </div>
          </div>
        ) : (
          /* Android / Desktop Instructions & Button */
          <div className="space-y-4">
            {installPrompt ? (
              <button
                onClick={handleNativeInstall}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 py-3.5 px-4 font-bold text-white shadow-lg shadow-emerald-700/25 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                <Download size={18} />
                <span>تثبيت التطبيق الآن على هاتفك</span>
              </button>
            ) : (
              <div className="space-y-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">خطوات التثبيت من متصفح Chrome:</div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">1</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 flex-wrap">
                    اضغط على قائمة الثلاث نقاط
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 shadow-sm border font-bold">
                      <MoreVertical size={13} className="inline" /> أعلى المتصفح
                    </span>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">2</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 flex-wrap">
                    اختر
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 shadow-sm border font-bold text-emerald-600 dark:text-emerald-400">
                      <Download size={13} className="inline ml-1" /> تثبيت التطبيق (Install App)
                    </span>
                    أو "إضافة إلى الشاشة الرئيسية".
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 text-center text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
        >
          إغلاق
        </button>
      </div>
    </div>
  )
}
