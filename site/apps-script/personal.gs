/*****************************************************************
 * personal.gs — 自己ベスト記録用 Apps Script（堅牢版）
 * ---------------------------------------------------------------
 * このコードは、これまで 500 エラー（→ ブラウザでは CORS エラー表示）
 * が出ていた原因（例外がそのまま返っていた）を解消したものです。
 *
 * 【差し替え手順】
 * 1. 「【部内用】陸上競技部 部員自己ベスト記録」スプレッドシートを開く
 * 2. 拡張機能 → Apps Script を開く
 * 3. 既存のコードを全部消して、このコードを貼り付ける
 * 4. 下の SPREADSHEET_ID に、そのスプレッドシートのIDを貼り付ける
 *    （URL の /d/ と /edit の間の長い文字列がIDです）
 * 5. 「デプロイ」→「デプロイを管理」→ 鉛筆マーク →
 *    バージョンを「新しいバージョン」にして「デプロイ」
 *    ※ 必ず「新しいバージョン」でデプロイし直すこと
 * 6. アクセスできるユーザーは「全員」にする
 *
 * ※ ウェブアプリのURL自体は変わりません。
 *   （変わった場合のみ js/main.js の PERSONAL_URL を更新）
 *****************************************************************/

// ★ここにスプレッドシートIDを貼り付ける（空のままだと当該スプレッドシートを使用）
var SPREADSHEET_ID = "";

function doGet(e) {
  try {
    var sheetName = (e && e.parameter && e.parameter.sheet) ? e.parameter.sheet : "短距離";

    var ss = SPREADSHEET_ID
      ? SpreadsheetApp.openById(SPREADSHEET_ID)
      : SpreadsheetApp.getActiveSpreadsheet();

    if (!ss) {
      return jsonOutput({ error: "スプレッドシートを開けませんでした" });
    }

    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      // シートが無くても 500 にせず、空データを返す
      return jsonOutput([]);
    }

    var range = sheet.getDataRange();
    var values = range.getValues();

    // 空シート（ヘッダーも無い）なら空配列
    if (!values || values.length < 2) {
      return jsonOutput([]);
    }

    var headers = values.shift();

    var data = values
      .filter(function (row) {
        // 全セルが空の行はスキップ
        return row.some(function (c) { return c !== "" && c !== null; });
      })
      .map(function (row) {
        var obj = {};
        headers.forEach(function (header, i) {
          obj[header] = formatCell(row[i]);
        });
        return obj;
      });

    return jsonOutput(data);

  } catch (err) {
    // どんな例外でも JSON で返す（500 を出さない）
    return jsonOutput({ error: String(err) });
  }
}

// 日付などをそのまま文字列化（記録の表記崩れを防ぐ）
function formatCell(v) {
  if (v === null || v === undefined) return "";
  return v;
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
