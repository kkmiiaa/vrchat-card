'use client'
import type { ComponentDef, ActivityValue } from './types'

const DAYS = ['月', '火', '水', '木', '金', '土', '日']

export const activityComponent: ComponentDef<ActivityValue> = {
  key: 'activity',
  variants: ['default', 'v2'],  // default=曜日ドット+時間帯テキスト, v2=視覚的タイムバー+曜日サークル
  CardItem({ value, ctx, variant }) {
    const safe: ActivityValue = (value && typeof value === 'object' && 'days' in value) ? value as ActivityValue : { days: [], weekdayStart: '', weekdayEnd: '', holidayStart: '', holidayEnd: '' }
    const fs = ctx.fontSize.sm

    if (variant === 'v2') {
      const timeToRatio = (t: string) => { const [h, m] = t.split(':').map(Number); return (h * 60 + m) / 1440 }
      const segments = (start: string, end: string) => {
        const s = timeToRatio(start), e = timeToRatio(end)
        return e >= s
          ? [{ left: `${s * 100}%`, width: `${(e - s) * 100}%` }]
          : [{ left: `${s * 100}%`, width: `${(1 - s) * 100}%` }, { left: '0%', width: `${e * 100}%` }]
      }
      const smallFs = ctx.fontSize.xs * 0.9
      const timeRanges = [
        { label: '平日', start: safe.weekdayStart, end: safe.weekdayEnd, color: '#60a5fa', irregular: safe.weekdayTimesMode === 'irregular' },
        { label: '休日', start: safe.holidayStart, end: safe.holidayEnd, color: '#f59e0b', irregular: safe.holidayTimesMode === 'irregular' },
      ]
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%', background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: ctx.cardWidth * 0.006, padding: '6px 8px' }}>
          {/* 曜日サークル */}
          {safe.days.length === 7 && (
            <div style={{ display: 'flex', gap: 3 }}>
              {DAYS.map((d, i) => (
                <div key={i} style={{
                  width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: safe.daysMode ? 'rgba(0,0,0,0.08)' : (safe.days[i] ? (i >= 5 ? 'rgba(251,191,36,0.85)' : 'rgba(96,165,250,0.85)') : 'rgba(0,0,0,0.1)'),
                  fontSize: 7, fontWeight: 700, fontFamily: ctx.fontFamily,
                  color: (!safe.daysMode && safe.days[i]) ? '#fff' : 'rgba(0,0,0,0.25)',
                }}>{d}</div>
              ))}
              {safe.daysMode && <span style={{ fontSize: smallFs, fontWeight: 700, color: '#60a5fa', background: 'rgba(96,165,250,0.15)', borderRadius: 99, padding: '1px 6px', fontFamily: ctx.fontFamily }}>バラバラ</span>}
            </div>
          )}
          {/* タイムバー */}
          {timeRanges.map(({ label, start, end, color, irregular }, idx) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: smallFs, color: 'rgba(0,0,0,0.4)', fontWeight: 600, fontFamily: ctx.fontFamily }}>{label}</span>
                {irregular
                  ? <span style={{ fontSize: smallFs, fontWeight: 700, color: '#60a5fa', background: 'rgba(96,165,250,0.15)', borderRadius: 99, padding: '1px 6px', fontFamily: ctx.fontFamily }}>バラバラ</span>
                  : <span style={{ fontSize: smallFs, color: '#6b7280', fontFamily: ctx.fontFamily }}>{start && end ? `${start} – ${end}` : '—'}</span>
                }
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden' }}>
                  {!irregular && start && end && segments(start, end).map((seg, i) => (
                    <div key={i} style={{ position: 'absolute', top: 0, height: '100%', background: color, left: seg.left, width: seg.width }} />
                  ))}
                </div>
                {[6, 12, 18].map(h => (
                  <div key={h} style={{ position: 'absolute', top: 0, left: `${(h / 24) * 100}%`, width: 1, height: 6, background: 'rgba(255,255,255,0.8)', pointerEvents: 'none' }} />
                ))}
              </div>
              {idx === timeRanges.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                  {['0', '6', '12', '18', '24'].map(h => (
                    <span key={h} style={{ fontSize: 7, color: 'rgba(0,0,0,0.3)', fontFamily: ctx.fontFamily }}>{h}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    const activeDays = safe.daysMode === 'irregular' ? null : DAYS.map((d, i) => ({ d, active: safe.days[i] }))
    const hasTime = safe.weekdayStart || safe.holidayStart
    if (!activeDays && !hasTime) return null
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: ctx.fontFamily }}>
        {activeDays && (
          <div style={{ display: 'flex', gap: 3 }}>
            {activeDays.map(({ d, active }, i) => (
              <span key={i} style={{ fontSize: fs * 0.9, fontWeight: 700, color: active ? (i >= 5 ? '#f59e0b' : ctx.theme.accent) : ctx.theme.subText, opacity: active ? 1 : 0.4 }}>{d}</span>
            ))}
            {safe.daysMode === 'irregular' && <span style={{ fontSize: fs, color: ctx.theme.subText }}>バラバラ</span>}
          </div>
        )}
        {(safe.weekdayStart || safe.holidayStart) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {safe.weekdayStart && <span style={{ fontSize: fs, color: ctx.theme.text }}>平日 {safe.weekdayStart}〜{safe.weekdayEnd}</span>}
            {safe.holidayStart && <span style={{ fontSize: fs, color: ctx.theme.text }}>休日 {safe.holidayStart}〜{safe.holidayEnd}</span>}
          </div>
        )}
      </div>
    )
  },
  defaultValue: {
    days: [true, true, true, true, true, false, false],
    weekdayStart: '',
    weekdayEnd: '',
    holidayStart: '',
    holidayEnd: '',
  },
  FormItem({ value, onChange, t }) {
    const update = (patch: Partial<ActivityValue>) => onChange({ ...value, ...patch })
    const toggleDay = (i: number) =>
      update({ days: value.days.map((v, j) => j === i ? !v : v) })

    const timeRanges = [
      { label: t.activityWeekday, startKey: 'weekdayStart' as const, endKey: 'weekdayEnd' as const, modeKey: 'weekdayTimesMode' as const },
      { label: t.activityHoliday, startKey: 'holidayStart' as const, endKey: 'holidayEnd' as const, modeKey: 'holidayTimesMode' as const },
    ]

    return (
      <div className="flex flex-col gap-3">


        {/* 曜日選択 */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-1.5">
            {DAYS.map((d, i) => (
              <button
                key={i}
                onClick={() => {
                if (value.daysMode) {
                  update({ daysMode: '', days: Array(7).fill(false).map((_, j) => j === i) })
                } else {
                  toggleDay(i)
                }
              }}
                className="w-8 h-8 rounded-full text-xs font-bold transition-colors"
                style={{
                  background: value.days[i] && !value.daysMode
                    ? (i >= 5 ? 'rgba(251,191,36,0.85)' : 'rgba(96,165,250,0.85)')
                    : '#f3f4f6',
                  color: (value.days[i] && !value.daysMode) ? '#fff' : '#9ca3af',
                }}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['irregular'] as const).map(mode => {
              const selected = value.daysMode === mode
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => update({ daysMode: selected ? '' : mode })}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    selected
                      ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]'
                      : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {t.activityIrregular}
                </button>
              )
            })}
          </div>
        </div>

        {/* 時間範囲 */}
        {timeRanges.map(({ label, startKey, endKey, modeKey }) => {
          const isIrregular = value[modeKey] === 'irregular'
          const timeOptions = Array.from({ length: 48 }, (_, i) => {
            const h = Math.floor(i / 2).toString().padStart(2, '0')
            const m = i % 2 === 0 ? '00' : '30'
            return `${h}:${m}`
          })
          return (
            <div key={label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">{label}</span>
                <button
                  type="button"
                  onClick={() => update({ [modeKey]: isIrregular ? '' : 'irregular', [startKey]: '', [endKey]: '' })}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all ${
                    isIrregular
                      ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]'
                      : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {t.activityIrregular}
                </button>
              </div>
              {!isIrregular && (
                <div className="flex items-center gap-2">
                  <select
                    value={value[startKey]}
                    onChange={e => update({ [startKey]: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white"
                  >
                    <option value="">--</option>
                    {timeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <span className="text-gray-400 text-sm flex-shrink-0">〜</span>
                  <select
                    value={value[endKey]}
                    onChange={e => update({ [endKey]: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white"
                  >
                    <option value="">--</option>
                    {timeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => update({ [startKey]: '', [endKey]: '' })}
                    className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    {t.activityClear}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  },
}
