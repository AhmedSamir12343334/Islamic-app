import { FALLBACK_RECITERS, RIWAYAT, SURAH_NAMES } from '../data'

const QURAN_COM_BASE = 'https://apis.quran.foundation/content/api/v4'
const MP3QURAN_BASE = 'https://www.mp3quran.net/api/v3'
const headers = () => {
  const clientId = import.meta.env.VITE_QURAN_COM_CLIENT_ID
  const token = import.meta.env.VITE_QURAN_COM_AUTH_TOKEN
  return clientId && token ? { 'x-client-id': clientId, 'x-auth-token': token } : null
}

export async function getSurah(surah) {
  const auth = headers()
  if (auth) {
    try {
      const response = await fetch(`${QURAN_COM_BASE}/verses/by_chapter/${surah}?language=ar&fields=text_uthmani&per_page=300`, { headers: auth })
      if (!response.ok) throw new Error('Quran.com unavailable')
      const payload = await response.json()
      return payload.verses.map((verse, index) => ({ number: index + 1, text: verse.text_uthmani, key: verse.verse_key }))
    } catch (error) {
      console.warn('Quran.com request failed; using the public fallback.', error)
    }
  }
  const response = await fetch(`https://api.alquran.cloud/v1/surah/${surah}/quran-uthmani`)
  if (!response.ok) throw new Error('تعذّر جلب نص السورة.')
  const payload = await response.json()
  return payload.data.ayahs.map((ayah) => ({ number: ayah.numberInSurah, text: ayah.text, key: `${surah}:${ayah.numberInSurah}` }))
}

const matchesRiwaya = (name = '', riwaya) => {
  const value = name.toLowerCase()
  if (riwaya === 'hafs') return value.includes('حفص') || value.includes('hafs')
  if (riwaya === 'warsh') return value.includes('ورش') || value.includes('warsh')
  return value.includes('قالون') || value.includes('qaloon') || value.includes('qalon')
}

export async function getReciters(riwaya, style = 'murattal') {
  try {
    const response = await fetch(`${MP3QURAN_BASE}/reciters?language=ar`)
    if (!response.ok) throw new Error('MP3Quran unavailable')
    const payload = await response.json()
    const reciters = payload.reciters.flatMap((reciter) => reciter.moshaf
      .filter((moshaf) => matchesRiwaya(moshaf.name, riwaya))
      .filter((moshaf) => style === 'mujawwad' ? /مجود|mujawwad/i.test(moshaf.name) : !/مجود|mujawwad/i.test(moshaf.name))
      .map((moshaf) => ({ id: `${reciter.id}-${moshaf.id}`, name: reciter.name, moshaf })))
    return reciters.length ? reciters : (FALLBACK_RECITERS[riwaya] || [])
  } catch (error) {
    console.warn('MP3Quran request failed; using local choices.', error)
    return FALLBACK_RECITERS[riwaya] || []
  }
}

export async function getAyahTimings(surah, reciter) {
  const readId = reciter?.moshaf?.id
  if (!readId) return {}
  try {
    const response = await fetch(`${MP3QURAN_BASE}/ayat_timing?surah=${surah}&read=${readId}`)
    if (!response.ok) throw new Error('Timing endpoint unavailable')
    const payload = await response.json()
    const entries = Array.isArray(payload) ? payload : (payload.data || payload.ayahs || [])
    return entries.reduce((timings, entry) => {
      const ayah = Number(entry.ayah ?? entry.ayah_number ?? entry.id)
      const start = Number(entry.start_time ?? entry.start ?? entry.from)
      const end = Number(entry.end_time ?? entry.end ?? entry.to)
      if (Number.isFinite(ayah) && Number.isFinite(start) && Number.isFinite(end) && end > start) timings[ayah] = { start: start / 1000, end: end / 1000 }
      return timings
    }, {})
  } catch (error) {
    console.warn('Verse timing is not available for this recitation.', error)
    return {}
  }
}

export const makeAudioUrl = (reciter, surah) => `${reciter.moshaf.server.replace(/\/$/, '')}/${String(surah).padStart(3, '0')}.mp3`

export const getSurahLabel = (surah) => `سورة ${SURAH_NAMES[surah - 1] || surah}`
export const allowedRiwayat = RIWAYAT
