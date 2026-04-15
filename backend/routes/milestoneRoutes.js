//Goal milestone routes with express js -Mati Sawadogo
const db = require("../db");
const express = require("express")
const router = express.Router()


//create and update goal
router.post("/milestone/:goal_id", async (req, res) => {
    const {goal_id} = req.body;

    try {
        //get goal
        const [[goal]] = await db.query (
            `SELECT * 
             FROM ReadingGoal
             WHERE goal_id = ?`, [goal_id]
        )

        const [[stats]] = await db.query (
            `SELECT
                COUNT(CASE WHEN status = 'Finished' THEN 1 END) AS book_completed,
                SUM(current_page) AS pages_read
            FROM ReadingProgress
            WHERE user_id = ?`, [goal.user_id]
        );

        const books_completed = stats.books_completed || 0;
        const pages_read = stats.pages_read || 0;

        const percent = goal.target_pages
        ? (pages_read / goal.target_pages) * 100
        : 0;

        //pace status
        const today = new Date();
        const end = new Date(goal.end_date);
        const days_left = Math.max((end - today) / (1000 * 60 * 60 * 24), 1);

        const pace_status = 
            percent >= 100 ? "Ahead" :
            percent >= 70 ? "On Track" : "Behind";

        //not sure how to get predicted completion
        await db.query (
            `INSERT INTO GoalMilestone (goal_id, books_completed, pages_read, percent_complete, days_remaining, pace_status)
            VALUES (?, CURDATE(), ?, ?, ?, ?, ?)`, [goal_id, books_completed, pages_read, percent, days_left, pace_status]
        )

        res.json({message: "Milestone created!"})

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to create milestone."});
    }
});


//get reading goal
router.get("/:goal_id", async (req, res) => {
    const {goal_id} = req.params;

    try {
        const [rows] = await db.query (
            `SELECT *
             FROM GoalMilestone
             WHERE goal_id = ?
             ORDER BY milestone_date DESC`, [goal_id]
        );

        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to get milestones."});
    }
});

module.exports = router;