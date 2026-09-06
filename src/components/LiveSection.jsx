import { ExternalLink, Play, Radio, Wifi } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/* ─── قائمة القنوات ─────────────────────────────────────────── */
const CHANNELS = [
  {
    id: 'makkah',
    title: 'قناة القرآن الكريم',
    subtitle: 'بث مباشر من المسجد الحرام — مكة المكرمة',
    /* Video ID الصحيح للبث الدائم لقناة القرآن الكريم */
    videoId: 'PLkCnLrKN8Q',
    officialUrl: 'https://www.youtube.com/watch?v=PLkCnLrKN8Q',
    gradient: 'from-emerald-950 via-teal-900 to-emerald-900',
    accentColor: '#10b981',
  },
  {
    id: 'madinah',
    title: 'قناة السنة النبوية',
    subtitle: 'بث مباشر من المسجد النبوي — المدينة المنورة',
    channelId: 'UCROKYPep-UuODNwyipe6JMw',
    officialUrl: 'https://www.youtube.com/@SaudiSunnahTv/live',
    gradient: 'from-amber-950 via-yellow-900 to-teal-900',
    accentColor: '#f59e0b',
  },
]

/* ─── بطاقة قناة ────────────────────────────────────────────── */
function StreamCard({ title, subtitle, videoId, channelId, officialUrl, gradient, accentColor }) {
  const [status, setStatus] = useState('idle') // idle | loading | playing | blocked
  const iframeRef = useRef(null)
  const embedSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1`
    : `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=1&rel=0&modestbranding=1`

  /* كشف إذا كان الـ embed محجوباً بواسطة YouTube */
  useEffect(() => {
    if (status !== 'loading') return
    const timeout = setTimeout(() => {
      /* لو ما حصلش onLoad في 8 ثواني → محجوب */
      setStatus((prev) => (prev === 'loading' ? 'blocked' : prev))
    }, 8000)
    return () => clearTimeout(timeout)
  }, [status])

  const handleLoad = () => {
    /* YouTube بيرجع صفحة حتى لو محجوب — نحاول نكشف بـ postMessage لكن مستحيل بسبب CORS */
    /* نفترض النجاح ونخلّي المستخدم يشوف */
    setStatus('playing')
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900">

      {/* منطقة الفيديو — نسبة 16:9 */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>

        {/* ── شاشة الانتظار (idle) ── */}
        {status === 'idle' && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br ${gradient} px-6 text-center text-white`}>
            {/* نمط زخرفي خفيف */}
            <div className="absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
            />

            <div className="relative flex flex-col items-center gap-3">
              {/* مؤشر البث */}
              <span className="live-pill"><i /> مباشر الآن</span>

              <p className="text-2xl font-extrabold">{title}</p>
              <p className="text-sm text-white/70">{subtitle}</p>

              {/* زر التشغيل الرئيسي */}
              <button
                onClick={() => setStatus('loading')}
                className="mt-1 flex items-center gap-2.5 rounded-2xl px-7 py-3.5 font-bold text-white shadow-lg transition active:scale-95"
                style={{ backgroundColor: accentColor }}
              >
                <Play size={18} fill="currentColor" /> تشغيل البث
              </button>

              {/* زر يوتيوب مباشر */}
              <a href={officialUrl} target="_blank" rel="noreferrer"
                className="mt-1 flex items-center gap-1.5 rounded-xl border border-white/25 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/15">
                أو افتح على يوتيوب <ExternalLink size={11} />
              </a>
            </div>
          </div>
        )}

        {/* ── تحميل + Iframe ── */}
        {(status === 'loading' || status === 'playing') && (
          <>
            {status === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-3 text-white">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-emerald-400" />
                  <p className="text-sm">جارٍ تحميل البث...</p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={embedSrc}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={handleLoad}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0,
                opacity: status === 'playing' ? 1 : 0, transition: 'opacity .4s'
              }}
            />
          </>
        )}

        {/* ── محجوب من YouTube ── */}
        {status === 'blocked' && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br ${gradient} px-6 text-center text-white`}>
            <div className="relative flex flex-col items-center gap-3">
              <span className="live-pill"><i /> مباشر الآن</span>
              <p className="text-lg font-bold">{title}</p>
              <p className="max-w-xs text-sm leading-7 text-white/70">
                يوتيوب لا يسمح بتضمين هذا البث مباشرةً. اضغط أدناه لمشاهدته على يوتيوب.
              </p>
              <a
                href={officialUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 flex items-center gap-2.5 rounded-2xl px-7 py-3.5 font-bold text-white shadow-lg transition active:scale-95"
                style={{ backgroundColor: accentColor }}
              >
                <ExternalLink size={16} /> شاهد على يوتيوب
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ── معلومات القناة ── */}
      <div className="flex items-center justify-between gap-3 p-5">
        <div>
          <h2 className="text-xl font-extrabold text-ink dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="live-pill"><i /> مباشر</span>
          <a href={officialUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950">
            يوتيوب <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </article>
  )
}

/* ─── القسم الرئيسي ─────────────────────────────────────────── */
export default function LiveSection() {
  return (
    <section className="space-y-5 pb-28">
      <div className="section-heading">
        <div>
          <span className="eyebrow"><Wifi size={14} /> على الهواء</span>
          <h1>البث المباشر</h1>
          <p>تابع الحرمين الشريفين مباشرةً عبر القنوات الرسمية على يوتيوب.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {CHANNELS.map((ch) => <StreamCard key={ch.id} {...ch} />)}
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-center text-sm leading-7 text-slate-600 dark:border-emerald-900/40 dark:bg-slate-800 dark:text-slate-300">
        <Radio size={16} className="mb-1 inline-block opacity-60" />
        &nbsp; البث مقدَّم من القنوات الرسمية لهيئة الإذاعة والتلفزيون السعودية.
        اضغط "تشغيل" للمشاهدة داخل الموقع، أو افتح يوتيوب مباشرةً.
      </div>
    </section>
  )
}
