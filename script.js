// =================================================================
// 初期設定
// =================================================================
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbw3EC1QzymI_4DaA8orwKIlf9_sjEV6Q-_pQONgcjifnL0KFhQRdc21ZPmPXj7mp8Gj7A/exec';
// ▼▼▼ START: 修正箇所 ▼▼▼
// TODO: ステップ1で取得したLarkのWebhook URLをここに設定してください
const LARK_WEBHOOK_URL = 'https://bjplm1vnnisz.jp.larksuite.com/base/automation/webhook/event/KqSvac83EwV3x3hw1vJjL6NDpzg';
// ▲▲▲ END: 修正箇所 ▲▲▲
let userProfile = null; // ユーザープロフィールをグローバルに保持

// =================================================================
// メイン処理 (ページの読み込み完了時に実行)
// =================================================================
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
    document.getElementById('consultation-form').addEventListener('submit', handleConsultationSubmit);
    
  } catch (error) {
    console.error(error);
    displayError('エラーが発生しました。時間をおいて再度お試しください。');
  } finally {
    hideLoading();
  }
});

// =================================================================
// ヘルパー関数: 相談フォームの送信処理
// =================================================================
async function handleConsultationSubmit(event) {
  event.preventDefault();

  const submitButton = document.getElementById('submit-button');
  const statusElement = document.getElementById('submit-status');
  const textArea = document.getElementById('consultation-text');
  const consultationText = textArea.value.trim();

  if (!consultationText) {
    statusElement.textContent = '相談内容を入力してください。';
    statusElement.style.color = '#e74c3c';
    return;
  }
  if (!userProfile) {
    statusElement.textContent = 'ユーザー情報の取得に失敗しました。ページを再読み込みしてください。';
    statusElement.style.color = '#e74c3c';
    return;
  }

  submitButton.disabled = true;
  statusElement.textContent = '送信中...';
  statusElement.style.color = '#3498db';

  try {
    // ▼▼▼ START: 修正箇所 ▼▼▼
    // 送信先をLark Webhook URLに変更し、送信するデータ形式をLarkに合わせます。
    const response = await fetch(LARK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Lark Baseのフィールド名と完全に一致させる必要があります
        "相談日": new Date().toISOString(),
        "LINEユーザーID": userProfile.userId,
        "LINE表示名": userProfile.displayName,
        "相談内容": consultationText,
        "対応ステータス": "未対応"
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Larkへの送信に失敗しました。');
    }
    // ▲▲▲ END: 修正箇所 ▲▲▲
    
    textArea.value = '';
    statusElement.textContent = 'ご相談ありがとうございます。内容を受け付けました。';
    statusElement.style.color = '#2ecc71';

  } catch (error) {
    console.error('Error submitting consultation:', error);
    statusElement.textContent = '送信中にエラーが発生しました。';
    statusElement.style.color = '#e74c3c';
  } finally {
    submitButton.disabled = false;
  }
}

// =================================================================
// ヘルパー関数: ページ表示の更新 (変更なし)
// =================================================================
function updatePage(profile, rank, contents) {
  document.getElementById('user-picture').src = profile.pictureUrl || 'https://placehold.co/80x80/EFEFEF/333333?text=User';
  document.getElementById('user-name').textContent = profile.displayName || 'ゲスト';
  document.getElementById('user-rank').textContent = rank || '---';
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

// =================================================================
// ヘルパー関数: コンテンツカードのHTML要素を作成 (変更なし)
// =================================================================
function createContentCard(item) {
  const card = document.createElement('a');
  card.href = item.url;
  card.target = '_blank';
  card.className = 'content-card';
  const typeIcons = {'動画': '🎥', '資料 (PDF)': '📄', 'テキスト/Wiki': '✍️', 'テンプレート/資料': '📝', 'サービス': '🤝', 'default': '🔗'};
  const firstType = Array.isArray(item.type) ? item.type[0] : item.type;
  const icon = typeIcons[firstType] || typeIcons['default'];
  const typeText = Array.isArray(item.type) ? item.type.join(', ') : item.type;
  card.innerHTML = `<div class="content-icon">${icon}</div><div class="content-details"><h3>${item.title || '無題のコンテンツ'}</h3><p>種類: ${typeText || '---'}</p></div>`;
  return card;
}

// =================================================================
// ヘルパー関数: UI関連 (変更なし)
// =================================================================
function hideLoading() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('main-content').style.display = 'block';
}
function displayError(message) {
  const errorDisplay = document.getElementById('error-display');
  errorDisplay.textContent = message;
  errorDisplay.style.display = 'block';
}

