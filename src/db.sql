CREATE TABLE IF NOT EXISTS notice (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event TEXT NOT NULL,
    created_at DATE DEFAULT CURRENT_DATE
);
CREATE TABLE IF NOT EXISTS blog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at DATE DEFAULT CURRENT_DATE
);
CREATE TABLE IF NOT EXISTS tag(
    id INT AUTO_INCREMENT PRIMARY KEY,
    blog_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    UNIQUE(blog_id, name),
    created_at DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (blog_id) REFERENCES blog(id) ON DELETE CASCADE ON UPDATE CASCADE
);
-- ブログのテスト
INSERT INTO blog (title, content) VALUES ('テストブログ1', 'これはテストブログの内容です。');
INSERT INTO blog (title, content) VALUES ('テストブログ2', '2つ目のテストブログです。');

-- ブログが正しく挿入されたか確認
SELECT * FROM blog;

-- タグのテスト
INSERT INTO tag (blog_id, name) VALUES (1, 'テストタグ1');
INSERT INTO tag (blog_id, name) VALUES (1, 'テストタグ2');
INSERT INTO tag (blog_id, name) VALUES (2, 'テストタグ3');