// components/CanvasRenderer.ts
import { fabric } from 'fabric'

interface RenderProps {
  name: string
  profileImage: File | null
  language?: string
  playEnv?: string[]
  microphone?: string[]
  selfIntro?: string
}

interface GridArea {
  x: number  // 0-1
  y: number
  w: number
  h: number
}

export class CanvasRenderer {
  canvas: fabric.Canvas
  width: number
  height: number
  balloonPadding: number

  constructor(canvas: fabric.Canvas) {
    if (!canvas || typeof canvas.getWidth !== 'function') {
      throw new Error('CanvasRenderer: invalid fabric.Canvas instance provided.')
    }
    this.canvas = canvas
    this.width = canvas.getWidth()
    this.height = canvas.getHeight()
    this.balloonPadding = 40
  }

  clear() {
    this.canvas.clear()
  }

  render(props: RenderProps) {
    const { name, profileImage, language, playEnv, microphone, selfIntro } = props

    this.clear()
    this.setBackgroundGradient('#60a5fa', '#a78bfa')
    this.drawBalloon()

    // 画像表示
    const imageSrc = profileImage ? URL.createObjectURL(profileImage) : '/default-profile.png'
    fabric.Image.fromURL(imageSrc, (img) => {
      this.drawRoundedImage(img, { x: 0.05, y: 0.08, w: 0.2, h: 0.2 })
    }, { crossOrigin: 'anonymous' })

    // テキスト
    this.drawTextBox("名前 Name", name || '（未入力）', { x: 0.3, y: 0.08, w: 0.3, h: 0.1 })
    this.drawText("使用言語: " + (language || '未入力'), { x: 0.3, y: 0.2, w: 0.5, h: 0.05 })
    this.drawText("プレイ環境: " + (playEnv?.join(', ') || '未入力'), { x: 0.3, y: 0.26, w: 0.5, h: 0.05 })
    this.drawText("マイク: " + (microphone?.join(', ') || '未入力'), { x: 0.3, y: 0.32, w: 0.5, h: 0.05 })

    this.drawTextBox("自己紹介", selfIntro || '（自己紹介なし）', { x: 0.55, y: 0.08, w: 0.4, h: 0.6 }, true)
  }

  setBackgroundGradient(from: string, to: string) {
    const bg = new fabric.Rect({
      left: 0,
      top: 0,
      width: this.width,
      height: this.height,
      fill: new fabric.Gradient({
        type: 'linear',
        gradientUnits: 'pixels',
        coords: { x1: 0, y1: 0, x2: this.width, y2: 0 },
        colorStops: [
          { offset: 0, color: from },
          { offset: 1, color: to },
        ],
      }),
      selectable: false,
      evented: false,
    })
    this.canvas.add(bg)
  }

  drawBalloon(alpha = 0.85) {
    const left = this.balloonPadding
    const top = this.balloonPadding
    const width = this.width - this.balloonPadding * 2
    const height = this.height - this.balloonPadding * 2
    const r = 30
    const tailHeight = 30
    const tailWidth = 60

    const path = new fabric.Path(`
      M ${left + r} ${top}
      H ${left + width - r}
      A ${r} ${r} 0 0 1 ${left + width} ${top + r}
      V ${top + height - tailHeight - r}
      A ${r} ${r} 0 0 1 ${left + width - r} ${top + height - tailHeight}
      H ${left + width / 2 + tailWidth / 2}
      L ${left + width / 2} ${top + height}
      L ${left + width / 2 - tailWidth / 2} ${top + height - tailHeight}
      H ${left + r}
      A ${r} ${r} 0 0 1 ${left} ${top + height - tailHeight - r}
      V ${top + r}
      A ${r} ${r} 0 0 1 ${left + r} ${top}
      Z
    `)

    path.set({
      fill: `rgba(255,255,255,${alpha})`,
      stroke: '#000',
      strokeWidth: 6,
      selectable: false,
      evented: false,
    })
    this.canvas.add(path)
  }

  drawText(text: string, area: GridArea, fontSizeRatio = 0.022) {
    const textObj = new fabric.Text(text, {
      left: this.width * area.x,
      top: this.height * area.y,
      fontSize: this.width * fontSizeRatio,
      fontFamily: '"Rounded Mplus 1c"',
      fill: '#1f2937',
      selectable: false,
      evented: false,
    })
    this.canvas.add(textObj)
  }

  drawTextBox(title: string, value: string, area: GridArea, multiline = false) {
    const label = new fabric.Text(title, {
      left: this.width * area.x,
      top: this.height * area.y,
      fontSize: this.width * 0.018,
      fontFamily: '"Rounded Mplus 1c"',
      fill: '#1f2937',
      selectable: false,
      evented: false,
    })
    const box = new fabric.Textbox(value, {
      left: this.width * area.x,
      top: this.height * (area.y + 0.05),
      width: this.width * area.w,
      fontSize: this.width * 0.016,
      fontFamily: '"Rounded Mplus 1c"',
      fill: '#1f2937',
      selectable: false,
      evented: false,
    })
    if (!multiline) box.set({ height: this.height * area.h })
    this.canvas.add(label)
    this.canvas.add(box)
  }

  drawRoundedImage(img: HTMLImageElement | fabric.Image, area: GridArea) {
    const size = this.width * area.w
    const left = this.width * area.x
    const top = this.height * area.y
    const scale = size / Math.max(img.width!, img.height!)
    const rx = size * 0.15

    img.scale(scale)
    img.set({ left: 0, top: 0, originX: 'left', originY: 'top' })

    const mask = new fabric.Rect({
      width: size,
      height: size,
      rx,
      ry: rx,
      fill: 'white',
      globalCompositeOperation: 'destination-in',
      originX: 'left',
      originY: 'top',
      absolutePositioned: true,
    })

    const group = new fabric.Group([img, mask], {
      left,
      top,
      selectable: false,
      evented: false,
    })

    this.canvas.add(group)
  }

  download() {
    const scale = 1920 / this.width
    const dataURL = this.canvas.toDataURL({ format: 'png', multiplier: scale })
    const link = document.createElement('a')
    link.href = dataURL
    link.download = 'vrchat_card.png'
    link.click()
  }
}