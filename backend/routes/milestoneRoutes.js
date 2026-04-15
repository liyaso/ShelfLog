//Goal milestone routes with express js -Mati Sawadogo
const db = require("../db");
const express = require("express")
const router = express.Router()


//create and update goal
router.post("/milestone/:goal_id", async (req, res) => {
    const {goal_id} = req.params;

    try {
        //get goal
        const [[goal]] = await db.query (
            `SELECT * 
             FROM ReadingGoal
             WHERE goal_id = ?`, [goal_id]
        );

        if(!goal){
            return res.status(404).json({error: "Goal not found"});
        }

        const [[stats]] = await db.query (
            `SELECT
                COUNT(CASE WHEN status = 'Finished' THEN 1 END) AS book_completed,
                COALESCE(SUM(b.page_count), 0) AS pages_read
            FROM ReadingProgress rp
            LEFT JOIN Book b ON rp.book_id = b.book_id
            WHERE rp.user_id = ?
                AND rp.status = 'Finished;
                AND rp.finish_date BETWEEN ? AND ?`,
            [goal.user_id, goal.start_date, goal.end_date]
        );

        const books_completed = stats?.books_completed || 0;
        const pages_read = stats?.pages_read || 0;

        const book_percent = goal.target_pages > 0
        ? (pages_read / goal.target_pages) * 100
        : 0;

        const page_percent = goal.target_pages > 0
        ? (pages_read / goal.target_pages) * 100
        : 0;

        const percent_complete = Math.max(book_percent, page_percent);

        //pace status
        const today = new Date();
        const end = new Date(goal.end_date);
        const start = new Date(goal.start_date);
        const days_left = Math.max(Math.ceil((end - today) / (1000 * 60 * 60 * 24)), 0);

        //calculate predicted completion date
        let predicted_completion = null;
        const days_elapsed = Math.max(Math.ceil((today - start) / (1000 * 60 * 60 * 24)), 1);
        
        if(books_completed > 0 && days_elapsed > 0){
            // Books per day so far
            const rate = books_completed / days_elapsed;
            
            // Days needed to complete remaining books
            const books_remaining = goal.target_books - books_completed;
            const days_needed = books_remaining / rate;
            
            // Predicted completion date
            const predicted = new Date(today);
            predicted.setDate(predicted.getDate() + Math.ceil(days_needed));
            predicted_completion = predicted.toISOString().split('T')[0];
        }

        //determine pace status
        let pace_status = 'On Track';
        if(percent_complete >= 100){
            pace_status = 'Ahead';
        } 
        else{
            // Expected percent at this point in time
            const total_days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            const expected_percent = (days_elapsed / total_days) * 100;
            
            if(percent_complete >= expected_percent + 10){
                pace_status = 'Ahead';
            } 
            else if(percent_complete < expected_percent - 10){
                pace_status = 'Behind';
            }
        }

        //insert milestone
        await db.query(
            `INSERT INTO GoalMilestone 
             (goal_id, milestone_date, books_completed, pages_read, 
              percent_complete, days_remaining, pace_status, predicted_completion)
             VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?)`,
            [goal_id, books_completed, pages_read, percent_complete.toFixed(2), 
             days_remaining, pace_status, predicted_completion]
        );

        res.json({message: "Milestone created!",
            milestone: {
                books_completed,
                pages_read,
                percent_complete: percent_complete.toFixed(2),
                days_remaining,
                pace_status,
                predicted_completion
            }
        });

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