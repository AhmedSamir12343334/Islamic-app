import { Quote, Sparkles } from 'lucide-react'

const VERSES = [
  {
    surah: 'البقرة',
    ayah: 255,
    text: 'اللّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ، لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ.'
  },
  {
    surah: 'آل عمران',
    ayah: 159,
    text: 'فَبِمَا رَحْمَةٍ مِنَ اللَّهِ لِنْتَ لَهُمْ، وَلَوْ كُنْتَ فَظًّا غَلِيظَ الْقَلْبِ لَانْفَضُّوا مِنْ حَوْلِكَ.'
  },
  {
    surah: 'الرحمن',
    ayah: 55,
    text: 'فَبِأَيِّ آلاءِ رَبِّكُمَا تُكَذِّبَانِ.'
  },
  {
    surah: 'الإسراء',
    ayah: 82,
    text: 'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِلْمُؤْمِنِينَ.'
  },
  {
    surah: 'التوبة',
    ayah: 122,
    text: 'وَمَا كَانَ الْمُؤْمِنُونَ لِيَنْفِرُوا كَافَّةً فَلَوْلا نَفَرَ مِنْ كُلِّ فِرْقَةٍ مِنْهُمْ طَائِفَةٌ.'
  },
  {
    surah: 'العلق',
    ayah: 5,
    text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا.'
  },
  {
    surah: 'الملك',
    ayah: 1,
    text: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ.'
  }
]

function getDailyVerse() {
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  return VERSES[seed % VERSES.length]
}

export default function DailyVerse() {
  const verse = getDailyVerse()

  return (
    <section className="utility-card overflow-hidden border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-emerald-50 dark:border-amber-900/50 dark:from-amber-950/40 dark:via-slate-900 dark:to-emerald-950/30" aria-label="آية اليوم">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="eyebrow"><Sparkles size={14} /> آية اليوم</span>
          <h2 className="mt-0.5">موردٌ للقلوب</h2>
        </div>
        <div className="rounded-full bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200">
          <Quote size={18} />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-amber-200/80 bg-white/80 p-4 text-right shadow-sm dark:border-amber-900/60 dark:bg-slate-900/70" dir="rtl">
        <p className="text-sm leading-8 text-slate-700 dark:text-slate-200">{verse.text}</p>
        <p className="mt-3 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          سورة {verse.surah} • آية {verse.ayah}
        </p>
      </div>
    </section>
  )
}
