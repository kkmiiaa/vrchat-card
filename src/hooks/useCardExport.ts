import { useRef, useState, useCallback } from 'react'

type UseCardExportReturn = {
  exportRef: React.RefObject<HTMLDivElement | null>
  downloading: boolean
  generatePng: () => Promise<string | null>
  downloadPng: () => Promise<void>
}

/**
 * カード画像のエクスポート（PNG 生成・ダウンロード）を担う hook。
 * CardEditor から抽出。
 */
export function useCardExport(filename = 'vrchat-introduction-card'): UseCardExportReturn {
  const exportRef = useRef<HTMLDivElement | null>(null)
  const [downloading, setDownloading] = useState(false)

  const generatePng = useCallback(async (): Promise<string | null> => {
    if (!exportRef.current) return null
    const { toPng } = await import('html-to-image')
    return await toPng(exportRef.current, { pixelRatio: 2 })
  }, [])

  const downloadPng = useCallback(async (): Promise<void> => {
    setDownloading(true)
    try {
      const dataUrl = await generatePng()
      if (!dataUrl) return
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        const win = window.open()
        if (win) win.document.write(`<img src="${dataUrl}" style="width:100%;height:auto;" />`)
      } else {
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = `${filename}.png`
        link.click()
      }
    } finally {
      setDownloading(false)
    }
  }, [generatePng, filename])

  return { exportRef, downloading, generatePng, downloadPng }
}
