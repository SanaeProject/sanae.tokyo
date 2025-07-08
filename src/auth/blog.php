<!DOCTYPE html>

<?php
session_start();

// CSRFトークンの生成
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
?>

<!-- html Start -->
<html lang="ja">
<!-- head Start -->
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog</title>
    <meta name="description" content="SanaeProjectのブログページです。AIや自然言語処理に関する最新情報や技術的な記事を掲載しています。">
    <meta name="keywords" content="SanaeProject, AI, 自然言語処理, NeuralNetwork, ディープラーニング">

    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/index.css">
    <link rel="stylesheet" href="../css/blog.css">

    <script type="module" src="../script/javascript/ui.js"></script>
    <script type="module" src="../script/javascript/header.js"></script>
    <script type="module" src="../script/javascript/util.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@latest/dist/katex.min.css">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@latest/dist/katex.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@latest/dist/contrib/auto-render.min.js"></script>
    <script defer src="../script/javascript/latex.js"></script>

    <script type="module">
        import * as UI from '../script/javascript/ui.js';
        window.delayPrint               = UI.delayPrint;
        window.toggleVisibilityOnScroll = UI.toggleVisibilityOnScroll;
        window.toggleStyleOnScroll      = UI.toggleStyleOnScroll;
        window.readSelectedFileContent  = UI.readSelectedFileContent;

        import * as util from '../script/javascript/util.js';
        window.throttle = util.throttle;
        window.getJsonFromFetch = util.getJsonFromFetch;
    </script>

    <style>
        .md-code,.md-content{
            height  : 50vh;
            overflow: auto;
        }
    </style>
</head>
<!-- head End -->

