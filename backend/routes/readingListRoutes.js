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
            `SELECT b.book_id, b.title, b.cover_image_url, b.page_count, l.date_added, l.notes, l.priority, a.name AS author
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

//add book to reading list + add book to database
router.post("/add-book", async (req, res) => {
    const {list_id, book, details, notes, priority} = req.body;

    if (!list_id || !book) {
        return res.status(400).json({error: "list_id and book data missing"});
    }

    //check if book is in our database
    try{
        let [existingBook] = await db.query (
            `SELECT book_id 
             FROM Book
            WHERE isbn = ?`, [details.isbn]
        );

        let book_id;

        //if book from api isnt in our database and user wants to have it in their reading list, add the book to our database
        if (existingBook.length === 0) {
            const [insertBook] = await db.query (
                `INSERT INTO Book (isbn, title, publication_year, genre, page_count, description, cover_image_url, language, publisher)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                 [  details.isbn, 
                    book.title, 
                    book.first_publish_year || null, 
                    details.genre?.split(",")[0] || "Unknown", 
                    details.page_count || 1, 
                    details.description || null, 
                    `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`,
                    "English",
                    details.publisher || null]
            );
            //use existing book
            book_id = insertBook.insertId;

        } else {
            book_id = existingBook[0].book_id;
        }

        //insert the book's author info into our database
        const name = book.author_name?.[0] || "Unknown";

        //check if author is already in our database
        let [existingAuthor] = await db.query (
            `SELECT author_id
             FROM Author
             WHERE name = ?`, [name]
        );

        let author_id;

        //add author to the database
        if (existingAuthor.length === 0) {
            const [insertAuthor] = await db.query(
                `INSERT INTO Author (name) VALUES (?)`, [name]
            );
            
            author_id = insertAuthor.insertId;

        } else { //use existing author
            author_id = existingAuthor[0].author_id;
        }

        //add to BookAuthor table
        await db.query (
            `INSERT IGNORE INTO BookAuthor (book_id, author_id)
             VALUES (?, ?)`, [book_id,author_id]
        );
        
        //add book to ListItem table
        await db.query(
            `INSERT INTO ListItem (list_id, book_id, notes, priority)
             VALUES (?, ?, ?, ?)`, [list_id, book_id, notes || null, priority || 0]
        );

        res.json({message: "Book added to reading list!", book_id});

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
        return res.status(500).json({error: "Failed to delete book to reading list."});
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