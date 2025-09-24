
// loading 要素
let concealElement;

let loadingContent;

// loading を表示:コードをロードした時
document.addEventListener("DOMContentLoaded",()=>{
    concealElement = document.createElement("div");
    loadingContent = document.createElement("p");

    subContent = document.createElement("p");

    // id 設定
    concealElement.id = "conceal";
    loadingContent.id = "conceal-content";
    subContent.id = "conceal-subcontent";

    // Fontを適用する
    loadingContent.className ="SankofaFont";
    subContent.className ="SankofaFont";

    // スタイル
    concealElement.style=
    `
        position:fixed;
        top : 0px;

        width:100%;
        height:100%;

        background-color:white;
        z-index:255;

        text-align:center;
    `;
    loadingContent.style=
    `
        font-size:60px;
    `;
    subContent.style=
    `
        font-size:20px;
    `;
    
    // body へ適用
    concealElement.appendChild(loadingContent);
    concealElement.appendChild(subContent);

    document.body.appendChild(concealElement);

    // SanaeProjectをかっこよく表示
    delayPrint(loadingContent,"Sanae",100);
    delayPrint(loadingContent,"Project",50,true);

    delayPrint(subContent,"May our God receive the praise, the glory and the honor.We are Jehovah's Witnesses.",10,false);

    setTimeout(function nowLoading(){
        // 読み込まれた & SanaeProject が表示されている。
        if (document.readyState === "complete" && loadingContent.textContent === "SanaeProject") {
            // 隠す
            concealElement.style.animation = "concealHide 1s forwards";
            
            // 要素削除
            setTimeout(()=>{concealElement.remove()},1000);
        }
        // 読み込み完了していない場合遅延&自分を呼び出し
        else
            setTimeout(nowLoading, 500);
    }, 1400);
});