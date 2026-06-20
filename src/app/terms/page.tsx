import Link from 'next/link'
import { type Metadata } from 'next'
import HeaderAuth from '@/components/HeaderAuth'

export const metadata: Metadata = {
  title: '利用規約 — vaacard',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-sky-100 shadow-sm h-14 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md">
        <Link href="/" className="text-xl font-black tracking-tight text-[#00AADB]">vaacard</Link>
        <HeaderAuth />
      </header>

      <main className="max-w-2xl mx-auto w-full px-6 py-12 flex-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">利用規約</h1>
        <p className="text-xs text-gray-400 mb-10">最終更新日：2026年5月15日</p>

        <div className="space-y-8 text-sm text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">第1条（適用）</h2>
            <p>本規約は、vaacard（以下「本サービス」）の利用に関する条件を定めるものです。ユーザーは本サービスを利用することにより、本規約に同意したものとみなします。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">第2条（利用登録）</h2>
            <p>本サービスは、Google または Discord アカウント、もしくはメールアドレスとパスワードによる登録が可能です。登録情報は正確かつ最新の状態に保つものとします。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">第3条（禁止事項）</h2>
            <p className="mb-2">ユーザーは以下の行為を行ってはなりません。</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>法令または公序良俗に違反する行為</li>
              <li>他のユーザーまたは第三者の権利・利益を侵害する行為</li>
              <li>他者を誹謗中傷する内容の投稿</li>
              <li>虚偽の情報を掲載する行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>本サービスを商業目的で無断利用する行為</li>
              <li>その他、運営者が不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">第4条（コンテンツの取り扱い）</h2>
            <p>ユーザーが投稿・作成したコンテンツ（プロフィール情報・自己紹介カード・画像等）の著作権はユーザーに帰属します。ただし、本サービスの運営・改善のために必要な範囲で利用する権利を運営者に許諾するものとします。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">第5条（サービスの変更・停止）</h2>
            <p>運営者は、ユーザーへの事前通知なしに本サービスの内容を変更、または提供を停止する場合があります。これによってユーザーに生じた損害について、運営者は責任を負いません。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">第6条（免責事項）</h2>
            <p>本サービスは現状有姿で提供されます。運営者は、本サービスの利用によってユーザーに生じた損害について、一切の責任を負いません。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">第7条（規約の変更）</h2>
            <p>運営者は、必要に応じて本規約を変更する場合があります。変更後の規約は本ページに掲載した時点で効力を生じます。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">第8条（準拠法・管轄）</h2>
            <p>本規約は日本法に準拠し、本サービスに関する紛争は、運営者の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-sky-100 flex gap-6 text-xs text-gray-400">
          <Link href="/privacy" className="hover:text-[#00AADB] transition-colors">プライバシーポリシー</Link>
          <Link href="/" className="hover:text-[#00AADB] transition-colors">トップへ戻る</Link>
        </div>
      </main>
    </div>
  )
}
