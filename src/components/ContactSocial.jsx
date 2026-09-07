import { Check, ExternalLink, Heart, Send, Share2, Sparkles, X, Download } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/* ── الأيقونات الرسمية بدقة ونقاء عالي (Branded SVGs) ── */
function WhatsAppIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.11 7.44C8.95 7.44 8.68 7.5 8.46 7.74C8.24 7.98 7.62 8.56 7.62 9.73C7.62 10.9 8.47 12.03 8.59 12.19C8.71 12.35 10.24 14.71 12.6 15.73C14.56 16.57 14.96 16.41 15.39 16.37C15.81 16.33 16.76 15.81 16.96 15.25C17.16 14.69 17.16 14.21 17.1 14.11C17.04 14.01 16.88 13.95 16.64 13.83C16.4 13.71 15.22 13.13 15 13.05C14.78 12.97 14.62 12.93 14.46 13.17C14.3 13.41 13.84 13.95 13.7 14.11C13.56 14.27 13.42 14.29 13.18 14.17C12.94 14.05 11.97 13.73 10.82 12.71C9.93 11.91 9.33 10.93 9.17 10.65C9.01 10.37 9.15 10.22 9.27 10.1C9.38 9.99 9.52 9.81 9.64 9.67C9.76 9.53 9.8 9.43 9.88 9.27C9.96 9.11 9.92 8.97 9.86 8.85C9.8 8.73 9.34 7.59 9.15 7.12C8.96 6.67 8.77 6.73 8.63 6.72C8.5 6.71 8.34 6.71 8.18 6.71L9.11 7.44Z" />
    </svg>
  )
}

function FacebookIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function TikTokIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.77 1.81-.02 3.29-1.5 3.32-3.31.06-3.8.02-7.6.03-11.4.01-2.27.01-4.54.01-6.81z" />
    </svg>
  )
}

const socialChannels = [
  {
    id: 'whatsapp',
    title: 'واتساب',
    subtitle: 'تواصل مباشر وسريع',
    icon: WhatsAppIcon,
    href: import.meta.env.VITE_WHATSAPP_NUMBER
      ? `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`
      : 'https://wa.me/201558262776',
    brandColor: 'from-[#25D366] to-[#128C7E]',
    hoverGlow: 'hover:shadow-[0_8px_25px_rgba(37,211,102,0.35)]'
  },
  {
    id: 'facebook',
    title: 'فيسبوك',
    subtitle: 'الصفحة الرسمية والمنشورات',
    icon: FacebookIcon,
    href: import.meta.env.VITE_FACEBOOK_URL || 'https://www.facebook.com/AhmedSamirFazza',
    brandColor: 'from-[#1877F2] to-[#0d5ec4]',
    hoverGlow: 'hover:shadow-[0_8px_25px_rgba(24,119,242,0.35)]'
  },
  {
    id: 'instagram',
    title: 'إنستاجرام',
    subtitle: 'تلاوات وتصميمات يومية',
    icon: InstagramIcon,
    href: import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/ahmed.fazza1',
    brandColor: 'from-[#f09433] via-[#dc2743] to-[#bc1888]',
    hoverGlow: 'hover:shadow-[0_8px_25px_rgba(220,39,67,0.35)]'
  },
  {
    id: 'tiktok',
    title: 'تيك توك',
    subtitle: 'مقاطع قرآنية قصيرة وتلاوات',
    icon: TikTokIcon,
    href: import.meta.env.VITE_TIKTOK_URL || 'https://www.tiktok.com/@ahmedsamirtech',
    brandColor: 'from-[#000000] via-[#25F4EE] to-[#FE2C55]',
    hoverGlow: 'hover:shadow-[0_8px_25px_rgba(37,244,238,0.35)]'
  }
]

