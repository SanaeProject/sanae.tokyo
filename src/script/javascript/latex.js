// KaTeXのレンダリング関数
const renderKaTeX = (element) => {
    if (typeof renderMathInElement !== 'undefined') {
        renderMathInElement(element, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false},
                {left: '\\[', right: '\\]', display: true},
                {left: '\\(', right: '\\)', display: false}
            ],
            throwOnError: false,
            strict: false,
            trust: true,
            macros: {
                "\\RR": "\\mathbb{R}",
                "\\NN": "\\mathbb{N}"
            }
        });
    }
};

// LaTeX数式を保護してからMarkdownをパース
function parseMarkdownWithMath(content) {
    // LaTeX数式を一時的に置き換え
    const mathBlocks = [];
    let tempContent = content;
    
    // $$...$$形式をプレースホルダに置換
    tempContent = tempContent.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
        const index = mathBlocks.length;
        mathBlocks.push(match);
        return `MATHBLOCK_${index}_MATHBLOCK`;
    });
    
    // $...$形式をプレースホルダに置換
    tempContent = tempContent.replace(/\$([^$\n]+?)\$/g, (match, math) => {
        const index = mathBlocks.length;
        mathBlocks.push(match);
        return `MATHBLOCK_${index}_MATHBLOCK`;
    });
    
    // Markdownをパース
    let html = marked.parse(tempContent);
    
    // プレースホルダを元のLaTeX数式に戻す
    mathBlocks.forEach((mathBlock, index) => {
        html = html.replace(`MATHBLOCK_${index}_MATHBLOCK`, mathBlock);
    });
    
    return html;
};