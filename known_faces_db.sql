CREATE DATABASE facerec CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE facerec;
CREATE TABLE face_db (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) CHARACTER SET utf8mb4,
    encoding TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

TRUNCATE TABLE face_db;
