//Reading statistics routes with express js -Mati Sawadogo
const db = require("../db");
const express = require("express")
const router = express.Router()


//get user reading statistics
router.get("/:user_id", async (req, res) => {
    const {user_id} = req.params;

    try {
        //im stumped here ngl
        const [stats] = await db.query (
            `SELECT
                COUNT(CASE WHEN rp.status = 'Finished' THEN 1 END) AS books_read,
                COALESCE(SUM(CASE WHEN rp.status = 'Finished' THEN b.page_count END), 0) AS pages_read,
                ROUND(AVG(r.rating), 2) AS avg_rating_given,
                ROUND(AVG(CASE WHEN rp.status = 'Finished' THEN b.page_count END), 0) AS avg_book_length
             FROM ReadingProgress rp
             LEFT JOIN Book b ON rp.book_id = b.book_id
             LEFT JOIN Review r ON r.user_id = rp.user_id AND r.book_id = rp.book_id
             WHERE rp.user_id = ?`, [user_id]
        );

        // Most read genre
        const [[genreResult]] = await db.query(
            `SELECT b.genre
             FROM ReadingProgress rp
             JOIN Book b ON rp.book_id = b.book_id
             WHERE rp.user_id = ? AND rp.status = 'Finished'
             GROUP BY b.genre
             ORDER BY COUNT(*) DESC
             LIMIT 1`,
             [user_id]
        );

        // Reading streak
        const [[streakResult]] = await db.query(
            `SELECT MAX(streak_days) AS reading_streak_days
             FROM (
                SELECT 
                    COUNT(*) AS streak_days
                FROM (
                    SELECT 
                        DATE(start_date) AS reading_date,
                        @streak := IF(@prev_date = DATE_SUB(DATE(start_date), INTERVAL 1 DAY), 
                                      @streak + 1, 1) AS streak,
                        @prev_date := DATE(start_date)
                    FROM ReadingProgress
                    CROSS JOIN (SELECT @streak := 0, @prev_date := NULL) vars
                    WHERE user_id = ? AND start_date IS NOT NULL
                    ORDER BY start_date
                ) streaks
                GROUP BY streak
             ) max_streaks`,
            [user_id]
        );

        // Get fastest and slowest book completion times
        const [[speedResult]] = await db.query(
            `SELECT
                MIN(DATEDIFF(finish_date, start_date)) AS fastest_book_days,
                MAX(DATEDIFF(finish_date, start_date)) AS slowest_book_days
             FROM ReadingProgress
             WHERE user_id = ? 
               AND status = 'Finished' 
               AND finish_date IS NOT NULL 
               AND start_date IS NOT NULL
               AND DATEDIFF(finish_date, start_date) > 0`,
            [user_id]
        );

        // Combine all results
        const finalStats = {
            books_read: stats?.books_read || 0,
            pages_read: stats?.pages_read || 0,
            avg_rating_given: stats?.avg_rating_given || null,
            most_read_genre: genreResult?.genre || null,
            avg_book_length: stats?.avg_book_length || null,
            reading_streak_days: streakResult?.reading_streak_days || 0,
            fastest_book_days: speedResult?.fastest_book_days || null,
            slowest_book_days: speedResult?.slowest_book_days || null
        };

        res.json(finalStats);

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to get statistics."});
    }
});

module.exports = router;