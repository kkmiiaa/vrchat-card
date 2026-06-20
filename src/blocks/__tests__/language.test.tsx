import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { languageComponent } from '../language'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'
import { translations } from '@/utils/translations'

const t = translations.ja

// language.FormItem uses useState internally
function LanguageForm(props: Parameters<typeof languageComponent.FormItem>[0]) {
  return <>{languageComponent.FormItem!(props)}</>
}

describe('language', () => {
  it('1. defaultValue は { preset: [], custom: [] }', () => {
    expect(languageComponent.defaultValue).toEqual({ preset: [], custom: [] })
  })

  it('2. global === true', () => {
    expect(languageComponent.global).toBe(true)
  })

  it('3. 固定の言語リストが表示される', () => {
    render(
      <LanguageForm
        value={{ preset: [], custom: [] }}
        onChange={() => {}}
        t={t}
      />
    )
    expect(screen.getByText('日本語')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
  })

  it('4. blockConfig.allowedPresets で指定した言語のみ表示される', () => {
    render(
      <LanguageForm
        value={{ preset: [], custom: [] }}
        onChange={() => {}}
        t={t}
        blockConfig={{ allowedPresets: ['日本語', 'English'] }}
      />
    )
    expect(screen.getByText('日本語')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.queryByText('한국어')).toBeNull()
    expect(screen.queryByText('中文')).toBeNull()
  })

  it('5. プリセット言語を選択すると preset 配列が更新される', () => {
    const onChange = vi.fn()
    render(
      <LanguageForm
        value={{ preset: [], custom: [] }}
        onChange={onChange}
        t={t}
      />
    )
    fireEvent.click(screen.getByText('日本語'))
    expect(onChange).toHaveBeenCalledWith({ preset: ['日本語'], custom: [] })
  })

  it('11. CardItem: 各言語が描画される', () => {
    render(
      languageComponent.CardItem!({
        value: { preset: ['日本語', 'English'], custom: ['手話'] },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    expect(screen.getByText('日本語')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('手話')).toBeInTheDocument()
  })

  it('12. CardItem: 空値はエラーなく描画される', () => {
    expect(() =>
      render(
        languageComponent.CardItem!({
          value: { preset: [], custom: [] },
          ctx: DEFAULT_CARD_RENDER_CONTEXT,
        })
      )
    ).not.toThrow()
  })
})
