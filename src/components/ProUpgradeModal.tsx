'use client'

import UpgradeContent from './UpgradeContent'

type Props = {
  onClose: () => void
}

export default function ProUpgradeModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="my-auto">
        <UpgradeContent onClose={onClose} />
      </div>
    </div>
  )
}
