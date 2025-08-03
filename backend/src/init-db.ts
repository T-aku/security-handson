import * as sqlite3 from "sqlite3";
import * as path from "path";

const dbPath = path.join(__dirname, "../database.sqlite");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 保険商品テーブル作成
  db.run(`
    CREATE TABLE IF NOT EXISTS insurance_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price INTEGER NOT NULL,
      category TEXT NOT NULL
    )
  `);

  // ユーザーテーブル作成（管理者認証用）
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    )
  `);

  // サンプルデータ挿入
  const products = [
    ["生命保険プラン A", "生命保険です", 50000, "生命保険"],
    ["自動車保険プラン B", "自動車事故に対する補償", 30000, "自動車保険"],
    ["火災保険プラン C", "住宅火災に対する保険です", 25000, "火災保険"],
    ["医療保険プラン D", "病気やケガの治療費をカバー", 40000, "医療保険"],
    ["旅行保険プラン E", "海外旅行時の万が一に備えて", 15000, "旅行保険"],
  ];

  products.forEach((product) => {
    db.run(
      "INSERT INTO insurance_products (name, description, price, category) VALUES (?, ?, ?, ?)",
      product
    );
  });

  // 管理者ユーザー作成
  db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [
    "admin",
    "password123",
    "admin",
  ]);

  console.log("データベースの初期化が完了しました");
});

db.close();
