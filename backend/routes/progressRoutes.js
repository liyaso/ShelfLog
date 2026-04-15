//Progress routes with express js -Mati Sawadogo
const db = require("../db");
const express = require("express")
const router = express.Router()

//create and update progress
router.post("/", async (req, res) => {
    const {user_id, book_id, status, current_page} = req.body;

    if (!user_id || !book_id || !status) {
        return res.status(400).json({error: "user_id, book_id, and status missing."})
    }

    try {
        await db.query (
            `INSERT INTO ReadingProgress (user_id, book_id, status, current_page, start_date, finish_date)
             VALUES (?, ?, ?, ?, CURDATE(), ?)
             ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                current_page = VALUES(current_page),
                finish_date = VALUES(finish_date)`, [user_id, book_id, status, current_page || 0]
        );

        res.json({message: "Reading progress saved!"})

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to save progress."});
    }
});


//get reading progress
router.get("/:user_id", async (req, res) => {
    const {user_id} = req.params;

    try {
        const [rows] = await db.query (
            `SELECT rp.progress_id, rp.book_id, rp.status, rp.current_page, rp.start_date, rp.finish_date, b.title, b.cover_image_url, b.page_count, 
            ROUND((rp.current_page * 100.0) / b.page_count, 2) AS completion_percent, 
            CASE 
                WHEN rp.start_date IS NULL THEN NULL
                WHEN rp.finish_date IS NOT NULL THEN 
                    rp.current_page / DATEDIFF(rp.finish_date, rp.start_date)
                ELSE 
                rp.current_page / DATEDIFF(CURDATE(), rp.start_date) END as reading_speed
             FROM ReadingProgress rp
             JOIN Book b ON rp.book_id = b.book_id
             WHERE rp.user_id = ?
             ORDER BY rp.start_date DESC`, [user_id]
        );

        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to get progress."});
    }
});

module.exports = router;