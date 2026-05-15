'use client';

export default function PostTimeline({ t }: { t: any }) {
  return (
    <div className="w-full max-w-screen-md mx-auto mt-4 mb-4">
      <div className="border border-gray-200 rounded-xl bg-gray-50 px-5 py-3 text-sm text-gray-600 shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <span className="text-xs text-gray-500">
          {t.searchWith}
        </span>
        <a
          href="https://twitter.com/hashtag/VRChat%E8%87%AA%E5%B7%B1%E7%B4%B9%E4%BB%8B%E3%82%AB%E3%83%BC%E3%83%89"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-sky-500 hover:text-sky-700 transition-colors whitespace-nowrap"
        >
          {t.seePostsOnX} #VRChat自己紹介カード →
        </a>
      </div>
    </div>
  );
}
