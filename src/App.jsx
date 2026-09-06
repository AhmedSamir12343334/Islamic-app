import { BookOpenText, Compass, Headphones, Menu, Moon, Radio, Smartphone, Sun, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import AdhkarSection from './components/AdhkarSection'
import AudioPlayer from './components/AudioPlayer'
import AudioSection from './components/AudioSection'
import ContactSocial from './components/ContactSocial'
import LiveSection from './components/LiveSection'
import QiblaSection from './components/QiblaSection'
import QuranSection from './components/QuranSection'
import { SURAH_NAMES } from './data'
import { getAyahTimings, getReciters, makeAudioUrl } from './services/api'

const navItems = [
  { id: 'quran', label: 'القرآن', icon: BookOpenText },
  { id: 'audio', label: 'التلاوات', icon: Headphones },
  { id: 'adhkar', label: 'الأذكار', icon: Sun },
  { id: 'qibla', label: 'القبلة', icon: Compass },
  { id: 'live', label: 'البث المباشر', icon: Radio }
]

/* ── تحميل إعدادات المستخدم من localStorage ── */
function loadSettings() {
  const savedRiwaya = localStorage.getItem('noor-riwaya')
  const savedReciter = localStorage.getItem('noor-reciter')
  const validReciter = (savedReciter && savedReciter.includes('-') && savedReciter !== '112-10924') ? savedReciter : '112-112'
  return {
    surah: Number(localStorage.getItem('noor-surah')) || 1,
    riwaya: (!savedRiwaya || savedRiwaya === 'qaloon') ? 'hafs' : savedRiwaya,
    style: localStorage.getItem('noor-style') || 'murattal',
    fontSize: Number(localStorage.getItem('noor-font')) || 32,
    reciterId: validReciter
  }
}

export default function App() {
  const [active, setActive] = useState('quran')
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('noor-theme') === 'dark')
  const [settings, setSettings] = useState(loadSettings)
  const [track, setTrack] = useState(null)
  const [activeAyah, setActiveAyah] = useState(null)
  const [activeSurah, setActiveSurah] = useState(null)
  const [installPrompt, setInstallPrompt] = useState(null)

  useEffect(() => {
    const handleBeforeInstall = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstallPrompt(null)
  }
  const playbackRequest = useRef(0)

  /* تطبيق الوضع الداكن / الفاتح */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('noor-theme', dark ? 'dark' : 'light')
  }, [dark])

  /* حفظ الإعدادات تلقائياً */
  useEffect(() => {
    localStorage.setItem('noor-surah', settings.surah)
    localStorage.setItem('noor-riwaya', settings.riwaya)
    localStorage.setItem('noor-style', settings.style)
    localStorage.setItem('noor-font', settings.fontSize)
    if (settings.reciterId) localStorage.setItem('noor-reciter', settings.reciterId)
  }, [settings])

  const play = async (surah = settings.surah, suppliedReciter, startAyah = 1) => {
    const requestId = ++playbackRequest.current
    let reciter = suppliedReciter
    if (!reciter) {
      const reciters = await getReciters(settings.riwaya, settings.style)
      reciter = reciters.find((r) => r.id === settings.reciterId) || reciters[0]
    }
    if (!reciter) { setActive('audio'); return }
    const timings = await getAyahTimings(surah, reciter)
    if (requestId !== playbackRequest.current) return
    setActiveAyah(startAyah)
    setActiveSurah(surah)
    setTrack({
      url: makeAudioUrl(reciter, surah),
      surah,
      startAyah,
      timings,
      surahName: `سورة ${SURAH_NAMES[surah - 1]}`,
      reciterName: reciter.name,
      riwaya: reciter.moshaf.name,
      reciter
    })
  }

  const navigateTrack = (offset) => {
    if (!track) return
    const surah = Math.min(114, Math.max(1, track.surah + offset))
    setSettings((old) => ({ ...old, surah }))
    play(surah, track.reciter)
  }

  const renderSection = () => {
    switch (active) {
      case 'quran': return <QuranSection settings={settings} setSettings={setSettings} onPlay={play} activeAyah={activeAyah} activeSurah={activeSurah} />
      case 'audio': return <AudioSection settings={settings} setSettings={setSettings} onPlay={play} />
      case 'adhkar': return <AdhkarSection />
      case 'qibla': return <QiblaSection />
      default: return <LiveSection />
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 transition-colors dark:bg-[#071923] dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-emerald-100/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-4 sm:px-6">
          <button className="brand group" onClick={() => setActive('quran')}>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-gold-100 shadow-md shadow-emerald-700/20 transition-transform group-hover:scale-105">
              <svg className="h-6 w-6 text-gold-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                <path d="M6 8h2" strokeWidth="1.5" stroke="#fef08a" />
                <path d="M16 8h2" strokeWidth="1.5" stroke="#fef08a" />
                <path d="M6 12h2" strokeWidth="1.5" stroke="#fef08a" />
                <path d="M16 12h2" strokeWidth="1.5" stroke="#fef08a" />
              </svg>
            </span>
            <div>
              <strong className="text-base font-extrabold text-ink dark:text-white">صدقة جارية</strong>
              <small className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400">رفيقك اليومي</small>
            </div>
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`nav-link ${active === id ? 'active' : ''}`} onClick={() => setActive(id)}>
                <Icon size={17} />{label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {installPrompt && (
              <button
                onClick={handleInstallClick}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:scale-105"
                title="تثبيت التطبيق على جهازك"
              >
                <Smartphone size={15} />
                <span>تثبيت التطبيق</span>
              </button>
            )}

            <div className="theme-switch" role="group" aria-label="اختيار المظهر">
              <button onClick={() => setDark(false)} className={!dark ? 'selected' : ''} aria-pressed={!dark} title="تفعيل الوضع الفاتح">
                <Sun size={16} /><span>فاتح</span>
              </button>
              <button onClick={() => setDark(true)} className={dark ? 'selected' : ''} aria-pressed={dark} title="تفعيل الوضع الداكن">
                <Moon size={16} /><span>داكن</span>
              </button>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="icon-button lg:hidden" aria-label="القائمة">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-emerald-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`mobile-nav-link ${active === id ? 'active' : ''}`} onClick={() => { setActive(id); setMenuOpen(false) }}>
                <Icon size={18} />{label}
              </button>
            ))}
            {installPrompt && (
              <button
                onClick={() => { handleInstallClick(); setMenuOpen(false) }}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm"
              >
                <Smartphone size={16} />
                <span>تثبيت تطبيق صدقة جارية</span>
              </button>
            )}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {renderSection()}
      </main>

      <footer className="border-t border-emerald-100 bg-white px-4 py-7 pb-28 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <ContactSocial />
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            صدقة جارية · اجعل لك ورداً من كتاب الله كل يوم
          </p>
          <p className="mt-2 text-center text-xs font-bold tracking-wide text-emerald-700 dark:text-emerald-300">
            تم تصميم الموقع بالكامل من قبل AHMED SAMIR FAZZA
          </p>
        </div>
      </footer>

      <AudioPlayer
        track={track}
        onClose={() => { setTrack(null); setActiveAyah(null); setActiveSurah(null) }}
        onNext={() => navigateTrack(1)}
        onPrevious={() => navigateTrack(-1)}
        onActiveAyah={(surah, ayah) => { setActiveSurah(surah); setActiveAyah(ayah) }}
      />
    </div>
  )
}
