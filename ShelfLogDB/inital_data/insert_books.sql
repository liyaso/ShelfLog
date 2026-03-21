-- ==========================================
-- ShelfLog Book Data Insert Script
-- ==========================================
-- Purpose: Inserts sample books for testing
-- Author: Liya (Database Lead)
-- Date: March 2026
-- Version: 1.0
-- ==========================================

USE shelflog_db;

-- Insert sample books
INSERT INTO Book (isbn, title, publication_year, genre, sub_genre, page_count, description, language, publisher) VALUES
('9780451524935', '1984', 1949, 'Fiction', 'Dystopian', 328, 
 'A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism, government surveillance, and repressive regimentation.', 
 'English', 'Signet Classic'),

('9780439708180', 'Harry Potter and the Sorcerer''s Stone', 1997, 'Fantasy', 'Young Adult', 309,
 'The first novel in the Harry Potter series follows Harry Potter, a young wizard who discovers his magical heritage on his eleventh birthday.', 
 'English', 'Scholastic'),

('9780062316097', 'Sapiens: A Brief History of Humankind', 2011, 'Non-Fiction', 'History', 443,
 'Explores the history and impact of Homo sapiens from the Stone Age to the twenty-first century.', 
 'English', 'Harper'),

('9781524763138', 'Becoming', 2018, 'Non-Fiction', 'Memoir', 426,
 'A memoir by former First Lady of the United States Michelle Obama, published in 2018.', 
 'English', 'Crown'),

('9781501142970', 'The Institute', 2019, 'Fiction', 'Thriller', 576,
 'A science fiction-horror hybrid thriller by Stephen King about children with special talents held captive.', 
 'English', 'Scribner'),

('9780141439518', 'Pride and Prejudice', 1813, 'Fiction', 'Romance', 432,
 'A romantic novel of manners that follows the character development of Elizabeth Bennet, the protagonist.', 
 'English', 'Penguin Classics'),

('9780062073488', 'And Then There Were None', 1939, 'Fiction', 'Mystery', 272,
 'A mystery novel and the world''s best-selling mystery, about ten strangers invited to an isolated island.', 
 'English', 'William Morrow'),

('9780062255655', 'The Graveyard Book', 2008, 'Fantasy', 'Young Adult', 312,
 'A young boy raised by ghosts and other denizens of the graveyard after his family is murdered.', 
 'English', 'HarperCollins'),

('9780062225672', 'Good Omens', 1990, 'Fantasy', 'Comedy', 288,
 'A comedic apocalyptic novel about the birth of the son of Satan and the coming of the End Times.', 
 'English', 'William Morrow'),

('9781400033416', 'Beloved', 1987, 'Fiction', 'Literary', 324,
 'A Pulitzer Prize-winning novel examining the destructive legacy of slavery.', 
 'English', 'Knopf'),

('9780743273565', 'The Great Gatsby', 1925, 'Fiction', 'Classic', 180,
 'A novel set in the Jazz Age on Long Island, near New York City, chronicling the tragic story of self-made millionaire Jay Gatsby.', 
 'English', 'Scribner'),

('9780060935467', 'To Kill a Mockingbird', 1960, 'Fiction', 'Classic', 324,
 'A novel about racial injustice and the destruction of innocence, set in the American South during the 1930s.', 
 'English', 'Harper Perennial'),

('9780060883287', 'One Hundred Years of Solitude', 1967, 'Fiction', 'Magical Realism', 417,
 'A multi-generational story of the Buendía family, whose patriarch founded the fictional town of Macondo.', 
 'English', 'Harper Perennial'),

('9780385490818', 'The Handmaid''s Tale', 1985, 'Fiction', 'Dystopian', 311,
 'A dystopian novel set in a near-future New England where a totalitarian state subjects fertile women into child-bearing servitude.', 
 'English', 'Anchor Books'),

('9780062315007', 'The Alchemist', 1988, 'Fiction', 'Philosophical', 208,
 'An allegorical novel about a young Spanish shepherd named Santiago who travels from Spain to Egypt in search of treasure.', 
 'English', 'HarperOne');

-- Verify insertion
SELECT COUNT(*) as 'Books Inserted' FROM Book;
SELECT book_id, title, genre, publication_year FROM Book ORDER BY title;

-- Display success message
SELECT 'Sample books inserted successfully!' AS Status;
