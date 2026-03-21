-- ShelfLog Database Creation Script: Creates the main database for ShelfLog

-- Drop database if it exists
DROP DATABASE IF EXISTS shelflog_db;

-- Create database with UTF-8 support for international characters
CREATE DATABASE shelflog_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Select the database for use
USE shelflog_db;

-- Verify database was created
SELECT 'Database shelflog_db created successfully!' AS Status;
