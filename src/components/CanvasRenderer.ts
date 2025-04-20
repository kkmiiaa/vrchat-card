// components/CanvasRenderer.ts
import { fabric } from 'fabric'

interface RenderProps {
  name: string
  profileImage: File | null
  language?: string
  playEnv?: string[]
  microphone?: string[]
  selfIntro?: string
  vrchatId?: string
  twitterId?: string
  discordId?: string
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
  fontSizeBase: number
  cornerRadius: number
  tailWidth: number
  tailHeight: number

  constructor(canvas: fabric.Canvas) {
    if (!canvas || typeof canvas.getWidth !== 'function') {
      throw new Error('CanvasRenderer: invalid fabric.Canvas instance provided.')
    }
  
    this.canvas = canvas
    this.width = canvas.getWidth()
    this.height = canvas.getHeight()
  
    // 👇 画面幅の 4% をパディングに（例：1000px → 40px）
    this.balloonPadding = this.width * 0.02
    this.fontSizeBase = this.width * 0.018
    this.cornerRadius = this.width * 0.03
    this.tailWidth = this.width * 0.08
    this.tailHeight = this.height * 0.04
  }

  clear() {
    this.canvas.clear()
  }

  render(props: RenderProps) {
    const { 
      name, 
      profileImage, 
      language, 
      playEnv, 
      microphone, 
      selfIntro, 
      vrchatId, 
      twitterId,
      discordId
    } = props

    this.clear()
    this.setBackgroundGradient('#60a5fa', '#a78bfa')
    this.drawBalloon(0.9)

    // 画像表示
    const imageSrc = profileImage ? URL.createObjectURL(profileImage) : '/default-profile.png'
    fabric.Image.fromURL(imageSrc, (img) => {
      this.drawRoundedImage(img, { x: 0.05, y: 0.08, w: 0.2, h: 0.2 })
    }, { crossOrigin: 'anonymous' })

    // テキスト
    this.drawTextBox("名前", "name", name || '', { x: 0.26, y: 0.08, w: 0.28, h: 0.075 }, false)
    // this.drawText("使用言語: " + (language || '未入力'), { x: 0.3, y: 0.2, w: 0.5, h: 0.05 })
    // this.drawText("プレイ環境: " + (playEnv?.join(', ') || '未入力'), { x: 0.3, y: 0.26, w: 0.5, h: 0.05 })
    // this.drawText("マイク: " + (microphone?.join(', ') || '未入力'), { x: 0.3, y: 0.32, w: 0.5, h: 0.05 })

    this.drawIconWithTextBox(
      'icon_vrchat.png',
      vrchatId ?? "",
      { x: 0.26, y: 0.23, w: 0.03, h: 0.03 },  // icon area
      { x: 0.30, y: 0.23, w: 0.24, h: 0.05 }   // text box area
    )
    this.drawIconWithTextBox(
      'icon_x.png',
      twitterId ?? "",
      { x: 0.26, y: 0.29, w: 0.03, h: 0.03 },  // icon area
      { x: 0.30, y: 0.29, w: 0.24, h: 0.05 }   // text box area
    )
    this.drawIconWithTextBox(
      'icon_discord.png',
      discordId ?? "",
      { x: 0.2605, y: 0.355, w: 0.029, h: 0.03 },  // icon area
      { x: 0.30, y: 0.35, w: 0.24, h: 0.05 }   // text box area
    )
    
    this.drawTextBox("自己紹介", "self-introduction", selfIntro || '', { x: 0.56, y: 0.08, w: 0.40, h: 0.6 }, true)
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

  drawBalloon(alpha = 0.9) {
    const left = this.balloonPadding
    const top = this.balloonPadding
    const width = this.width - this.balloonPadding * 2
    const height = this.height - this.balloonPadding * 2
    const r = this.cornerRadius
    const tailW = this.tailWidth
    const tailH = this.tailHeight

    const path = new fabric.Path(`
      M ${left + r} ${top}
      H ${left + width - r}
      A ${r} ${r} 0 0 1 ${left + width} ${top + r}
      V ${top + height - tailH - r}
      A ${r} ${r} 0 0 1 ${left + width - r} ${top + height - tailH}
      H ${left + width / 2 + tailW / 2}
      L ${left + width / 2} ${top + height}
      L ${left + width / 2 - tailW / 2} ${top + height - tailH}
      H ${left + r}
      A ${r} ${r} 0 0 1 ${left} ${top + height - tailH - r}
      V ${top + r}
      A ${r} ${r} 0 0 1 ${left + r} ${top}
      Z
    `)

    path.set({
      fill: `rgba(255,255,255,${alpha})`,
      stroke: '#000',
      strokeWidth: this.width * 0.003, // ← 枠線もスケール
      selectable: false,
      evented: false,
    })

    this.canvas.add(path)
  }

  drawText(text: string, xRatio: number, yRatio: number, fontSizeRatio = 1) {
    const textObj = new fabric.Text(text, {
      left: this.width * xRatio,
      top: this.height * yRatio,
      fontSize: this.fontSizeBase * fontSizeRatio,
      fontFamily: '"Rounded Mplus 1c"',
      fill: '#1f2937',
      selectable: false,
      evented: false,
    })
    this.canvas.add(textObj)
  }

  drawTextBox(
    title: string,
    subtitle: string,
    value: string,
    area: GridArea,
    multiline = false,
    labelFontSizeRatio = 0.016,
    valueFontSizeRatio = 0.016,
    subtitleFontSizeRatio = 0.013
  ) {
    const padding = this.width * 0.008
    const cornerRadius = this.width * 0.005
    const borderColor = '#ccc'
  
    const labelTop = this.height * area.y
    const boxTop = this.height * (area.y + 0.05)
    const boxLeft = this.width * area.x
    const boxWidth = this.width * area.w
    const boxHeight = this.height * area.h
  
    const contentHeight = multiline
      ? this.height * 0.15
      : boxHeight - padding * 2
  
    const labelFontSize = this.width * labelFontSizeRatio
    const subtitleFontSize = this.width * subtitleFontSizeRatio
  
    // ラベル
    const label = new fabric.Text(title, {
      left: boxLeft,
      top: labelTop,
      fontSize: labelFontSize,
      fontFamily: '"Rounded Mplus 1c"',
      fill: '#1f2937',
      selectable: false,
      evented: false,
    })
  
    let subtitleText: fabric.Text | undefined
  
    if (subtitle) {
      subtitleText = new fabric.Text(subtitle, {
        left: boxLeft + label.width! + this.width * 0.01, // ラベルの右＋余白
        top: labelTop + (labelFontSize - subtitleFontSize), // 下揃え
        fontSize: subtitleFontSize,
        fontFamily: '"Rounded Mplus 1c"',
        fill: '#6b7280', // グレー寄りの色
        selectable: false,
        evented: false,
      })
    }
  
    // 背景ボックス
    const background = new fabric.Rect({
      left: boxLeft,
      top: boxTop,
      width: boxWidth,
      height: contentHeight + padding * 2,
      fill: 'white',
      rx: cornerRadius,
      ry: cornerRadius,
      stroke: borderColor,
      strokeWidth: this.width * 0.0015,
      selectable: false,
      evented: false,
    })
  
    // テキストボックス
    const textbox = new fabric.Textbox(value, {
      left: boxLeft + padding,
      top: boxTop + padding,
      width: boxWidth - padding * 2,
      height: contentHeight,
      fontSize: this.width * valueFontSizeRatio,
      fontFamily: '"Rounded Mplus 1c"',
      fill: '#1f2937',
      selectable: false,
      evented: false,
    })
  
    this.canvas.add(label)
    if (subtitleText) this.canvas.add(subtitleText)
    this.canvas.add(background)
    this.canvas.add(textbox)
  }

  drawIconWithTextBox(
    iconUrl: string,
    value: string,
    iconArea: GridArea,
    textArea: GridArea,
    valueFontSizeRatio = 0.014,
    iconCornerRatio = 0.15
  ) {
    const iconSize = this.width * iconArea.w
    const iconLeft = this.width * iconArea.x
    const iconTop = this.height * iconArea.y
  
    fabric.Image.fromURL(iconUrl, (img) => {
      const scale = iconSize / Math.max(img.width!, img.height!)
      img.scale(scale)
      img.set({
        left: 0,
        top: 0,
        originX: 'left',
        originY: 'top',
      })
  
      const rx = iconSize * iconCornerRatio
      const mask = new fabric.Rect({
        width: iconSize,
        height: iconSize,
        rx,
        ry: rx,
        fill: 'white',
        globalCompositeOperation: 'destination-in',
        originX: 'left',
        originY: 'top',
        absolutePositioned: true,
      })
  
      const group = new fabric.Group([img, mask], {
        left: iconLeft,
        top: iconTop,
        selectable: false,
        evented: false,
      })
  
      this.canvas.add(group)
  
      // 値のみ白背景ボックス
      const padding = this.width * 0.008
      const boxLeft = this.width * textArea.x
      const boxTop = this.height * textArea.y
      const boxWidth = this.width * textArea.w
      const boxHeight = this.height * textArea.h
      const cornerRadius = this.width * 0.005
      const strokeWidth = this.width * 0.0015
  
      const background = new fabric.Rect({
        left: boxLeft,
        top: boxTop,
        width: boxWidth,
        height: boxHeight,
        fill: 'white',
        rx: cornerRadius,
        ry: cornerRadius,
        stroke: '#ccc',
        strokeWidth,
        selectable: false,
        evented: false,
      })
  
      const valueText = new fabric.Text(value, {
        left: boxLeft + padding,
        top: boxTop + (boxHeight - this.width * valueFontSizeRatio) / 2,
        fontSize: this.width * valueFontSizeRatio,
        fontFamily: '"Rounded Mplus 1c"',
        fill: '#1f2937',
        selectable: false,
        evented: false,
      })
  
      this.canvas.add(background)
      this.canvas.add(valueText)
    }, { crossOrigin: 'anonymous' })
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