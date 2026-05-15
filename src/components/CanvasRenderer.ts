import { fabric } from 'fabric'
import {
  RoundedMplus,
  Kosugi,
  ZenMaru,
  Uzura,
  Kawaii,
  MaruMinya,
} from '@/app/fonts'

export const fontMap = {
  rounded: RoundedMplus,
  kosugi: Kosugi,
  zenmaru: ZenMaru,
  uzura: Uzura,
  kawaii: Kawaii,
  maruminya: MaruMinya,
}

interface RenderProps {
  name: string
  profileImage: File | null
  language?: string[]
  gender?: string
  playEnv?: string[]
  micOnRate?: number
  selfIntro?: string
  vrchatId?: string
  twitterId?: string
  discordId?: string
  statusBlue?: string
  statusGreen?: string
  statusYellow?: string
  statusRed?: string
  friendPolicy?: string[]
  interactions: InteractionItem[]
  backgroundType?: 'color' | 'gradient' | 'image'
  backgroundValue?: string | [string, string] | File,
  galleryEnabled: boolean
  galleryImages: (File | null)[]
  fontFamily: string;
  showBalloon: boolean;
}

interface GridArea {
  x: number  // 0-1
  y: number
  w: number
  h: number
}

type TextOptions = {
  text: string
  left?: number
  top?: number
  fontSize?: number
  fontFamily?: string
  fill?: string
  selectable?: boolean
  evented?: boolean
  maxWidth?: number // オプション：幅を指定すると自動で縮小
}

