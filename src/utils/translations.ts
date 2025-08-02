// utils/translations.ts
export const translations = {
  ja: {
    // General
    title: 'VRChat自己紹介カードメーカー',
    contact: '質問・要望・コメントなどは',
    support: 'このツールが役に立ったら、コーヒー代のサポートをお願いします！☕',
    supportButton: 'サポートする',
    supportLink: 'https://qr.paypay.ne.jp/p2p01_A7rB7I6eo1bUMSzY',
    save: '💾 保存',
    share: 'Xでシェア',
    done: '完了',
    cancel: 'キャンセル',
    close: '閉じる',
    delete: '削除',
    requests: '要望',
    seePostsOnX: 'Xで投稿一覧を見る → ',
    searchWith: 'で検索すると、他の人の投稿が見られます。',
    
    // Onboarding
    howToMakeCard: '🎉 自己紹介カードの作り方',
    step1: 'カードデザインを決定',
    step2: '各項目を入力',
    step3: '画像を保存してXに投稿！',

    // Card Settings
    cardDesign: 'カードデザイン',
    fontSettings: 'フォントの設定',
    uzuraFont: 'うずらフォント',
    kawaiiFont: 'kawaii手書き文字',
    maruminyaFont: 'マルミーニャM',

    // Background Settings
    backgroundSettings: '背景の設定',
    solidColorBg: '単色背景',
    gradientBg: 'グラデーション背景',
    handwrittenBg: '手書きカード版背景',
    handwrittenBgNote: '※背景画像はヒツジ電機さんの公開バージョンとは異なりますが、似た背景を使用しています。',
    originalVersionLink: '元のバージョンもぜひご覧ください →',
    imageBg: '画像背景',

    // Speech Bubble
    speechBubble: '吹き出し',
    showSpeechBubble: '吹き出しを表示する',

    // Profile Section
    profileInfo: 'プロフィール情報',
    profileImage: 'プロフィール画像',
    name: '名前',
    gender: '性別（4文字まで）',

    // Environment & Languages Section
    envAndLang: '使用環境・言語',
    environment: '使用環境',
    languages: '使用言語',
    otherLanguages: 'その他の言語（カンマ区切り）',
    japanese: '日本語',
    english: 'English',
    korean: 'Korean',

    // Mic Section
    micOnRate: 'マイクON率',

    // SNS Section
    snsContact: 'SNS・コンタクト情報',
    snsInfo: 'SNS情報',
    xFormerTwitter: 'X（旧Twitter）',

    // Interaction Section
    howToInteract: '関わり方',
    statusDescription: 'ステータスの説明',
    statusBlue: '青ステータス',
    statusGreen: '緑ステータス',
    statusYellow: '黄ステータス',
    statusRed: '赤ステータス',
    friendRequestPolicy: 'フレンド申請ポリシー',
    frPolicyAnyone: 'だれでもOK',
    frPolicyAfterGettingToKnow: '仲良くなってから許可',
    frPolicyIfInterested: '気になったら許可',
    frPolicyMutualsOnX: 'Twitter相互は申請OK',
    frPolicyNo: '送らないでください',

    // OK/NG Section
    okNg: 'OKなこと・NGなこと',
    customItem: 'カスタム項目',
    addCustomItem: '+ カスタム項目を追加',
    okNgDefaults: {
      touch: '触る',
      closeRange: '近距離',
      romantic: 'お砂糖',
      weapons: '武器',
      abuseViolence: '暴言/暴力',
      dirtyJokes: '下ネタ',
    },

    // About Me & Gallery Section
    aboutMeAndImages: '自己紹介・画像',
    aboutMeText: '自己紹介テキスト',
    galleryImages: 'ギャラリー画像（３枚まで）',
    showGallery: 'ギャラリーを表示する（自己紹介エリアが小さくなります）',
    galleryImage: 'ギャラリー画像',

    // Misc UI
    adSpace: 'ⓘ 広告スペース or サポートリンクなど',
    enlargedCardPreview: '拡大カードプレビュー',
    contactTo: '@yota3dへ連絡',
    left: 'まで！',
    chooseFile: 'ファイルを選択',
    noFileChosen: '選択されていません',
    
    // Save/Share Modal
    pressAndHoldToSave: '画像を長押しで保存して、投稿時に添付してください📎',
    openPostScreenOnX: 'Xで投稿画面を開く →',
    pressAndHoldToAdd: '下の画像を長押しして「写真に追加」してください。',
    tweetText: '自己紹介カードを作りました！\n#VRChat自己紹介カード\n#VRChat自己紹介カードメーカー',
    
    // Post Timeline
    postTimelineCredit: '本ツールは、ヒツジ電機さんの自己紹介カードを参考に制作していますが、背景画像についてはオリジナル版とは異なる素材を使用しています。',
    postTimelineDisclaimer: 'デザイン・コンセプトのもととなったのはヒツジ電機さんですが、ヒツジ電機さんご本人は本ツールの制作には関与しておらず、別個のプロジェクトです（許諾は頂いています）。',

    // Canvas
    canvasGender: '性別',
    canvasEnvironment: '環境',
    canvasLanguages: '言語',
    canvasMicOnRate: 'マイクON率',
    canvasStatus: 'ステータス',
    canvasFriendRequest: 'フレンド申請',
    canvasAboutMe: '自己紹介',
    canvasSubtitleName: 'name',
    canvasSubtitleGender: 'gender',
    canvasSubtitleEnvironment: 'env',
    canvasSubtitleLanguages: 'languages spoken',
    canvasSubtitleMicUsage: 'microphone usage',
    canvasSubtitleStatuses: 'status description',
    canvasSubtitleFriendRequest: 'friend request policy',
    canvasSubtitleBoundaries: 'my boundaries',
    canvasSubtitleIntroduction: 'about me',
    canvasMakerCredit: 'VRChat自己紹介カードメーカー by @yota3d',
    canvasHeaderExplanation: 'Create your own VRChat profile card easily!',
  },
  en: {
    // General
    title: 'VRChatCardMaker',
    contact: 'For questions, requests, or comments,',
    support: 'If you find this tool helpful, please consider buying me a coffee! ☕',
    supportButton: 'Support Me',
    supportLink: 'https://ko-fi.com/yota3d',
    save: '💾 Save',
    share: 'Share on X',
    done: 'Done',
    cancel: 'Cancel',
    close: 'Close',
    delete: 'Delete',
    requests: 'Requests',
    seePostsOnX: 'See posts on X → ',
    searchWith: 'to see other people\'s posts.',

    // Onboarding
    howToMakeCard: '🎉 How to make a profile card',
    step1: 'Decide on a card design',
    step2: 'Fill in each item',
    step3: 'Save the image and post it on X!',

    // Card Settings
    cardDesign: 'Card Design',
    fontSettings: 'Font Settings',
    uzuraFont: 'Uzura Font',
    kawaiiFont: 'Kawaii Handwriting',
    maruminyaFont: 'Maruminya M',

    // Background Settings
    backgroundSettings: 'Background Settings',
    solidColorBg: 'Solid Color Background',
    gradientBg: 'Gradient Background',
    handwrittenBg: 'Hand-drawn Card Background',
    handwrittenBgNote: '*The background image is different from the public version by Hitsuji Denki, but a similar one is used.',
    originalVersionLink: 'Please also see the original version →',
    imageBg: 'Image Background',

    // Speech Bubble
    speechBubble: 'Speech Bubble',
    showSpeechBubble: 'Show Speech Bubble',

    // Profile Section
    profileInfo: 'Profile Information',
    profileImage: 'Profile Image',
    name: 'Name',
    gender: 'Gender (up to 4 chars)',

    // Environment & Languages Section
    envAndLang: 'Environment & Languages',
    environment: 'Environment',
    languages: 'Languages',
    otherLanguages: 'Other languages (comma separated)',
    japanese: 'Japanese',
    english: 'English',
    korean: 'Korean',

    // Mic Section
    micOnRate: 'Mic ON Rate',

    // SNS Section
    snsContact: 'SNS & Contact Info',
    snsInfo: 'SNS Info',
    xFormerTwitter: 'X (formerly Twitter)',

    // Interaction Section
    howToInteract: 'How to Interact',
    statusDescription: 'Status Description',
    statusBlue: 'Blue Status',
    statusGreen: 'Green Status',
    statusYellow: 'Yellow Status',
    statusRed: 'Red Status',
    friendRequestPolicy: 'Friend Request Policy',
    frPolicyAnyone: 'Anyone is welcome',
    frPolicyAfterGettingToKnow: 'Accept after getting to know',
    frPolicyIfInterested: 'Accept if interested',
    frPolicyMutualsOnX: 'Mutuals on X are welcome',
    frPolicyNo: 'Please do not send',

    // OK/NG Section
    okNg: 'OK & NG',
    customItem: 'Custom Item',
    addCustomItem: '+ Add Custom Item',
    okNgDefaults: {
      touch: 'Touching',
      closeRange: 'CloseDist',
      romantic: 'Romantic',
      weapons: 'Weapons',
      abuseViolence: 'Violence',
      dirtyJokes: 'DirtyJokes',
    },

    // About Me & Gallery Section
    aboutMeAndImages: 'About Me & Images',
    aboutMeText: 'About Me Text',
    galleryImages: 'Gallery Images (up to 3)',
    showGallery: 'Show Gallery (About Me area will be smaller)',
    galleryImage: 'Gallery Image',

    // Misc UI
    adSpace: 'ⓘ Ad space or support links, etc.',
    enlargedCardPreview: 'Enlarged card preview',
    contactTo: 'Contact @yota3d',
    left: '',
    chooseFile: 'Choose File',
    noFileChosen: 'No file chosen',

    // Save/Share Modal
    pressAndHoldToSave: 'Press and hold the image to save, then attach it to your post 📎',
    openPostScreenOnX: 'Open post screen on X →',
    pressAndHoldToAdd: 'Press and hold the image below and "Add to Photos".',
    tweetText: 'I made my profile card!\n#MyVRChatCard\n#VRChatCardMaker',

    // Post Timeline
    postTimelineCredit: 'This tool was created with reference to Hitsuji Denki\'s profile card, but the background image uses different materials from the original version.',
    postTimelineDisclaimer: 'The original design and concept are by Hitsuji Denki, but Hitsuji Denki themselves are not involved in the production of this tool; it is a separate project (permission has been granted).',
    
    // Canvas
    canvasGender: 'Pron.',
    canvasEnvironment: 'Env',
    canvasLanguages: 'Languages',
    canvasMicOnRate: 'Mic Usage Rate',
    canvasStatus: 'Statues',
    canvasFriendRequest: 'Friend Request',
    canvasAboutMe: 'About Me',
    canvasSubtitleName: 'on vrchat',
    canvasSubtitleGender: 'gender',
    canvasSubtitleEnvironment: 'env',
    canvasSubtitleLanguages: 'languages spoken',
    canvasSubtitleMicUsage: 'microphone usage',
    canvasSubtitleStatuses: 'status description',
    canvasSubtitleFriendRequest: 'friend request policy',
    canvasSubtitleBoundaries: 'my boundaries',
    canvasSubtitleIntroduction: 'about me',
    canvasMakerCredit: 'VRChatCardMaker by @yota3d',
    canvasHeaderExplanation: 'Create your own VRChat profile card easily!',
  },
};