<!-- body Start -->
<body>
    <!-- header Start -->
    <header>
        <label class="menu-icon">
            <input type="checkbox" id="menu-toggle" class="menu-toggle">
            <span class="navicon"></span>
        </label>
        <nav class="menu">
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="blog.html">Blog</a></li>
                <li><a href="terms.html">Terms</a></li>
                <li><a href="mailto:support@sanae.tokyo">Contact</a></li>
            </ul>
        </nav>
        <h1>Blog</h1>
    </header>
    <!-- header End -->

    <!-- Sidebar Toggle Button -->
    <button class="sidebar-toggle" id="sidebar-toggle">
        &gt;
    </button>

    <!-- side Start -->
    <aside class="side">
        <div class="title-wrapper">
            <h2>Blog Tags</h2>
        </div>
        <div class="content-wrapper">
            <table class="common">
                <thead>
                    <tr>
                        <th>Tag</th>
                        <th>Count</th>
                        <th>Del</th>
                    </tr>
                </thead>
                <tbody id="tag-list">
                    <script>
                        document.addEventListener('DOMContentLoaded', () => {
                            getJsonFromFetch('../include/request.php?req=tag')
                                .then(data => {
                                    const tbody = document.querySelector('#tag-list');
                                    data.forEach(tag => {
                                        const tr = document.createElement('tr');
                                        tr.innerHTML = `
                                            <td><a href="../blog.html?tag=${tag.name}">${tag.name}</a></td>
                                            <td>${tag.count}</td>
                                            <td>
                                                <form method="post" action="del-tag-btn.php">
                                                    <input type="hidden" name="tag" value="${tag.name}">
                                                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                                                    <button class="delete" type="submit" onclick="return prompt('タグ「${tag.name}」を削除しますか？削除する場合は「${tag.name}」と入力してください。') === '${tag.name}'"></button>
                                                </form>
                                            </td>
                                        `;
                                        tbody.appendChild(tr);
                                    });

                                    const tr = document.createElement('tr');
                                        tr.innerHTML = '<td colspan="2"><a href="../blog.html">すべて</a></td>';
                                        tbody.appendChild(tr);
                                });
                        });
                    </script>
                </tbody>
            </table>
            <form class="search-form" method="get">
                <input  class="search-input" type="text" name="search" placeholder="タイトルを入力">
                <button class="search-button" type="submit">検索</button>
            </form>
        </div>
    </aside>
    <!-- side End -->

    <!-- main Start -->
    <main>
        <?php if (isset($_SESSION['success'])): ?>
            <div class="alert alert-success">
                <?php echo htmlspecialchars($_SESSION['success']); unset($_SESSION['success']); ?>
            </div>
        <?php endif; ?>
        
        <?php if (isset($_SESSION['error'])): ?>
            <div class="alert alert-error">
                <?php echo htmlspecialchars($_SESSION['error']); unset($_SESSION['error']); ?>
            </div>
        <?php endif; ?>
        
        <section class="slide-in">
            <div class="title-wrapper">
                <h2>Blog</h2>
            </div>
            <div class="content-wrapper">
                <div class="editor-wrapper">
                    <form id="md-code-wrapper" method="post" action="./update-blog.php">
                        <textarea name="md" id="md-code"></textarea>
                        <input type="hidden" name="id" value="<?php echo isset($_GET['id']) ? htmlspecialchars($_GET['id']) : ''; ?>">
                        <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                        <input type="text" name="title" id="title" placeholder="タイトルを入力" required>
                        <input type="text" name="tags" id="tags" placeholder="タグをカンマ区切りで入力（例: AI, 機械学習, Python）">
                        <button class="next-btn" type="submit">投稿</button>
                    </form>
                    <div id="md-content">
                    </div>
                </div>

                <table class="common">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody id="blog-list">
                    </tbody>
                </table>
                <div id="pagination" class="pagination"></div>
                <script>
                    document.addEventListener('DOMContentLoaded', () => {
                        const urlSearchParm = new URLSearchParams(window.location.search);
                        const getTag    = urlSearchParm.get('tag');
                        const getId     = urlSearchParm.get('id');
                        const getSearch = urlSearchParm.get('search');
                        const getSkip   = parseInt(urlSearchParm.get('skip') || 0);

                        document.querySelector('#md-code').addEventListener('keydown', (event) => {
                            if(event.key !== 'Enter' && event.key !== 'Tab') {
                                return; // EnterやTab以外のキーは何もしない
                            }

                            event.preventDefault();
                            const textarea = event.target;
                            const start    = textarea.selectionStart;
                            const end      = textarea.selectionEnd;

                            const value      = textarea.value;
                            const before     = value.substring(0, start);
                            const selected   = value.substring(start, end);
                            const after      = value.substring(end);
                            if(event.key === 'Enter') {
                                event.target.value = before + selected + '  \n' + after;
                            }
                            if (event.key === 'Tab') {
                                const lines = selected.split('\n');
                                const tab = '    ';
                                let modified;

                                if (event.shiftKey) {
                                    // Shift+Tab → アンインデント（行頭の4スペースを削除）
                                    modified = lines
                                        .map(line => line.startsWith(tab) ? line.slice(tab.length) : line)
                                        .join('\n');
                                } else {
                                    // Tab → インデント（行頭に4スペース追加）
                                    modified = lines.map(line => tab + line).join('\n');
                                }

                                textarea.value = before + modified + after;

                                // 選択範囲の再設定（カーソルの再配置も含め）
                                textarea.selectionStart = start;
                                textarea.selectionEnd = start + modified.length;
                            }
                        });
                        document.querySelector('#md-code').addEventListener('input', (event) => {
                            const content = event.target.value;
                            const previewElement = document.querySelector('#md-content');
                            previewElement.innerHTML = parseMarkdownWithMath(content);

                            // KaTeXでLaTeX数式をレンダリング（少し遅延を入れる）
                            setTimeout(() => {
                                try {
                                    renderKaTeX(previewElement);
                                } catch (e) {
                                    console.warn('KaTeX rendering error:', e);
                                }
                            }, 100);
                        });

                        // IDが指定されている場合はそのブログの詳細を表示
                        if (getId) {
                            fetch(`../include/request.php?req=blog_detail&id=${getId}`)
                                .then(response => response.json())
                                .then(data => {
                                    const content = document.querySelector('#md-content');
                                    content.innerHTML = parseMarkdownWithMath(data.content);

                                    document.querySelector('#title').value = data.title;
                                    
                                    // タグがある場合は表示
                                    if (data.tags && data.tags.length > 0) {
                                        document.querySelector('#tags').value = data.tags.join(', ');
                                    }

                                    // KaTeXでLaTeX数式をレンダリング
                                    try {
                                        renderKaTeX(content);
                                    } catch (e) {
                                        console.warn('KaTeX rendering error:', e);
                                    }

                                    document.querySelector('#md-code').value = data.content;
                                })
                                .catch(error => console.error('Error fetching blog content:', error));
                            document.querySelector('table:has(#blog-list)').style.display = 'none';
                            return;
                        }

                        // ブログ一覧を取得
                        fetch(`../include/request.php?req=blog`+
                            (getTag     ? `&tag=${getTag}` : '')+
                            (getSearch  ? `&search=${encodeURIComponent(getSearch)}` : '')+
                            (getSkip    ? `&skip=${getSkip}` : '')
                        )
                            .then(response => response.json())
                            .then(data => {
                                const tbody      = document.querySelector('#blog-list');
                                const pagination = document.querySelector('#pagination');

                                // テーブルをクリア
                                tbody.innerHTML      = '';
                                pagination.innerHTML = '';
                                
                                // ブログデータを表示
                                data.forEach(blog => {
                                    const tr = document.createElement('tr');
                                    tr.innerHTML = `
                                        <td><a href="./blog.php?id=${blog.id}">${blog.title}</a></td>
                                        <td>${blog.created_at}</td>
                                    `;
                                    tbody.appendChild(tr);
                                });

                                // ページネーションボタンを作成
                                const createPaginationButton = (text, skip, disabled = false) => {
                                    const button = document.createElement('button');
                                    button.textContent = text;
                                    button.className = 'pagination-btn';
                                    if (disabled) {
                                        button.disabled = true;
                                        button.className += ' disabled';
                                    } else {
                                        button.addEventListener('click', () => {
                                            const url = new URL(window.location);
                                            if (skip > 0) {
                                                url.searchParams.set('skip', skip);
                                            } else {
                                                url.searchParams.delete('skip');
                                            }
                                            window.location.href = url.toString();
                                        });
                                    }
                                    return button;
                                };

                                // 戻るボタン（skipが1以上の時）
                                if (getSkip > 0) {
                                    const prevButton = createPaginationButton('← 戻る', getSkip - 1);
                                    pagination.appendChild(prevButton);
                                }

                                // 次へボタン（データが10件ちょうどの時）
                                if (data.length % 10 === 0 && data.length > 0) {
                                    const nextButton = createPaginationButton('次へ →', getSkip + 1);
                                    pagination.appendChild(nextButton);
                                }
                            });
                    });
                </script>
            </div>
        </section>
    </main>
    <!-- main End -->

    <script>
        document.addEventListener("DOMContentLoaded", () => { 
            const elements = Array.from(document.querySelectorAll(".slide-in,.write")); 
            toggleVisibilityOnScroll( elements, (entry) => {
                if(entry.target.classList.contains("write")){
                    delayPrint(
                        entry.target, 
                        entry.target.textContent, 
                        100
                    );
                    entry.target.classList.remove("write");
                    entry.target.classList.add("wrote");
                }

                if(entry.target.classList.contains("slide-in"))
                    entry.target.classList.add("slide-in-visible");
                }, (entry) => {}
            ); 

            // サイドバーの表示/非表示制御
            const sidebarToggle = document.getElementById('sidebar-toggle');
            const sidebar = document.querySelector('.side');
            let isOpen = false;

            sidebarToggle.addEventListener('click', () => {
                if (isOpen) {
                    // サイドバーを非表示
                    sidebar.classList.remove('visible');
                    sidebarToggle.classList.remove('sidebar-open');
                    sidebarToggle.innerHTML = '&gt;';
                    isOpen = false;
                } else {
                    // サイドバーを表示
                    sidebar.classList.add('visible');
                    sidebarToggle.classList.add('sidebar-open');
                    sidebarToggle.innerHTML = '&lt;';
                    isOpen = true;
                }
            });
        });
    </script>

    <!-- footer Start -->
    <footer>
        <p>&copy; 2023 SanaeProject. All rights reserved.</p>
    </footer>
    <!-- footer End -->
</body>
<!-- body End -->
</html>
<!-- html End -->