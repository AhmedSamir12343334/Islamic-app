import { AlertCircle, Clock3, LocateFixed, MapPin, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const PRAYERS = [
  { key: 'Fajr', label: 'الفجر' },
  { key: 'Dhuhr', label: 'الظهر' },
  { key: 'Asr', label: 'العصر' },
  { key: 'Maghrib', label: 'المغرب' },
  { key: 'Isha', label: 'العشاء' }
]
const cacheKey = 'noor-prayer-times'
const cleanTime = (value = '') => value.replace(/\s*\(.*?\)\s*$/, '').trim()
const dayKey = () => new Date().toLocaleDateString('en-CA')

function getNextPrayer(timings) {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const next = PRAYERS.find(({ key }) => {
    const [hours, minutes] = cleanTime(timings[key]).split(':').map(Number)
    return hours * 60 + minutes > currentMinutes
  })
  return next || PRAYERS[0]
}

export default function PrayerTimes() {
  const [payload, setPayload] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /* تحميل الـ cache عند الـ mount */
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null')
      if (cached?.date === dayKey() && cached?.data?.timings) setPayload(cached.data)
    } catch {
      try { localStorage.removeItem(cacheKey) } catch { /* التخزين محظور */ }
    }
  }, [])

  /* كشف تغيير اليوم (مثلاً لو فتح الموقع بعد منتصف الليل) */
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null')
        if (cached && cached.date !== dayKey()) {
          /* يوم جديد — نحذف البيانات القديمة */
          localStorage.removeItem(cacheKey)
          setPayload(null)
        }
      } catch { /* تجاهل */ }
    }, 60 * 1000) // كل دقيقة
    return () => clearInterval(interval)
  }, [])

  const loadTimings = async ({ latitude, longitude }) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=5`)
      if (!response.ok) throw new Error('تعذر جلب مواقيت الصلاة حالياً.')
      const result = await response.json()
      if (!result?.data?.timings) throw new Error('بيانات المواقيت غير مكتملة.')
      setPayload(result.data)
      try { localStorage.setItem(cacheKey, JSON.stringify({ date: dayKey(), data: result.data })) } catch { /* التخزين اختياري */ }
    } catch (requestError) {
      setError(requestError.message || 'تعذر جلب مواقيت الصلاة حالياً.')
    } finally {
      setLoading(false)
    }
  }

  const requestLocation = () => {
    if (!navigator.geolocation) { setError('المتصفح لا يدعم تحديد الموقع.'); return }
    setLoading(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      (position) => loadTimings(position.coords),
      () => { setLoading(false); setError('لم يتم السماح بتحديد الموقع. يمكنك المحاولة مرة أخرى.') },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60 * 60 * 1000 }
    )
  }

  const next = useMemo(() => payload ? getNextPrayer(payload.timings) : null, [payload])

  useEffect(() => {
    if (!next || !payload) return
    const prayer = { label: next.label, time: cleanTime(payload.timings[next.key]) }
    window.__nextPrayer = prayer
    window.dispatchEvent(new CustomEvent('prayer-updated', { detail: prayer }))
  }, [next, payload])

  return (
    <section className="utility-card prayer-card">
      <div className="utility-heading">
        <div>
          <span className="eyebrow"><Clock3 size={14} /> مواقيت اليوم</span>
          <h2>الصلاة القادمة</h2>
        </div>
        {payload && (
          <button className="icon-button" onClick={requestLocation} title="تحديث الموقع">
            <RefreshCw size={17} />
          </button>
        )}
      </div>

      {!payload && !loading && !error && (
        <div className="utility-empty">
          <MapPin size={23} />
          <p>حدّد موقعك لعرض المواقيت الدقيقة لمدينتك.</p>
          <button className="button-primary" onClick={requestLocation}>
            <LocateFixed size={16} /> تحديد موقعي
          </button>
        </div>
      )}

      {loading && (
        <div className="space-y-3 py-5">
          <div className="skeleton-line w-3/5" />
          <div className="skeleton-line w-full" />
          <div className="skeleton-line w-4/5" />
        </div>
      )}

      {error && (
        <div className="utility-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={requestLocation}>إعادة المحاولة</button>
        </div>
      )}

      {payload && !loading && (
        <>
          <div className="next-prayer">
            <span>{next.label}</span>
            <strong>{cleanTime(payload.timings[next.key])}</strong>
            <small>{payload.date?.hijri?.date} {payload.date?.hijri?.month?.ar}</small>
          </div>
          <div className="prayer-grid">
            {PRAYERS.map((prayer) => (
              <div key={prayer.key} className={next.key === prayer.key ? 'active' : ''}>
                <span>{prayer.label}</span>
                <strong>{cleanTime(payload.timings[prayer.key])}</strong>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
