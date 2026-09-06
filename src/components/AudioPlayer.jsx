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
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }, [track?.url])

  /* الانتقال إلى آية محددة عند تغيير startAyah */
  useEffect(() => {
    const audio = audioRef.current
    const timing = track?.timings?.[track?.startAyah]
    if (!audio || !timing) return
    const seek = () => {
      audio.currentTime = timing.start
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
    if (audio.readyState >= 1) seek()
    else audio.addEventListener('loadedmetadata', seek, { once: true })
  }, [track?.startAyah, track?.timings])

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
    <aside className="fixed bottom-0 z-50 w-full border-t border-emerald-100 bg-white/95 px-4 py-3 shadow-[0_-10px_35px_rgba(9,60,47,.12)] backdrop-blur dark:border-slate-700 dark:bg-slate-950/95">
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
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        {/* معلومات التلاوة */}
        <div className="hidden min-w-0 flex-1 sm:block">
          <p className="truncate font-bold text-ink dark:text-white">{track.surahName}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {track.reciterName} · {track.riwaya}{activeAyah ? ` · الآية ${activeAyah}` : ''}
          </p>
        </div>

        {/* أزرار التحكم */}
        <div className="flex items-center gap-1">
          <button onClick={onNext} className="icon-button" aria-label="السورة التالية"><SkipForward size={19} /></button>
          <button
            onClick={toggle}
            className="grid h-11 w-11 place-items-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
            aria-label={playing ? 'إيقاف' : 'تشغيل'}
          >
            {playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}
          </button>
          <button onClick={onPrevious} className="icon-button" aria-label="السورة السابقة"><SkipBack size={19} /></button>
        </div>

        {/* شريط التقدم */}
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

        {/* تكرار */}
        <button
          onClick={changeRepeat}
          className={`icon-button relative ${repeat !== 'off' ? 'text-emerald-600' : ''}`}
          title={repeatLabels[repeat]}
          aria-label={repeatLabels[repeat]}
        >
          <Repeat2 size={19} />
          {repeat !== 'off' && (
            <span className="absolute -bottom-1 -left-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-600 text-[9px] text-white">
              {repeat === 'surah' ? 'س' : 'آ'}
            </span>
          )}
        </button>

        {/* تنزيل */}
        <a href={track.url} download target="_blank" rel="noreferrer" className="icon-button" title="تنزيل التلاوة">
          <Download size={18} />
        </a>

        {/* مستوى الصوت */}
        <Volume2 className="hidden text-emerald-600 lg:block" size={19} />
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

        {/* إغلاق */}
        <button onClick={onClose} className="icon-button" aria-label="إغلاق المشغل"><X size={18} /></button>
      </div>
    </aside>
  )
}
