import { Download, Pause, Play, Repeat2, SkipBack, SkipForward, Volume2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const repeatLabels = { off: 'بدون تكرار', surah: 'تكرار السورة', verse: 'تكرار الآية' }

export default function AudioPlayer({ track, onClose, onNext, onPrevious, onActiveAyah }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [repeat, setRepeat] = useState('off')

  /* تحميل وتشغيل التلاوة عند تغيير الـ URL */
  useEffect(() => {
    if (!track || !audioRef.current) return
    const audio = audioRef.current
    audio.load()

    const onCanPlay = () => {
      const startAyah = track.startAyah || 1
      const timing = track.timings?.[startAyah]
      if (timing && timing.start > 0) {
        audio.currentTime = timing.start
      }
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }

    if (audio.readyState >= 2) {
      onCanPlay()
    } else {
      audio.addEventListener('loadeddata', onCanPlay, { once: true })
    }
  }, [track?.url])

  /* الانتقال إلى آية محددة عند تغيير startAyah */
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !track?.startAyah) return
    const timing = track.timings?.[track.startAyah]
    if (timing) {
      audio.currentTime = timing.start
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }, [track?.startAyah])

  if (!track) return null

  const toggle = () => {
    const audio = audioRef.current
    if (audio.paused) audio.play().then(() => setPlaying(true))
    else { audio.pause(); setPlaying(false) }
  }

  const changeRepeat = () => setRepeat((value) => value === 'off' ? 'surah' : value === 'surah' ? 'verse' : 'off')
  const formatTime = (seconds) => `${Math.floor(seconds / 60) || 0}:${String(Math.floor(seconds % 60) || 0).padStart(2, '0')}`

  /* حساب وتحديث الآية النشطة الحالية بدقة متناهية مع حركة الصوت */
  const onTimeUpdate = (event) => {
    const current = event.currentTarget.currentTime
    setProgress(current)

    if (track.timings && Object.keys(track.timings).length > 0) {
      const timingEntries = Object.entries(track.timings)
        .map(([k, v]) => ({ ayah: Number(k), start: v.start, end: v.end }))
        .sort((a, b) => a.start - b.start)

      let active = null

      for (let i = 0; i < timingEntries.length; i++) {
        const item = timingEntries[i]
        const nextItem = timingEntries[i + 1]
        const upperLimit = nextItem ? nextItem.start : (item.end || item.start + 60)

        if (current >= item.start && current < upperLimit) {
          active = item.ayah
          break
        }
      }

      // إذا كان الصوت في مقدمة التلاوة/البسملة (قبل بداية الآية الأولى)
      if (active === null && timingEntries.length > 0) {
        if (current < timingEntries[0].start) {
          active = timingEntries[0].ayah === 0 ? 1 : timingEntries[0].ayah
        } else if (current >= timingEntries[timingEntries.length - 1].start) {
          active = timingEntries[timingEntries.length - 1].ayah
        }
      }

      // البسملة التمهيدية (0) ترتبط بالآية الأولى
      if (active === 0) active = 1

      if (active && Number.isFinite(active)) {
        onActiveAyah?.(track.surah, active)
      }
    }

    /* تكرار الآية */
    if (repeat === 'verse' && track.startAyah && track.timings?.[track.startAyah] && current >= track.timings[track.startAyah].end) {
      event.currentTarget.currentTime = track.timings[track.startAyah].start
      event.currentTarget.play()
    }
  }

  const activeAyah = (() => {
    if (!track?.timings || Object.keys(track.timings).length === 0) return null
    const timingEntries = Object.entries(track.timings)
      .map(([k, v]) => ({ ayah: Number(k), start: v.start, end: v.end }))
      .sort((a, b) => a.start - b.start)

    for (let i = 0; i < timingEntries.length; i++) {
      const item = timingEntries[i]
      const nextItem = timingEntries[i + 1]
      const upperLimit = nextItem ? nextItem.start : (item.end || item.start + 60)
      if (progress >= item.start && progress < upperLimit) {
        return item.ayah === 0 ? 1 : item.ayah
      }
    }
    if (timingEntries.length > 0 && progress < timingEntries[0].start) {
      return 1
    }
    return null
  })()

  return (
    <aside className="fixed bottom-[calc(60px+env(safe-area-inset-bottom,0px))] lg:bottom-0 left-0 right-0 z-40 border-t border-emerald-200/80 bg-white/95 px-3 py-2.5 shadow-[0_-8px_30px_rgba(9,60,47,.12)] backdrop-blur-xl transition-all duration-300 dark:border-slate-800/90 dark:bg-slate-950/95 sm:px-4 sm:py-3">
      {/* شريط تقدم نحيف وأنيق في أعلى المشغل مباشرة للموبايل والشاشات كلها */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-slate-100 cursor-pointer group dark:bg-slate-800"
        onClick={(e) => {
          if (!duration || !audioRef.current) return
          const rect = e.currentTarget.getBoundingClientRect()
          const clickX = e.clientX - rect.left
          const ratio = clickX / rect.width
          const newTime = ratio * duration
          audioRef.current.currentTime = newTime
          setProgress(newTime)
        }}
      >
        <div
          className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-150"
          style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
        />
      </div>

      <audio
        ref={audioRef}
        src={track.url}
        loop={repeat === 'surah'}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onEnded={() => {
          if (repeat === 'verse' && !track.timings?.[track.startAyah]) audioRef.current?.play()
        }}
      />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 sm:gap-3">
        {/* معلومات التلاوة (ظاهرة الآن بوضوح على الموبايل والشاشات الكبيرة) */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs sm:text-sm font-bold text-ink dark:text-white">
            {track.surahName}
          </p>
          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
            {track.reciterName}{activeAyah ? ` · آية ${activeAyah}` : ''}
          </p>
        </div>

        {/* أزرار التحكم بالتشغيل */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button onClick={onNext} className="icon-button h-8 w-8 sm:h-9 sm:w-9" aria-label="السورة التالية" title="السورة التالية">
            <SkipForward size={17} />
          </button>
          <button
            onClick={toggle}
            className="grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/30 transition-transform active:scale-95"
            aria-label={playing ? 'إيقاف' : 'تشغيل'}
          >
            {playing ? <Pause size={17} className="sm:w-5 sm:h-5" fill="currentColor" /> : <Play size={17} className="sm:w-5 sm:h-5 mr-0.5" fill="currentColor" />}
          </button>
          <button onClick={onPrevious} className="icon-button h-8 w-8 sm:h-9 sm:w-9" aria-label="السورة السابقة" title="السورة السابقة">
            <SkipBack size={17} />
          </button>
        </div>

        {/* شريط التمرير الدقيق للشاشات المتوسطة والكبيرة */}
        <div className="hidden flex-[2] items-center gap-2 md:flex">
          <span className="w-9 text-xs tabular-nums text-slate-500">{formatTime(progress)}</span>
          <input
            aria-label="موضع التشغيل"
            className="accent-emerald-600"
            type="range"
            min="0"
            step="0.1"
            max={duration || 0}
            value={progress}
            onChange={(event) => {
              audioRef.current.currentTime = Number(event.target.value)
              setProgress(Number(event.target.value))
            }}
          />
          <span className="w-9 text-xs tabular-nums text-slate-500">{formatTime(duration)}</span>
        </div>

        {/* أدوات إضافية: التكرار والتحميل والإغلاق */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            onClick={changeRepeat}
            className={`icon-button h-8 w-8 sm:h-9 sm:w-9 relative ${repeat !== 'off' ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
            title={repeatLabels[repeat]}
            aria-label={repeatLabels[repeat]}
          >
            <Repeat2 size={16} className="sm:w-[18px] sm:h-[18px]" />
            {repeat !== 'off' && (
              <span className="absolute -bottom-0.5 -left-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-emerald-600 text-[8px] font-bold text-white">
                {repeat === 'surah' ? 'س' : 'آ'}
              </span>
            )}
          </button>

          <a
            href={track.url}
            download
            target="_blank"
            rel="noreferrer"
            className="icon-button h-8 w-8 sm:h-9 sm:w-9 hidden xs:grid"
            title="تنزيل التلاوة"
            aria-label="تنزيل التلاوة"
          >
            <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
          </a>

          {/* مستوى الصوت للشاشات الكبيرة */}
          <Volume2 className="hidden text-emerald-600 lg:block mr-1" size={18} />
          <input
            aria-label="مستوى الصوت"
            className="hidden w-16 accent-emerald-600 lg:block"
            type="range"
            min="0"
            max="1"
            step="0.05"
            defaultValue="1"
            onChange={(event) => { audioRef.current.volume = Number(event.target.value) }}
          />

          {/* إغلاق المشغل */}
          <button onClick={onClose} className="icon-button h-8 w-8 sm:h-9 sm:w-9 text-slate-400 hover:text-rose-600" aria-label="إغلاق المشغل" title="إغلاق المشغل">
            <X size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  )
}

