'use client';

export default function PostTimeline({ t }: { t: any }) {
  return (
    <div className="w-full max-w-screen-md mx-auto mt-4 mb-4">
      <div className="border border-gray-300 rounded-xl bg-gray-50 p-4 text-sm text-gray-700 text-center shadow-sm">
        <p className="text-xs text-gray-600 mb-2 leading-snug">
          <span className="hidden sm:inline">「</span>
          <a
          href="https://twitter.com/hashtag/VRChat%E8%87%AA%E5%B7%B1%E7%B4%B9%E4%BB%8B%E3%82%AB%E3%83%BC%E3%83%89"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-blue-600 hover:underline text-xs font-medium"
        > <strong className="text-gray-600">#VRChat自己紹介カード </strong></a>
          <span className="hidden sm:inline">」</span> 
          {t.searchWith}
        </p>
        <a
          href="https://twitter.com/hashtag/VRChat%E8%87%AA%E5%B7%B1%E7%B4%B9%E4%BB%8B%E3%82%AB%E3%83%BC%E3%83%89"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-blue-600 hover:underline text-xs font-medium"
        >
          {t.seePostsOnX}
        </a>
      </div>
      <div className="border border-gray-300 rounded-xl bg-gray-50 p-4 text-sm text-gray-700 text-left shadow-sm mt-4">
        <p className="text-xs text-gray-600 mb-2 leading-snug">
          {t.postTimelineCredit}
        </p>
        <p className="text-xs text-gray-600 leading-snug">
          {t.postTimelineDisclaimer}
        </p>
      </div>
    </div>
  );
}
