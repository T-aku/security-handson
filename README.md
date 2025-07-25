# 脆弱な保険商品管理システム

⚠️ **重要**: このアプリケーションは教育目的で作成されています。意図的にセキュリティ脆弱性が含まれているため、本番環境では絶対に使用しないでください。

## 概要

このアプリケーションは、社内のセキュリティ教育・研修用に作成された保険商品管理システムです。以下の脆弱性が意図的に含まれています：

- **SQLインジェクション** (バックエンド)
- **XSS (Cross-Site Scripting)** (フロントエンド)

## 技術スタック

- **フロントエンド**: Vue 3 + TypeScript + Vite
- **バックエンド**: Fastify + TypeScript
- **データベース**: SQLite3

## セットアップ手順

### 1. 依存関係のインストール

```bash
# バックエンドの依存関係をインストール
cd backend
npm install

# フロントエンドの依存関係をインストール
cd ../frontend
npm install
```

### 2. データベースの初期化

```bash
cd backend
npm run build
npm run init-db
```

### 3. アプリケーションの起動

**バックエンドサーバーの起動** (ターミナル1):
```bash
cd backend
npm run dev
```

**フロントエンドサーバーの起動** (ターミナル2):
```bash
cd frontend
npm run dev
```

アプリケーションは以下のURLでアクセスできます：
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:3001

## 脆弱性の詳細と攻撃例

### 1. SQLインジェクション脆弱性

**場所**: `backend/src/server.ts`

**脆弱な箇所**:
- 商品検索API (`/api/products`)
- 管理者ログインAPI (`/api/admin/login`)
- 商品詳細API (`/api/products/:id`)

**攻撃例**:

1. **商品検索での攻撃**:
   ```
   GET /api/products?search=' OR 1=1 --
   ```

2. **管理者ログインでの攻撃**:
   - ユーザー名: `admin' --`
   - パスワード: (任意)

3. **商品詳細での攻撃**:
   ```
   GET /api/products/1' UNION SELECT username,password,1,1 FROM users --
   ```

**修正方法**:
```typescript
// 悪い例 (現在のコード)
const query = `SELECT * FROM users WHERE username = '${username}'`;

// 良い例 (修正後)
const query = 'SELECT * FROM users WHERE username = ?';
db.get(query, [username], callback);
```

### 2. XSS脆弱性

**場所**: `frontend/src/views/`の各Vueコンポーネント

**脆弱な箇所**:
- 商品説明の表示 (`v-html="product.description"`)
- 検索結果の表示 (`v-html="searchQuery"`)
- ユーザーコメントの表示 (`v-html="comment.text"`)
- レビューの表示 (`v-html="review.text"`)

**攻撃例**:

1. **検索欄での攻撃**:
   ```html
   <script>alert('XSS Attack!')</script>
   ```

2. **コメント欄での攻撃**:
   ```html
   <img src="x" onerror="alert('XSS via Image')">
   ```

3. **レビュー欄での攻撃**:
   ```html
   <svg onload="alert('XSS via SVG')">
   ```

**修正方法**:
```vue
<!-- 悪い例 (現在のコード) -->
<div v-html="userInput"></div>

<!-- 良い例 (修正後) -->
<div>{{ userInput }}</div>
```

## 学習の進め方

### ステップ1: 脆弱性の確認
1. アプリケーションを起動
2. 上記の攻撃例を実際に試してみる
3. 脆弱性が存在することを確認

### ステップ2: 脆弱性の修正
1. SQLインジェクション対策の実装
2. XSS対策の実装
3. 修正後の動作確認

### ステップ3: セキュリティテスト
1. 修正後も攻撃が可能かテスト
2. 新たな攻撃手法を考えてテスト
3. セキュリティが向上したことを確認

## 参考資料

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [SQLインジェクション対策](https://www.ipa.go.jp/security/vuln/websecurity.html)
- [XSS対策](https://jpcert.cc/java-rules/00-rules/MSC61-J.html)

## 注意事項

- このアプリケーションは教育目的のみで使用してください
- 実際のWebアプリケーション開発では、必ずセキュリティ対策を実装してください
- 本番環境でこのコードを使用することは絶対に避けてください