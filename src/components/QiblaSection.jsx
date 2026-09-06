import { AlertCircle, CheckCircle2, Compass, Locate, MapPin, Navigation, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/* ── إحداثيات الكعبة المشرفة ── */
const KAABA_LAT = 21.422487
const KAABA_LNG = 39.826206

/* ── أشهر المدن مسبقة الإعداد ── */
const PRESET_CITIES = [
  { name: 'القاهرة، مصر', lat: 30.0444, lng: 31.2357 },
  { name: 'الإسكندرية، مصر', lat: 31.2001, lng: 29.9187 },
  { name: 'مكة المكرمة، السعودية', lat: 21.4225, lng: 39.8262 },
  { name: 'المدينة المنورة، السعودية', lat: 24.4672, lng: 39.6111 },
  { name: 'الرياض، السعودية', lat: 24.7136, lng: 46.6753 },
  { name: 'جدة، السعودية', lat: 21.5433, lng: 39.1728 },
  { name: 'القدس الشريف، فلسطين', lat: 31.7683, lng: 35.2137 },
  { name: 'دبي، الإمارات', lat: 25.2048, lng: 55.2708 },
  { name: 'أبوظبي، الإمارات', lat: 24.4539, lng: 54.3773 },
  { name: 'عمان، الأردن', lat: 31.9454, lng: 35.9284 },
  { name: 'الكويت، الكويت', lat: 29.3759, lng: 47.9774 },
  { name: 'الدوحة، قطر', lat: 25.2854, lng: 51.5310 },
  { name: 'المنامة، البحرين', lat: 26.2285, lng: 50.5860 },
  { name: 'مسقط، عُمان', lat: 23.5880, lng: 58.3829 },
  { name: 'بغداد، العراق', lat: 33.3152, lng: 44.3661 },
  { name: 'دمشق، سوريا', lat: 33.5138, lng: 36.2765 },
  { name: 'بيروت، لبنان', lat: 33.8938, lng: 35.5018 },
  { name: 'طرابلس، ليبيا', lat: 32.8872, lng: 13.1913 },
  { name: 'تونس، تونس', lat: 36.8065, lng: 10.1815 },
  { name: 'الجزائر، الجزائر', lat: 36.7538, lng: 3.0588 },
  { name: 'الرباط، المغرب', lat: 34.0209, lng: -6.8416 },
  { name: 'الدار البيضاء، المغرب', lat: 33.5731, lng: -7.5898 },
  { name: 'الخرطوم، السودان', lat: 15.5007, lng: 32.5599 },
  { name: 'صنعاء، اليمن', lat: 15.3694, lng: 44.1910 },
  { name: 'إسطنبول، تركيا', lat: 41.0082, lng: 28.9784 },
  { name: 'لندن، بريطانيا', lat: 51.5074, lng: -0.1278 },
  { name: 'باريس، فرنسا', lat: 48.8566, lng: 2.3522 },
  { name: 'برلين، ألمانيا', lat: 52.5200, lng: 13.4050 },
  { name: 'نيويورك، أمريكا', lat: 40.7128, lng: -74.0060 },
  { name: 'تورونتو، كندا', lat: 43.6532, lng: -79.3832 },
  { name: 'جاكرتا، إندونيسيا', lat: -6.2088, lng: 106.8456 },
  { name: 'كوالالمبور، ماليزيا', lat: 3.1390, lng: 101.6869 }
]

/* ── حساب زاوية اتجاه القبلة رياضياً بدقة من أي إحداثيات ── */
function calculateQibla(latitude, longitude) {
  const phiK = (KAABA_LAT * Math.PI) / 180
  const lambdaK = (KAABA_LNG * Math.PI) / 180
  const phi = (latitude * Math.PI) / 180
  const lambda = (longitude * Math.PI) / 180

  const deltaLambda = lambdaK - lambda

  const y = Math.sin(deltaLambda)
  const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(deltaLambda)

  let qibla = (Math.atan2(y, x) * 180) / Math.PI
  return Math.round(((qibla + 360) % 360) * 10) / 10
}

/* ── حساب المسافة إلى الكعبة المشرفة بالكيلومتر ── */
function calculateDistanceToKaaba(latitude, longitude) {
  const R = 6371
  const phi1 = (latitude * Math.PI) / 180
  const phi2 = (KAABA_LAT * Math.PI) / 180
  const deltaPhi = ((KAABA_LAT - latitude) * Math.PI) / 180
  const deltaLambda = ((KAABA_LNG - longitude) * Math.PI) / 180

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

/* ── تحويل الزاوية إلى اتجاه عربي مقروء ── */
function getDirectionLabel(degree) {
  if (degree >= 337.5 || degree < 22.5) return 'شمال'
  if (degree >= 22.5 && degree < 67.5) return 'شمال شرق'
  if (degree >= 67.5 && degree < 112.5) return 'شرق'
  if (degree >= 112.5 && degree < 157.5) return 'جنوب شرق'
  if (degree >= 157.5 && degree < 202.5) return 'جنوب'
  if (degree >= 202.5 && degree < 247.5) return 'جنوب غرب'
  if (degree >= 247.5 && degree < 292.5) return 'غرب'
  return 'شمال غرب'
}

export default function QiblaSection() {
  const [location, setLocation] = useState({
    name: 'القاهرة، مصر',
    lat: 30.0444,
    lng: 31.2357,
    isGPS: false
  })
  const [deviceHeading, setDeviceHeading] = useState(0)
  const [sensorAvailable, setSensorAvailable] = useState(false)
  const [needsPermission, setNeedsPermission] = useState(false)
  const [locating, setLocating] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const lastVibrate = useRef(0)

  const qiblaAngle = calculateQibla(location.lat, location.lng)
  const distance = calculateDistanceToKaaba(location.lat, location.lng)

  /* الزاوية النسبية لمؤشر القبلة بالنسبة لتوجيه الهاتف الحالي */
  const relativeAngle = sensorAvailable ? (qiblaAngle - deviceHeading + 360) % 360 : qiblaAngle
  const isAligned = sensorAvailable && (relativeAngle <= 4 || relativeAngle >= 356)

  /* اهتزاز خفيف عند محاذاة القبلة */
  useEffect(() => {
    if (isAligned && navigator.vibrate) {
      const now = Date.now()
      if (now - lastVibrate.current > 3000) {
        lastVibrate.current = now
        navigator.vibrate([40, 60, 40])
      }
    }
  }, [isAligned])

  /* تحديد الموقع تلقائياً عبر GPS */
  const requestGPS = () => {
    if (!navigator.geolocation) {
      setErrorMsg('خدمة تحديد الموقع غير مدعومة في متصفحك.')
      return
    }
    setLocating(true)
    setErrorMsg('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          name: 'موقعي الحالي (GPS)',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          isGPS: true
        })
        setLocating(false)
      },
      (err) => {
        setLocating(false)
        if (err.code === 1) {
          setErrorMsg('تم رفض إذن الموقع، يمكنك اختيار مدينتك يدوياً من القائمة.')
        } else {
          setErrorMsg('تعذّر الحصول على الموقع الدقيق، تم الاعتماد على المدينة المختارة.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  /* الاستماع لحساس البوصلة */
  const handleOrientation = (event) => {
    let heading = null
    if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
      // iOS
      heading = event.webkitCompassHeading
    } else if (event.alpha !== null && event.absolute) {
      // Android absolute
      heading = 360 - event.alpha
    } else if (event.alpha !== null) {
      heading = 360 - event.alpha
    }

    if (heading !== null && !isNaN(heading)) {
      setDeviceHeading(heading)
      setSensorAvailable(true)
    }
  }

  /* طلب إذن البوصلة لـ iOS 13+ */
  const enableSensor = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const state = await DeviceOrientationEvent.requestPermission()
        if (state === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true)
          setNeedsPermission(false)
        }
      } catch (err) {
        console.warn('Sensor permission error:', err)
      }
    } else {
      window.addEventListener('deviceorientationabsolute', handleOrientation, true)
      window.addEventListener('deviceorientation', handleOrientation, true)
      setSensorAvailable(true)
    }
  }

  useEffect(() => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      setNeedsPermission(true)
    } else if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientationabsolute', handleOrientation, true)
      window.addEventListener('deviceorientation', handleOrientation, true)
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation)
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [])

  return (
    <section className="space-y-6 pb-28">
      {/* ── العنوان الرئيسي ── */}
      <div className="section-heading">
        <div>
          <span className="eyebrow"><Compass size={14} /> اتجاه القبلة</span>
          <h1>بوصلة القبلة التفاعلية</h1>
          <p>تحديد اتجاه الكعبة المشرفة بدقة متناهية من أي بقعة في العالم.</p>
        </div>
      </div>

      {/* ── لوحة الموقع والتحكم ── */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="text-emerald-600 dark:text-emerald-400" size={20} />
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">الموقع المعتمد:</span>
              <p className="font-bold text-ink dark:text-white">{location.name}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={requestGPS}
              disabled={locating}
              className="button-primary py-2 px-3 text-xs"
            >
              {locating ? <RefreshCw className="animate-spin" size={15} /> : <Locate size={15} />}
              {locating ? 'جارِ التحديد...' : 'تحديد موقعي التلقائي (GPS)'}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* اختيار المدينة يدوياً */}
        <div className="pt-2 border-t border-emerald-100/60 dark:border-slate-800">
          <label className="input-wrap">
            <span>أو اختر مدينتك من القائمة:</span>
            <select
              value={location.isGPS ? '' : location.name}
              onChange={(e) => {
                const city = PRESET_CITIES.find((c) => c.name === e.target.value)
                if (city) {
                  setLocation({ ...city, isGPS: false })
                  setErrorMsg('')
                }
              }}
            >
              {location.isGPS && <option value="">موقعي الحالي (GPS)</option>}
              {PRESET_CITIES.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* ── شاشة البوصلة التفاعلية ── */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] items-center">
        {/* البوصلة المركزية */}
        <div className="glass-card relative flex flex-col items-center justify-center p-6 sm:p-10 overflow-hidden">
          {/* إشعار حالة المحاذاة */}
          <div className={`mb-6 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-300 ${
            isAligned
              ? 'bg-amber-400 text-amber-950 ring-4 ring-amber-400/30 shadow-lg scale-105 animate-pulse'
              : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
          }`}>
            {isAligned ? (
              <>
                <CheckCircle2 size={16} />
                <span>أنت الآن باتجاه القبلة تماماً 🕋</span>
              </>
            ) : sensorAvailable ? (
              <>
                <Compass size={16} className="animate-spin-slow" />
                <span>حرّك هاتفك حتى يتطابق المؤشر مع الكعبة</span>
              </>
            ) : (
              <>
                <Navigation size={16} />
                <span>زاوية القبلة الثابتة نحو الشمال الحقيقي</span>
              </>
            )}
          </div>

          {/* البوصلة الدائرية الرسومية */}
          <div className="relative h-72 w-72 sm:h-80 sm:w-80 select-none">
            {/* الخلفية والإطار الخارجي */}
            <div
              className={`absolute inset-0 rounded-full border-4 transition-all duration-300 shadow-2xl ${
                isAligned
                  ? 'border-amber-400 bg-gradient-to-tr from-amber-500/15 via-emerald-900/10 to-teal-500/15 shadow-amber-400/30'
                  : 'border-gold-300 bg-gradient-to-tr from-emerald-50/50 to-white dark:border-slate-700 dark:bg-slate-900/90'
              }`}
            >
              {/* درجات البوصلة */}
              <div
                className="absolute inset-0 transition-transform duration-200"
                style={{
                  transform: sensorAvailable ? `rotate(${-deviceHeading}deg)` : 'rotate(0deg)'
                }}
              >
                {/* حروف الاتجاهات الأربعة */}
                <span className="absolute top-2 left-1/2 -translate-x-1/2 font-bold text-xs text-rose-600 dark:text-rose-400">ش (N)</span>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-bold text-xs text-slate-500">ج (S)</span>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500">شـ (E)</span>
                <span className="absolute left-2 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500">غ (W)</span>

                {/* علامات الدرجات المحيطية */}
                {Array.from({ length: 12 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-0.5"
                    style={{ transform: `rotate(${i * 30}deg)` }}
                  >
                    <div className="h-2 w-full bg-slate-300 dark:bg-slate-700" />
                  </div>
                ))}
              </div>

              {/* دائرة داخلية زخرفية */}
              <div className="absolute inset-8 rounded-full border border-dashed border-emerald-300/60 dark:border-slate-700" />
              <div className="absolute inset-16 rounded-full border border-gold-200/50 bg-white/40 dark:border-slate-800 dark:bg-slate-950/60 backdrop-blur" />

              {/* مؤشر الشمال الجغرافي */}
              <div
                className="absolute inset-0 transition-transform duration-200 pointer-events-none"
                style={{ transform: sensorAvailable ? `rotate(${-deviceHeading}deg)` : 'rotate(0deg)' }}
              >
                <div className="absolute top-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[14px] border-b-rose-500" />
                </div>
              </div>

              {/* مؤشر القبلة الذهبي مع أيقونة الكعبة */}
              <div
                className="absolute inset-0 transition-transform duration-300 pointer-events-none"
                style={{
                  transform: `rotate(${relativeAngle}deg)`
                }}
              >
                {/* رأس المؤشر متجهاً للكعبة */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  {/* أيقونة الكعبة المشرفة */}
                  <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-900 to-black text-white shadow-lg ring-2 ring-gold-400 animate-bounce">
                    <span className="text-sm">🕋</span>
                  </div>
                  {/* سهم التوجيه الذهبي */}
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[18px] border-b-gold-500" />
                  <div className="h-16 w-1 bg-gradient-to-b from-gold-500 via-amber-400 to-transparent" />
                </div>
              </div>

              {/* النقطة المركزية */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white font-mono text-xs font-extrabold shadow-lg shadow-emerald-600/30">
                {Math.round(qiblaAngle)}°
              </div>
            </div>
          </div>

          {/* زر تفعيل الحساس في iOS إن لزم */}
          {needsPermission && (
            <button
              onClick={enableSensor}
              className="mt-6 button-secondary py-2 px-4 text-xs shadow-sm"
            >
              <Sparkles size={15} /> تفعيل بوصلة الهاتف المباشرة (iOS)
            </button>
          )}
        </div>

        {/* ── تفاصيل الزاوية والمسافة والتعليمات ── */}
        <div className="space-y-4">
          {/* بطاقة معلومات الزاوية */}
          <div className="glass-card p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400">بيانات التوجيه</h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-emerald-50/70 p-4 dark:bg-emerald-950/40">
                <span className="text-xs text-slate-500 dark:text-slate-400">زاوية القبلة:</span>
                <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                  {qiblaAngle}°
                </p>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {getDirectionLabel(qiblaAngle)}
                </span>
              </div>

              <div className="rounded-2xl bg-gold-50/70 p-4 dark:bg-amber-950/30">
                <span className="text-xs text-slate-500 dark:text-slate-400">المسافة لمكة المكرمة:</span>
                <p className="mt-1 text-2xl font-black text-gold-600 dark:text-gold-400 font-mono">
                  {distance.toLocaleString('ar-EG')}
                </p>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">كيلومتر</span>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-3 text-xs leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <span className="font-bold text-emerald-700 dark:text-emerald-400">إحداثيات الموقع: </span>
              {location.lat.toFixed(4)}° شمالاً ، {location.lng.toFixed(4)}° شرقاً
            </div>
          </div>

          {/* نصائح المعايرة والاستخدام */}
          <div className="glass-card p-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-6">
            <div className="flex items-center gap-2 font-bold text-ink dark:text-white">
              <ShieldCheck className="text-emerald-600" size={17} />
              <span>إرشادات لأعلى دقة في تحديد القبلة:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400 pr-1">
              <li>ضع الهاتف في وضع أفقي مستوٍ تماماً (على راحة يدك أو طاولة).</li>
              <li>ابتعد عن الأجهزة الإلكترونية والمعادن لتفادي التشويش المغناطيسي.</li>
              <li>إذا لاحظت عدم استجابة البوصلة، قم بتحريك الهاتف في الهواء على شكل رقم (8) لمعايرة الحساس.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
