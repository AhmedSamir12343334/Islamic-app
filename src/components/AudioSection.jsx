import { Download, Headphones, LoaderCircle, Play, Radio, Volume2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { RIWAYAT, SURAH_NAMES } from '../data'
import { getReciters, getSurahLabel, makeAudioUrl } from '../services/api'

export default function AudioSection({ settings, setSettings, onPlay }) {
  const [reciters, setReciters] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedSurah, setSelectedSurah] = useState(settings.surah)
  useEffect(() => { setSelectedSurah(settings.surah) }, [settings.surah])
  useEffect(() => {
    let ignore = false; setLoading(true)
    getReciters(settings.riwaya, settings.style).then((data) => { if (!ignore) setReciters(data) }).finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [settings.riwaya, settings.style])
  const filtered = reciters.filter((reciter) => reciter.name.includes(query.trim()))
  return <section className="space-y-5 pb-28">
    <div className="section-heading"><div><span className="eyebrow"><Headphones size={14} /> مكتبة التلاوات</span><h1>استمع للقرآن الكريم</h1><p>القرّاء المعروضون محصورون في الروايات الثلاث التي اخترتها.</p></div></div>
    <div className="glass-card grid gap-4 p-5 lg:grid-cols-4">
      <label className="input-wrap"><span>الرواية</span><select value={settings.riwaya} onChange={(event) => setSettings((old) => ({ ...old, riwaya: event.target.value }))}>{RIWAYAT.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <label className="input-wrap"><span>نوع التلاوة</span><select value={settings.style} onChange={(event) => setSettings((old) => ({ ...old, style: event.target.value }))}><option value="murattal">مرتل</option><option value="mujawwad">مجود</option></select></label>
      <label className="input-wrap"><span>السورة</span><select value={selectedSurah} onChange={(event) => setSelectedSurah(Number(event.target.value))}>{SURAH_NAMES.map((name, index) => <option key={name} value={index + 1}>{index + 1}. {name}</option>)}</select></label>
      <label className="input-wrap"><span>ابحث عن قارئ</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="مثال: السديس" /></label>
    </div>
    <div className="flex items-center justify-between"><h2 className="font-bold text-ink dark:text-white">القرّاء المتاحون</h2><span className="text-sm text-slate-500">{loading ? 'جارِ التحديث...' : `${filtered.length} قارئ`}</span></div>
    {loading ? <div className="grid min-h-52 place-items-center text-emerald-600"><LoaderCircle className="animate-spin" size={30} /></div> : filtered.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((reciter) => <article key={reciter.id} className="reciter-card"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950"><Volume2 size={23} /></div><div className="min-w-0 flex-1"><h3 className="truncate font-bold text-ink dark:text-white">{reciter.name}</h3><p className="mt-1 truncate text-xs text-slate-500">{reciter.moshaf.name}</p></div><button className="icon-button text-emerald-600" onClick={() => onPlay(selectedSurah, reciter)} aria-label={`تشغيل ${reciter.name}`}><Play size={18} fill="currentColor" /></button></article>)}</div> : <div className="empty-state"><Radio size={30} /><p>لا توجد تلاوة مطابقة حالياً. جرّب «مرتل» أو غيّر الرواية.</p></div>}
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-sm leading-7 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"><Download className="ml-2 inline" size={16} /> بعد تشغيل أي تلاوة ستجد زر التنزيل، والتكرار (السورة / الآية) في المشغّل الثابت أسفل الصفحة. <span className="font-bold">{getSurahLabel(selectedSurah)}</span></div>
  </section>
}
