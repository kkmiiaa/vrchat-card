'use client'
import { createContext, useContext } from 'react'

type ImageUploadContextValue = {
  /** slot 名と File を渡すと Storage にアップロードして公開 URL を返す。cardId 未確定時は null を返す */
  upload: (slot: string, file: File) => Promise<string | null>
}

export const ImageUploadContext = createContext<ImageUploadContextValue | null>(null)

export function useImageUpload(): ImageUploadContextValue | null {
  return useContext(ImageUploadContext)
}
