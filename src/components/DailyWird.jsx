import { ArrowLeft, BookOpen, BookOpenCheck, Check, CheckCircle2, Flame, Minus, Plus, RotateCcw, Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ADHKAR } from '../data'

const MOTIVATIONS = [
  'خير ما يُشغل به المرء وقته تلاوة القرآن الكريم',
  'من قرأ حرفاً من كتاب الله فله به حسنة والحسنة بعشر أمثالها',
  'اقرأ ورتّل كلام رب العالمين',
  'القرآن شفاء للقلوب ونور للبصائر',
  'اجعل لك نصيباً من كلام الله كل يوم',
]

const STORAGE_KEY = 'noor-wird-v3'
const ADHKAR_STORAGE_KEY = 'noor-adhkar-counts'
const ACTIVITY_KEY = 'noor-activity-v1'
const todayStr = () => new Date().toLocaleDateString('en-CA')

function loadWird() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (raw) {
      const progress = raw.date === todayStr() ? (raw.progress || 0) : 0
      const streak = raw.date === todayStr() ? (raw.streak || 0) : raw.yesterdayDone ? (raw.streak || 0) : 0
      return { ...raw, progress, streak, date: todayStr() }
    }
  } catch {
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* التخزين محظور */ }
  }
  return { date: todayStr(), progress: 0, goal: 20, streak: 0 }
}

function saveWird(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    const activity = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '{}')
    activity[todayStr()] = { ...(activity[todayStr()] || {}), pages: data.progress }
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity))
  } catch { /* التخزين اختياري */ }
}

function loadAdhkarCounts() {
  try {
    const saved = JSON.parse(localStorage.getItem(ADHKAR_STORAGE_KEY) || 'null')
    return saved?.date === todayStr() ? (saved.counts || {}) : {}
  } catch { return {} }
}

function getAdhkarProgress(category, counts) {
  const items = ADHKAR[category] || []
  const total = items.reduce((sum, item) => sum + item.count, 0)
  const completed = items.reduce((sum, item, index) => Math.min(counts[`${category}-${index}`] || 0, item.count) + sum, 0)
  return { completed, total, percent: total ? Math.round((completed / total) * 100) : 0 }
}

