import { Download, Headphones, LoaderCircle, Play, Radio, Search, Volume2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { RIWAYAT, SURAH_NAMES } from '../data'
import { getReciters, getSurahLabel, makeAudioUrl } from '../services/api'

/* ── توحيد الأحرف العربية للبحث ── */
function normalizeArabic(text = '') {
  return text
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .trim()
}

const TOP_SHEIKHS = [
  'الكل',
  'المنشاوي',
  'عبد الباسط',
  'الحصري',
  'العفاسي',
  'المعيقلي',
  'السديس',
  'الشريم',
  'الغامدي'
]

export default function AudioSection({ settings, setSettings, onPlay }) {
  const [reciters, setReciters] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('الكل')
  const [selectedSurah, setSelectedSurah] = useState(settings.surah)

  useEffect(() => {
    setSelectedSurah(settings.surah)
  }, [settings.surah])

  useEffect(() => {
    let ignore = false
    setLoading(true)
    getReciters(settings.riwaya, settings.style)
      .then((data) => { if (!ignore) setReciters(data) })
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [settings.riwaya, settings.style])

  const filtered = reciters.filter((reciter) => {
    const q = normalizeArabic(query)
    const matchesQuery = !q || normalizeArabic(reciter.name).includes(q)
    const matchesChip =
      activeFilter === 'الكل' ||
      normalizeArabic(reciter.name).includes(normalizeArabic(activeFilter))
    return matchesQuery && matchesChip
  })

  const handleChipClick = (name) => {
    setActiveFilter(name)
    if (name !== 'الكل') setQuery('')
  }

  return (
    <section className="space-y-5 pb-28">
      <div className="section-heading">
        <div>
          <span className="eyebrow"><Headphones size={14} /> مكتبة التلاوات</span>
          <h1>استمع للقرآن الكريم</h1>
          <p>تلاوات خاشعة لكبار قرّاء العالم الإسلامي بروايات وأساليب متعددة.</p>
        </div>
      </div>

      <div className="glass-card p-5 space-y-4">
        {/* شريط البحث المتقدم عن القارئ */}
        <div className="relative">
          <Search className="absolute right-3.5 top-3.5 text-emerald-600 dark:text-emerald-400 pointer-events-none" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (activeFilter !== 'الكل') setActiveFilter('الكل')
            }}
            placeholder="ابحث عن قارئ أو شيخ (مثال: المنشاوي، عبد الباسط، الحصري، العفاسي)..."
            className="w-full rounded-2xl border border-emerald-200/90 bg-emerald-50/40 py-3 pr-10 pl-10 text-sm font-medium text-ink placeholder-slate-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:focus:bg-slate-900"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute left-3.5 top-3.5 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="مسح البحث"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* أزرار الفلترة السريعة لكبار الشيوخ */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-1">شيوخ مميزون:</span>
          {TOP_SHEIKHS.map((name) => (
            <button
              key={name}
              onClick={() => handleChipClick(name)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                activeFilter === name
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* خيارات التصفية الإضافية (الرواية، أسلوب التلاوة، السورة) */}
        <div className="grid gap-3 pt-3 border-t border-emerald-100/60 dark:border-slate-800 sm:grid-cols-3">
          <label className="input-wrap">
            <span>الرواية</span>
            <select value={settings.riwaya} onChange={(event) => setSettings((old) => ({ ...old, riwaya: event.target.value }))}>
              {RIWAYAT.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <label className="input-wrap">
            <span>نوع التلاوة</span>
            <select value={settings.style} onChange={(event) => setSettings((old) => ({ ...old, style: event.target.value }))}>
              <option value="murattal">مرتل</option>
              <option value="mujawwad">مجود</option>
            </select>
          </label>
          <label className="input-wrap">
            <span>السورة المراد سماعها</span>
            <select value={selectedSurah} onChange={(event) => setSelectedSurah(Number(event.target.value))}>
              {SURAH_NAMES.map((name, index) => <option key={name} value={index + 1}>{index + 1}. {name}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-bold text-ink dark:text-white">القرّاء المتاحون</h2>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
          {loading ? 'جارِ التحديث...' : `${filtered.length} قارئ`}
        </span>
      </div>

      {loading ? (
        <div className="grid min-h-52 place-items-center text-emerald-600">
          <LoaderCircle className="animate-spin" size={30} />
        </div>
      ) : filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((reciter) => (
            <article key={reciter.id} className="reciter-card">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 shrink-0">
                <Volume2 size={23} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-bold text-ink dark:text-white">{reciter.name}</h3>
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{reciter.moshaf.name}</p>
              </div>
              <button
                className="icon-button text-emerald-600 dark:text-emerald-400"
                onClick={() => onPlay(selectedSurah, reciter)}
                aria-label={`تشغيل ${reciter.name}`}
              >
                <Play size={18} fill="currentColor" />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Radio size={30} />
          <p>لا يوجد قارئ مطابق لـ «{query || activeFilter}». جرّب اسماً آخر أو اختر الرواية المناسبة.</p>
        </div>
      )}

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-sm leading-7 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
        <Download className="ml-2 inline" size={16} /> بعد تشغيل أي تلاوة ستجد زر التنزيل، والتكرار (السورة / الآية) في المشغّل الثابت أسفل الصفحة. <span className="font-bold">{getSurahLabel(selectedSurah)}</span>
      </div>
    </section>
  )
}
