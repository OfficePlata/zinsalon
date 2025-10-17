// =================================================================
// 初期設定
// =================================================================
// TODO: ステップ2でデプロイしたGASウェブアプリのURLをここに設定してください
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbw3EC1QzymI_4DaA8orwKIlf9_sjEV6Q-_pQONgcjifnL0KFhQRdc21ZPmPXj7mp8Gj7A/exec';

// =================================================================
// メイン処理 (ページの読み込み完了時に実行)
// =================================================================
window.addEventListener('load', async () => {
  try {
    // 1. LIFFの初期化
    await liff.init({ liffId: "1657635807-1GX23pBJ" });

    // 2. LINEプロフィールを取得
    const profile = await liff.getProfile();
    
    // 3. GAS APIにコンテンツを問い合わせ
    const apiResponse = await fetch(`${GAS_API_URL}?userId=${profile.userId}`);
    if (!apiResponse.ok) {
      throw new Error('APIサーバーからの応答がありません。');
    }
    const data = await apiResponse.json();

    if (!data.success) {
      throw new Error(data.message || 'コンテンツの取得に失敗しました。');
    }

    // 4. 取得したデータでページを更新
    updatePage(profile, data.rank, data.contents);
    
  } catch (error) {
    console.error(error);
    displayError('エラーが発生しました。時間をおいて再度お試しください。');
  } finally {
    // 5. ローディング画面を非表示にする
    hideLoading();
  }
});

// =================================================================
// ヘルパー関数: ページ表示の更新
// =================================================================
function updatePage(profile, rank, contents) {
  // ユーザー情報を表示
  document.getElementById('user-picture').src = profile.pictureUrl || 'https://placehold.co/80x80/EFEFEF/333333?text=User';
  document.getElementById('user-name').textContent = profile.displayName || 'ゲスト';
  document.getElementById('user-rank').textContent = rank || '---';

  // コンテンツ一覧を表示
  const contentList = document.getElementById('content-list');
  contentList.innerHTML = ''; // 一旦クリア

  if (contents && contents.length > 0) {
    contents.forEach(item => {
      const card = createContentCard(item);
      contentList.appendChild(card);
    });
  } else {
    contentList.innerHTML = '<p>現在閲覧できるコンテンツはありません。</p>';
  }
}

// =================================================================
// ヘルパー関数: コンテンツカードのHTML要素を作成
// =================================================================
function createContentCard(item) {
  const card = document.createElement('a');
  card.href = item.url;
  card.target = '_blank'; // リンクを新しいタブで開く
  card.className = 'content-card';

  const typeIcons = {
    '動画': '🎥',
    '資料 (PDF)': '📄',
    'テキスト/Wiki': '✍️',
    'テンプレート/資料': '📝',
    'サービス': '🤝',
    'default': '🔗'
  };

  // 複数のTypeに対応
  const firstType = Array.isArray(item.type) ? item.type[0] : item.type;
  const icon = typeIcons[firstType] || typeIcons['default'];
  const typeText = Array.isArray(item.type) ? item.type.join(', ') : item.type;

  card.innerHTML = `
    <div class="content-icon">${icon}</div>
    <div class="content-details">
      <h3>${item.title || '無題のコンテンツ'}</h3>
      <p>種類: ${typeText || '---'}</p>
    </div>
  `;
  return card;
}

// =================================================================
// ヘルパー関数: ローディング画面を非表示にし、メインコンテンツを表示
// =================================================================
function hideLoading() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('main-content').style.display = 'block';
}

// =================================================================
// ヘルパー関数: エラーメッセージを表示
// =================================================================
function displayError(message) {
  const errorDisplay = document.getElementById('error-display');
  errorDisplay.textContent = message;
  errorDisplay.style.display = 'block';
}
