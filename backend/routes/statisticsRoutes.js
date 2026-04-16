const express = require("express");
const router = express.Router();
const db = require("../db");

// GET user reading statistics
router.get("/:user_id", async (req, res) => {
    const { user_id } = req.params;

    try {
        const [stats] = await db.query (
            `SELECT
                COUNT(CASE WHEN status = 'Finished' THEN 1 END) AS books_read,
                SUM(CASE WHEN rp.status = 'Finished' THEN b.page_count END) AS pages_read,
                AVG(r.rating) AS avg_rating_given,
                (SELECT b2.genre
                 FROM ReadingProgress rp2
                 JOIN Book b2 ON rp2.book_id = b2.book_id
                 WHERE rp2.user_id = ?
                 GROUP BY b2.genre
                 ORDER BY COUNT(*) DESC
                 LIMIT 1) AS most_read_genre
             FROM ReadingProgress rp
             JOIN Book b ON rp.book_id = b.book_id
             LEFT JOIN Review r ON r.user_id = rp.user_id AND r.book_id = rp.book_id
             WHERE rp.user_id = ?`,
            [user_id, user_id]
        );

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get statistics." });
    }
});

module.exports = router;
