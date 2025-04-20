export function calculateLayout(width: number, height: number, padding: number = 40) {
  const usableWidth = width - padding * 2;
  const colWidth = usableWidth / 4;
  const colX = Array.from({ length: 4 }, (_, i) => padding + i * colWidth);

  return {
      colX,
      colWidth,
      padding,
      usableWidth,
  };
}
