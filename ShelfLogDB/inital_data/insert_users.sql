-- ShelfLog User Data Insert Script: Inserts sample users for testing

USE shelflog_db;

-- Insert test users
INSERT INTO User (username, email, password_hash, bio) VALUES
('demo_user', 'demo@shelflog.com', '$2b$10$dummyhash123456789012345678901', 'Avid reader and book enthusiast. Goal: 52 books in 2026!'),
('alice_reads', 'alice@shelflog.com', '$2b$10$dummyhash234567890123456789012', 'Fantasy lover and Sci-Fi explorer. Always looking for the next great adventure.'),
('bob_bookworm', 'bob@shelflog.com', '$2b$10$dummyhash345678901234567890123', 'Non-fiction reader with a passion for history and biography.'),
('charlie_lit', 'charlie@shelflog.com', '$2b$10$dummyhash456789012345678901234', 'Literary fiction fan. Loves character-driven stories.'),
('diana_pages', 'diana@shelflog.com', '$2b$10$dummyhash567890123456789012345', 'Mystery and thriller enthusiast. Can''t put down a good whodunit!');

-- Verify insertion
SELECT COUNT(*) as 'Users Inserted' FROM User;
SELECT user_id, username, email FROM User;

-- Display success message
SELECT 'Sample users inserted successfully!' AS Status;
