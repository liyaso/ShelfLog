-- ShelfLog Book-Author Linking Script: Links books to their authors

USE shelflog_db;

-- Link books to authors
-- Note: book_id and author_id must match the auto-generated IDs from previous inserts
-- Assuming books and authors were inserted in order

INSERT INTO BookAuthor (book_id, author_id, author_order) VALUES
-- 1984 by George Orwell
(1, 1, 1),

-- Harry Potter by J.K. Rowling
(2, 2, 1),

-- A Christmas Carol by Charles Dickens
(3, 3, 1),

-- Becoming by Michelle Obama
(4, 4, 1),

-- The Institute by Stephen King
(5, 5, 1),

-- Pride and Prejudice by Jane Austen
(6, 6, 1),

-- And Then There Were None by Agatha Christie
(7, 7, 1),

-- The Graveyard Book by Neil Gaiman
(8, 8, 1),

-- Good Omens by Terry Pratchett and Neil Gaiman
(9, 9, 1),  -- Terry Pratchett (first author)
(9, 8, 2),  -- Neil Gaiman (second author)

-- The Adeventures of Tom Sawyer by Mark Twain
(10, 10, 1),

-- The Great Gatsby by F. Scott Fitzgerald
(11, 11, 1),

-- To Kill a Mockingbird by Harper Lee
(12, 12, 1),

-- One Hundred Years of Solitude by Gabriel García Márquez
(13, 13, 1),

-- The Handmaid's Tale by Margaret Atwood
(14, 14, 1),

-- The Alchemist by Paulo Coelho
(15, 15, 1);

-- Verify linking
SELECT COUNT(*) as 'Book-Author Links Created' FROM BookAuthor;

-- Show books with their authors
SELECT 
    b.title,
    GROUP_CONCAT(a.name ORDER BY ba.author_order SEPARATOR ', ') as authors
FROM Book b
JOIN BookAuthor ba ON b.book_id = ba.book_id
JOIN Author a ON ba.author_id = a.author_id
GROUP BY b.book_id, b.title
ORDER BY b.title;

-- Display success message
SELECT 'Books successfully linked to authors!' AS Status;
