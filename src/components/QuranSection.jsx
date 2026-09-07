import { AlertCircle, Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Play, Search, Settings2, Type, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { SURAH_NAMES } from '../data'
import { getReciters, getSurah } from '../services/api'
import DailyWird from './DailyWird'
import PrayerTimes from './PrayerTimes'

/* ── قراءة الـ bookmark من localStorage ── */
function loadBookmark() {
  try {
    return JSON.parse(localStorage.getItem('noor-bookmark') || 'null')
  } catch {
    try { localStorage.removeItem('noor-bookmark') } catch { /* التخزين محظور */ }
    return null
  }
}

/* ── تنظيف وتوحيد الحروف العربية للبحث الذكي ── */
function normalizeArabic(text = '') {
  return text
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .trim()
}

const POPULAR_SURAHS = [
  { id: 1, name: 'الفاتحة' },
  { id: 2, name: 'البقرة' },
  { id: 18, name: 'الكهف' },
  { id: 36, name: 'يس' },
  { id: 55, name: 'الرحمن' },
  { id: 56, name: 'الواقعة' },
  { id: 67, name: 'الملك' },
  { id: 112, name: 'الإخلاص' }
]

export default function QuranSection({ settings, setSettings, onPlay, activeAyah, activeSurah, lastPosition }) {
  const [verses, setVerses] = useState([])
  const [reciters, setReciters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showControls, setShowControls] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  /* إدارة الـ bookmark عبر state حتى يتحدّث الـ UI فوراً عند الحفظ */
  const [bookmark, setBookmark] = useState(loadBookmark)
  const surah = settings.surah
  /* ref للـ scroll container الداخلي */
  const scrollRef = useRef(null)
  const searchWrapRef = useRef(null)

  /* إغلاق قائمة البحث عند النقر خارجها */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /* مزامنة الـ bookmark عند تغييره من أي مكان (storage event) */
  useEffect(() => {
    const sync = () => setBookmark(loadBookmark())
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  /* جلب قائمة الشيوخ حسب الرواية وأسلوب التلاوة */
  useEffect(() => {
    let ignore = false
    getReciters(settings.riwaya, settings.style).then((data) => {
      if (!ignore) {
        setReciters(data)
        if (data.length && (!settings.reciterId || !data.some((r) => r.id === settings.reciterId))) {
          setSettings((old) => ({ ...old, reciterId: data[0].id }))
        }
      }
    })
    return () => { ignore = true }
  }, [settings.riwaya, settings.style])

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
    if (!activeAyah || Number(activeSurah) !== Number(surah) || loading) return
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

  const changeSurah = (next) => {
    setSettings((old) => ({ ...old, surah: Math.min(114, Math.max(1, next)) }))
    setSearchQuery('')
    setSearchOpen(false)
  }

  const saveBookmark = () => {
    const data = { surah, ayah: Number(activeAyah) || 1, name: SURAH_NAMES[surah - 1] }
    try { localStorage.setItem('noor-bookmark', JSON.stringify(data)) } catch { return }
    setBookmark(data)
    /* إعلام النوافذ الأخرى */
    window.dispatchEvent(new Event('storage'))
  }

  const currentReciter = reciters.find((r) => r.id === settings.reciterId) || reciters[0]

  /* فلترة السور للبحث */
  const matchingSurahs = searchQuery.trim()
    ? SURAH_NAMES.map((name, index) => ({ id: index + 1, name }))
        .filter((item) => {
          const q = normalizeArabic(searchQuery)
          return (
            normalizeArabic(item.name).includes(q) ||
            String(item.id).includes(searchQuery.trim())
          )
        })
    : []

  return (
    <section className="space-y-5 pb-28">
      <div className="section-heading">
        <div>
          <span className="eyebrow">المصحف الشريف</span>
          <h1>اقرأ بطمأنينة</h1>
          <p>نص عثماني واضح، مع محرك بحث فوري في السور واختيار قارئك المفضل.</p>
        </div>
        <button className="button-secondary" onClick={() => setShowControls(!showControls)}>
          <Settings2 size={17} /> إعدادات القراءة والتلاوة
        </button>
      </div>

      <div className="glass-card p-4 sm:p-5 space-y-4">
        {/* شريط البحث المباشر في السور */}
        <div ref={searchWrapRef} className="relative">
          <div className="relative flex items-center">
            <Search className="absolute right-3.5 text-emerald-600 dark:text-emerald-400 pointer-events-none" size={18} />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSearchOpen(true)
              }}
              placeholder="ابحث عن سورة بالاسم أو الرقم (مثال: الكهف، يس، 18، الرحمن)..."
              className="w-full rounded-2xl border border-emerald-200/90 bg-emerald-50/40 py-3 pr-10 pl-10 text-sm font-medium text-ink placeholder-slate-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:focus:bg-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="مسح البحث"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* قائمة نتائج البحث السريع */}
          {searchOpen && searchQuery.trim() && (
            <div className="absolute top-full z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-emerald-100 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              {matchingSurahs.length > 0 ? (
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
                  {matchingSurahs.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => changeSurah(item.id)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-right text-xs font-bold transition ${
                        item.id === surah
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>سورة {item.name}</span>
                      <span className="font-mono text-[10px] opacity-75">{item.id}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  لا توجد سورة مطابقة لـ «{searchQuery}»
                </p>
              )}
            </div>
          )}
        </div>

        {/* أزرار الانتقال السريع لأشهر السور - تمرير أفقي سلس للموبايل */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-1 shrink-0">انتقال سريع:</span>
          {POPULAR_SURAHS.map((item) => (
            <button
              key={item.id}
              onClick={() => changeSurah(item.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                surah === item.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* محدد السورة والأزرار السابقة والتالية بتصميم مرن للموبايل والديسكتوب */}
        <div className="grid grid-cols-2 sm:grid-cols-[1fr_auto_auto] gap-2.5 pt-2 border-t border-emerald-100/60 dark:border-slate-800 items-end">
          <label className="input-wrap col-span-2 sm:col-span-1">
            <span>اختر السورة من القائمة</span>
            <select value={surah} onChange={(event) => changeSurah(Number(event.target.value))}>
              {SURAH_NAMES.map((name, index) => (
                <option key={name} value={index + 1}>{index + 1}. {name}</option>
              ))}
            </select>
          </label>
          <button className="button-secondary justify-center py-2.5" onClick={() => changeSurah(surah - 1)} disabled={surah === 1}>
            <ChevronUp size={17} /> السابقة
          </button>
          <button className="button-secondary justify-center py-2.5" onClick={() => changeSurah(surah + 1)} disabled={surah === 114}>
            التالية <ChevronDown size={17} />
          </button>
        </div>


        {showControls && (
          <div className="mt-4 grid gap-3 border-t border-emerald-100 pt-4 dark:border-slate-700 sm:grid-cols-2 lg:grid-cols-4">
            <label className="input-wrap">
              <span>القارئ / الشيخ</span>
              <select
                value={settings.reciterId || (reciters[0]?.id || '')}
                onChange={(event) => setSettings((old) => ({ ...old, reciterId: event.target.value }))}
              >
                {reciters.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </label>
            <label className="input-wrap">
              <span>الرواية</span>
              <select value={settings.riwaya} onChange={(event) => setSettings((old) => ({ ...old, riwaya: event.target.value, reciterId: '' }))}>
                <option value="hafs">حفص عن عاصم</option>
                <option value="warsh">ورش عن نافع</option>
              </select>
            </label>
            <label className="input-wrap">
              <span>أسلوب التلاوة</span>
              <select value={settings.style} onChange={(event) => setSettings((old) => ({ ...old, style: event.target.value, reciterId: '' }))}>
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

      {lastPosition && (
        <button onClick={() => {
          setSettings((old) => ({ ...old, surah: lastPosition.surah }))
          onPlay(lastPosition.surah, undefined, lastPosition.ayah)
        }} className="bookmark-callout">
          <BookmarkCheck size={18} /> استئناف القراءة: سورة {lastPosition.name}، آية {lastPosition.ayah}
          <span>متابعة</span>
        </button>
      )}

      {bookmark && (
        <button onClick={() => changeSurah(bookmark.surah)} className="bookmark-callout">
          <BookmarkCheck size={18} /> آخر موضع محفوظ: سورة {bookmark.name}
          <span>متابعة</span>
        </button>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-2">
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
          <div className="flex items-center gap-2">
            {currentReciter && (
              <span className="hidden text-xs text-emerald-800 dark:text-emerald-300 md:inline-block font-medium bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                بصوت: {currentReciter.name}
              </span>
            )}
            <button className="icon-button" title="حفظ الموضع" onClick={saveBookmark}>
              <Bookmark size={19} />
            </button>
            <button className="button-primary py-2 text-sm" onClick={() => onPlay(surah, currentReciter, 1, verses)}>
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
              {verses.map((verse) => {
                const isPlaying = Number(activeSurah) === Number(surah) && Number(activeAyah) === Number(verse.number)
                return (
                  <span
                    key={verse.key}
                    id={`ayah-${verse.number}`}
                    role="button"
                    tabIndex={0}
                    className={`ayah ${isPlaying ? 'is-playing' : ''}`}
                    onClick={() => onPlay(surah, currentReciter, verse.number, verses)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onPlay(surah, currentReciter, verse.number, verses)
                      }
                    }}
                    title={`تشغيل الآية ${verse.number}`}
                  >
                    <span className="ayah-text">{verse.text}</span>
                    <span className="ayah-end">
                      <span className="ayah-symbol">۝</span>
                      <span className="ayah-num">{verse.number}</span>
                    </span>
                    {' '}
                  </span>
                )
              })}
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
