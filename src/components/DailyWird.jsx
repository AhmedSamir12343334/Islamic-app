import { Check, Minus, Plus, RotateCcw, Sparkles } from 'lucide-react'
import { useState } from 'react'

const storageKey = 'noor-daily-wird'
const today = () => new Date().toLocaleDateString('en-CA')
const initialState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null')
    if (saved?.date === today()) return saved
  } catch { localStorage.removeItem(storageKey) }
  return { date: today(), progress: 0, goal: 20 }
}

export default function DailyWird() {
  const [wird, setWird] = useState(initialState)
  const update = (change) => setWird((current) => {
    const next = typeof change === 'function' ? change(current) : change
    const normalized = { ...next, date: today(), progress: Math.max(0, Math.min(next.progress, next.goal)) }
    localStorage.setItem(storageKey, JSON.stringify(normalized))
    return normalized
  })
  const percent = Math.round((wird.progress / wird.goal) * 100)
  const complete = wird.progress >= wird.goal
  return <section className="utility-card wird-card">
    <div className="utility-heading"><div><span className="eyebrow"><Sparkles size={14} /> وردك اليومي</span><h2>{complete ? 'أتممت وردك اليوم' : 'ورد ختمة ٣٠ يوماً'}</h2></div><button className="icon-button" onClick={() => update((item) => ({ ...item, progress: 0 }))} title="إعادة ضبط"><RotateCcw size={17} /></button></div>
    <div className="wird-progress"><div className="wird-circle" style={{ '--progress': `${percent * 3.6}deg` }}><strong>{percent}%</strong><span>مكتمل</span></div><div><p><b>{wird.progress}</b> من {wird.goal} صفحة</p><small>هدفك اليومي يقارب جزءاً كاملاً.</small></div></div>
    <div className="mt-5 flex items-center justify-between gap-3"><label className="text-xs font-bold text-slate-500 dark:text-slate-400">هدف الصفحات<select value={wird.goal} onChange={(event) => update((item) => ({ ...item, goal: Number(event.target.value) }))}>{[10, 20, 30, 40].map((goal) => <option key={goal} value={goal}>{goal} صفحة</option>)}</select></label><div className="flex gap-2"><button className="icon-button" onClick={() => update((item) => ({ ...item, progress: item.progress - 1 }))} disabled={wird.progress === 0} aria-label="إنقاص صفحة"><Minus size={17} /></button><button className={`wird-add ${complete ? 'complete' : ''}`} onClick={() => update((item) => ({ ...item, progress: item.progress + 1 }))}>{complete ? <Check size={17} /> : <Plus size={17} />}{complete ? 'مكتمل' : 'أضف صفحة'}</button></div></div>
  </section>
}
