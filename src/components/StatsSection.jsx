import { BookOpen, Check, Copy, Flame, History, RotateCcw, Send, Share2, Target } from 'lucide-react'
import { useEffect, useState } from 'react'

const KHATMA_KEY = 'noor-khatma-v1'
const LAST_POSITION_KEY = 'noor-last-position'
const ADHKAR_KEY = 'noor-adhkar-counts'
const WIRD_KEY = 'noor-wird-v3'
const ACTIVITY_KEY = 'noor-activity-v1'
const KHATMA_DAYS = [7, 15, 30]
const TELEGRAM_GROUP_URL = import.meta.env.VITE_TELEGRAM_GROUP_URL || 'https://t.me/+FXjbrGYE7uRmMmM0'
const todayKey = () => new Date().toLocaleDateString('en-CA')

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback } catch { return fallback }
}

function saveJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* التخزين اختياري */ }
}

function getInitialKhatma() {
  const saved = readJson(KHATMA_KEY, null)
  return saved?.days && saved?.pagesPerDay ? saved : null
}

function getStats() {
  const wird = readJson(WIRD_KEY, {})
  const adhkar = readJson(ADHKAR_KEY, {})
  const lastPosition = readJson(LAST_POSITION_KEY, null)
  const adhkarCompleted = Object.values(adhkar.date === todayKey() ? (adhkar.counts || {}) : {})
    .reduce((sum, count) => sum + Number(count || 0), 0)
  return {
    pages: wird.date === todayKey() ? Number(wird.progress || 0) : 0,
    goal: Number(wird.goal || 20),
    streak: Number(wird.streak || 0),
    adhkarCompleted,
    lastPosition
  }
}

function getWeeklyActivity() {
  const saved = readJson(ACTIVITY_KEY, {})
  const current = getStats()
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))
    const key = date.toLocaleDateString('en-CA')
    const day = saved[key] || (index === 6 ? { pages: current.pages, adhkar: current.adhkarCompleted } : {})
    return {
      key,
      label: new Intl.DateTimeFormat('ar-EG', { weekday: 'short' }).format(date),
      pages: Number(day.pages || 0),
      adhkar: Number(day.adhkar || 0)
    }
  })
}

