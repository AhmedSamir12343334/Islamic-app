import { BarChart3, BookOpenText, Compass, Headphones, Moon, Radio, Sun } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import AdhkarSection from './components/AdhkarSection'
import AudioPlayer from './components/AudioPlayer'
import AudioSection from './components/AudioSection'
import ContactSocial from './components/ContactSocial'
import LiveSection from './components/LiveSection'
import QiblaSection from './components/QiblaSection'
import QuranSection from './components/QuranSection'
import StatsSection from './components/StatsSection'
import IosInstallModal, { isIosDevice } from './components/IosInstallModal'
import { SURAH_NAMES } from './data'
import { getAyahTimings, getReciters, getSurah, makeAudioUrl } from './services/api'

const navItems = [
  { id: 'quran', label: 'القرآن', icon: BookOpenText },
  { id: 'audio', label: 'التلاوات', icon: Headphones },
  { id: 'adhkar', label: 'الأذكار', icon: Sun },
  { id: 'qibla', label: 'القبلة', icon: Compass },
  { id: 'live', label: 'البث المباشر', icon: Radio },
  { id: 'stats', label: 'إحصائياتي', icon: BarChart3 }
]

const LAST_POSITION_KEY = 'noor-last-position'

function loadLastPosition() {
  try { return JSON.parse(localStorage.getItem(LAST_POSITION_KEY) || 'null') } catch { return null }
}

/* ── تحميل إعدادات المستخدم من localStorage ── */
function loadSettings() {
  const getItem = (key) => {
    try { return window.localStorage.getItem(key) } catch { return null }
  }
  const savedRiwaya = getItem('noor-riwaya')
  const savedReciter = getItem('noor-reciter')
  const validReciter = (savedReciter && savedReciter.includes('-') && savedReciter !== '112-10924') ? savedReciter : '112-112'
  const savedSurah = Number(getItem('noor-surah'))
  const savedFontSize = Number(getItem('noor-font'))
  return {
    surah: Number.isInteger(savedSurah) && savedSurah >= 1 && savedSurah <= 114 ? savedSurah : 1,
    riwaya: savedRiwaya === 'warsh' ? 'warsh' : 'hafs',
    style: getItem('noor-style') || 'murattal',
    fontSize: Number.isFinite(savedFontSize) && savedFontSize >= 25 && savedFontSize <= 45 ? savedFontSize : 32,
    reciterId: validReciter
  }
}

function saveItem(key, value) {
  try { window.localStorage.setItem(key, value) } catch { /* التخزين قد يكون محظوراً في بعض المتصفحات */ }
}

