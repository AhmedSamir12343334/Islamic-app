import { FALLBACK_RECITERS, RIWAYAT, SURAH_NAMES } from '../data'

const QURAN_COM_BASE = 'https://apis.quran.foundation/content/api/v4'
const MP3QURAN_BASE = 'https://www.mp3quran.net/api/v3'
const headers = () => {
  const clientId = import.meta.env.VITE_QURAN_COM_CLIENT_ID
  const token = import.meta.env.VITE_QURAN_COM_AUTH_TOKEN
  return clientId && token ? { 'x-client-id': clientId, 'x-auth-token': token } : null
}

export function cleanAyahText(text, surahNumber, ayahNumber) {
  if (!text) return ''
  if (surahNumber === 1) {
    return text.replace(/^[\uFEFF\u200B-\u200D\s]+/, '').trim()
  }
  if (ayahNumber === 1 && surahNumber !== 9) {
    return text
      .replace(/^[\uFEFF\u200B-\u200D\s]+/, '')
      .replace(/^بِسْمِ\s+[\u0600-\u06FF]+\s+[\u0600-\u06FF]+\s+[\u0600-\u06FF]+\s*/u, '')
      .trim()
  }
  return text.replace(/^[\uFEFF\u200B-\u200D\s]+/, '').trim()
}

export async function getSurah(surah) {
  const auth = headers()
  if (auth) {
    try {
      const response = await fetch(`${QURAN_COM_BASE}/verses/by_chapter/${surah}?language=ar&fields=text_uthmani,page_number&per_page=300`, { headers: auth })
      if (!response.ok) throw new Error('Quran.com unavailable')
      const payload = await response.json()
      return payload.verses.map((verse, index) => ({
        number: index + 1,
        text: cleanAyahText(verse.text_uthmani, surah, index + 1),
        key: verse.verse_key,
        page: verse.page_number
      }))
    } catch (error) {
      console.warn('Quran.com request failed; using the public fallback.', error)
    }
  }
  const response = await fetch(`https://api.alquran.cloud/v1/surah/${surah}/quran-uthmani`)
  if (!response.ok) throw new Error('تعذّر جلب نص السورة.')
  const payload = await response.json()
  return payload.data.ayahs.map((ayah) => ({
    number: ayah.numberInSurah,
    text: cleanAyahText(ayah.text, surah, ayah.numberInSurah),
    key: `${surah}:${ayah.numberInSurah}`,
    page: ayah.page
  }))
}

const matchesRiwaya = (name = '', riwaya) => {
  const value = name.toLowerCase()
  if (riwaya === 'warsh') return value.includes('ورش') || value.includes('warsh')
  if (riwaya === 'qaloon') return value.includes('قالون') || value.includes('qaloon') || value.includes('qalun')
  if (riwaya === 'douri') return value.includes('الدوري') || value.includes('الدورى') || value.includes('douri') || value.includes('duri')
  return value.includes('حفص') || value.includes('hafs')
}

const PRIORITY_NAMES = [
  'محمد صديق المنشاوي',
  'المنشاوي',
  'عبد الباسط عبد الصمد',
  'عبدالباسط عبدالصمد',
  'محمود خليل الحصري',
  'الحصري',
  'مشاري العفاسي',
  'العفاسي',
  'عبد الرحمن السديس',
  'عبدالرحمن السديس',
  'ماهر المعيقلي',
  'المعيقلي',
  'سعود الشريم',
  'الشريم',
  'سعد الغامدي',
  'الغامدي'
]

