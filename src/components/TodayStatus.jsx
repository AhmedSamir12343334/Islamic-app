import { CalendarDays, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

function getDates() {
  const now = new Date()
  return {
    day: new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(now),
    gregorian: new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(now),
    hijri: new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(now)
  }
}

export default function TodayStatus() {
  const [dates, setDates] = useState(getDates)

  useEffect(() => {
    const interval = setInterval(() => setDates(getDates()), 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="today-status" aria-label="حالة اليوم">
      <div className="today-status-heading">
        <span className="today-status-icon"><CalendarDays size={18} /></span>
        <div>
          <span className="eyebrow">حالة اليوم</span>
          <h2>{dates.day}</h2>
        </div>
      </div>
      <div className="today-status-dates">
        <div><span>الميلادي</span><strong>{dates.gregorian}</strong></div>
        <div><span><Moon size={12} /> الهجري</span><strong>{dates.hijri}</strong></div>
      </div>
    </section>
  )
}
