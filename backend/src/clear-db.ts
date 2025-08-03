import * as sqlite3 from "sqlite3";
import * as path from "path";

const dbPath = path.join(__dirname, "../database.sqlite");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 削除対象のテーブル一覧
  const tables = ["insurance_products", "users"];

  tables.forEach((table) => {
    db.run(`DROP TABLE IF EXISTS ${table}`, (err) => {
      if (err) {
        console.error(
          `テーブル ${table} の削除中にエラーが発生しました:`,
          err.message
        );
      } else {
        console.log(`テーブル ${table} を削除しました`);
      }
    });
  });
});

db.close();
