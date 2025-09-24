"use strict";
/* --------------------------------------------------------------------------------------------------
    このライブラリは SanaeProject の webサイト で使用される共通ライブラリです。
    
    DelayPrint       : ゆっくりとタイピングするように表記できます。

    Copyright 2024 SanaeProject.
-------------------------------------------------------------------------------------------------- */
// 書き込み中のエレメント
let writingElements = [];
// ゆっくりと表示するメソッド
// <p id='helloWorld'>hello</p>
// -----------------------------
// 1文字500ミリ秒でゆっくりと表示する。
//
// let element = document.getElementById('helloWorld');
// 上書き: delayPrint(element,'helloWorld',500);      // -> helloWorld
// 追記  : delayPrint(element,'helloWorld',500,true); // -> hellohelloWorld
async function delayPrint(element, text, interval, add = false) {
    var _a;
    // 指定された element が書き込み中でないかを確かめるラムダ式
    const is_existing = () => {
        return writingElements.includes(element);
    };
    // element の文字数を取得するラムダ式
    const get_length = () => {
        var _a, _b;
        return (_b = (_a = element === null || element === void 0 ? void 0 : element.textContent) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
    };
    // 書き込む文字列
    let writeContent = (_a = element.textContent) !== null && _a !== void 0 ? _a : '';
    // 書き込んだ文字数
    let writeCount = 0;
    // 書き込み中であれば interval[ms] 待って再度確認する。
    while (is_existing())
        await new Promise((resolve) => setTimeout(resolve, interval));
    // 書き込み中にする。
    writingElements.push(element);
    // 追記
    if (add) {
        writeContent += text;
        writeCount = get_length();
    }
    // 上書き
    else
        writeContent = text;
    // 書き込みを行う
    const printInterval = setInterval(() => {
        if (writeCount < writeContent.length) {
            // 文字を少しずつ表示させていく。
            element.textContent = writeContent.substring(0, writeCount) + '_';
            // カウント増加
            writeCount++;
        }
        else {
            // tag も反映させる。
            element.innerHTML = writeContent;
            // interval 削除
            clearInterval(printInterval);
            // 書き込み終了
            writingElements = writingElements.filter((elements) => elements !== element);
        }
    }, interval);
}
// スクロール時に要素の表示を切り替えるメソッド
// -----------------------------
// const showElement = (entry: IntersectionObserverEntry) => {
//      entry.target.style.opacity = '1';
// };
// const hideElement = (entry: IntersectionObserverEntry) => {
//      entry.target.style.opacity = '0';
// };
//
// const elements = document.querySelectorAll('.toggle-visibility');
// toggleVisibilityOnScroll(Array.from(elements), showElement, hideElement);
function toggleVisibilityOnScroll(elements, visibleStyle, invisibleStyle) {
    // オブザーバ
    const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            // 描画されている
            if (entry.isIntersecting)
                visibleStyle(entry);
            // 描画されていない
            else
                invisibleStyle(entry);
        });
    });
    // すべての要素に対して
    elements.forEach((element) => obs.observe(element));
}
// 指定した要素で選択されたファイルを読み取るメソッド
async function readSelectedFileContent(element) {
    // 要素の type は 'file' でなければならない。
    if (element.type !== 'file')
        throw new Error('element type must file');
    // ファイルを取得
    const file = element.files[0];
    // 選択されていない
    if (!file)
        throw new Error('not selected file');
    return new Promise((resolve, reject) => {
        // filereader 作成
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(event.target.result);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsText(file);
    });
}
//# sourceMappingURL=sanaeUI.js.map