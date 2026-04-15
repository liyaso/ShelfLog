router.get("/:user_id", async (req, res) => {
    const { user_id } = req.params;

    try {
        const [stats] = await db.query(
            `SELECT
                -- Books finished this month
                COUNT(CASE 
                    WHEN rp.status = 'Finished' 
                    AND MONTH(rp.date_finished) = MONTH(CURDATE())
                    AND YEAR(rp.date_finished) = YEAR(CURDATE())
                THEN 1 END) AS books_read_month,

                -- Total books read
                COUNT(CASE WHEN rp.status = 'Finished' THEN 1 END) AS total_books_read,

                -- Books read this year
                COUNT(CASE 
                    WHEN rp.status = 'Finished'
                    AND YEAR(rp.date_finished) = YEAR(CURDATE())
                THEN 1 END) AS books_read_year,

                -- Most read genre
                (
                    SELECT b2.genre
                    FROM ReadingProgress rp2
                    JOIN Book b2 ON rp2.book_id = b2.book_id
                    WHERE rp2.user_id = rp.user_id
                    AND rp2.status = 'Finished'
                    GROUP BY b2.genre
                    ORDER BY COUNT(*) DESC
                    LIMIT 1
                ) AS most_read_genre,

                -- Most read author
                (
                    SELECT b2.author
                    FROM ReadingProgress rp2
                    JOIN Book b2 ON rp2.book_id = b2.book_id
                    WHERE rp2.user_id = rp.user_id
                    AND rp2.status = 'Finished'
                    GROUP BY b2.author
                    ORDER BY COUNT(*) DESC
                    LIMIT 1
                ) AS most_read_author,

                -- Average rating
                AVG(r.rating) AS avg_rating_given

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