export default function StatsSection() {
  const [khatma, setKhatma] = useState(getInitialKhatma)
  const [selectedDays, setSelectedDays] = useState(khatma?.days || 30)
  const [stats, setStats] = useState(getStats)
  const [activity, setActivity] = useState(getWeeklyActivity)
  const [notice, setNotice] = useState('')
  const [groupId, setGroupId] = useState(() => readJson('noor-group-khatma-v1', null)?.id || '')

  useEffect(() => {
    const sync = () => { setStats(getStats()); setActivity(getWeeklyActivity()); setKhatma(getInitialKhatma()) }
    window.addEventListener('storage', sync)
    window.addEventListener('adhkar-counts-updated', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('adhkar-counts-updated', sync)
    }
  }, [])

  const startKhatma = () => {
    const plan = { days: selectedDays, pagesPerDay: Math.ceil(604 / selectedDays), startedAt: todayKey() }
    saveJson(KHATMA_KEY, plan)
    const currentWird = readJson(WIRD_KEY, {})
    saveJson(WIRD_KEY, {
      ...currentWird,
      date: todayKey(),
      goal: plan.pagesPerDay,
      progress: Math.min(Number(currentWird.progress || 0), plan.pagesPerDay)
    })
    setKhatma(plan)
    window.dispatchEvent(new Event('wird-updated'))
    setNotice(`تم إعداد ختمة ${selectedDays} يوماً: ${plan.pagesPerDay} صفحة يومياً.`)
  }

  const resetKhatma = () => {
    try { localStorage.removeItem(KHATMA_KEY) } catch { /* التخزين محظور */ }
    const currentWird = readJson(WIRD_KEY, {})
    saveJson(WIRD_KEY, { ...currentWird, goal: 20, progress: Math.min(Number(currentWird.progress || 0), 20) })
    setKhatma(null)
    window.dispatchEvent(new Event('wird-updated'))
    setNotice('تم إيقاف خطة الختمة.')
  }

  const createGroupKhatma = () => {
    const id = Math.random().toString(36).slice(2, 8).toUpperCase()
    saveJson('noor-group-khatma-v1', { id, createdAt: todayKey(), days: selectedDays })
    setGroupId(id)
    setNotice(`تم إنشاء ختمة جماعية برمز ${id}. شارك الرابط مع من تريد.`)
  }

  const shareGroupKhatma = async () => {
    if (!groupId) return
    const url = `${window.location.origin}${window.location.pathname}#group-khatma=${groupId}`
    try {
      if (navigator.share) await navigator.share({ title: 'ختمة جماعية', text: `انضم إلى ختمتنا الجماعية: ${groupId}`, url })
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); setNotice('تم نسخ رابط الختمة الجماعية.') }
    } catch { /* أُلغيَت المشاركة */ }
  }

  const shareOnTelegram = () => {
    if (!groupId) return
    const url = `${window.location.origin}${window.location.pathname}#group-khatma=${groupId}`
    const text = `انضم إلى ختمتنا الجماعية 🤍\nرمز الختمة: ${groupId}`
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
    window.open(telegramUrl, '_blank', 'noopener,noreferrer')
  }

  const joinTelegramGroup = () => {
    window.open(TELEGRAM_GROUP_URL, '_blank', 'noopener,noreferrer')
  }

  const progress = Math.min(100, Math.round((stats.pages / Math.max(1, stats.goal)) * 100))
  const maxPages = Math.max(stats.goal, ...activity.map((day) => day.pages), 1)
  const maxAdhkar = Math.max(...activity.map((day) => day.adhkar), 1)

  return (
    <section className="space-y-5 pb-28">
      <div className="section-heading">
        <div>
          <span className="eyebrow"><History size={14} /> متابعتك اليومية</span>
          <h1>الإحصائيات والخطط</h1>
          <p>تابع إنجازك اليومي، وراقب تقدم ختمتك، وحافظ على استمراريتك.</p>
        </div>
      </div>

      {notice && <div className="utility-error" role="status"><Check size={18} /><span>{notice}</span><button onClick={() => setNotice('')}>إخفاء</button></div>}

      <div className="stats-grid">
        <article className="stat-card"><BookOpen size={20} /><strong>{stats.pages}</strong><span>صفحة اليوم</span></article>
        <article className="stat-card"><Target size={20} /><strong>{progress}%</strong><span>إنجاز الورد</span></article>
        <article className="stat-card"><Flame size={20} /><strong>{stats.streak}</strong><span>أيام متتالية</span></article>
        <article className="stat-card"><Check size={20} /><strong>{stats.adhkarCompleted}</strong><span>أذكار مكتملة</span></article>
      </div>

      <div className="activity-grid">
        <article className="utility-card activity-card">
          <div className="utility-heading"><div><span className="eyebrow"><History size={14} /> آخر 7 أيام</span><h2>نشاطك الأسبوعي</h2></div></div>
          <div className="activity-chart" aria-label="رسم نشاط الورد والأذكار خلال آخر سبعة أيام">
            {activity.map((day) => <div key={day.key} className="activity-day"><div className="activity-bars"><span className="activity-bar pages" style={{ height: `${Math.max(day.pages ? 10 : 3, (day.pages / maxPages) * 100)}%` }} title={`${day.pages} صفحة`} /><span className="activity-bar adhkar" style={{ height: `${Math.max(day.adhkar ? 10 : 3, (day.adhkar / maxAdhkar) * 100)}%` }} title={`${day.adhkar} ذكر`} /></div><strong>{day.label}</strong></div>)}
          </div>
          <div className="activity-legend"><span><i className="pages" /> صفحات</span><span><i className="adhkar" /> أذكار</span></div>
        </article>

        <article className="utility-card activity-card">
          <div className="utility-heading"><div><span className="eyebrow"><History size={14} /> سجل الالتزام</span><h2>ملخص الأيام</h2></div></div>
          <div className="activity-history">{activity.slice().reverse().map((day) => <div key={day.key} className="activity-history-row"><strong>{day.label}</strong><span>{day.pages} صفحة</span><span>{day.adhkar} ذكر</span></div>)}</div>
        </article>
      </div>

      <div className="stats-layout">
        <article className="utility-card">
          <div className="utility-heading">
            <div><span className="eyebrow"><Target size={14} /> خطة الختمة</span><h2>{khatma ? `ختمة ${khatma.days} يوماً` : 'ابدأ ختمتك'}</h2></div>
            {khatma && <button className="icon-button" onClick={resetKhatma} title="إيقاف الختمة" aria-label="إيقاف الختمة"><RotateCcw size={17} /></button>}
          </div>
          {khatma ? (
            <div className="mt-5 space-y-4">
              <div className="khatma-progress"><span style={{ width: `${Math.min(100, Math.round((stats.pages / khatma.pagesPerDay) * 100))}%` }} /></div>
              <div className="flex items-end justify-between gap-3"><p className="text-sm text-slate-500 dark:text-slate-400">هدف اليوم</p><strong className="text-3xl text-ink dark:text-white">{khatma.pagesPerDay} <small className="text-sm font-bold text-slate-400">صفحة</small></strong></div>
              <p className="text-xs text-slate-500 dark:text-slate-400">باقي {Math.max(0, khatma.pagesPerDay - stats.pages)} صفحة لإتمام ورد اليوم.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <p className="text-sm leading-7 text-slate-500 dark:text-slate-400">اختر مدة الختمة، وسيُحسب هدف الصفحات اليومي تلقائياً من أصل 604 صفحات.</p>
              <div className="grid grid-cols-3 gap-2">{KHATMA_DAYS.map((days) => <button key={days} className={`plan-choice ${selectedDays === days ? 'active' : ''}`} onClick={() => setSelectedDays(days)}>{days}<small>يوم</small></button>)}</div>
              <button className="button-primary w-full" onClick={startKhatma}><Target size={17} /> بدء الختمة</button>
            </div>
          )}
        </article>
        <article className="utility-card">
          <div className="utility-heading"><div><span className="eyebrow"><Share2 size={14} /> ختمتنا معاً</span><h2>ختمتنا معاً</h2></div></div>
          <div className="mt-5 space-y-4">
            <p className="text-sm leading-7 text-slate-500 dark:text-slate-400">شارك أهلك وأصدقاءك في ختم القرآن، واختر مدة الختمة ثم شارك الدعوة عبر تليجرام.</p>
            {groupId ? <div className="group-khatma-code"><span>رمز الختمة</span><strong>{groupId}</strong></div> : <button className="button-primary w-full" onClick={createGroupKhatma}><Share2 size={17} /> إنشاء ختمة جماعية</button>}
            {groupId && <div className="grid gap-2 sm:grid-cols-2"><button className="button-secondary justify-center py-2" onClick={shareGroupKhatma}><Share2 size={16} /> مشاركة الرابط</button><button className="button-secondary justify-center py-2" onClick={shareOnTelegram}><Send size={16} /> مشاركة بتليجرام</button><button className="button-secondary justify-center py-2" onClick={joinTelegramGroup}><Send size={16} /> انضم للمجموعة</button><button className="button-secondary justify-center py-2" onClick={async () => { await navigator.clipboard?.writeText(groupId); setNotice('تم نسخ رمز الختمة.') }}><Copy size={16} /> نسخ الرمز</button></div>}
          </div>
        </article>

      </div>

      {stats.lastPosition && <article className="bookmark-callout"><BookOpen size={18} /><span className="mr-0">آخر موضع تلقائي: سورة {stats.lastPosition.name}، آية {stats.lastPosition.ayah}</span></article>}
    </section>
  )
}
