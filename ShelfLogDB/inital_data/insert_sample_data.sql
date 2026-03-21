-- ==========================================
-- ShelfLog Sample Data Insert Script
-- ==========================================
-- Purpose: Inserts sample reading data (goals, lists, progress, reviews)
-- Author: Liya (Database Lead)
-- Date: March 2026
-- Version: 1.0
-- ==========================================

USE shelflog_db;

-- ==========================================
-- INSERT READING GOALS
-- ==========================================

INSERT INTO ReadingGoal (user_id, year, target_books, target_pages, start_date, end_date, is_active) VALUES
(1, 2026, 52, 15000, '2026-01-01', '2026-12-31', TRUE),
(2, 2026, 30, 10000, '2026-01-01', '2026-12-31', TRUE),
(3, 2026, 24, 8000, '2026-01-01', '2026-12-31', TRUE),
(4, 2026, 40, 12000, '2026-01-01', '2026-12-31', TRUE);

SELECT 'Reading goals inserted' AS Status;

-- ==========================================
-- INSERT READING LISTS
-- ==========================================

INSERT INTO ReadingList (user_id, name, description, is_public) VALUES
(1, 'Want to Read', 'Books I plan to read in 2026', TRUE),
(1, '2026 Reading Goal', 'Must-reads for the year', FALSE),
(1, 'Favorites', 'All-time favorite books', TRUE),
(2, 'Fantasy Shelf', 'Fantasy and magical realism', TRUE),
(2, 'Currently Reading', 'Books in progress', FALSE),
(3, 'History & Biography', 'Non-fiction picks', TRUE),
(3, 'Mystery Corner', 'Whodunits and thrillers', TRUE),
(4, 'Classic Literature', 'Timeless classics', TRUE);

SELECT 'Reading lists inserted' AS Status;

-- ==========================================
-- INSERT LIST ITEMS
-- ==========================================

INSERT INTO ListItem (list_id, book_id, notes, priority) VALUES
-- demo_user's Want to Read list
(1, 2, 'Finally getting around to this classic!', 1),
(1, 3, 'Recommended by friend', 2),
(1, 8, 'Looks interesting', 3),
(1, 14, 'For book club', 4),

-- demo_user's 2026 Reading Goal
(2, 1, 'Classic must-read', 1),
(2, 10, 'Literary fiction', 2),
(2, 11, 'The Great Gatsby', 3),

-- demo_user's Favorites
(3, 2, 'Best book ever', 1),
(3, 6, 'Re-read every year', 2),
(3, 12, 'Powerful story', 3),

-- alice_reads Fantasy Shelf
(4, 2, 'Perfect fantasy', 1),
(4, 8, 'Gaiman is amazing', 2),
(4, 9, 'Co-authored masterpiece', 3),
(4, 13, 'Magical realism at its best', 4),

-- bob_bookworm History & Biography
(6, 3, 'Fascinating history', 1),
(6, 4, 'Inspiring memoir', 2),

-- bob_bookworm Mystery Corner
(7, 7, 'Classic mystery', 1),

-- charlie_lit Classic Literature
(8, 6, 'Austen at her best', 1),
(8, 11, 'Jazz Age classic', 2),
(8, 12, 'American classic', 3);

SELECT 'List items inserted' AS Status;

-- ==========================================
-- INSERT READING PROGRESS
-- ==========================================

INSERT INTO ReadingProgress (user_id, book_id, status, current_page, start_date, finish_date, completion_percent, reading_speed) VALUES
-- demo_user
(1, 3, 'Reading', 150, '2026-03-01', NULL, 33.86, 7.5),
(1, 1, 'Finished', 328, '2026-02-01', '2026-02-28', 100.00, 11.71),
(1, 6, 'Want to Read', 0, NULL, NULL, 0.00, NULL),
(1, 11, 'Finished', 180, '2026-01-10', '2026-01-22', 100.00, 15.00),

-- alice_reads
(2, 2, 'Reading', 200, '2026-03-10', NULL, 64.72, 20.0),
(2, 9, 'Finished', 288, '2026-02-15', '2026-03-05', 100.00, 15.16),
(2, 8, 'Want to Read', 0, NULL, NULL, 0.00, NULL),
(2, 13, 'Finished', 417, '2026-01-15', '2026-02-10', 100.00, 16.04),

-- bob_bookworm
(3, 4, 'Reading', 100, '2026-03-15', NULL, 23.47, 5.0),
(3, 3, 'Finished', 443, '2026-01-05', '2026-02-20', 100.00, 9.63),
(3, 7, 'Want to Read', 0, NULL, NULL, 0.00, NULL),

