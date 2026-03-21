-- ShelfLog Views Creation Script: Creates views for commonly used queries

USE shelflog_db;

-- View 1: Complete book information with authors and review count
CREATE VIEW v_books_complete AS
SELECT 
    b.book_id,
    b.title,
    b.isbn,
    b.publication_year,
    b.genre,
    b.sub_genre,
    b.page_count,
    b.description,
    b.language,
    b.publisher,
    b.average_rating,
    b.cover_image_url,
    GROUP_CONCAT(a.name ORDER BY ba.author_order SEPARATOR ', ') as authors,
    COUNT(DISTINCT r.review_id) as review_count
FROM Book b
LEFT JOIN BookAuthor ba ON b.book_id = ba.book_id
LEFT JOIN Author a ON ba.author_id = a.author_id
LEFT JOIN Review r ON b.book_id = r.book_id
GROUP BY b.book_id;

-- View 2: User dashboard summary with reading statistics
CREATE VIEW v_user_dashboard AS
SELECT 
    u.user_id,
    u.username,
    u.email,
    u.join_date,
    COUNT(DISTINCT CASE WHEN rp.status = 'Finished' THEN rp.book_id END) as books_finished,
    COUNT(DISTINCT CASE WHEN rp.status = 'Reading' THEN rp.book_id END) as currently_reading,
    COUNT(DISTINCT CASE WHEN rp.status = 'Want to Read' THEN rp.book_id END) as want_to_read,
    COUNT(DISTINCT rl.list_id) as lists_count,
    COUNT(DISTINCT r.review_id) as reviews_written,
    COUNT(DISTINCT CASE WHEN rg.is_active = TRUE THEN rg.goal_id END) as active_goals
FROM User u
LEFT JOIN ReadingProgress rp ON u.user_id = rp.user_id
LEFT JOIN ReadingList rl ON u.user_id = rl.user_id
LEFT JOIN Review r ON u.user_id = r.user_id
LEFT JOIN ReadingGoal rg ON u.user_id = rg.user_id
GROUP BY u.user_id, u.username, u.email, u.join_date;

-- View 3: Active reading goals with current progress
CREATE VIEW v_active_goals AS
SELECT 
    g.goal_id,
    u.user_id,
    u.username,
    g.year,
    g.target_books,
    g.target_pages,
    g.start_date,
    g.end_date,
    COUNT(rp.progress_id) as books_completed,
    COALESCE(SUM(b.page_count), 0) as pages_read,
    ROUND((COUNT(rp.progress_id) * 100.0 / NULLIF(g.target_books, 0)), 2) as book_progress_percent,
    ROUND((COALESCE(SUM(b.page_count), 0) * 100.0 / NULLIF(g.target_pages, 0)), 2) as page_progress_percent,
    DATEDIFF(g.end_date, CURDATE()) as days_remaining
FROM ReadingGoal g
JOIN User u ON g.user_id = u.user_id
LEFT JOIN ReadingProgress rp ON u.user_id = rp.user_id 
    AND rp.status = 'Finished'
    AND rp.finish_date BETWEEN g.start_date AND g.end_date
LEFT JOIN Book b ON rp.book_id = b.book_id
WHERE g.is_active = TRUE
GROUP BY g.goal_id, u.user_id, u.username, g.year, g.target_books, 
         g.target_pages, g.start_date, g.end_date;


-- Show all created views
SHOW FULL TABLES WHERE Table_type = 'VIEW';

-- Display success message
SELECT 'All 3 views created successfully!' AS Status;
SELECT 'Views: v_books_complete, v_user_dashboard, v_active_goals' AS Views_Created;
