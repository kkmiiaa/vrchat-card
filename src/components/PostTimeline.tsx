'use client';

const DEFAULT_HASHTAG = 'VRChat自己紹介カード'
const DEFAULT_HASHTAG_LABEL = '#VRChat自己紹介カード'

type Props = {
  t: { searchWith: string; seePostsOnX: string }
  /** テンプレート固有のハッシュタグ文字列（例: "#VRChat自己紹介カード #vaacard"） */
  tweetHashtags?: string
}

/** ハッシュタグ文字列から最初の #tag を抽出して Twitter 検索 URL を生成 */
function resolveHashtagLink(tweetHashtags?: string): { label: string; url: string } {
  if (!tweetHashtags) {
    return {
      label: DEFAULT_HASHTAG_LABEL,
      url: `https://twitter.com/hashtag/${encodeURIComponent(DEFAULT_HASHTAG)}`,
    }
  }
  const match = tweetHashtags.match(/#([\w　-鿿！-￯]+)/)
  if (!match) {
    return {
      label: DEFAULT_HASHTAG_LABEL,
      url: `https://twitter.com/hashtag/${encodeURIComponent(DEFAULT_HASHTAG)}`,
    }
  }
  const tag = match[1]
  return {
    label: `#${tag}`,
    url: `https://twitter.com/hashtag/${encodeURIComponent(tag)}`,
  }
}

export default function PostTimeline({ t, tweetHashtags }: Props) {
  const { label, url } = resolveHashtagLink(tweetHashtags)
  return (
    <div className="w-full max-w-screen-md mx-auto mt-4 mb-4">
      <div className="border border-gray-200 rounded-xl bg-gray-50 px-5 py-3 text-sm text-gray-600 shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <span className="text-xs text-gray-500">
          {t.searchWith}
        </span>
        <div className="flex items-center gap-1 text-xs whitespace-nowrap">
          <span className="text-gray-500">{t.seePostsOnX}</span>
          <span className="text-gray-400">→</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sky-500 hover:text-sky-700 transition-colors"
          >
            {label}
          </a>
        </div>
      </div>
    </div>
  );
}
