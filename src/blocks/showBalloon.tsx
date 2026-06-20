'use client'
import BalloonToggle from '@/components/BaloonToggle'
import type { ComponentDef } from './types'

export const showBalloonBlock: ComponentDef<boolean> = {
  key: 'showBalloon',
  defaultValue: true,
  FormItem({ value, onChange, t }) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-gray-500">{t.speechBubble}</h2>
        <BalloonToggle showBalloon={value} setShowBalloon={onChange} t={t} />
      </div>
    )
  },
}
