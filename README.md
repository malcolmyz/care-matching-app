# 介護マッチングプラットフォーム MVP

このプロジェクトは、介護提供者と依頼者のマッチングを行う、シンプルなマッチングプラットフォームのMVP（Minimum Viable Product）です。

## テックスタック

### フロントエンド
- HTML5
- CSS3
- Vanilla JavaScript

### バックエンド
- Node.js
- Express.js
- MongoDB
- JSON Web Token (JWT) 認証

### インフラ
- Docker / Docker Compose
- Nginx (フロントエンドのデプロイ)

## ディレクトリ構成

```
care-matching-app/
│
├── docker-compose.yml      # Dockerコンテナの設定
│
├── frontend/               # フロントエンドのファイル
│   ├── Dockerfile          # フロントエンドのDockerファイル
│   ├── index.html          # メインHTMLファイル
│   ├── style.css           # スタイルシート
│   └── js/                 # JavaScriptファイル
│       ├── main.js         # メインの機能実装
│       ├── auth.js         # 認証関連の機能
│       └── api.js          # APIとの通信処理
│
└── backend/                # バックエンドのファイル
    ├── Dockerfile          # バックエンドのDockerファイル
    ├── package.json        # 依存関係定義
    ├── server.js           # サーバー設定ファイル
    ├── models/             # データモデル
    │   ├── User.js         # ユーザーモデル
    │   └── Request.js      # リクエストモデル
    └── routes/             # APIルート
        ├── auth.js         # 認証関連のルート
        ├── users.js        # ユーザー関連のルート
        └── requests.js     # リクエスト関連のルート
```

## 開発環境構築方法

### 必要なもの
- Docker と Docker Compose
- Node.js (ローカル開発の場合)
- MongoDB (ローカル開発の場合)

### 環境構築手順

1. リポジトリをクローン
```bash
git clone <リポジトリURL>
cd care-matching-app
```

2. Docker Composeを使って全てのサービスを起動
```bash
docker-compose up -d
```

3. アプリケーションにアクセス
   - フロントエンド: http://localhost:8080
   - バックエンドAPI: http://localhost:3001

## 主な機能

1. **ユーザー管理**
   - ユーザー登録（メール、パスワード、名前、ユーザータイプのみ）
   - ログイン
   - プロフィール管理（サービス種類と地域のみ）

2. **マッチング機能**
   - 介護提供者一覧表示
   - 連絡先交換リクエスト（承認後にメールアドレス表示）

## API仕様

### 認証API
- POST /api/auth/register - 新規ユーザー登録
- POST /api/auth/login - ログイン

### ユーザーAPI
- GET /api/users - 提供者一覧取得
- GET /api/users/me - 自分のプロフィール取得
- PUT /api/users/me - 自分のプロフィール更新

### リクエストAPI
- POST /api/requests - リクエスト送信
- GET /api/requests - 自分宛のリクエスト取得
- PUT /api/requests/:id - リクエスト承認/拒否
