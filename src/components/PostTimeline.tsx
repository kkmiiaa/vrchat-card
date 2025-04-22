'use client';

export default function PostTimeline() {
  return (
    <div className="w-full max-w-screen-md mx-auto my-8 px-4 text-center">
      <h2 className="text-lg font-bold text-gray-800 mb-2">みんなの投稿を見る</h2>
      <p className="text-sm text-gray-600 mb-4">
        「#VRChat自己紹介カード」で検索すると、他の人の投稿をチェックできます！
      </p>
      <a
        href="https://twitter.com/hashtag/VRChat%E8%87%AA%E5%B7%B1%E7%B4%B9%E4%BB%8B%E3%82%AB%E3%83%BC%E3%83%89"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-black text-white rounded-full px-6 py-2 text-sm font-semibold hover:bg-blue-700 transition"
      >
        Xで投稿一覧を見る
      </a>
    </div>
  );
}
