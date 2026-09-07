import { ExternalLink, Play, Radio, Wifi } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/* ─── قائمة القنوات الرسمية للحرمين الشريفين ─────────────────────────── */
const CHANNELS = [
  {
    id: 'makkah',
    title: 'قناة القرآن الكريم',
    subtitle: 'بث مباشر من المسجد الحرام — مكة المكرمة',
    location: 'مكة المكرمة',
    videoId: 'PLkCnLrKN8Q',
    officialUrl: 'https://www.youtube.com/watch?v=PLkCnLrKN8Q',
    gradient: 'from-emerald-950 via-teal-900 to-slate-950',
    accentColor: '#10b981',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  {
    id: 'madinah',
    title: 'قناة السنة النبوية',
    subtitle: 'بث مباشر من المسجد النبوي — المدينة المنورة',
    location: 'المدينة المنورة',
    channelId: 'UCROKYPep-UuODNwyipe6JMw',
    officialUrl: 'https://www.youtube.com/@SaudiSunnahTv/live',
    gradient: 'from-amber-950 via-stone-900 to-slate-950',
    accentColor: '#f59e0b',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  }
]

/* ─── بطاقة قناة البث المباشر المتجاوبة ────────────────────────────── */
function StreamCard({ title, subtitle, location, videoId, channelId, officialUrl, gradient, accentColor, badgeColor }) {
  const [status, setStatus] = useState('idle') // idle | loading | playing | blocked
  const iframeRef = useRef(null)

  const embedSrc = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`
    : `https://www.youtube-nocookie.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`

  /* مهلة انتظار كافية لشبكات الهاتف */
  useEffect(() => {
    if (status !== 'loading') return
    const timeout = setTimeout(() => {
      setStatus((prev) => (prev === 'loading' ? 'blocked' : prev))
    }, 15000)
    return () => clearTimeout(timeout)
  }, [status])

  const handleLoad = () => {
    setStatus('playing')
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-soft transition-all dark:border-slate-800 dark:bg-slate-900">
      
      {/* ── منطقة مشغل الفيديو مع ضمان مساحة كافية على كافة الموبايلات ── */}
      <div className="relative w-full aspect-video min-h-[220px] sm:min-h-[270px] bg-slate-950">

        {/* ── حالة الانتظار قبل التشغيل (idle) ── */}
        {status === 'idle' && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${gradient} p-4 sm:p-6 text-center text-white`}>
            
            {/* زخرفة خفيفة في الخلفية */}
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />

            <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-2 sm:gap-3">
              
              {/* شارة الموقع والبث المباشر */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[11px] font-bold text-rose-300 backdrop-blur border border-rose-500/30">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  مباشر الآن
                </span>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold backdrop-blur ${badgeColor}`}>
                  {location}
                </span>
              </div>

              {/* عنوان ووصف القناة بمرونة كاملة للشاشات الصغيرة */}
              <div className="space-y-0.5">
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-white/75 line-clamp-1 sm:line-clamp-none">
                  {subtitle}
                </p>
              </div>

              {/* أزرار الإجراءات */}
              <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setStatus('loading')}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: accentColor }}
                >
                  <Play size={15} fill="currentColor" />
                  <span>تشغيل البث</span>
                </button>

                <a
                  href={officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white/90 backdrop-blur transition hover:bg-white/20"
                >
                  <span>يوتيوب</span>
                  <ExternalLink size={12} />
                </a>
              </div>

            </div>
          </div>
        )}

        {/* ── حالة التحميل والتشغيل ── */}
        {(status === 'loading' || status === 'playing') && (
          <>
            {status === 'loading' && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950 text-white">
                <div className="h-9 w-9 animate-spin rounded-full border-3 border-emerald-400/20 border-t-emerald-400" />
                <p className="text-xs text-slate-300">جارٍ تهيئة البث المباشر...</p>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={embedSrc}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={handleLoad}
              className="absolute inset-0 h-full w-full border-0"
              style={{
                opacity: status === 'playing' ? 1 : 0,
                transition: 'opacity 0.4s ease'
              }}
            />
          </>
        )}

        {/* ── حالة الحجب أو انقطاع التضمين ── */}
        {status === 'blocked' && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${gradient} p-4 text-center text-white`}>
            <div className="flex max-w-xs flex-col items-center gap-2.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
                بث خارجي مباشر
              </span>
              <h3 className="text-base font-bold">{title}</h3>
              <p className="text-xs leading-relaxed text-white/75">
                اضغط بالأسفل لفتح البث المباشر فورا على يوتيوب:
              </p>
              <a
                href={officialUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-lg transition hover:scale-105"
                style={{ backgroundColor: accentColor }}
              >
                <ExternalLink size={14} />
                <span>مشاهدة البث الآن</span>
              </a>
            </div>
          </div>
        )}

      </div>

      {/* ── معلومات القناة في الشريط السفلي (متجاوب تماماً) ── */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="text-right">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-ink dark:text-white">
              {title}
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 sm:border-0 sm:pt-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
            <i className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            24/7 على مدار الساعة
          </span>

          <a
            href={officialUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-emerald-300"
          >
            <span>يوتيوب</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

    </article>
  )
}

/* ─── القسم الرئيسي ─────────────────────────────────────────── */
export default function LiveSection() {
  return (
    <section className="space-y-6 pb-28">
      
      {/* عنوان وتفاصيل القسم */}
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            <Wifi size={14} />
            <span>على الهواء مباشرة</span>
          </span>
          <h1>البث المباشر للحرمين</h1>
          <p>تابع الحرمين الشريفين على مدار 24 ساعة عبر القنوات الرسمية المعتمدة.</p>
        </div>
      </div>

      {/* شبكة القنوات */}
      <div className="grid gap-6 lg:grid-cols-2">
        {CHANNELS.map((ch) => (
          <StreamCard key={ch.id} {...ch} />
        ))}
      </div>

      {/* تنويه الهيئة */}
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-center text-xs leading-relaxed text-slate-600 dark:border-emerald-900/40 dark:bg-slate-800/80 dark:text-slate-300 sm:text-sm">
        <Radio size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>
          البث مقدَّم من القنوات الرسمية لهيئة الإذاعة والتلفزيون بالمملكة العربية السعودية.
        </span>
      </div>

    </section>
  )
}
