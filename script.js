/**
 * =================================================================
 * 初期設定
 * =================================================================
 */
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbwEZoEdySFyZi2Y--26uWzpqZdU9eUzj521TNCxcTJPZqTAO5eCte1lcLQ9RzLCrpmyJQ/exec';
// ご指定のLarkフォーム共有URL
const LARK_FORM_URL = 'https://bjplm1vnnisz.jp.larksuite.com/share/base/form/shrjpQCxuI9Sa1Q0QC4Y2xgn8Fb'; 
let userProfile = null;

/**
 * =================================================================
 * メイン処理 (ページの読み込み完了時に実行)
 * =================================================================
 */
window.addEventListener('load', async () => {
  try {
    await liff.init({ liffId: "1657635807-1GX23pBJ" });
    const profile = await liff.getProfile();
    userProfile = profile;
    
    const apiResponse = await fetch(`${GAS_API_URL}?userId=${profile.userId}`);
    if (!apiResponse.ok) throw new Error('APIサーバーからの応答がありません。');
    
    const data = await apiResponse.json();
    if (!data.success) throw new Error(data.message || 'コンテンツの取得に失敗しました。');

    updatePage(profile, data.rank, data.contents);
    // 「相談する」ボタンにイベントリスナーを設定
    document.getElementById('submit-button').addEventListener('click', openLarkForm);
    
  } catch (error) {
    console.error(error);
    displayError('エラーが発生しました。時間をおいて再度お試しください。');
  } finally {
    hideLoading();
  }
});

/**
 * =================================================================
 * Larkフォームを事前入力状態で開く処理
 * =================================================================
 */
function openLarkForm() {
    if (!userProfile) {
        alert('ユーザー情報が取得できませんでした。ページを再読み込みしてください。');
        return;
    }
    
    const textArea = document.getElementById('consultation-text');
    const consultationText = textArea.value.trim();

    // LarkフォームのURLに、LINEの情報をパラメータとして付与する
    // TODO: ご自身のLarkフォームのフィールド名に合わせて、以下のパラメータ名を変更してください
    // 例: フィールド名が「お名前」ならパラメータ名は「prefill_お名前」
    const params = new URLSearchParams({
        'prefill_LINEユーザーID': userProfile.userId,
        'prefill_LINE表示名': userProfile.displayName,
        'prefill_相談内容': consultationText
    });

    const formUrlWithParams = `${LARK_FORM_URL}?${params.toString()}`;

    // LIFFの機能を使って外部リンクを開く
    liff.openWindow({
        url: formUrlWithParams,
        external: true // LINE内ブラウザではなく、標準のブラウザで開く
    });
}

/**
 * =================================================================
 * ヘルパー関数: ページ表示の更新
 * =================================================================
 */
function updatePage(profile, rank, contents) {
  // ユーザー情報を表示
  document.getElementById('user-picture').src = profile.pictureUrl || 'https://placehold.co/80x80/EFEFEF/333333?text=User';
  document.getElementById('user-name').textContent = profile.displayName || 'ゲスト';
  document.getElementById('user-rank').textContent = rank || '---';
  
  // フォームのセクションを再描画
  const formSection = document.getElementById('consultation-form');
  formSection.innerHTML = `
    <h2>悩み・相談</h2>
    <p>事業やビジネス、自己実現に関する悩みなど、お気軽にご相談ください。</p>
    <textarea id="consultation-text" placeholder="こちらに相談内容を入力してください..."></textarea>
    <button id="submit-button" class="submit-button">相談フォームを開く</button>
  `;

  // コンテンツ一覧を表示
  const contentList = document.getElementById('content-list');
  contentList.innerHTML = '';
  if (contents && contents.length > 0) {
    contents.forEach(item => {
      const card = createContentCard(item);
      contentList.appendChild(card);
    });
  } else {
    contentList.innerHTML = '<p>現在閲覧できるコンテンツはありません。</p>';
  }
}

/**
 * =================================================================
 * ヘルパー関数: コンテンツカードのHTML要素を作成
 * =================================================================
 */
function createContentCard(item) {
  const card = document.createElement('a');
  card.href = item.url;
  card.target = '_blank';
  card.className = 'content-card';

  const typeIcons = {
    '動画': '🎥',
    '資料 (PDF)': '📄',
    'テキスト/Wiki': '✍️',
    'テンプレート/資料': '📝',
    'サービス': '🤝',
    'default': '🔗'
  };

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

/**
 * =================================================================
 * ヘルパー関数: ローディング画面の非表示
 * =================================================================
 */
function hideLoading() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('main-content').style.display = 'block';
}

/**
 * =================================================================
 * ヘルパー関数: エラーメッセージの表示
 * =================================================================
 */
function displayError(message) {
  const errorDisplay = document.getElementById('error-display');
  errorDisplay.textContent = message;
  errorDisplay.style.display = 'block';
}

