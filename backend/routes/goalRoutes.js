//Reading goals routes with express js -Mati Sawadogo
const db = require("../db");
const express = require("express")
const router = express.Router()


//create and update goal
router.post("/", async (req, res) => {
    const {user_id, year, target_books, target_pages} = req.body;

    if (!user_id || !year) {
        return res.status(400).json({error: "user_id and year missing."})
    }

    try {
        await db.query (
            `INSERT INTO ReadingGoal (user_id, year, target_books, target_pages, start_date, end_date)
             VALUES (?, ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR))
             ON DUPLICATE KEY UPDATE
                target_books = VALUES(target_books),
                target_pages = VALUES(target_pages),
                is_active = TRUE`, [user_id, year, target_books || 0, target_pages || 0]
        );

        res.json({message: "Goal saved!"})

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to save goal."});
    }
});


//get reading goal
router.get("/:user_id", async (req, res) => {
    const {user_id} = req.params;

    try {
        const [rows] = await db.query (
            `SELECT *
             FROM ReadingGoal
             WHERE user_id = ?
             ORDER BY year DESC`, [user_id]
        );

        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to get goals."});
    }
});

module.exports = router;