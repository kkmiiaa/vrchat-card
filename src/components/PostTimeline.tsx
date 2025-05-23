'use client';

export default function PostTimeline() {
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
          で検索すると、他の人の投稿が見られます。
        </p>
        <a
          href="https://twitter.com/hashtag/VRChat%E8%87%AA%E5%B7%B1%E7%B4%B9%E4%BB%8B%E3%82%AB%E3%83%BC%E3%83%89"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-blue-600 hover:underline text-xs font-medium"
        >
          Xで投稿一覧を見る →
        </a>
      </div>
      <div className="border border-gray-300 rounded-xl bg-gray-50 p-4 text-sm text-gray-700 text-left shadow-sm mt-4">
        <p className="text-xs text-gray-600 mb-2 leading-snug">
          本ツールは、ヒツジ電機さんの自己紹介カードを参考に制作していますが、
          背景画像についてはオリジナル版とは異なる素材を使用しています。
        </p>
        <p className="text-xs text-gray-600 leading-snug">
          デザイン・コンセプトのもととなったのはヒツジ電機さんですが、
          ヒツジ電機さんご本人は本ツールの制作には関与しておらず、別個のプロジェクトです（許諾は頂いています）。
        </p>
      </div>
    </div>
  );
}
