-- Student Management System Database Schema

CREATE DATABASE IF NOT EXISTS sms_db;
USE sms_db;

-- Principal table
CREATE TABLE IF NOT EXISTS principal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(150) DEFAULT 'Principal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20),
  age INT,
  course_id INT,
  semester INT DEFAULT 1,
  username VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  profile_pic VARCHAR(255),
  status ENUM('active','inactive') DEFAULT 'active',
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

-- Messages table (principal to student broadcast/direct)
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_type ENUM('principal','student') DEFAULT 'principal',
  sender_id INT NOT NULL,
  recipient_id INT DEFAULT NULL,  -- NULL = broadcast to all
  subject VARCHAR(255),
  body TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE
);

-- Insert default principal
INSERT IGNORE INTO principal (username, password, name) VALUES ('admin', 'admin123', 'Dr. Admin Principal');

-- Insert default courses
INSERT IGNORE INTO courses (name, description) VALUES
  ('Computer Science', 'Bachelor of Computer Science'),
  ('Mechanical Engineering', 'Bachelor of Mechanical Engineering'),
  ('Civil Engineering', 'Bachelor of Civil Engineering'),
  ('Electronics & Communication', 'Bachelor of ECE'),
  ('Business Administration', 'Bachelor of Business Administration'),
  ('Data Science', 'Bachelor of Data Science');

-- Insert sample students
INSERT IGNORE INTO students (name, email, phone, age, course_id, semester, username, password) VALUES
  ('Arjun Sharma', 'arjun@example.com', '9876543210', 20, 1, 3, 'arjun', 'pass123'),
  ('Priya Nair', 'priya@example.com', '9876543211', 21, 2, 5, 'priya', 'pass123'),
  ('Rohan Verma', 'rohan@example.com', '9876543212', 19, 1, 1, 'rohan', 'pass123'),
  ('Sneha Patel', 'sneha@example.com', '9876543213', 22, 3, 7, 'sneha', 'pass123'),
  ('Vikram Singh', 'vikram@example.com', '9876543214', 20, 4, 3, 'vikram', 'pass123'),
  ('Anjali Menon', 'anjali@example.com', '9876543215', 21, 5, 5, 'anjali', 'pass123'),
  ('Kiran Reddy', 'kiran@example.com', '9876543216', 19, 6, 1, 'kiran', 'pass123'),
  ('Deepa Joshi', 'deepa@example.com', '9876543217', 22, 1, 7, 'deepa', 'pass123');

-- Insert sample messages
INSERT IGNORE INTO messages (sender_type, sender_id, recipient_id, subject, body) VALUES
  ('principal', 1, NULL, 'Welcome to New Semester!', 'Dear Students, Welcome to the new academic semester. We wish you all the best in your studies. Please check your timetable on the notice board.'),
  ('principal', 1, NULL, 'Exam Schedule Released', 'The mid-semester examination schedule has been released. Exams will begin from next Monday. Please prepare accordingly and contact your respective department heads for any queries.'),
  ('principal', 1, NULL, 'Holiday Notice', 'The college will remain closed on account of the national holiday. Regular classes will resume the following day. Have a great holiday!');