type TextboxOptions = {
  text: string
  left: number
  top: number
  width: number
  height: number
  fontSize?: number
  fontFamily?: string
  fill?: string
  selectable?: boolean
  evented?: boolean
  underline?: boolean
  padding?: number
  minFontSize?: number
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
  t: any

  constructor(canvas: fabric.Canvas, t: { [key: string]: any, lang: string }) {
    if (!canvas || typeof canvas.getWidth !== 'function') {
      throw new Error('CanvasRenderer: invalid fabric.Canvas instance provided.')
    }
  
    this.canvas = canvas
    this.width = canvas.getWidth()
    this.height = canvas.getHeight()
    this.t = t
  
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
      gender,
      language, 
      playEnv, 
      micOnRate, 
      selfIntro, 
      vrchatId, 
      twitterId,
      discordId,
      statusBlue,
      statusGreen,
      statusYellow,
      statusRed,
      friendPolicy,
      interactions,
      backgroundType,
      backgroundValue,
      galleryEnabled,
      galleryImages,
      fontFamily,
      showBalloon
    } = props

    this.clear()
    this.setBackground(
      backgroundType ?? "gradient", 
      backgroundValue ?? ['#60a5fa', '#a78bfa']
    )

    if (showBalloon) {
      this.drawBalloon(0.9)
    }

    // 画像表示
    const imageSrc = profileImage ? URL.createObjectURL(profileImage) : '/default-profile.png'
    fabric.Image.fromURL(imageSrc, (img) => {
      const image = img as fabric.Image
      this.drawRoundedImage(
        image, 
        { x: 0.05, y: 0.08, w: 0.2, h: 0.2 }
      )
    }, { crossOrigin: 'anonymous' })

    this.drawTextBox(
      this.t.name, 
      this.t.canvasSubtitleName, 
      name || '', 
      { x: 0.26, y: 0.08, w: 0.28, h: 0.075 }, 
      false,
      0.016,
      0.02,
      0.013,
      fontFamily,
      0.01,
      false,
    )

    this.drawInlineField(
      this.t.canvasGender,
      this.t.canvasSubtitleGender,
      gender ?? "", 
      0.26,
      0.21,
      { x: 0.30, y: 0.21, w: 0.06, h: 0.045 }, 
      0.013,
      0.010,
      0.011,
      fontFamily,
      false,
      'box'
    )

    this.drawInlineField(
      this.t.canvasEnvironment,
      this.t.canvasSubtitleEnvironment,
      (playEnv ?? []).join(" / "), 
      0.375,
      0.21,
      { x: 0.41, y: 0.21, w: 0.13, h: 0.045 }, 
      0.013,
      0.010,
      0.010,
      fontFamily,
      false,
      'box'
    )

    this.drawIconWithTextBox(
      '/icon_vrchat.png',
      vrchatId ?? "",
      { x: 0.26, y: 0.27, w: 0.03, h: 0.03 },
      { x: 0.30, y: 0.27, w: 0.24, h: 0.05 },
      0.012, 
      fontFamily,
      0.15,
      false,
    )

    this.drawIconWithTextBox(
      '/icon_x.png',
      twitterId ?? "",
      { x: 0.26, y: 0.33, w: 0.03, h: 0.03 },
      { x: 0.30, y: 0.33, w: 0.24, h: 0.05 },
      0.012, 
      fontFamily,
      0.15,
      false,
    )

    this.drawIconWithTextBox(
      '/icon_discord.png',
      discordId ?? "",
      { x: 0.2605, y: 0.395, w: 0.029, h: 0.03 },
      { x: 0.30, y: 0.39, w: 0.24, h: 0.05 },
      0.012,
      fontFamily, 
      0.15,
      false,
    )

    this.drawTextBox(
      this.t.canvasLanguages, 
      this.t.canvasSubtitleLanguages, 
      (language ?? []).join(' / '), 
      { x: 0.05, y: 0.455, w: 0.21, h: 0.05 }, 
      false,
      0.012,
      0.01,
      0.01,
      fontFamily,
      0.008,
      false
    )

    this.drawMicGauge(
      this.t.canvasMicOnRate,
      this.t.canvasSubtitleMicUsage,
      micOnRate ?? 0,
      { x: 0.05, y: 0.56, w: 0.18, h: 0.06 },
      0.01,
      0.01,
      0.01,
      fontFamily,
    )

    this.drawStatusSection(
      this.t.canvasStatus, 
      this.t.canvasSubtitleStatuses, 
      {
        blue: statusBlue ?? '',
        green: statusGreen ?? '',
        yellow: statusYellow ?? '',
        red: statusRed ?? ''
      }, 
      { x: 0.05, y: 0.64, w: 0.24, h: 0.18 },
      0.013,
      0.01,
      0.01,
      0.018,
      0.04,
      0.015,
      fontFamily,
    )

    this.drawTextBox(
      this.t.canvasFriendRequest,
      this.t.canvasSubtitleFriendRequest,
      (friendPolicy ?? []).map(key => this.t[key as keyof typeof this.t]).join(" / "),
      { x: 0.28, y: 0.48, w: 0.26, h: 0.10 },
      false,
      0.013,
      0.011,
      0.01,
      fontFamily,
      0.008,
      false
    )

    this.drawTitleAndSubtitle(
      this.t.okNg, 
      this.t.canvasSubtitleBoundaries, 
      this.width * 0.28,
      this.height * 0.64,
      0.013,
      0.01,
      fontFamily,
    )

    interactions.forEach((item, i) => {
      this.drawInlineField(
        '', // ラベルは使わない
        '', // サブタイトルも不要
        `${item.isCustom ? item.label : this.t.okNgDefaults[item.label as keyof typeof this.t.okNgDefaults]}：${item.mark}`.replace(/：/g, `: `),
        0,
        0,
        { 
          x: 0.28 + 0.09 * (i%3), 
          y: 0.68 + 0.07 * Math.floor(i/3), 
          w: 0.08, 
          h: 0.06 
        },
        0.013,
        0.010,
        0.010,
        fontFamily,
        false,
        'box'
      )
    })

    const introductionHeight = galleryEnabled ? 0.52 : 0.76
    this.drawTextBox(
      this.t.canvasAboutMe, 
      this.t.canvasSubtitleIntroduction, 
      selfIntro || '', 
      { x: 0.56, y: 0.08, w: 0.40, h: introductionHeight },
      true,
      0.016,
      0.013,
      0.012,
      fontFamily,
      0.014,
      false
    )

    if (galleryEnabled) {
      const maxImages = 3
      const _padding = this.width * 0.01
      const areaX = 0.56
      const areaYBottom = 0.645
      const areaW = 0.40
    
      const margin = this.width * 0.008
      const totalWidth = this.width * areaW - margin * (maxImages - 1)
      const imageWidth = totalWidth / maxImages
      const _imageHeight = imageWidth * 0.5625 // 16:9
      const top = this.height * (areaYBottom + 0.01)
    
      galleryImages.slice(0, maxImages).forEach((file, i) => {
        if (!file) return
        const left = this.width * areaX + i * (imageWidth + margin)
        const url = URL.createObjectURL(file)
      
        fabric.Image.fromURL(url, (img) => {
          const image = img as fabric.Image
          const targetSize = imageWidth // 正方形
        
          const scale = Math.max(
            targetSize / image.width!,
            targetSize / image.height!
          )
        
          image.scale(scale)
        
          const displayWidth = image.width! * scale
          const displayHeight = image.height! * scale
        
          const offsetX = (displayWidth - targetSize) / 2
          const offsetY = (displayHeight - targetSize) / 2
        
          image.set({
            left: -offsetX,
            top: -offsetY,
            originX: 'left',
            originY: 'top',
          })
        
          const rx = targetSize * 0.05
        
          const mask = new fabric.Rect({
            width: targetSize,
            height: targetSize,
            rx,
            ry: rx,
            fill: 'white',
            globalCompositeOperation: 'destination-in',
            originX: 'left',
            originY: 'top',
            absolutePositioned: true,
          })
        
          const group = new fabric.Group([image, mask], {
            left,
            top,
            width: targetSize,
            height: targetSize,
            selectable: false,
            evented: false,
          })
        
          this.canvas.add(group)
        }, { crossOrigin: 'anonymous' })

      })
      
    }

    this.drawCopyright()
  }

  setBackground(type: 'color' | 'gradient' | 'image', value: string | [string, string] | File) {
    const bg = new fabric.Rect({
      left: 0,
      top: 0,
      width: this.width,
      height: this.height,
      selectable: false,
      evented: false
    })

    if (type === 'color' && typeof value === 'string') {
      bg.set({ fill: value })
    } else if (type === 'gradient' && Array.isArray(value)) {
      bg.set({
        fill: new fabric.Gradient({
          type: 'linear',
          gradientUnits: 'pixels',
          coords: { x1: 0, y1: 0, x2: this.width, y2: 0 },
          colorStops: [
            { offset: 0, color: value[0] },
            { offset: 1, color: value[1] },
          ],
        })
      })
    } else if (type === 'image') {
      let src: string | undefined;
    
      if (value instanceof File) {
        src = URL.createObjectURL(value); // File → Blob URL
      } else if (typeof value === 'string') {
        src = value;
      }
    
      if (!src) return;
    
      fabric.Image.fromURL(src, (img) => {
        const canvas = this.canvas;
        if (!img || !canvas) return;

        img.set({
          scaleX: this.width / img.width!,
          scaleY: this.height / img.height!,
          originX: 'left',
          originY: 'top',
        });

        try {
          canvas.setBackgroundImage(
            img,
            canvas.renderAll.bind(canvas),
            {
              scaleX: this.width / img.width!,
              scaleY: this.height / img.height!,
              originX: 'left',
              originY: 'top',
            }
          );
        } catch {
          // canvas already disposed
        }
      }, { crossOrigin: 'anonymous' });
    
      return;
    }

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
  
    // 👇 三角の位置を右寄りに移動（右端から余白40pxの位置に中心が来るように）
    const tailCenterX = left + width - this.width * 0.08
  
    const path = new fabric.Path(`
      M ${left + r} ${top}
      H ${left + width - r}
      A ${r} ${r} 0 0 1 ${left + width} ${top + r}
      V ${top + height - tailH - r}
      A ${r} ${r} 0 0 1 ${left + width - r} ${top + height - tailH}
      H ${tailCenterX + tailW / 2}
      L ${tailCenterX + tailW * 0.5} ${top + height}
      L ${tailCenterX - tailW / 2} ${top + height - tailH}
      H ${left + r}
      A ${r} ${r} 0 0 1 ${left} ${top + height - tailH - r}
      V ${top + r}
      A ${r} ${r} 0 0 1 ${left + r} ${top}
      Z
    `)
  
    path.set({
      fill: `rgba(255,255,255,${alpha})`,
      stroke: 'rgba(0,0,0,0.12)',
      strokeWidth: this.width * 0.002,
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.15)',
        blur: this.width * 0.02,
        offsetX: 0,
        offsetY: this.height * 0.005,
      }),
      selectable: false,
      evented: false,
    })
  
    this.canvas.add(path)
  }

  createFittedText({
    text,
    left = 0,
    top = 0,
    fontSize = 48,
    fontFamily = RoundedMplus.style.fontFamily,
    fill = '#000',
    selectable = false,
    evented = false,
    maxWidth,
  }: TextOptions): fabric.Text {
    let t = new fabric.Text(text, {
      left,
      top,
      fontSize,
      fontFamily,
      fill,
      selectable,
      evented,
    })
  
    // maxWidth の範囲に収める処理（任意）
    if (maxWidth !== undefined) {
      while ((t.width ?? 0) > maxWidth && fontSize > 8) {
        fontSize -= 1
        t.set({ fontSize })
        t.setCoords()
      }
    }
  
    return t
  }
  
  drawTextBox(
    title: string,
    subtitle: string,
    value: string,
    area: GridArea,
    _multiline = false,
    labelFontSizeRatio = 0.016,
    valueFontSizeRatio = 0.016,
    subtitleFontSizeRatio = 0.013,
    fontFamily = RoundedMplus.style.fontFamily,
    paddingRatio = 0.008,
    isBorder = true,
  ) {
    const padding = this.width * paddingRatio
    const cornerRadius = this.width * 0.005

    const labelFontSize = this.width * labelFontSizeRatio
    const subtitleFontSize = this.width * subtitleFontSizeRatio
    const labelGap = this.width * 0.006

    const labelTop = this.height * area.y
    const boxTop = labelTop + labelFontSize + labelGap
    const boxLeft = this.width * area.x
    const boxWidth = this.width * area.w
    const boxHeight = this.height * area.h

    const contentHeight = boxHeight - padding * 2
  
    // ラベル
    const label = new fabric.Text(title, {
      left: boxLeft,
      top: labelTop,
      fontSize: labelFontSize,
      fontFamily: fontFamily,
      fill: '#1f2937',
      selectable: false,
      evented: false,
    })

    let subtitleText: fabric.Text | undefined

    if (subtitle) {
      subtitleText = new fabric.Text(subtitle, {
        left: boxLeft + label.width! + this.width * 0.01,
        top: labelTop + (labelFontSize - subtitleFontSize),
        fontSize: subtitleFontSize,
        fontFamily: fontFamily,
        fill: '#9ca3af',
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
      stroke: isBorder ? 'rgba(0,0,0,0.08)' : undefined,
      strokeWidth: isBorder ? this.width * 0.001 : 0,
      selectable: false,
      evented: false,
    })
  
    // テキストボックス
    const textbox = new fabric.Textbox(String(value), {
      left: boxLeft + padding,
      top: boxTop + padding,
      width: boxWidth - padding * 2,
      height: contentHeight,
      fontSize: this.width * valueFontSizeRatio,
      fontFamily: String(fontFamily),
      fill: '#1f2937',
      selectable: false,
      evented: false,
      splitByGrapheme: true
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
    fontFamily = RoundedMplus.style.fontFamily,
    iconCornerRatio = 0.15,
    isBorder = true,
  ) {
    const iconSize = this.width * iconArea.w
    const iconLeft = this.width * iconArea.x
    const iconTop = this.height * iconArea.y
  
    fabric.Image.fromURL(iconUrl, (img) => {
      const image = img as fabric.Image
      const scale = iconSize / Math.max(image.width!, image.height!)
      image.scale(scale)
      image.set({
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
  
      const group = new fabric.Group([image, mask], {
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
      const strokeWidth = this.width * 0.001
  
      const background = new fabric.Rect({
        left: boxLeft,
        top: boxTop,
        width: boxWidth,
        height: boxHeight,
        fill: 'white',
        rx: cornerRadius,
        ry: cornerRadius,
        stroke: isBorder ? '#ccc' : undefined,
        strokeWidth: isBorder ? strokeWidth : 0,
        selectable: false,
        evented: false,
      })
  
      const valueText = this.createFittedText(
        {
          text: value,
          left: boxLeft + padding,
          top: boxTop + (boxHeight - this.width * valueFontSizeRatio) / 2,
          fontSize: this.width * valueFontSizeRatio,
          fontFamily: fontFamily,
          fill: '#1f2937',
          selectable: false,
          evented: false,
          maxWidth: boxWidth - padding * 2
        }
      )
  
      this.canvas.add(background)
      this.canvas.add(valueText)
    }, { crossOrigin: 'anonymous' })
  }  

  drawInlineField(
    title: string,
    subtitle: string,
    value: string,
    labelLeft: number,
    labelTop: number,
    boxArea: GridArea,
    labelFontSizeRatio = 0.016,
    subtitleFontSizeRatio = 0.009,
    valueFontSizeRatio = 0.016,
    fontFamily = RoundedMplus.style.fontFamily,
    withStroke = false,
    variant: 'box' | 'underline' = 'box'  // ← 追加
  ) {
    const labelFontSize = this.width * labelFontSizeRatio
    const subtitleFontSize = this.width * subtitleFontSizeRatio
    const valueFontSize = this.width * valueFontSizeRatio
    const padding = this.width * 0.006
  
    const label = new fabric.Text(title, {
      left: this.width * labelLeft,
      top: this.height * labelTop,
      fontSize: labelFontSize,
      fontFamily: fontFamily,
      fill: '#1f2937',
      selectable: false,
      evented: false,
    })

    const subtitleText = new fabric.Text(subtitle, {
      left: label.left!,
      top: label.top! + labelFontSize,
      fontSize: subtitleFontSize,
      fontFamily: fontFamily,
      fill: '#9ca3af',
      selectable: false,
      evented: false,
    })
  
    const boxLeft = this.width * boxArea.x
    const boxTop = this.height * boxArea.y
    const boxWidth = this.width * boxArea.w
    const boxHeight = this.height * boxArea.h
    const cornerRadius = this.width * 0.005
  
    // optional background box（variantがboxの場合のみ描画）
    if (variant === 'box') {
      const background = new fabric.Rect({
        left: boxLeft,
        top: boxTop,
        width: boxWidth,
        height: boxHeight,
        fill: 'white',
        rx: cornerRadius,
        ry: cornerRadius,
        stroke: withStroke ? '#ccc' : undefined,
        strokeWidth: withStroke ? this.width * 0.001 : 0,
        selectable: false,
        evented: false,
      })
      this.canvas.add(background)
    }
  
    // テキストボックス
    const textbox = new fabric.Textbox(String(value), {
      left: boxLeft + padding,
      top: boxTop + (boxHeight - valueFontSize) / 2,
      width: boxWidth - padding * 2,
      fontSize: valueFontSize,
      fontFamily: String(fontFamily),
      fill: '#1f2937',
      selectable: false,
      evented: false,
      underline: variant === 'underline',
    })
  
    this.canvas.add(label)
    this.canvas.add(subtitleText)
    this.canvas.add(textbox)
  }
  
  drawRoundedImage(img: HTMLImageElement | fabric.Image, area: GridArea) {
    const image = img as fabric.Image

    const size = this.width * area.w
    const left = this.width * area.x
    const top = this.height * area.y
    const scale = size / Math.max(image.width!, image.height!)
    const rx = size * 0.15

    image.scale(scale)
    image.set({ left: 0, top: 0, originX: 'left', originY: 'top' })

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

    const group = new fabric.Group([image, mask], {
      left,
      top,
      selectable: false,
      evented: false,
    })

    this.canvas.add(group)
  }

  drawMicGauge(
    title: string,
    subtitle: string,
    percent: number,
    area: GridArea,
    titleFontRatio = 0.016,
    subtitleFontRatio = 0.012,
    valueFontRatio = 0.014,
    fontFamily = RoundedMplus.style.fontFamily,
    gradient: [string, string] = ['#60a5fa', '#a78bfa']
  ) {
    const padding = this.width * 0.006
    const left = this.width * area.x
    const top = this.height * area.y
    const width = this.width * area.w
    const height = this.height * area.h
    const cornerRadius = this.width * 0.005
    const barHeight = height * 0.3
  
    // ラベル横並び
    const titleText = new fabric.Text(title, {
      left,
      top,
      fontSize: this.width * titleFontRatio,
      fontFamily: fontFamily,
      fill: '#1f2937',
      selectable: false,
      evented: false,
    })
  
    const subtitleText = new fabric.Text(subtitle, {
      left: titleText.left! + titleText.width! + padding,
      top: top + (titleText.fontSize! - this.width * subtitleFontRatio), // 下揃え
      fontSize: this.width * subtitleFontRatio,
      fontFamily: fontFamily,
      fill: '#6b7280',
      selectable: false,
      evented: false,
    })
  
    const barTop = top + titleText.fontSize! + this.width * 0.006
  
    // 背景バー
    const background = new fabric.Rect({
      left,
      top: barTop,
      width,
      height: barHeight,
      fill: '#e5e7eb',
      rx: cornerRadius,
      ry: cornerRadius,
      selectable: false,
      evented: false,
    })
  
    // ゲージ本体（グラデ）
    const filled = new fabric.Rect({
      left,
      top: barTop,
      width: width * (percent / 100),
      height: barHeight,
      rx: cornerRadius,
      ry: cornerRadius,
      fill: new fabric.Gradient({
        type: 'linear',
        gradientUnits: 'pixels',
        coords: { x1: 0, y1: 0, x2: width, y2: 0 },
        colorStops: [
          { offset: 0, color: gradient[0] },
          { offset: 1, color: gradient[1] },
        ],
      }),
      selectable: false,
      evented: false,
    })
  
    // 数値表示
    const valueText = new fabric.Text(`${percent}%`, {
      left: left + width + padding,
      top: barTop + (barHeight - this.width * valueFontRatio) / 2,
      fontSize: this.width * valueFontRatio,
      fontFamily: fontFamily,
      fill: '#1f2937',
      selectable: false,
      evented: false,
    })
  
    this.canvas.add(titleText, subtitleText, background, filled, valueText)
  }

  drawStatusSection(
    title: string, 
    subtitle: string, 
    values: { blue: string, green: string, yellow: string, red: string }, 
    area: GridArea,
    titleFontRatio = 0.016,
    subtitleFontRatio = 0.012,
    valueFontRatio = 0.014,
    iconSizeRatio = 0.03,
    textBoxHeightRatio = 0.04,
    rowSpacingRatio = 0.02, // 上下間の余白
    fontFamily = RoundedMplus.style.fontFamily,
  ) {
    const left = this.width * area.x
    const top = this.height * area.y
  
    // タイトル・サブタイトル表示（横並び）
    this.drawTitleAndSubtitle(title, subtitle, left, top, titleFontRatio, subtitleFontRatio, fontFamily)
  
    // 各行のスタート位置（ラベルフォントサイズ＋余白に連動）
    const labelPx = this.width * titleFontRatio + this.width * 0.006
    const startY = area.y + labelPx / this.height
    const rowHeight = textBoxHeightRatio + rowSpacingRatio
  
    const colors = ['blue', 'green', 'yellow', 'red'] as const
    colors.forEach((color, i) => {
      const y = startY + rowHeight * i
      const iconPath = `/icon_status_${color}.png`
      const text = values[color]
  
      this.drawIconWithTextBox(
        iconPath,
        text,
        {
          x: area.x,
          y,
          w: iconSizeRatio,
          h: iconSizeRatio
        },
        {
          x: area.x + 0.03,
          y,
          w: area.w - 0.06,
          h: textBoxHeightRatio
        },
        valueFontRatio, // 値のフォントサイズ比
        fontFamily,
        0.15,
        false
      )
    })
  }

  drawTitleAndSubtitle(
    title: string,
    subtitle: string,
    left: number,
    top: number,
    titleFontRatio = 0.016,
    subtitleFontRatio = 0.012,
    fontFamily = RoundedMplus.style.fontFamily,
  ) {
    const titleText = new fabric.Text(title, {
      left,
      top,
      fontSize: this.width * titleFontRatio,
      fontFamily: fontFamily,
      fill: '#1f2937',
      selectable: false,
      evented: false,
    })
  
    const subtitleText = new fabric.Text(subtitle, {
      left: left + titleText.width! + this.width * 0.006,
      top: top + (this.width * titleFontRatio - this.width * subtitleFontRatio), // 下揃え
      fontSize: this.width * subtitleFontRatio,
      fontFamily: fontFamily,
      fill: '#6b7280',
      selectable: false,
      evented: false,
    })
  
    this.canvas.add(titleText)
    this.canvas.add(subtitleText)
  }

  drawCopyright() {
    // watermark intentionally removed
  }

  renderV2(props: RenderProps) {
    const {
      name,
      profileImage,
      gender,
      language,
      playEnv,
      micOnRate,
      selfIntro,
      vrchatId,
      twitterId,
      discordId,
      statusBlue,
      statusGreen,
      statusYellow,
      statusRed,
      interactions,
      backgroundType,
      backgroundValue,
      fontFamily,
    } = props

    this.clear()
    this.setBackground(
      backgroundType ?? 'gradient',
      backgroundValue ?? ['#e0e7ff', '#fce7f3']
    )

    const W = this.width
    const H = this.height
    const photoW = W * 0.43
    const rightX = photoW + W * 0.04
    const rightW = W - rightX - W * 0.03
    const pad = W * 0.018

    // ── 左: 写真（上下フチなし） ──
    const imageSrc = profileImage ? URL.createObjectURL(profileImage) : '/default-profile.png'
    fabric.Image.fromURL(imageSrc, (img) => {
      if (!this.canvas) return
      const image = img as fabric.Image
      const iw = image.width ?? 1
      const ih = image.height ?? 1
      const scale = Math.max(photoW / iw, H / ih)
      const scaledW = iw * scale
      const scaledH = ih * scale
      image.set({
        left: -(scaledW - photoW) / 2,
        top: -(scaledH - H) / 2,
        originX: 'left',
        originY: 'top',
      })
      image.scale(scale)
      const mask = new fabric.Rect({
        width: photoW,
        height: H,
        fill: 'white',
        globalCompositeOperation: 'destination-in',
        originX: 'left',
        originY: 'top',
        absolutePositioned: true,
      })
      if (!this.canvas) return
      this.canvas.add(new fabric.Group([image, mask], {
        left: 0, top: 0,
        width: photoW, height: H,
        selectable: false, evented: false,
      }))
    }, { crossOrigin: 'anonymous' })

    // ── 右: 名前 ──
    const nameSize = W * 0.042
    this.canvas.add(new fabric.Text(name || '名前未設定', {
      left: rightX, top: H * 0.07,
      fontSize: nameSize, fontFamily,
      fill: '#111827', fontWeight: 'bold',
      selectable: false, evented: false,
    }))

    // ── 属性タグ（固定幅・折り返しなし・1行） ──
    const tagItems = [
      gender,
      (language ?? []).join(' / '),
      (playEnv ?? []).join(' / '),
      micOnRate ? `Mic ${micOnRate}%` : '',
    ].filter(Boolean) as string[]

    const tagY = H * 0.07 + nameSize + H * 0.018
    const tagFontSize = W * 0.011
    const tagH = tagFontSize + H * 0.018
    const tagRadius = W * 0.005
    const tagGap = W * 0.008
    let tagX = rightX

    tagItems.forEach((tag) => {
      if (!this.canvas) return
      const tagW = Math.min(tag.length * tagFontSize * 0.65 + W * 0.016, rightW * 0.45)
      this.canvas.add(new fabric.Rect({
        left: tagX, top: tagY,
        width: tagW, height: tagH,
        fill: 'rgba(255,255,255,0.7)',
        rx: tagRadius, ry: tagRadius,
        stroke: 'rgba(0,0,0,0.08)', strokeWidth: W * 0.001,
        selectable: false, evented: false,
      }))
      this.canvas.add(new fabric.Text(tag, {
        left: tagX + W * 0.008, top: tagY + (tagH - tagFontSize) / 2,
        fontSize: tagFontSize, fontFamily,
        fill: '#374151', selectable: false, evented: false,
      }))
      tagX += tagW + tagGap
    })

    // ── 自己紹介 ──
    const introY = tagY + tagH + H * 0.022
    const introH = H * 0.24
    this.canvas.add(new fabric.Rect({
      left: rightX, top: introY,
      width: rightW, height: introH,
      fill: 'rgba(255,255,255,0.6)',
      rx: W * 0.005, ry: W * 0.005,
      selectable: false, evented: false,
    }))
    this.canvas.add(new fabric.Textbox(selfIntro || '', {
      left: rightX + pad, top: introY + pad,
      width: rightW - pad * 2,
      fontSize: W * 0.013, fontFamily,
      fill: '#374151', selectable: false, evented: false,
      splitByGrapheme: true,
    }))

    // ── SNS（縦並び） ──
    const snsItems = [
      { icon: '/icon_vrchat.png', value: vrchatId ?? '' },
      { icon: '/icon_x.png',     value: twitterId ?? '' },
      { icon: '/icon_discord.png', value: discordId ?? '' },
    ].filter(s => s.value)

    const snsStartY = introY + introH + H * 0.022
    const snsRowH = H * 0.055
    const iconSz = W * 0.022

    snsItems.forEach((sns, i) => {
      const sy = snsStartY + i * (snsRowH + H * 0.008)
      this.drawIconWithTextBox(
        sns.icon, sns.value,
        { x: rightX / W, y: sy / H, w: iconSz / W, h: iconSz / W },
        { x: (rightX + iconSz + W * 0.008) / W, y: sy / H, w: (rightW - iconSz - W * 0.01) / W, h: snsRowH / H },
        0.011, fontFamily, 0.15, false,
      )
    })

    const afterSnsY = snsStartY + snsItems.length * (snsRowH + H * 0.008) + H * 0.015

    // ── ステータス（2列） ──
    const statusEntries = [
      { color: '#3b82f6', value: statusBlue ?? '' },
      { color: '#22c55e', value: statusGreen ?? '' },
      { color: '#f59e0b', value: statusYellow ?? '' },
      { color: '#ef4444', value: statusRed ?? '' },
    ].filter(s => s.value)

    let afterStatusY = afterSnsY
    if (statusEntries.length > 0) {
      const sFontSize = W * 0.011
      const dotR = W * 0.005
      const rowH = sFontSize + H * 0.014
      const colW = rightW / 2

      statusEntries.forEach((s, i) => {
        const sx = rightX + (i % 2) * colW
        const sy = afterSnsY + Math.floor(i / 2) * (rowH + H * 0.006)
        this.canvas.add(new fabric.Circle({
          left: sx, top: sy + (rowH - dotR * 2) / 2,
          radius: dotR, fill: s.color,
          selectable: false, evented: false,
        }))
        this.canvas.add(new fabric.Text(s.value, {
          left: sx + dotR * 2 + W * 0.007, top: sy + (rowH - sFontSize) / 2,
          fontSize: sFontSize, fontFamily, fill: '#374151',
          selectable: false, evented: false,
        }))
      })
      afterStatusY = afterSnsY + Math.ceil(statusEntries.length / 2) * (rowH + H * 0.006) + H * 0.015
    }

    // ── OK/NG（グリッド） ──
    const visibleItems = interactions.filter(item => item.mark !== '-')
    if (visibleItems.length > 0) {
      const bFontSize = W * 0.010
      const bH = bFontSize + H * 0.016
      const cols = 3
      const bW = (rightW - (cols - 1) * W * 0.006) / cols

      visibleItems.slice(0, 6).forEach((item, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        const bx = rightX + col * (bW + W * 0.006)
        const by = afterStatusY + row * (bH + H * 0.006)
        const label = item.isCustom
          ? item.label
          : (this.t?.okNgDefaults?.[item.label as keyof typeof this.t.okNgDefaults] ?? item.label)
        const isOk = item.mark === 'OK' || item.mark === '○'
        this.canvas.add(new fabric.Rect({
          left: bx, top: by, width: bW, height: bH,
          fill: isOk ? 'rgba(220,252,231,0.9)' : 'rgba(254,226,226,0.9)',
          rx: W * 0.004, ry: W * 0.004,
          selectable: false, evented: false,
        }))
        this.canvas.add(new fabric.Text(String(label ?? ''), {
          left: bx + W * 0.006, top: by + (bH - bFontSize) / 2,
          fontSize: bFontSize, fontFamily,
          fill: isOk ? '#15803d' : '#b91c1c',
          selectable: false, evented: false,
        }))
      })
    }
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