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

-- noticeを追加
INSERT INTO notice (event, created_at) VALUES
('2017 Sanae initiated the Info Project, starting research and program development.', '2017-01-01'),
('2020 The project was renamed to the Sanae Project. A website was launched on the FC2 server.', '2020-01-01'),
('2021 The server was changed to Starfree.', '2021-01-01'),
('2023 Began developing and studying neural networks. We have renewed our website!', '2023-01-01'),
('2025 We have renewed our website.', '2025-01-01');