export async function getReciters(riwaya, style = 'murattal') {
  try {
    const response = await fetch(`${MP3QURAN_BASE}/reciters?language=ar`)
    if (!response.ok) throw new Error('MP3Quran unavailable')
    const payload = await response.json()
    const reciters = payload.reciters.flatMap((reciter) => {
      const matchingMoshafs = reciter.moshaf
        .filter((moshaf) => matchesRiwaya(moshaf.name, riwaya))
        .filter((moshaf) => style === 'mujawwad' ? /مجود|mujawwad/i.test(moshaf.name) : !/مجود|mujawwad/i.test(moshaf.name))

      if (!matchingMoshafs.length) return []

      // Prioritize standard 'مرتل' with full ayah timing support over old/special recordings
      matchingMoshafs.sort((a, b) => {
        const aIsStandard = /مرتل/i.test(a.name) && !/عام|تسجيل/i.test(a.name)
        const bIsStandard = /مرتل/i.test(b.name) && !/عام|تسجيل/i.test(b.name)
        if (aIsStandard && !bIsStandard) return -1
        if (!aIsStandard && bIsStandard) return 1
        return 0
      })

      const bestMoshaf = matchingMoshafs[0]
      return [{
        id: `${reciter.id}-${bestMoshaf.id}`,
        name: reciter.name,
        moshaf: bestMoshaf,
        allMoshafs: reciter.moshaf
      }]
    })

    if (reciters.length) {
      reciters.sort((a, b) => {
        const idxA = PRIORITY_NAMES.findIndex((p) => a.name.includes(p))
        const idxB = PRIORITY_NAMES.findIndex((p) => b.name.includes(p))
        if (idxA !== -1 && idxB !== -1) return idxA - idxB
        if (idxA !== -1) return -1
        if (idxB !== -1) return 1
        return a.name.localeCompare(b.name, 'ar')
      })
      return reciters
    }
    return FALLBACK_RECITERS[riwaya] || []
  } catch (error) {
    console.warn('MP3Quran request failed; using local choices.', error)
    return FALLBACK_RECITERS[riwaya] || []
  }
}

// Quran.com Recitation ID Mapping
const QURAN_COM_NAME_MAP = [
  { test: /المنشاوي/i, murattal: 9, mujawwad: 8 },
  { test: /عبد\s*الباسط/i, murattal: 2, mujawwad: 1 },
  { test: /الحصري/i, murattal: 6, mujawwad: 6, muallim: 12 },
  { test: /العفاسي/i, murattal: 7 },
  { test: /السديس/i, murattal: 3 },
  { test: /الشريم/i, murattal: 10 },
  { test: /الشاطر/i, murattal: 4 },
  { test: /الرفاعي/i, murattal: 5 },
  { test: /الطبلاوي/i, murattal: 11 }
]

export function generateEstimatedTimings(duration, verses) {
  if (!duration || !verses || verses.length === 0) return {}
  
  // Calculate relative weight for each ayah based on text length + punctuation pause
  const weights = verses.map((v) => Math.max(10, (v.text || '').trim().length + 15))
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)
  if (totalWeight <= 0) return {}

  const timings = {}
  let accumulatedTime = 0

  for (let i = 0; i < verses.length; i++) {
    const ayahNum = verses[i].number || (i + 1)
    const ayahDuration = (weights[i] / totalWeight) * duration
    const start = accumulatedTime
    const end = i === verses.length - 1 ? duration : accumulatedTime + ayahDuration

    timings[ayahNum] = {
      start: Number(start.toFixed(2)),
      end: Number(end.toFixed(2))
    }
    accumulatedTime = end
  }

  return timings
}