export default function App() {
  const [active, setActive] = useState('quran')
  const [dark, setDark] = useState(() => {
    try { return window.localStorage.getItem('noor-theme') === 'dark' } catch { return false }
  })
  const [settings, setSettings] = useState(loadSettings)
  const [track, setTrack] = useState(null)
  const [activeAyah, setActiveAyah] = useState(null)
  const [activeSurah, setActiveSurah] = useState(null)
  const [lastPosition, setLastPosition] = useState(loadLastPosition)
  const [installPrompt, setInstallPrompt] = useState(() => window.__pwaInstallPrompt || null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showIosInstall, setShowIosInstall] = useState(false)

  useEffect(() => {
    const openAdhkar = (event) => {
      window.__preferredAdhkarCategory = event.detail?.category || window.__preferredAdhkarCategory
      setActive('adhkar')
    }
    window.addEventListener('open-adhkar', openAdhkar)
    return () => window.removeEventListener('open-adhkar', openAdhkar)
  }, [])

  useEffect(() => {
    const openStats = () => setActive('stats')
    window.addEventListener('open-stats', openStats)
    return () => window.removeEventListener('open-stats', openStats)
  }, [])

  useEffect(() => {
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    setIsStandalone(isStandaloneMode)

    if (window.__pwaInstallPrompt) {
      setInstallPrompt(window.__pwaInstallPrompt)
    }

    const handleBeforeInstall = (event) => {
      event.preventDefault()
      window.__pwaInstallPrompt = event
      setInstallPrompt(event)
    }
    const handlePromptReady = () => {
      if (window.__pwaInstallPrompt) setInstallPrompt(window.__pwaInstallPrompt)
    }
    const handleAppInstalled = () => {
      setIsStandalone(true)
      setInstallPrompt(null)
      window.__pwaInstallPrompt = null
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('pwa-prompt-ready', handlePromptReady)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('pwa-prompt-ready', handlePromptReady)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    // إذا كان المستخدم على جهاز آيفون أو آيباد، يتم فتح نافذة إرشادات التثبيت المخصصة لـ iOS
    if (isIosDevice()) {
      setShowIosInstall(true)
      return
    }

    // للأنظمة الأخرى (أندرويد والكمبيوتر) يتم تشغيل التثبيت التلقائي المباشر
    const promptEvent = installPrompt || window.__pwaInstallPrompt
    if (promptEvent) {
      try {
        await promptEvent.prompt()
        const { outcome } = await promptEvent.userChoice
        if (outcome === 'accepted') {
          setInstallPrompt(null)
          window.__pwaInstallPrompt = null
          setIsStandalone(true)
        }
      } catch (err) {
        console.error('PWA prompt error:', err)
      }
    }
  }
  const playbackRequest = useRef(0)

  /* تطبيق الوضع الداكن / الفاتح */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    saveItem('noor-theme', dark ? 'dark' : 'light')
  }, [dark])

  /* حفظ الإعدادات تلقائياً */
  useEffect(() => {
    saveItem('noor-surah', settings.surah)
    saveItem('noor-riwaya', settings.riwaya)
    saveItem('noor-style', settings.style)
    saveItem('noor-font', settings.fontSize)
    if (settings.reciterId) saveItem('noor-reciter', settings.reciterId)
  }, [settings])

  const play = async (surah = settings.surah, suppliedReciter, startAyah = 1, suppliedVerses = null) => {
    const requestId = ++playbackRequest.current
    let reciter = suppliedReciter
    if (!reciter) {
      const reciters = await getReciters(settings.riwaya, settings.style)
      reciter = reciters.find((r) => r.id === settings.reciterId) || reciters[0]
    }
    if (!reciter) { setActive('audio'); return }

    const verses = suppliedVerses || []
    setActiveAyah(startAyah)
    setActiveSurah(surah)
    const position = { surah, ayah: startAyah, name: SURAH_NAMES[surah - 1], updatedAt: Date.now() }
    saveItem(LAST_POSITION_KEY, JSON.stringify(position))
    setLastPosition(position)
    setTrack({
      url: makeAudioUrl(reciter, surah),
      surah,
      startAyah,
      timings: {},
      verses,
      surahName: `سورة ${SURAH_NAMES[surah - 1]}`,
      reciterName: reciter.name,
      riwaya: reciter.moshaf.name,
      reciter
    })

    const versesPromise = suppliedVerses?.length
      ? Promise.resolve(suppliedVerses)
      : getSurah(surah).catch(() => [])
    const timingsPromise = getAyahTimings(surah, reciter).catch(() => ({}))
    const [loadedVerses, timings] = await Promise.all([versesPromise, timingsPromise])
    if (requestId !== playbackRequest.current) return
    setTrack((current) => current && current.url === makeAudioUrl(reciter, surah)
      ? { ...current, verses: loadedVerses, timings }
      : current)
  }

  const navigateTrack = (offset) => {
    if (!track) return
    const surah = Math.min(114, Math.max(1, track.surah + offset))
    setSettings((old) => ({ ...old, surah }))
    play(surah, track.reciter)
  }

  const handleActiveAyah = (surah, ayah) => {
    const position = { surah, ayah, name: SURAH_NAMES[surah - 1], updatedAt: Date.now() }
    saveItem(LAST_POSITION_KEY, JSON.stringify(position))
    setLastPosition(position)
    setActiveSurah(surah)
    setActiveAyah(ayah)
  }

  const renderSection = () => {
    switch (active) {
      case 'quran': return <QuranSection settings={settings} setSettings={setSettings} onPlay={play} activeAyah={activeAyah} activeSurah={activeSurah} lastPosition={lastPosition} />
      case 'audio': return <AudioSection settings={settings} setSettings={setSettings} onPlay={play} />
      case 'adhkar': return <AdhkarSection initialCategory={window.__preferredAdhkarCategory} />
      case 'qibla': return <QiblaSection />
      case 'stats': return <StatsSection />
      default: return <LiveSection />
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 transition-colors dark:bg-[#071923] dark:text-slate-100">
      {/* ── الرأس (Header) - نظيف وأنيق للموبايل والديسكتوب ── */}
      <header className="sticky top-0 z-30 border-b border-emerald-100/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-3.5 sm:h-[74px] sm:px-6">
          <button
            className="brand group"
            onClick={() => {
              setActive('quran')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            <span className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-gold-100 shadow-md shadow-emerald-700/20 transition-transform group-hover:scale-105">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gold-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                <path d="M6 8h2" strokeWidth="1.5" stroke="#fef08a" />
                <path d="M16 8h2" strokeWidth="1.5" stroke="#fef08a" />
                <path d="M6 12h2" strokeWidth="1.5" stroke="#fef08a" />
                <path d="M16 12h2" strokeWidth="1.5" stroke="#fef08a" />
              </svg>
            </span>
            <div>
              <strong className="text-sm sm:text-base font-extrabold text-ink dark:text-white">صدقة جارية</strong>
              <small className="block text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400">رفيقك اليومي</small>
            </div>
          </button>

          {/* روابط التنقل للشاشات الكبيرة */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`nav-link ${active === id ? 'active' : ''}`} onClick={() => setActive(id)}>
                <Icon size={17} />{label}
              </button>
            ))}
          </nav>

          {/* زر تبديل الوضع الداكن/الفاتح */}
          <div className="flex items-center gap-2">
            <div className="theme-switch" role="group" aria-label="اختيار المظهر">
              <button onClick={() => setDark(false)} className={!dark ? 'selected' : ''} aria-pressed={!dark} title="تفعيل الوضع الفاتح">
                <Sun size={15} /><span>فاتح</span>
              </button>
              <button onClick={() => setDark(true)} className={dark ? 'selected' : ''} aria-pressed={dark} title="تفعيل الوضع الداكن">
                <Moon size={15} /><span>داكن</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── المحتوى الأساسي ── */}
      <main className={`mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:py-10 ${track ? 'pb-44 sm:pb-36 lg:pb-24' : 'pb-28 lg:pb-12'}`}>
        {renderSection()}
      </main>

      {/* ── الفوتر ── */}
      <footer className={`border-t border-emerald-100 bg-white px-4 py-7 dark:border-slate-800 dark:bg-slate-950 ${track ? 'pb-44 sm:pb-36 lg:pb-16' : 'pb-28 lg:pb-12'}`}>
        <div className="mx-auto max-w-7xl">
          <ContactSocial
            onInstallClick={handleInstallClick}
            isStandalone={isStandalone}
            canInstall={isIosDevice() || Boolean(installPrompt)}
          />
          <p className="mt-6 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            اجعل القرآن رفيق يومك، ودع أثره يضيء طريقك.
          </p>
          <p className="mt-2 text-center text-[11px] sm:text-xs font-bold tracking-wide text-emerald-700 dark:text-emerald-300">
            تم تصميم وتطوير هذه المنصة بواسطة Ahmed Samir Fazza.
          </p>
        </div>
      </footer>

      {/* ── شريط التنقل السفلي الذكي للموبايل (Floating Glassmorphic Bottom Nav) ── */}
      <nav className="mobile-bottom-bar" aria-label="شريط التنقل السريع">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                onClick={() => {
                  setActive(id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`bottom-nav-btn ${isActive ? 'active' : ''}`}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="nav-icon-wrap">
                  <Icon size={19} />
                </div>
                <span>{label}</span>
                <span className="nav-dot" />
              </button>
            )
          })}
        </div>
      </nav>

      {/* ── مشغل الصوت العائم ── */}
      <AudioPlayer
        track={track}
        onClose={() => { setTrack(null); setActiveAyah(null); setActiveSurah(null) }}
        onNext={() => navigateTrack(1)}
        onPrevious={() => navigateTrack(-1)}
        onActiveAyah={handleActiveAyah}
      />

      {/* ── نافذة تعليمات تثبيت التطبيق لأجهزة الآيفون (iOS) ── */}
      <IosInstallModal
        isOpen={showIosInstall}
        onClose={() => setShowIosInstall(false)}
      />
    </div>
  )
}