export default function DailyWird() {
  const [wird, setWird] = useState(loadWird)
  const [adhkarCounts, setAdhkarCounts] = useState(loadAdhkarCounts)
  const [justDone, setJustDone] = useState(false)

  const motivation = MOTIVATIONS[new Date().getDay() % MOTIVATIONS.length]
  const percent = Math.min(100, Math.round((wird.progress / wird.goal) * 100))
  const isDone = wird.progress >= wird.goal
  const morningProgress = getAdhkarProgress('أذكار الصباح', adhkarCounts)
  const eveningProgress = getAdhkarProgress('أذكار المساء', adhkarCounts)
  const overallPercent = Math.round((percent + morningProgress.percent + eveningProgress.percent) / 3)
  const openAdhkar = (category) => {
    window.__preferredAdhkarCategory = category
    window.dispatchEvent(new CustomEvent('open-adhkar', { detail: { category } }))
  }

  useEffect(() => {
    const syncAdhkar = () => setAdhkarCounts(loadAdhkarCounts())
    const syncWird = () => setWird(loadWird())
    window.addEventListener('adhkar-counts-updated', syncAdhkar)
    window.addEventListener('wird-updated', syncWird)
    window.addEventListener('storage', syncAdhkar)
    return () => {
      window.removeEventListener('adhkar-counts-updated', syncAdhkar)
      window.removeEventListener('wird-updated', syncWird)
      window.removeEventListener('storage', syncAdhkar)
    }
  }, [])

  const update = (next) => {
    const normalized = { ...next, date: todayStr(), progress: Math.max(0, Math.min(next.progress, next.goal)) }
    saveWird(normalized)
    setWird(normalized)
  }

  const addPage = () => {
    if (isDone) return
    const next = { ...wird, progress: wird.progress + 1 }
    if (next.progress >= next.goal) {
      next.streak = (wird.streak || 0) + 1
      next.yesterdayDone = true
      setJustDone(true)
      setTimeout(() => setJustDone(false), 2500)
    }
    update(next)
  }

  const boxes = Array.from({ length: wird.goal }, (_, i) => i < wird.progress)

  return (
    <section className="utility-card wird-card overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="eyebrow"><BookOpen size={13} /> وردك اليومي</span>
          <h2 className="mt-0.5">{isDone ? 'أتممت وردك اليوم ✅' : 'ورد القرآن اليومي'}</h2>
        </div>
        {wird.streak > 0 && (
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-extrabold text-amber-600 dark:bg-amber-950/50 dark:text-amber-300">
            <Flame size={14} className="text-orange-500" />
            {wird.streak} يوم
          </div>
        )}
      </div>

      <p className="mt-3 border-r-2 border-emerald-400 pr-2 text-[11px] italic leading-5 text-slate-500 dark:text-slate-400">
        {motivation}
      </p>

      <div className="mt-4 flex items-end gap-3">
        <div className="wird-circle" style={{ '--progress': `${overallPercent * 3.6}deg` }}>
          <strong>{overallPercent}%</strong>
          <span>منجز</span>
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-500 dark:text-slate-400">الصفحات المقروءة</p>
          <p className="text-4xl font-black leading-none text-ink dark:text-white">
            {wird.progress}
            <span className="mr-1 text-base font-bold text-slate-400 dark:text-slate-500">/ {wird.goal}</span>
          </p>
          {isDone ? (
            <p className="mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">بارك الله فيك 🎉</p>
          ) : (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">تبقى {wird.goal - wird.progress} صفحة</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1">
        {boxes.map((filled, i) => (
          <div
            key={i}
            className={`h-2 min-w-[6px] flex-1 rounded-full transition-all duration-300 ${filled ? 'bg-emerald-500 shadow-sm shadow-emerald-400/40' : 'bg-slate-100 dark:bg-slate-800'}`}
          />
        ))}
      </div>

      {justDone && (
        <div className="mt-3 flex animate-bounce items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <p className="text-sm font-bold">ماشاء الله! أتممت وردك اليوم 🌿</p>
        </div>
      )}

      <div className="mt-5 border-t border-emerald-100 pt-4 dark:border-slate-700">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-extrabold text-ink dark:text-white">خطة اليوم</p>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{overallPercent}% مكتمل</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className={`smart-wird-item ${isDone ? 'complete' : ''}`}>
            <div className="smart-wird-icon"><BookOpen size={16} /></div>
            <div className="min-w-0 flex-1">
              <p>ورد القرآن</p>
              <span>{wird.progress} من {wird.goal} صفحة</span>
            </div>
            {isDone ? <Check size={17} /> : <span className="smart-wird-percent">{percent}%</span>}
          </div>
          <button className={`smart-wird-item text-right ${morningProgress.percent === 100 ? 'complete' : ''}`} onClick={() => openAdhkar('أذكار الصباح')}>
            <div className="smart-wird-icon"><Sun size={16} /></div>
            <div className="min-w-0 flex-1">
              <p>أذكار الصباح</p>
              <span>{morningProgress.percent === 100 ? 'تمت بالكامل' : `${morningProgress.percent}% مكتمل`}</span>
            </div>
            {morningProgress.percent === 100 ? <Check size={17} /> : <ArrowLeft size={15} />}
          </button>
          <button className={`smart-wird-item text-right ${eveningProgress.percent === 100 ? 'complete' : ''}`} onClick={() => openAdhkar('أذكار المساء')}>
            <div className="smart-wird-icon"><Moon size={16} /></div>
            <div className="min-w-0 flex-1">
              <p>أذكار المساء</p>
              <span>{eveningProgress.percent === 100 ? 'تمت بالكامل' : `${eveningProgress.percent}% مكتمل`}</span>
            </div>
            {eveningProgress.percent === 100 ? <Check size={17} /> : <ArrowLeft size={15} />}
          </button>
        </div>
      </div>

      <div className="wird-controls mt-4 flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          الهدف
          <select
            value={wird.goal}
            onChange={(e) => update({ ...wird, goal: Number(e.target.value) })}
            className="rounded-lg border border-emerald-100 bg-white px-2 py-1 text-xs text-ink outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {[10, 15, 20, 30, 40].map((g) => <option key={g} value={g}>{g} صفحة</option>)}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => update({ ...wird, progress: wird.progress - 1 })}
            disabled={wird.progress === 0}
            className="icon-button border border-slate-200 dark:border-slate-700"
            title="إنقاص صفحة"
          >
            <Minus size={16} />
          </button>
          <button onClick={addPage} disabled={isDone} className={`wird-add ${isDone ? 'complete' : ''}`}>
            {isDone ? <><BookOpenCheck size={16} /> منجز</> : <><Plus size={16} /> أضف صفحة</>}
          </button>
          <button
            onClick={() => update({ ...wird, progress: 0 })}
            className="icon-button border border-slate-200 dark:border-slate-700"
            title="إعادة الضبط"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
    </section>
  )
}
