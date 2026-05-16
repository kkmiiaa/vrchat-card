import Link from 'next/link'
import { type Metadata } from 'next'
import HeaderAuth from '@/components/HeaderAuth'

export const metadata: Metadata = {
  title: 'プライバシーポリシー — vaacard',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-sky-100 h-14 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md">
        <Link href="/" className="text-xl font-black tracking-tight text-[#00AADB]">vaacard</Link>
        <HeaderAuth />
      </header>

      <main className="max-w-2xl mx-auto w-full px-6 py-12 flex-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">プライバシーポリシー</h1>
        <p className="text-xs text-gray-400 mb-10">最終更新日：2026年5月15日</p>

        <div className="space-y-8 text-sm text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">1. 取得する情報</h2>
            <p className="mb-2">本サービスでは、以下の情報を取得します。</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>メールアドレス（メール登録の場合）</li>
              <li>外部サービス（Google / Discord）から提供されるアカウント情報（メールアドレス、アカウントID等）</li>
              <li>ユーザーが入力した表示名・自己紹介文・リンク情報</li>
              <li>ユーザーがアップロードした画像</li>
              <li>作成した自己紹介カードの内容</li>
              <li>アクセスログ（IPアドレス、ブラウザ情報等）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">2. 情報の利用目的</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>本サービスの提供・運営</li>
              <li>ユーザーの識別・認証</li>
              <li>サービスの改善・新機能の開発</li>
              <li>不正利用の検知・防止</li>
              <li>お問い合わせへの対応</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">3. 第三者への提供</h2>
            <p>取得した情報は、以下の場合を除き第三者に提供しません。</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500 mt-2">
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づく場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">4. 業務委託先（サブプロセッサ）</h2>
            <p className="mb-2">本サービスは以下のサービスを利用しており、それぞれのプライバシーポリシーに従って情報が処理されます。</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Supabase, Inc.（データベース・認証・ストレージ）</li>
              <li>Google LLC（OAuth認証・アクセス解析）</li>
              <li>Discord Inc.（OAuth認証）</li>
              <li>Vercel Inc.（ホスティング）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">5. Cookieの利用</h2>
            <p>本サービスは、認証状態の維持のためにCookie（セッションCookie）を使用します。ブラウザの設定によりCookieを無効にすることができますが、その場合一部の機能が利用できなくなります。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">6. 情報の保管・削除</h2>
            <p>取得した情報はアカウントが存在する期間保管します。アカウントを削除することで、関連する個人情報の削除を申請できます。削除をご希望の場合はお問い合わせください。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">7. 公開情報について</h2>
            <p>プロフィールページおよび「公開」に設定されたカードは、インターネット上に公開されます。公開範囲はユーザー自身が設定・管理できます。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">8. お問い合わせ</h2>
            <p>個人情報の取り扱いに関するお問い合わせは、本サービスのお問い合わせ窓口までご連絡ください。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">9. ポリシーの変更</h2>
            <p>本ポリシーは必要に応じて改定する場合があります。重要な変更がある場合はサービス上でお知らせします。</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-sky-100 flex gap-6 text-xs text-gray-400">
          <Link href="/terms" className="hover:text-[#00AADB] transition-colors">利用規約</Link>
          <Link href="/" className="hover:text-[#00AADB] transition-colors">トップへ戻る</Link>
        </div>
      </main>
    </div>
  )
}
