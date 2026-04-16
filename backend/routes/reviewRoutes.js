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
            `SELECT r.review_id, r.rating, r.review_text, r.date_posted, r.likes_count, u.username
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


// get user review of book
router.get("/user/:user_id", async (req, res) => {
    const { user_id } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT r.book_id, b.title, b.cover_image_url, a.name AS author, r.rating, r.review_text
            FROM Review r
            JOIN Book b ON r.book_id = b.book_id
            LEFT JOIN BookAuthor ba ON b.book_id = ba.book_id
            LEFT JOIN Author a ON ba.author_id = a.author_id
            WHERE r.user_id = ?`, [user_id]);

        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch user reviews." });
    }
});

//delete review
router.delete("/delete", async (req, res) => {
    const { user_id, book_id } = req.body;

    if (!user_id || !book_id) {
        return res.status(400).json({ error: "user_id and book_id are required." });
    }

    try {
        const [result] = await db.query(
            `DELETE FROM Review
             WHERE user_id = ? AND book_id = ?`,
            [user_id, book_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Review not found." });
        }

        // update avg rating after delete
        await updateBookRating(book_id);

        res.json({ message: "Review deleted successfully." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete review." });
    }
});


//get book avg_rating by isbn
router.get("/rating/:isbn", async (req, res) => {
    const { isbn } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT average_rating FROM Book WHERE isbn = ?`, [isbn]
        );

        if (rows.length === 0) {
            return res.json({ average_rating: 0 });
        }

        res.json({ average_rating: rows[0].average_rating });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch rating" });
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