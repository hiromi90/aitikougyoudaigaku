/*****************************************************************
 * results.gs — 大会結果用 Apps Script（年度スプレッドシートごと）
 * ---------------------------------------------------------------
 * この1ファイルを「年度ごとのスプレッドシート」それぞれに入れて
 * デプロイします（2026年度用・2025年度用…と年度の数だけ）。
 *
 * 【仕組み】
 * ・そのスプレッドシート内の「シート（タブ）1枚 = 1大会」として扱います。
 * ・シート名（タブ名）は次の形にしてください：
 *     大会名〔半角スペース〕開催日｜開催場所
 *   例）第2回トヨタ紡織記録挑戦会 2026年3月28日｜ウェーブスタジアム刈谷
 *   ・大会名の中には半角スペースを入れないでください
 *     （最初の半角スペースで「大会名」と「開催日」を区切ります）。
 *   ・日付・場所が無い大会は「大会名」だけでもOKです。
 * ・各シートの1行目は見出し（種目 / 氏名 / 学年 / 記録 / 順位 / PB/SB）。
 *
 * 【差し替え手順】
 * 1. その年度の「大会結果」スプレッドシートを開く
 * 2. 拡張機能 → Apps Script を開き、このコードを貼り付ける
 * 3. SPREADSHEET_ID は【空のままでOK】（下の説明を参照）
 * 4. デプロイ →「新しいデプロイ」→ 種類「ウェブアプリ」→
 *    アクセスできるユーザー「全員」→ デプロイ
 * 5. 表示された「ウェブアプリのURL」を、
 *    content/results.txt の該当年度の行に貼り付ける
 *
 * 【非表示にしたいシート】
 * ・先頭が「_」で始まるシート名（例：_メモ）は結果に含めません。
 *****************************************************************/

/* ================================================================
 * ★ SPREADSHEET_ID について（何を入れればいい？）
 * ----------------------------------------------------------------
 * 結論：上の手順どおり「スプレッドシートの画面から
 *       拡張機能 → Apps Script」で開いて貼り付けた場合は、
 *       【空欄 "" のままで正しく動きます】。何も入れないでください。
 *       （空欄のときは「このスクリプトが付いているスプレッドシート」
 *         を自動で使う仕組みになっています）
 *
 * IDを入れる必要があるのは、script.google.com から
 * 「単独のスクリプト」として作った場合だけです。そのときは、
 * 対象スプレッドシートを開いたときのURLの
 *   https://docs.google.com/spreadsheets/d/【この部分】/edit
 * にある長い英数字の文字列をコピーして、下の "" の間に貼り付けます。
 *   例）var SPREADSHEET_ID = "1AbCdEfGhIjKlMnOpQrStUvWxYz123456789";
 * ================================================================ */
var SPREADSHEET_ID = "";

function doGet(e) {
  try {
    var ss = SPREADSHEET_ID
      ? SpreadsheetApp.openById(SPREADSHEET_ID)
      : SpreadsheetApp.getActiveSpreadsheet();

    if (!ss) {
      return jsonOutput({ error: "スプレッドシートを開けませんでした" });
    }

    var sheets = ss.getSheets();
    var result = [];

    sheets.forEach(function (sheet) {
      var name = sheet.getName();
      if (name.indexOf("_") === 0) return; // 「_」始まりは除外

      var values = sheet.getDataRange().getValues();
      var data = [];

      if (values && values.length >= 2) {
        var headers = values.shift();
        data = values
          .filter(function (row) {
            return row.some(function (c) { return c !== "" && c !== null; });
          })
          .map(function (row) {
            var obj = {};
            headers.forEach(function (header, i) {
              obj[header] = (row[i] === null || row[i] === undefined) ? "" : row[i];
            });
            return obj;
          });
      }

      result.push({ sheet: name, data: data });
    });

    return jsonOutput(result);

  } catch (err) {
    return jsonOutput({ error: String(err) });
  }
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
