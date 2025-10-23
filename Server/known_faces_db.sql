
CREATE DATABASE IF NOT EXISTS attendance
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE attendance;

-- =========================================================
-- 1) STUDENTS: Danh sách sinh viên + dữ liệu khuôn mặt
-- =========================================================
CREATE TABLE students (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  msv  VARCHAR(20)  NOT NULL UNIQUE,
  full_name     VARCHAR(100) NOT NULL,
  image_url     TEXT,
  encoding TEXT,                        -- vector khuôn mặt (ví dụ)
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================================
-- 2) ATTENDANCE_SESSIONS: 2 ca điểm danh mỗi ngày
-- =========================================================
CREATE TABLE attendance_sessions (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  date          DATE         NOT NULL,
  session_name  ENUM('Sáng','Chiều') NOT NULL,
  start_time    TIME         NOT NULL,
  end_time      TIME         NOT NULL,
  UNIQUE KEY ux_session_unique (date, session_name)
) ENGINE=InnoDB;

-- =========================================================
-- 3) ATTENDANCE_RECORDS: Bản ghi điểm danh
--    status: present | late
--    Ràng buộc: Mỗi (student_id, session_id) chỉ 1 bản ghi
-- =========================================================
CREATE TABLE attendance_records (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id    INT UNSIGNED NOT NULL,
  session_id    INT UNSIGNED NOT NULL,
  timestamp     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status        ENUM('present','late') NOT NULL DEFAULT 'present',
  confidence    DECIMAL(5,2),             -- 0.00 -> 100.00 (%)
  image_url     TEXT,
  CONSTRAINT fk_ar_student
    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ar_session
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY ux_unique_attendance (student_id, session_id)
) ENGINE=InnoDB;

-- 2) Tạo 2 ca điểm danh cho ngày ví dụ 2025-10-23
INSERT INTO attendance_sessions (date, session_name, start_time, end_time)
VALUES
  ('2025-10-23', 'Sáng',  '07:00:00', '07:30:00'),
  ('2025-10-23', 'Chiều', '13:00:00', '13:30:00');