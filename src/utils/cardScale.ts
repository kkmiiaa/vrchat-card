/**
 * コンテナ幅とカード幅からスケール値を計算する。
 * 1 を上限（拡大しない）、0.1 を下限とする。
 */
export function calcCardScale(containerWidth: number, cardWidth: number): number {
  if (containerWidth <= 0) return 0.1
  return Math.min(1, containerWidth / cardWidth)
}