export async function getAyahTimings(surah, reciter) {
  const readId = Number(reciter?.moshaf?.id ?? (typeof reciter?.id === 'string' ? reciter.id.split('-')[1] : reciter?.id) ?? reciter)
  
  // 1. Try MP3Quran Timing API
  if (readId) {
    try {
      const response = await fetch(`${MP3QURAN_BASE}/ayat_timing?surah=${surah}&read=${readId}`)
      if (response.ok) {
        const payload = await response.json()
        const entries = Array.isArray(payload) ? payload : (payload.data || payload.ayahs || [])
        if (entries.length > 0) {
          const parsedTimings = entries.reduce((acc, entry) => {
            const ayah = Number(entry.ayah ?? entry.ayah_number ?? entry.id)
            const start = Number(entry.start_time ?? entry.start ?? entry.from)
            const end = Number(entry.end_time ?? entry.end ?? entry.to)
            if (Number.isFinite(ayah) && Number.isFinite(start) && Number.isFinite(end) && end > start) {
              acc.push({ ayah, start: start / 1000, end: end / 1000 })
            }
            return acc
          }, [])
          if (parsedTimings.length > 0) {
            const ordered = parsedTimings.sort((a, b) => a.start - b.start)
            return ordered.reduce((acc, item, index) => {
              acc[index + 1] = { start: item.start, end: item.end }
              return acc
            }, {})
          }
        }
      }
    } catch (error) {
      console.warn('Verse timing is not available for this recitation from MP3Quran.', error)
    }
  }

  // 2. Try alternative moshaf for the same reciter if available in reciter object
  if (reciter?.allMoshafs && Array.isArray(reciter.allMoshafs)) {
    for (const altMoshaf of reciter.allMoshafs) {
      if (altMoshaf.id !== readId) {
        try {
          const altRes = await fetch(`${MP3QURAN_BASE}/ayat_timing?surah=${surah}&read=${altMoshaf.id}`)
          if (altRes.ok) {
            const altPayload = await altRes.json()
            const entries = Array.isArray(altPayload) ? altPayload : (altPayload.data || altPayload.ayahs || [])
            if (entries.length > 0) {
              const parsedTimings = entries.reduce((acc, entry) => {
                const ayah = Number(entry.ayah ?? entry.ayah_number ?? entry.id)
                const start = Number(entry.start_time ?? entry.start ?? entry.from)
                const end = Number(entry.end_time ?? entry.end ?? entry.to)
                if (Number.isFinite(ayah) && Number.isFinite(start) && Number.isFinite(end) && end > start) {
                  acc.push({ ayah, start: start / 1000, end: end / 1000 })
                }
                return acc
              }, [])
              if (parsedTimings.length > 0) {
                const ordered = parsedTimings.sort((a, b) => a.start - b.start)
                return ordered.reduce((acc, item, index) => {
                  acc[index + 1] = { start: item.start, end: item.end }
                  return acc
                }, {})
              }
            }
          }
        } catch {
          // ignore alternative moshaf failure
        }
      }
    }
  }

  // 3. Fallback to Quran.com timing API if matching reciter
  try {
    const reciterName = reciter?.name || ''
    let qdcId = null

    for (const item of QURAN_COM_NAME_MAP) {
      if (item.test.test(reciterName)) {
        qdcId = item.murattal
        break
      }
    }

    if (!qdcId) {
      const quranComMap = { 112: 9, 113: 8, 53: 2, 118: 6, 119: 6, 54: 3, 123: 7, 31: 4, 30: 1, 102: 133 }
      qdcId = quranComMap[readId]
    }

    if (qdcId) {
      const qdcRes = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${qdcId}/${surah}?segments=true`)
      if (qdcRes.ok) {
        const qdcData = await qdcRes.json()
        const timestamps = qdcData?.audio_file?.timestamps
        if (Array.isArray(timestamps) && timestamps.length > 0) {
          return timestamps.reduce((timings, item, index) => {
            timings[index + 1] = {
              start: item.timestamp_from / 1000,
              end: item.timestamp_to / 1000
            }
            return timings
          }, {})
        }
      }
    }
  } catch (err) {
    console.warn('Fallback timing request failed.', err)
  }

  return {}
}

export const makeAudioUrl = (reciter, surah) => `${reciter.moshaf.server.replace(/\/$/, '')}/${String(surah).padStart(3, '0')}.mp3`
export const makeMushafImageUrl = (page) => `https://raw.githubusercontent.com/QuranHub/quran-pages-images/main/ayat/tajweed/${page}.png`

export const getSurahLabel = (surah) => `سورة ${SURAH_NAMES[surah - 1] || surah}`
export const allowedRiwayat = RIWAYAT
