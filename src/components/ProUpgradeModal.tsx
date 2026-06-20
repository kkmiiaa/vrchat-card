'use client'

import { useEffect } from 'react'
import UpgradeContent from './UpgradeContent'
import { trackEvent } from '@/lib/gtag'

type Props = {
  onClose: () => void
  trigger?: string
}

export default function ProUpgradeModal({ onClose, trigger = 'unknown' }: Props) {
  useEffect(() => {
    trackEvent('upgrade_modal_opened', { trigger })
  }, [trigger])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="my-auto">
        <UpgradeContent onClose={onClose} />
      </div>
    </div>
  )
}
