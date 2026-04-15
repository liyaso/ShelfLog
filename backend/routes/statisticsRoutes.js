const express = require("express");
const router = express.Router();
const db = require("../db");

// GET user reading statistics
router.get("/:user_id", async (req, res) => {
    const { user_id } = req.params;

    try {
        const [stats] = await db.query(
            `SELECT
                COUNT(CASE WHEN status = 'Finished' THEN 1 END) AS books_read,
                SUM(b.page_count) AS pages_read,
                AVG(r.rating) AS avg_rating_given,
                MAX(b.genre) AS most_read_genre
             FROM ReadingProgress rp
             JOIN Book b ON rp.book_id = b.book_id
             LEFT JOIN Review r ON r.user_id = rp.user_id AND r.book_id = rp.book_id
             WHERE rp.user_id = ?`,
            [user_id]
        );

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get statistics." });
    }
});

module.exports = router;
