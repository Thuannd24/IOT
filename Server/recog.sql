-- =========================================
-- TẠO DATABASE (Nếu cần)
-- =========================================
CREATE DATABASE IF NOT EXISTS attendance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE attendance;

-- =========================================
-- DROP TABLES (Để chạy lại không lỗi)
-- =========================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS attendance_records;
DROP TABLE IF EXISTS attendance_sessions;
DROP TABLE IF EXISTS students;
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================
-- BẢNG students
-- =========================================
CREATE TABLE `students` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `msv` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` text COLLATE utf8mb4_unicode_ci,
  `encoding` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_msv` (`msv`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `students` VALUES
(1,'B22DCCN840','Nguyễn Đình Thuân','/static/students/B22DCCN840.jpg', '...encoding...', '2025-11-07 22:49:07'),
(2,'B22DCCN001','Bùi Mạnh Hùng','/static/students/B22DCCN001.jpg', '...encoding...', '2025-11-08 09:10:44');

-- =========================================
-- BẢNG attendance_sessions
-- =========================================
CREATE TABLE `attendance_sessions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `session_name` enum('Sáng','Chiều') COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `close_time` time DEFAULT NULL,
  `shift` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `attendance_sessions` VALUES
(1,'2025-11-07','Sáng','22:49:00','22:53:00','22:55:00',1),
(2,'2025-11-07','Sáng','23:03:00','23:06:00','23:07:00',2),
(3,'2025-11-07','Sáng','23:13:00','23:17:00','23:19:00',3),
(4,'2025-11-07','Chiều','23:17:56','23:27:56','23:27:56',1),
(5,'2025-11-07','Chiều','23:28:00','23:29:00','23:30:00',2),
(7,'2025-11-07','Chiều','23:57:00','00:00:00','00:07:00',3),
(8,'2025-11-08','Sáng','08:45:00','08:49:00','08:50:00',1),
(9,'2025-11-08','Sáng','09:10:00','09:20:00','09:20:00',2);

-- =========================================
-- BẢNG attendance_records
-- =========================================
CREATE TABLE `attendance_records` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `student_id` int unsigned NOT NULL,
  `session_id` int unsigned NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('present','late','absent') COLLATE utf8mb4_unicode_ci NOT NULL,
  `confidence` decimal(5,2) DEFAULT NULL,
  `image_url` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_attendance_unique` (`student_id`,`session_id`),
  CONSTRAINT `fk_ar_session` FOREIGN KEY (`session_id`) REFERENCES `attendance_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ar_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `attendance_records` VALUES
(1,1,1,'2025-11-07 22:55:00','absent',0.00,NULL),
(2,1,2,'2025-11-07 23:07:00','absent',0.00,NULL),
(3,1,3,'2025-11-07 23:19:00','absent',0.00,NULL),
(4,1,4,'2025-11-07 23:22:16','present',70.00,'/static/attendance_faces/B22DCCN840_20251107_232216.jpg'),
(5,1,5,'2025-11-07 23:30:00','absent',0.00,NULL),
(8,1,7,'2025-11-07 00:07:00','absent',0.00,NULL),
(9,1,8,'2025-11-08 08:46:21','present',70.00,'/static/attendance_faces/B22DCCN840_20251108_084621.jpg'),
(10,1,9,'2025-11-08 09:11:06','present',70.00,'/static/attendance_faces/B22DCCN840_20251108_091106.jpg'),
(11,2,9,'2025-11-08 09:16:41','present',70.00,'/static/attendance_faces/B22DCCN001_20251108_091641.jpg'),
(12,2,1,'2025-11-07 22:55:00','absent',0.00,NULL),
(13,2,2,'2025-11-07 23:07:00','absent',0.00,NULL),
(14,2,3,'2025-11-07 23:19:00','absent',0.00,NULL),
(15,2,4,'2025-11-07 23:27:56','absent',0.00,NULL),
(16,2,5,'2025-11-07 23:30:00','absent',0.00,NULL),
(17,2,7,'2025-11-07 00:07:00','absent',0.00,NULL),
(18,2,8,'2025-11-08 08:50:00','absent',0.00,NULL);