-- charlie_lit
(4, 6, 'Finished', 432, '2026-02-01', '2026-02-25', 100.00, 18.00),
(4, 12, 'Reading', 180, '2026-03-05', NULL, 55.56, 12.00),
(4, 11, 'Want to Read', 0, NULL, NULL, 0.00, NULL);

SELECT 'Reading progress inserted' AS Status;

-- ==========================================
-- INSERT REVIEWS
-- ==========================================

INSERT INTO Review (user_id, book_id, rating, review_text, likes_count) VALUES
(1, 1, 5, 'Absolutely brilliant! A must-read classic that remains relevant today. Orwell''s vision is chilling.', 15),
(1, 11, 4, 'Beautiful prose and a tragic story. Fitzgerald captures the Jazz Age perfectly.', 8),
(2, 2, 5, 'Magical from start to finish. Perfect for all ages! The world-building is incredible.', 23),
(2, 9, 4, 'Hilarious and clever. Great collaboration between two masters. The apocalypse has never been funnier!', 12),
(2, 13, 5, 'Magical realism at its finest. García Márquez is a genius. This book changed how I see literature.', 18),
(3, 3, 5, 'Eye-opening perspective on human history. Highly recommended! Makes you think about our species differently.', 20),
(4, 6, 5, 'Timeless romance with wit and social commentary. Austen never gets old.', 10),
(4, 12, 5, 'Powerful and moving. An American classic that everyone should read.', 16);

SELECT 'Reviews inserted' AS Status;

-- ==========================================
-- INSERT GOAL MILESTONES
-- ==========================================

INSERT INTO GoalMilestone (goal_id, milestone_date, books_completed, pages_read, percent_complete, days_remaining, pace_status) VALUES
-- demo_user's 2026 goal milestones
(1, '2026-01-31', 4, 1250, 7.69, 335, 'On Track'),
(1, '2026-02-28', 8, 2890, 15.38, 306, 'Ahead'),
(1, '2026-03-19', 10, 3740, 19.23, 287, 'On Track'),

-- alice_reads milestones
(2, '2026-01-31', 2, 680, 6.67, 335, 'On Track'),
(2, '2026-02-28', 5, 1890, 16.67, 306, 'Ahead'),

-- bob_bookworm milestones
(3, '2026-01-31', 1, 443, 4.17, 335, 'Behind'),
(3, '2026-02-28', 2, 890, 8.33, 306, 'Behind');

SELECT 'Goal milestones inserted' AS Status;

-- ==========================================
-- INSERT READING STATISTICS
-- ==========================================

INSERT INTO ReadingStatistics (user_id, period, books_read, pages_read, avg_rating_given, most_read_genre, avg_book_length, reading_streak_days) VALUES
-- January 2026 stats
(1, '2026-01', 4, 1250, 4.75, 'Fiction', 312, 21),
(2, '2026-01', 2, 680, 5.00, 'Fantasy', 340, 18),
(3, '2026-01', 1, 443, 5.00, 'Non-Fiction', 443, 15),

-- February 2026 stats
(1, '2026-02', 4, 1640, 5.00, 'Fiction', 410, 28),
(2, '2026-02', 3, 1210, 4.67, 'Fantasy', 403, 25),
(3, '2026-02', 1, 447, 5.00, 'Non-Fiction', 447, 10);

SELECT 'Reading statistics inserted' AS Status;

-- ==========================================
-- FINAL VERIFICATION
-- ==========================================

-- Display summary
SELECT 'Sample data insertion complete!' AS Status;
SELECT '' AS '';
SELECT 'Summary of Inserted Data:' AS '';
SELECT '=========================' AS '';
SELECT CONCAT(COUNT(*), ' Reading Goals') AS '' FROM ReadingGoal;
SELECT CONCAT(COUNT(*), ' Reading Lists') AS '' FROM ReadingList;
SELECT CONCAT(COUNT(*), ' List Items') AS '' FROM ListItem;
SELECT CONCAT(COUNT(*), ' Reading Progress Records') AS '' FROM ReadingProgress;
SELECT CONCAT(COUNT(*), ' Reviews') AS '' FROM Review;
SELECT CONCAT(COUNT(*), ' Goal Milestones') AS '' FROM GoalMilestone;
SELECT CONCAT(COUNT(*), ' Statistics Records') AS '' FROM ReadingStatistics;
