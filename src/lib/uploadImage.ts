import { createClient } from '@/lib/supabase/client'

const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB
const MAX_DIMENSION = 1200
const JPEG_QUALITY = 0.80

export class ImageTooLargeError extends Error {}

/** File → 圧縮済み Blob（長辺 MAX_DIMENSION・JPEG 80%） */
export async function compressImage(file: File): Promise<Blob> {
  if (file.size > MAX_SIZE_BYTES) {
    throw new ImageTooLargeError(`ファイルサイズは2MB以下にしてください（現在: ${(file.size / 1024 / 1024).toFixed(1)}MB）`)
  }
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width >= height) { height = Math.round(height * MAX_DIMENSION / width); width = MAX_DIMENSION }
        else                 { width = Math.round(width * MAX_DIMENSION / height); height = MAX_DIMENSION }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('変換失敗')), 'image/jpeg', JPEG_QUALITY)
    }
    img.onerror = reject
    img.src = url
  })
}

/**
 * Storage にアップロードして公開 URL を返す。
 * 同じパスに上書きすることで古い画像を自動置換。
 */
export async function uploadCardImage(
  userId: string,
  cardId: string,
  slot: string, // 'profile' | 'gallery-0' | 'gallery-1' | 'gallery-2'
  file: File,
): Promise<string> {
  const supabase = createClient()
  const blob = await compressImage(file)
  const path = `${userId}/${cardId}/${slot}.jpg`

  const { error } = await supabase.storage
    .from('card-images')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true })

  if (error) throw new Error(`アップロード失敗: ${error.message}`)

  const { data } = supabase.storage.from('card-images').getPublicUrl(path)
  // キャッシュバスティング
  return `${data.publicUrl}?t=${Date.now()}`
}

/** カードに紐づく全画像を削除 */
export async function deleteCardImages(userId: string, cardId: string): Promise<void> {
  const supabase = createClient()
  const slots = ['profile', 'gallery-0', 'gallery-1', 'gallery-2']
  const paths = slots.map(s => `${userId}/${cardId}/${s}.jpg`)
  await supabase.storage.from('card-images').remove(paths)
}
