'use client'
import type { Block, ActivityValue } from './types'

const DAYS = ['月', '火', '水', '木', '金', '土', '日']

export const activityBlock: Block<ActivityValue> = {
  key: 'activity',
  defaultValue: {
    days: [true, true, true, true, true, false, false],
    weekdayStart: '',
    weekdayEnd: '',
    holidayStart: '',
    holidayEnd: '',
  },
  FormItem({ value, onChange }) {
    const update = (patch: Partial<ActivityValue>) => onChange({ ...value, ...patch })
    const toggleDay = (i: number) =>
      update({ days: value.days.map((v, j) => j === i ? !v : v) })

    const timeRanges = [
      { label: '平日', startKey: 'weekdayStart' as const, endKey: 'weekdayEnd' as const, modeKey: 'weekdayTimesMode' as const },
      { label: '休日', startKey: 'holidayStart' as const, endKey: 'holidayEnd' as const, modeKey: 'holidayTimesMode' as const },
    ]

    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">活動時間</h2>

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
              const label = 'バラバラ'
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
                  {label}
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
                  バラバラ
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
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span className="text-gray-400 text-sm flex-shrink-0">〜</span>
                  <select
                    value={value[endKey]}
                    onChange={e => update({ [endKey]: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white"
                  >
                    <option value="">--</option>
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => update({ [startKey]: '', [endKey]: '' })}
                    className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    クリア
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
