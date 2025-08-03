import Fastify from "fastify";
import cors from "@fastify/cors";
import * as sqlite3 from "sqlite3";
import * as path from "path";

const fastify = Fastify({ logger: true });

// CORS設定
fastify.register(cors, {
  origin: true,
  credentials: true,
});

const dbPath = path.join(__dirname, "../database.sqlite");
const db = new sqlite3.Database(dbPath);

// 保険商品一覧取得API
// 【脆弱性あり】SQLインジェクション攻撃が可能
// 修正方法: プリペアードステートメントを使用する
fastify.get("/api/products", async (request, reply) => {
  const { search, category } = request.query as {
    search?: string;
    category?: string;
  };

  // 【危険】ユーザー入力を直接SQLクエリに埋め込んでいる
  // 攻撃例: ?search=' OR 1=1 --
  // 修正すべき点: sqlite3のprepared statementsを使用する
  let query = "SELECT * FROM insurance_products WHERE 1=1";

  if (search) {
    // 【脆弱性】文字列連結によるSQLインジェクション
    query += ` AND name LIKE '%${search}%'`;
  }

  if (category) {
    // 【脆弱性】文字列連結によるSQLインジェクション
    query += ` AND category = '${category}'`;
  }

  return new Promise((resolve, reject) => {
    db.all(query, (err, rows) => {
      if (err) {
        console.error("Database error:", err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
});

// // 保険商品一覧取得API(安全版)
// fastify.get("/api/products", async (request, reply) => {
//   const { search = "", category } = request.query as {
//     search?: string;
//     category?: string;
//   };

//   let query = "SELECT * FROM insurance_products WHERE 1=1";
//   const params: any[] = [];

//   if (search) {
//     query += " AND name LIKE ?";
//     params.push(`%${search}%`);
//   }
//   if (category) {
//     query += " AND category = ?";
//     params.push(category);
//   }

//   return new Promise((resolve, reject) => {
//     db.all(query, params, (err, rows) => {
//       if (err) reject(err);
//       else resolve(rows);
//     });
//   });
// });

// 管理者ログインAPI
// 【脆弱性あり】SQLインジェクション攻撃が可能
fastify.post("/api/admin/login", async (request, reply) => {
  const { username, password } = request.body as {
    username: string;
    password: string;
  };

  // 【危険】ユーザー入力を直接SQLクエリに埋め込んでいる
  // 攻撃例: username: admin' --
  // 修正すべき点: プリペアードステートメントとパスワードハッシュ化
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  return new Promise((resolve, reject) => {
    db.get(query, (err, row) => {
      if (err) {
        console.error("Login error:", err);
        reject(err);
      } else if (row) {
        resolve({ success: true, user: row });
      } else {
        resolve({ success: false, message: "Invalid credentials" });
      }
    });
  });
});

// // 管理者ログインAPI(安全版)
// fastify.post("/api/admin/login", async (request, reply) => {
//   const { username, password } = request.body as {
//     username: string;
//     password: string;
//   };

//   const query =
//     "SELECT * FROM users WHERE username = ? AND password = ? LIMIT 1";

//   return new Promise((resolve, reject) => {
//     db.get(query, [username, password], (err, row) => {
//       if (err) reject(err);
//       else if (row) resolve({ success: true, user: row });
//       else resolve({ success: false, message: "Invalid credentials" });
//     });
//   });
// });

// 商品詳細取得API
// 【脆弱性あり】SQLインジェクション攻撃が可能
fastify.get("/api/products/:id", async (request, reply) => {
  const { id } = request.params as { id: string };

  // 【危険】パラメータを直接SQLクエリに埋め込んでいる
  // 攻撃例: /api/products/1' UNION SELECT password FROM users --
  const query = `SELECT * FROM insurance_products WHERE id = ${id}`;

  return new Promise((resolve, reject) => {
    db.get(query, (err, row) => {
      if (err) {
        console.error("Database error:", err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
});

// // 商品詳細取得API(安全版)
// fastify.get("/api/products/:id", async (request, reply) => {
//   const { id } = request.params as { id: string };
//   const query = "SELECT * FROM insurance_products WHERE id = ?";

//   return new Promise((resolve, reject) => {
//     db.get(query, [id], (err, row) => {
//       if (err) reject(err);
//       else resolve(row);
//     });
//   });
// });

// カテゴリ一覧取得API
fastify.get("/api/categories", async (request, reply) => {
  const query = "SELECT DISTINCT category FROM insurance_products";

  return new Promise((resolve, reject) => {
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.map((row: any) => row.category));
      }
    });
  });
});

// // カテゴリ一覧取得API(安全版)
// fastify.get("/api/categories", async (request, reply) => {
//   db.all("SELECT DISTINCT category FROM insurance_products", (err, rows) => {
//     if (err) reply.send(err);
//     else reply.send(rows.map((r: any) => r.category));
//   });
// });

// サーバー起動
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: "0.0.0.0" });
    console.log("Server is running on http://localhost:3001");
    console.log("==================================================");
    console.log("【警告】このアプリケーションは教育目的で作成されています");
    console.log("SQLインジェクション脆弱性が意図的に含まれています");
    console.log("本番環境では絶対に使用しないでください");
    console.log("==================================================");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
