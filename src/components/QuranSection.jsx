import { AlertCircle, Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Play, Settings2, Type } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { SURAH_NAMES } from '../data'
import { getSurah } from '../services/api'
import DailyWird from './DailyWird'
import PrayerTimes from './PrayerTimes'

/* ── قراءة الـ bookmark من localStorage ── */
function loadBookmark() {
  try {
    return JSON.parse(localStorage.getItem('noor-bookmark') || 'null')
  } catch {
    localStorage.removeItem('noor-bookmark')
    return null
  }
}

export default function QuranSection({ settings, setSettings, onPlay, activeAyah, activeSurah }) {
  const [verses, setVerses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showControls, setShowControls] = useState(false)
  const [attempt, setAttempt] = useState(0)
  /* إدارة الـ bookmark عبر state حتى يتحدّث الـ UI فوراً عند الحفظ */
  const [bookmark, setBookmark] = useState(loadBookmark)
  const surah = settings.surah
  /* ref للـ scroll container الداخلي */
  const scrollRef = useRef(null)

  /* مزامنة الـ bookmark عند تغييره من أي مكان (storage event) */
  useEffect(() => {
    const sync = () => setBookmark(loadBookmark())
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  /* تحميل آيات السورة */
  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError('')
    getSurah(surah)
      .then((data) => { if (!ignore) setVerses(data) })
      .catch((err) => { if (!ignore) setError(err.message) })
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [surah, attempt])

  /* إعادة التمرير للأعلى عند تغيير السورة */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [surah])

  /* التمرير التلقائي السلس للآية المُشغَّلة بدقة داخل حاوية التمرير فقط */
  useEffect(() => {
    if (!activeAyah || activeSurah !== surah || loading) return
    const ayahEl = document.getElementById(`ayah-${activeAyah}`)
    const container = scrollRef.current
    if (!ayahEl || !container) return

    const ayahRect = ayahEl.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    /* التحقق إذا كانت الآية ظاهرة بالفعل في منتصف أو مساحة العرض الحالية */
    const isVisible = (
      ayahRect.top >= containerRect.top + 60 &&
      ayahRect.bottom <= containerRect.bottom - 60
    )

    if (!isVisible) {
      const scrollOffset = ayahRect.top - containerRect.top + container.scrollTop - (container.clientHeight / 2) + (ayahRect.height / 2)
      container.scrollTo({
        top: Math.max(0, scrollOffset),
        behavior: 'smooth'
      })
    }
  }, [activeAyah, activeSurah, surah, loading])

  const changeSurah = (next) => setSettings((old) => ({ ...old, surah: Math.min(114, Math.max(1, next)) }))

  const saveBookmark = () => {
    const data = { surah, ayah: 1, name: SURAH_NAMES[surah - 1] }
    localStorage.setItem('noor-bookmark', JSON.stringify(data))
    setBookmark(data)
    /* إعلام النوافذ الأخرى */
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <section className="space-y-5 pb-28">
      <div className="section-heading">
        <div>
          <span className="eyebrow">المصحف الشريف</span>
          <h1>اقرأ بطمأنينة</h1>
          <p>نص عثماني واضح، مع حفظ موضع القراءة على جهازك.</p>
        </div>
        <button className="button-secondary" onClick={() => setShowControls(!showControls)}>
          <Settings2 size={17} /> إعدادات القراءة
        </button>
      </div>

      <div className="glass-card p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
          <label className="input-wrap">
            <span>السورة</span>
            <select value={surah} onChange={(event) => changeSurah(Number(event.target.value))}>
              {SURAH_NAMES.map((name, index) => (
                <option key={name} value={index + 1}>{index + 1}. {name}</option>
              ))}
            </select>
          </label>
          <button className="button-secondary justify-center" onClick={() => changeSurah(surah - 1)} disabled={surah === 1}>
            <ChevronUp size={17} /> السابقة
          </button>
          <button className="button-secondary justify-center" onClick={() => changeSurah(surah + 1)} disabled={surah === 114}>
            التالية <ChevronDown size={17} />
          </button>
        </div>

        {showControls && (
          <div className="mt-4 grid gap-3 border-t border-emerald-100 pt-4 dark:border-slate-700 sm:grid-cols-3">
            <label className="input-wrap">
              <span>الرواية</span>
              <select value={settings.riwaya} onChange={(event) => setSettings((old) => ({ ...old, riwaya: event.target.value }))}>
                <option value="hafs">حفص عن عاصم</option>
                <option value="warsh">ورش عن نافع</option>
              </select>
            </label>
            <label className="input-wrap">
              <span>أسلوب التلاوة</span>
              <select value={settings.style} onChange={(event) => setSettings((old) => ({ ...old, style: event.target.value }))}>
                <option value="murattal">مرتل</option>
                <option value="mujawwad">مجود</option>
              </select>
            </label>
            <div className="input-wrap">
              <span><Type size={14} /> حجم الخط: {settings.fontSize}px</span>
              <input type="range" min="25" max="45" value={settings.fontSize}
                onChange={(event) => setSettings((old) => ({ ...old, fontSize: Number(event.target.value) }))} />
            </div>
          </div>
        )}
      </div>

      {bookmark && (
        <button onClick={() => changeSurah(bookmark.surah)} className="bookmark-callout">
          <BookmarkCheck size={18} /> آخر موضع محفوظ: سورة {bookmark.name}
          <span>متابعة</span>
        </button>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <PrayerTimes />
        <DailyWird />
      </div>

      <article className="quran-paper flex flex-col" style={{ maxHeight: '82vh', minHeight: '500px' }}>

        {/* ── Header ثابت ── */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gold-100 pb-4 shrink-0">
          <div>
            <span className="text-sm text-emerald-700">
              {surah < 10 ? `00${surah}` : surah < 100 ? `0${surah}` : surah}
            </span>
            <h2>سورة {SURAH_NAMES[surah - 1]}</h2>
          </div>
          <div className="flex gap-2">
            <button className="icon-button" title="حفظ الموضع" onClick={saveBookmark}>
              <Bookmark size={19} />
            </button>
            <button className="button-primary py-2 text-sm" onClick={() => onPlay(surah)}>
              <Play size={16} fill="currentColor" /> استمع
            </button>
          </div>
        </div>

        {/* ── منطقة التمرير ── */}
        <div ref={scrollRef} className="quran-scroll-area flex-1 overflow-y-auto">

          {loading && (
            <div className="space-y-5 py-8" aria-label="جارِ تحميل السورة">
              {Array.from({ length: 7 }, (_, index) => (
                <div key={index} className={`skeleton-line ${index % 3 === 0 ? 'w-4/5' : index % 3 === 1 ? 'w-full' : 'w-3/5'}`} />
              ))}
            </div>
          )}

          {error && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-rose-50 p-4 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
              <AlertCircle size={20} />
              <span>{error}</span>
              <button onClick={() => setAttempt((value) => value + 1)} className="button-secondary mr-auto py-2">
                إعادة المحاولة
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="quran-text" style={{ fontSize: `${settings.fontSize}px` }}>
              {surah !== 1 && surah !== 9 && <p className="basmalah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>}
              {verses.map((verse) => (
                <button
                  key={verse.key}
                  id={`ayah-${verse.number}`}
                  className={`ayah ${activeSurah === surah && activeAyah === verse.number ? 'is-playing' : ''}`}
                  onClick={() => onPlay(surah, undefined, verse.number)}
                  title={`تشغيل الآية ${verse.number}`}
                >
                  {verse.text} <sup>{verse.number}</sup>{' '}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ثابت ── */}
        <p className="mt-4 border-t border-gold-100 pt-3 text-center text-xs text-slate-500 shrink-0">
          الرواية المختارة تضبط التلاوة. النص العثماني يُجلب من مزود القرآن الموثق.
        </p>
      </article>
    </section>
  )
}
