import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { activityComponent } from '../activity'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'
import { translations } from '@/utils/translations'

const t = translations.ja

const DEFAULT_VALUE = {
  days: [true, true, true, true, true, false, false],
  weekdayStart: '',
  weekdayEnd: '',
  holidayStart: '',
  holidayEnd: '',
}

describe('activity', () => {
  it('1. defaultValue は曜日・時間帯を含むオブジェクト', () => {
    expect(activityComponent.defaultValue).toHaveProperty('days')
    expect(activityComponent.defaultValue).toHaveProperty('weekdayStart')
    expect(activityComponent.defaultValue).toHaveProperty('holidayStart')
  })

  it('2. FormItem にグリッドUI（曜日ボタン）が描画される', () => {
    render(
      activityComponent.FormItem!({
        value: DEFAULT_VALUE,
        onChange: () => {},
        t,
      })
    )
    // 月〜日の曜日ボタンが存在する
    expect(screen.getByText('月')).toBeInTheDocument()
    expect(screen.getByText('日')).toBeInTheDocument()
  })

  it('3. 曜日ボタンをクリックすると days が更新された値が onChange に渡される', () => {
    const onChange = vi.fn()
    render(
      activityComponent.FormItem!({
        value: { ...DEFAULT_VALUE, days: [false, false, false, false, false, false, false] },
        onChange,
        t,
      })
    )
    fireEvent.click(screen.getByText('月'))
    expect(onChange).toHaveBeenCalled()
    const called = onChange.mock.calls[0][0]
    expect(called.days).toBeDefined()
  })

  it('4. blockConfig.allowMixedSchedule=true のとき個別設定のヒントが表示される', () => {
    render(
      activityComponent.FormItem!({
        value: DEFAULT_VALUE,
        onChange: () => {},
        t,
        blockConfig: { allowMixedSchedule: true },
      })
    )
    expect(screen.getByTestId('mixed-schedule-hint')).toBeInTheDocument()
  })

  it('5. blockConfig.allowMixedSchedule=false のときヒントが表示されない', () => {
    render(
      activityComponent.FormItem!({
        value: DEFAULT_VALUE,
        onChange: () => {},
        t,
        blockConfig: { allowMixedSchedule: false },
      })
    )
    expect(screen.queryByTestId('mixed-schedule-hint')).toBeNull()
  })

  it('10. CardItem: 入力済み値が描画される', () => {
    render(
      activityComponent.CardItem!({
        value: { ...DEFAULT_VALUE, weekdayStart: '20:00', weekdayEnd: '23:00' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    expect(screen.getByText(/20:00/)).toBeInTheDocument()
  })

  it('11. CardItem: defaultValue はエラーなく描画される', () => {
    expect(() =>
      render(
        activityComponent.CardItem!({
          value: activityComponent.defaultValue,
          ctx: DEFAULT_CARD_RENDER_CONTEXT,
        })
      )
    ).not.toThrow()
  })
})
