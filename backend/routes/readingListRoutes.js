//ReadingList routes for CRUD functions with express js -Mati Sawadogo
const db = require("../db");
const express = require("express")
const router = express.Router()

//getting user's reading lists
router.get("/user/:user_id", async (req, res) => {
    const {user_id} = req.params 

    //displays all user's reading lists
    try {
        const [lists] = await db.query (
            `SELECT list_id, name, description, created_date, is_public 
             FROM ReadingList
             WHERE user_id = ?
             ORDER BY created_date DESC`, [user_id]
        );

        res.json(lists);

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Failed to fetch reading lists"});
    }
});

//getting reading list details
router.get("/:list_id", async (req, res) => {
    const {list_id} = req.params;

    //when user clicks on a reading list they get the details and contents of the list
    try {
        const [[list]] = await db. query (
            `SELECT list_id, name, description, created_date, is_public 
             FROM ReadingList
             WHERE list_id = ?`, [list_id]
        );

        if (!list) {
            return res.status(404).json({error: "List not found"});
        }

        //get books in a reading list
        const [books] = await db.query (
            `SELECT b.book_id, b.title, b.cover_image_url, b.page_count,  l.date_added, l.notes, l.priority, a.name AS author
             FROM ListItem l
             JOIN Book b ON l.book_id = b.book_id
             LEFT JOIN BookAuthor ba ON b.book_id = ba.book_id
             LEFT JOIN Author a ON ba.author_id = a.author_id
             WHERE l.list_id = ?
             ORDER BY l.date_added DESC`, [list_id]
        );

        res.json({...list, books});

    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Failed to fetch list"});
    }
});

//creating a reading list
router.post("/create", async (req, res) => {
    const {user_id, name, description, is_public} = req.body;

    if (!user_id || !name) {
        return res.status(400).json({error: "user_id and name missing"});
    }

    try {
        const [result] = await db.query(
            `INSERT INTO ReadingList (user_id, name, description, is_public)
             VALUES (?, ?, ?, ?)`, [user_id, name, description || null, is_public || false]
        );

        res.status(201).json({message: "Reading list created!", list_id: result.insertId});

    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Failed to create reading list"});
    }
});

//add book to reading list
router.post("/add-book", async (req, res) => {
    const {list_id, book_id, notes, priority} = req.body;

    if (!list_id || !book_id) {
        return res.status(400).json({error: "list_id and book_id missing"});
    }

    try {
        const [result] = await db.query(
            `INSERT INTO ListItem (list_id, book_id, notes, priority)
             VALUES (?, ?, ?, ?)`, [list_id, book_id, notes || null, priority || 0]
        );

        res.status(201).json({message: "Book added to reading list!", list_id: result.insertId});

    } catch (error) {

        //check duplicates
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({error: "This book is already in this list."});
        }

        console.error(error);
        return res.status(500).json({error: "Failed to add book to reading list."});
    }
});


//delete book from reading list
router.delete("/delete-book", async (req, res) => {
    const {list_id, book_id} = req.body;

    if (!list_id || !book_id) {
        return res.status(400).json({error: "list_id and book_id missing"});
    }

    try {
        await db.query(
            `DELETE FROM ListItem 
             WHERE list_id = ? AND book_id = ? `, [list_id, book_id]
        );

        res.status(201).json({message: "Book deleted from reading list!"});

    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Failed to add book to reading list."});
    }
});

//delete reading list
router.delete("/delete/:list_id", async (req, res) => {
    const {list_id} = req.params;

    try {
        await db.query(
            `DELETE FROM ReadingList 
             WHERE list_id = ?`, [list_id]
        );
        res.status(201).json({message: "Reading list removed successfully!"});

    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Failed to delete reading list."});
    }
});


module.exports = router;