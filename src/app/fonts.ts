// app/fonts.ts
import localFont from 'next/font/local'
import {
  Kosugi_Maru,
  Zen_Maru_Gothic,
  M_PLUS_Rounded_1c,
} from 'next/font/google'

export const RoundedMplus = M_PLUS_Rounded_1c({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rounded',
})

export const Kosugi = Kosugi_Maru({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-kosugi',
})

export const ZenMaru = Zen_Maru_Gothic({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-zenmaru',
})

export const Uzura = localFont({
  src: '../../public/fonts/uzura.woff2',
  display: 'swap',
  variable: '--font-uzura',
})

export const Kawaii = localFont({
  src: '../../public/fonts/KTEGAKI.woff2',
  display: 'swap',
  variable: '--font-kawaii',
})

export const MaruMinya = localFont({
  src: '../../public/fonts/x12y12pxMaruMinyaM.woff2',
  display: 'swap',
  variable: '--font-maruminya',
})
