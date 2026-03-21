-- ShelfLog Author Data Insert Script: Inserts sample authors for testing

USE shelflog_db;

-- Insert sample authors
INSERT INTO Author (name, birth_year, nationality, biography) VALUES
('George Orwell', 1903, 'British', 'English novelist, essayist, journalist, and critic. Best known for his dystopian novel 1984 and allegorical novella Animal Farm.'),
('J.K. Rowling', 1965, 'British', 'British author, best known for creating the Harry Potter fantasy series.'),
('Charles Dickens', 1812, 'British', 'English author and social critic who is considered one of the greatest Victorian era novelists'),
('Michelle Obama', 1964, 'American', 'American attorney and author who served as the First Lady of the United States from 2009 to 2017.'),
('Stephen King', 1947, 'American', 'American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels.'),
('Jane Austen', 1775, 'British', 'English novelist known primarily for her six major novels which critique the British landed gentry at the end of the 18th century.'),
('Agatha Christie', 1890, 'British', 'English writer known for her 66 detective novels and 14 short story collections.'),
('Neil Gaiman', 1960, 'British', 'English author of short fiction, novels, comic books, graphic novels, audio theatre, and films.'),
('Terry Pratchett', 1948, 'British', 'English humorist, satirist, and author of the Discworld series of 41 comic fantasy novels published between 1983 and 2015.'),
('Mark Twain', 1835, 'American', 'American novelist known for novels like The Adventures of Tom Sawyer and Adventures of Huckleberry Finn.'),
('F. Scott Fitzgerald', 1896, 'American', 'American novelist and short story writer, widely regarded as one of the greatest American writers of the 20th century.'),
('Harper Lee', 1926, 'American', 'American novelist best known for To Kill a Mockingbird, published in 1960, which won the Pulitzer Prize.'),
('Gabriel García Márquez', 1927, 'Colombian', 'Colombian novelist, short-story writer, screenwriter, and journalist, known as one of the most significant authors of the 20th century.'),
('Margaret Atwood', 1939, 'Canadian', 'Canadian poet, novelist, literary critic, essayist, and environmental activist.'),
('Paulo Coelho', 1947, 'Brazilian', 'Brazilian lyricist and novelist, best known for his novel The Alchemist.');

-- Verify insertion
SELECT COUNT(*) as 'Authors Inserted' FROM Author;
SELECT author_id, name, nationality FROM Author ORDER BY name;

-- Display success message
SELECT 'Sample authors inserted successfully!' AS Status;
