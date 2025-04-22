'use client';

import { useEffect, useRef } from 'react';

export default function PostTimeline() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scriptExists = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
    if (!scriptExists) {
      const script = document.createElement('script');
      script.setAttribute('src', 'https://platform.twitter.com/widgets.js');
      script.setAttribute('async', '');
      script.setAttribute('charset', 'utf-8');
      document.head.appendChild(script);
      script.onload = () => {
        window?.twttr?.widgets?.load(ref.current ?? undefined);
      };
    } else {
      window?.twttr?.widgets?.load(ref.current ?? undefined);
    }
  }, []);

  return (
    <div ref={ref} className="w-full max-w-screen-md mx-auto my-8 px-4">
      <h2 className="text-lg font-bold text-gray-800 text-center mb-4">
        #VRChat自己紹介カード の投稿例
      </h2>
      <a
        className="twitter-timeline"
        data-theme="light"
        data-chrome="noheader nofooter"
        data-tweet-limit="4"
        href="https://twitter.com/hashtag/VRChat自己紹介カード"
      >
        ロード中…
      </a>
    </div>
  );
}
