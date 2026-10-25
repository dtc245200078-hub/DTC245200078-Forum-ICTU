CREATE DATABASE IF NOT EXISTS forum_db;

USE forum_db;

-- Bang nguoi dung
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bang danh muc
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT
);

-- Bang bai viet
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id),

    FOREIGN KEY (category_id)
        REFERENCES categories(id)
);

-- Bang binh luan
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (post_id)
        REFERENCES posts(id),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
);

-- Du lieu danh muc mau
INSERT INTO categories (name, description)
VALUES
('Cong nghe thong tin', 'Thao luan ve CNTT'),
('Lap trinh', 'Chia se kien thuc lap trinh'),
('Hoc tap', 'Trao doi kinh nghiem hoc tap'),
('Hoi dap', 'Dat cau hoi va giai dap thac mac');
