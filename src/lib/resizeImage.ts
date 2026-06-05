/**
 * ブラウザ Canvas API を使って画像をリサイズし、JPEG base64 として返す。
 * localStorage への保存サイズを削減するために使用。
 */
export function resizeImageToBase64(
  source: File | Blob | string,
  maxWidth: number,
  maxHeight: number,
  quality = 0.8,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    let objectUrl: string | null = null

    img.onload = () => {
      const ratio = Math.min(
        maxWidth  / (img.naturalWidth  || maxWidth),
        maxHeight / (img.naturalHeight || maxHeight),
        1,
      )
      const w = Math.round((img.naturalWidth  || maxWidth)  * ratio)
      const h = Math.round((img.naturalHeight || maxHeight) * ratio)

      const canvas = document.createElement('canvas')
      canvas.width  = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('canvas 2d context unavailable')); return }
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }

    img.onerror = reject

    if (typeof source === 'string') {
      img.src = source
    } else {
      objectUrl = URL.createObjectURL(source)
      img.src = objectUrl
    }
  })
}
