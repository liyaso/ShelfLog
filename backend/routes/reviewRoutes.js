//Review routes for CRUD functions with express js -Mati Sawadogo
const db = require("../db");
const express = require("express")
const router = express.Router()


//updating avg_rating in Book table
async function updateBookRating(book_id) {
    const [rows] = await db.query (
        `SELECT AVG(rating) AS avgRating
         FROM Review
         WHERE book_id = ?`, [book_id]
    );

    const avg = rows[0].avgRating || 0;

    await db.query (
        `UPDATE Book
         SET average_rating = ?
         WHERE book_id = ?`, [avg, book_id]
    );
}


//add and update review
router.post("/add", async (req, res) => {
    const {user_id, book_id, rating, review_text} = req.body;

    if (!user_id || !book_id || !rating) {
        return res.status(400).json({error: "user_id, book_id, and rating missing."})
    }

    try {
        //add review and update each time
        await db.query (
            `INSERT INTO Review (user_id, book_id, rating, review_text)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                rating = VALUES(rating),
                review_text = VALUES(review_text),
                date_posted = CURRENT_TIMESTAMP`, [user_id, book_id, rating, review_text || null]
        );

        //update book avg rating in Book table
        await updateBookRating(book_id);

        res.json({message: "Review saved successfullly!"});

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to add review."});
    }
});


//get book reviews
router.get("/:book_id", async (req, res) => {
    const {book_id} = req.params;

    try {
        const [reviews] = await db.query (
            `SELECT r.review_id, r.rating, r.review_text, r.date_posted r.likes_count, u.username
             FROM Review r
             JOIN User u ON r.user_id = u.user_id
             WHERE r.book_id = ?
             ORDER BY r.date_posted DESC`, [book_id]
        );

        res.json(reviews);

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to get reviews."});
    }
});


//add like to review 
router.post("/like", async (req, res) => {
    const {review_id} = req.body;

    if (!review_id) {
        return res.status(400).json({error: "review_id missing."})
    }

    try {
        await db.query (
            `UPDATE Review
             SET likes_count = likes_count + 1
             WHERE review_id = ?`, [review_id]
        );

        //get updated like count
        const [rows] = await db.query (
            `SELECT likes_count
             FROM Review
             WHERE review_id =?`, [review_id]
        )

        res.json({message: "Review liked!", likes_count : rows[0].likes_count});

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to like reviews."});
    }
});


//unlike review
router.delete("/unlike", async (req, res) => {
    const {review_id} = req.body;

    if (!review_id) {
        return res.status(400).json({error: "review_id missing."})
    }

    try {
        await db.query (
            `UPDATE Review
             SET likes_count = likes_count - 1
             WHERE review_id = ?`, [review_id]
        );

        res.json({message: "Review unliked!"});

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to unlike reviews."});
    }
});

module.exports = router;