function ShareButton({ className = '' }) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const shareData = {
      title: 'صدقة جارية',
      text: 'تطبيق صدقة جارية - رفيقك اليومي لقراءة القرآن والأذكار ومواقيت الصلاة والبث المباشر',
      url: window.location.href
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      if (error?.name !== 'AbortError' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  return (
    <button
      onClick={share}
      className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition-all hover:scale-[1.02] hover:shadow-emerald-700/30 active:scale-95 ${className}`}
      title="مشاركة رابط التطبيق"
    >
      {copied ? (
        <>
          <Check size={18} className="text-white" />
          <span>تم نسخ الرابط بنجاح</span>
        </>
      ) : (
        <>
          <Share2 size={18} />
          <span>شارك تؤجر 🌿</span>
        </>
      )}
    </button>
  )
}

export default function ContactSocial({ onInstallClick, isStandalone, canInstall }) {
  const [open, setOpen] = useState(false)
  const backdropRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])

  const handleBackdropClick = (event) => {
    if (event.target === backdropRef.current) setOpen(false)
  }

  return (
    <>
      <section
        className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 p-6 shadow-soft transition-all dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900/90 dark:to-emerald-950/20 sm:p-8"
        aria-label="قسم التواصل والمشاركة"
      >
        {/* خلفية تجميلية بلمسة نورانية */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          {/* النصوص الترحيبية */}
          <div className="text-right space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
              <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>الدال على الخير كفاعله</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-ink dark:text-white sm:text-3xl">
              تواصل معنا وشارك الأجر
            </h2>
            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
              نسعد باستقبال اقتراحاتكم، ونرحب بمشاركتكم التطبيق ليكون صدقة جارية.
            </p>
          </div>

          {/* أزرار السوشيال والتثبيت التفاعلية المميزة */}
          <div className="flex flex-wrap items-center gap-3">

            {/* زر تثبيت التطبيق لكافة الأجهزة */}
            {!isStandalone && onInstallClick && canInstall && (
              <button
                onClick={onInstallClick}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-amber-600/25 transition-all hover:scale-[1.03] hover:shadow-amber-600/40 active:scale-95 animate-pulse"
                title="تثبيت التطبيق على جهازك"
              >
                <Download size={18} />
                <span>تثبيت التطبيق</span>
              </button>
            )}

            {/* أيقونات التواصل المصممة بشكل أنيق */}
            <div className="flex items-center gap-2.5">
              {socialChannels.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`group relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:text-white ${item.hoverGlow} dark:bg-slate-800 dark:text-slate-200`}
                    aria-label={item.title}
                    title={item.title}
                  >
                    {/* خلفية التدرج عند الـ Hover */}
                    <span
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-tr ${item.brandColor} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                    />
                    <Icon className="relative z-10 h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                  </a>
                )
              })}
            </div>

            {/* زر المشاركة الرئيسي */}
            <ShareButton />

            {/* زر فتح النافذة التفصيلية */}
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-bold text-slate-700 backdrop-blur transition-all hover:border-emerald-300 hover:bg-white hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-emerald-700 dark:hover:text-emerald-400"
            >
              <Send size={16} />
              <span>تفاصيل التواصل</span>
            </button>

          </div>
        </div>
      </section>

      {/* النافذة المنبثقة الشاملة (Modal) */}
      {open && (
        <div
          ref={backdropRef}
          className="modal-backdrop"
          role="presentation"
          onClick={handleBackdropClick}
        >
          <section
            className="contact-modal max-w-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
          >
            <button
              className="icon-button absolute left-5 top-5"
              onClick={() => setOpen(false)}
              aria-label="إغلاق"
            >
              <X size={20} />
            </button>

            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <Heart size={14} className="fill-emerald-600 text-emerald-600" />
                <span>قنوات التواصل الرسمية</span>
              </div>
              <h2 id="contact-modal-title" className="mt-2 text-2xl font-extrabold text-ink dark:text-white">
                تواصل معنا مباشرة
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                اختر المنصة المناسبة لك للتواصل أو متابعة المحتوى:
              </p>
            </div>

            {/* بطاقات المنصات التفصيلية */}
            <div className="mt-6 space-y-3">
              {socialChannels.map((channel) => {
                const Icon = channel.icon
                return (
                  <a
                    key={channel.id}
                    href={channel.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 transition-all duration-200 hover:border-emerald-300 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-tr ${channel.brandColor} text-white shadow-sm transition-transform duration-200 group-hover:scale-105`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-right">
                        <strong className="block text-base font-bold text-ink dark:text-white">
                          {channel.title}
                        </strong>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">
                          {channel.subtitle}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <span>زيارة</span>
                      <ExternalLink size={15} />
                    </div>
                  </a>
                )
              })}
            </div>

            {/* زر المشاركة بالأسفل */}
            <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
              <ShareButton className="w-full justify-center" />
            </div>
          </section>
        </div>
      )}
    </>
  )
}
