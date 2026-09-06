import { Check, Copy, RotateCcw, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ADHKAR } from '../data'

/* ─── استرجاع وحفظ العداد يومياً ─── */
const STORAGE_KEY = 'noor-adhkar-counts'
const todayKey = () => new Date().toLocaleDateString('en-CA')

function loadCounts() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (saved?.date === todayKey()) return saved.counts
  } catch { localStorage.removeItem(STORAGE_KEY) }
  return {}
}

function saveCounts(counts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey(), counts }))
}

export default function AdhkarSection() {
  const categories = Object.keys(ADHKAR)
  const [active, setActive] = useState(categories[0])
  const [counts, setCounts] = useState(loadCounts)
  const [copied, setCopied] = useState('')
  /* مفتاح الزر الذي يُعاد ضبطه (لعرض تأكيد مؤقت) */
  const [resetting, setResetting] = useState('')

  /* حفظ العداد كلما تغيّر */
  useEffect(() => { saveCounts(counts) }, [counts])

  const increment = (key, target) =>
    setCounts((old) => ({ ...old, [key]: Math.min((old[key] || 0) + 1, target) }))

  const copy = async (key, text) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 1800)
  }

  const share = async (text) => {
    if (navigator.share) await navigator.share({ title: 'ذكر من الأذكار', text })
    else await navigator.clipboard.writeText(text)
  }

  /* إعادة ضبط العداد مع تأكيد مرئي بسيط (تمييز الزر للحظة) */
  const resetCount = (key) => {
    setResetting(key)
    setCounts((old) => ({ ...old, [key]: 0 }))
    setTimeout(() => setResetting(''), 800)
  }

  return (
    <section className="space-y-5 pb-28">
      <div className="section-heading">
        <div>
          <span className="eyebrow">وردك اليومي</span>
          <h1>الأذكار</h1>
          <p>أذكار مختارة مع عدّاد يومي يُحفظ تلقائيًا ويُصفّر كل يوم.</p>
        </div>
      </div>

      <div className="tab-list" role="tablist">
        {categories.map((category) => (
          <button
            key={category}
            className={active === category ? 'active' : ''}
            onClick={() => setActive(category)}
            role="tab"
            aria-selected={active === category}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {ADHKAR[active].map((dhikr, index) => {
          const key = `${active}-${index}`
          const current = counts[key] || 0
          const done = current >= dhikr.count
          return (
            <article key={key} className={`dhikr-card ${done ? 'completed' : ''}`}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <span className="source-pill">{dhikr.source}</span>
                <button
                  onClick={() => resetCount(key)}
                  className={`icon-button transition-colors ${resetting === key ? 'text-rose-500' : ''}`}
                  title="إعادة العداد"
                  aria-label="إعادة العداد"
                >
                  <RotateCcw size={17} />
                </button>
              </div>

              <p>{dhikr.text}</p>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-100 pt-4 dark:border-slate-700">
                <div className="flex gap-2">
                  <button onClick={() => copy(key, dhikr.text)} className="icon-button" title="نسخ الذكر">
                    {copied === key ? <Check size={17} className="text-emerald-600" /> : <Copy size={17} />}
                  </button>
                  <button onClick={() => share(dhikr.text)} className="icon-button" title="مشاركة الذكر">
                    <Share2 size={17} />
                  </button>
                </div>
                <button
                  onClick={() => increment(key, dhikr.count)}
                  className={`counter-button ${done ? 'done' : ''}`}
                  aria-label="زيادة العداد"
                  disabled={done}
                >
                  <strong>{current}</strong>
                  <span>/ {dhikr.count}</span>
                  {done && <Check size={16} />}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
