'use client'

import { Suspense } from 'react'
import VRChatCardGenerator from './VRChatCardGenerator'

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VRChatCardGenerator />
    </Suspense>
  )
}
