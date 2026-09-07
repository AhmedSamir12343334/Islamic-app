import { Bell, BookOpen, Moon, Palette, Save, Sun, Type } from 'lucide-react'
import { useState } from 'react'
import { RIWAYAT } from '../data'

export default function SettingsSection({ settings, setSettings, dark, setDark }) {
  const [notice, setNotice] = useState('')
  const update = (changes) => setSettings((current) => ({ ...current, ...changes }))
  const save = () => setNotice('تم حفظ إعدادات الموقع.')

  return (
    <section className="space-y-5 pb-28">
      <div className="section-heading">
        <div>
          <span className="eyebrow"><Palette size={14} /> تفضيلاتك</span>
          <h1>إعدادات الموقع</h1>
          <p>خصص القراءة والمظهر والتنبيهات بالطريقة التي تناسب يومك.</p>
        </div>
      </div>

      {notice && <div className="utility-error" role="status"><Save size={17} /><span>{notice}</span><button onClick={() => setNotice('')}>إخفاء</button></div>}

      <div className="settings-grid">
        <article className="utility-card">
          <div className="utility-heading"><div><span className="eyebrow"><BookOpen size={14} /> إعدادات القراءة</span><h2>المصحف والتلاوة</h2></div></div>
          <div className="mt-5 space-y-4">
            <label className="input-wrap"><span><Type size={14} /> حجم الخط: {settings.fontSize}px</span><input type="range" min="25" max="45" value={settings.fontSize} onChange={(event) => update({ fontSize: Number(event.target.value) })} /></label>
            <label className="input-wrap"><span>الرواية</span><select value={settings.riwaya} onChange={(event) => update({ riwaya: event.target.value, reciterId: '' })}>{RIWAYAT.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
            <label className="input-wrap"><span>أسلوب التلاوة</span><select value={settings.style} onChange={(event) => update({ style: event.target.value, reciterId: '' })}><option value="murattal">مرتل</option><option value="mujawwad">مجود</option></select></label>
            <label className="input-wrap"><span>شكل المصحف</span><select value={settings.mushafTheme} onChange={(event) => update({ mushafTheme: event.target.value })}><option value="paper">ورق دافئ</option><option value="cream">كريمي هادئ</option><option value="night">ليلي مريح</option></select></label>
          </div>
        </article>

        <article className="utility-card">
          <div className="utility-heading"><div><span className="eyebrow"><Palette size={14} /> المظهر</span><h2>ألوان الموقع</h2></div></div>
          <div className="mt-5 space-y-3">
            <button className={`settings-choice ${!dark ? 'active' : ''}`} onClick={() => setDark(false)}><Sun size={18} /><span><b>الوضع الفاتح</b><small>ألوان واضحة للنهار</small></span></button>
            <button className={`settings-choice ${dark ? 'active' : ''}`} onClick={() => setDark(true)}><Moon size={18} /><span><b>الوضع الداكن</b><small>راحة أكبر للعين ليلاً</small></span></button>
            <button className="button-primary mt-3 w-full" onClick={save}><Save size={17} /> حفظ الإعدادات</button>
          </div>
        </article>

        <article className="utility-card">
          <div className="utility-heading"><div><span className="eyebrow"><Bell size={14} /> مركز التنبيهات</span><h2>تنبيهاتك اليومية</h2></div></div>
          <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">يمكنك ضبط كل تذكير من صفحة الإحصائيات: ورد القرآن، أذكار الصباح، وأذكار المساء.</p>
          <button className="button-secondary mt-4 w-full justify-center" onClick={() => window.dispatchEvent(new CustomEvent('open-stats'))}><Bell size={17} /> إدارة التنبيهات</button>
        </article>
      </div>
    </section>
  )
}
