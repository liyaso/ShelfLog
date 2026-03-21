-- ShelfLog Table Creation Script: Creates all 11 tables for ShelfLog database

USE shelflog_db;

-- Table 1: User (Stores user account information)
CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bio TEXT,
    
    -- Indexes for faster lookups
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB;

-- Table 2: Author (Stores information about book authors)
CREATE TABLE Author (
    author_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    birth_year INT,
    nationality VARCHAR(50),
    biography TEXT,
    
    -- Index for searching by author name
    INDEX idx_name (name)
) ENGINE=InnoDB;

-- Table 3: Book (Stores book catalog information)
CREATE TABLE Book (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(13) UNIQUE,
    title VARCHAR(255) NOT NULL,
    publication_year INT,
    genre VARCHAR(50) NOT NULL,
    sub_genre VARCHAR(50),
    page_count INT NOT NULL CHECK (page_count > 0),
    description TEXT,
    cover_image_url VARCHAR(500),
    average_rating DECIMAL(3,2) DEFAULT 0.0,
    language VARCHAR(50) DEFAULT 'English',
    publisher VARCHAR(100),
    
    -- Indexes for searching and filtering
    INDEX idx_title (title),
    INDEX idx_genre (genre),
    INDEX idx_isbn (isbn)
) ENGINE=InnoDB;


-- Table 4: ReadingGoal (Stores user reading goals (yearly targets))
CREATE TABLE ReadingGoal (
    goal_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    year INT NOT NULL,
    target_books INT CHECK (target_books > 0),
    target_pages INT CHECK (target_pages > 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Foreign key to User table
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_user_active (user_id, is_active),
    
    -- Constraints
    CHECK (end_date > start_date),
    CHECK (target_books > 0 OR target_pages > 0)
) ENGINE=InnoDB;

-- Table 5: ReadingList (Stores user-created reading lists)
CREATE TABLE ReadingList (
    list_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Foreign key to User table
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    
    -- Index
    INDEX idx_user_lists (user_id)
) ENGINE=InnoDB;

-- Table 6: ReadingProgress (Tracks user's reading progress for each book)
CREATE TABLE ReadingProgress (
    progress_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    status ENUM('Want to Read', 'Reading', 'Finished') NOT NULL,
    current_page INT DEFAULT 0 CHECK (current_page >= 0),
    start_date DATE,
    finish_date DATE,
    completion_percent DECIMAL(5,2) DEFAULT 0.0,
    reading_speed DECIMAL(6,2),
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES Book(book_id) ON DELETE CASCADE,
    
    -- One progress record per user per book
    UNIQUE KEY unique_user_book (user_id, book_id),
    
    -- Indexes
    INDEX idx_status (status),
    INDEX idx_user_status (user_id, status),
    
    -- Constraint
    CHECK (finish_date IS NULL OR finish_date >= start_date)
) ENGINE=InnoDB;

-- Table 7: Review (Stores user reviews and ratings for books)
CREATE TABLE Review (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes_count INT DEFAULT 0,
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES Book(book_id) ON DELETE CASCADE,
    
    -- One review per user per book
    UNIQUE KEY unique_user_book_review (user_id, book_id),
    
    -- Index
    INDEX idx_book_rating (book_id, rating)
) ENGINE=InnoDB;

-- Table 8: GoalMilestone (Stores periodic snapshots of reading goal progress)
CREATE TABLE GoalMilestone (
    milestone_id INT AUTO_INCREMENT PRIMARY KEY,
    goal_id INT NOT NULL,
    milestone_date DATE NOT NULL,
    books_completed INT DEFAULT 0,
    pages_read INT DEFAULT 0,
    percent_complete DECIMAL(5,2) DEFAULT 0.0,
    days_remaining INT,
    pace_status ENUM('Ahead', 'On Track', 'Behind') DEFAULT 'On Track',
    predicted_completion DATE,
    
    -- Foreign key
    FOREIGN KEY (goal_id) REFERENCES ReadingGoal(goal_id) ON DELETE CASCADE,
    
    -- Index
    INDEX idx_goal_date (goal_id, milestone_date)
) ENGINE=InnoDB;

-- Table 9: ReadingStatistics (Stores aggregated reading statistics per user per period)
CREATE TABLE ReadingStatistics (
    stat_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    period VARCHAR(10) NOT NULL,
    books_read INT DEFAULT 0,
    pages_read INT DEFAULT 0,
    avg_rating_given DECIMAL(3,2),
    most_read_genre VARCHAR(50),
    avg_book_length INT,
    reading_streak_days INT DEFAULT 0,
    fastest_book_days INT,
    slowest_book_days INT,
    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    
    -- One statistics record per user per period
    UNIQUE KEY unique_user_period (user_id, period),
    
    -- Index
    INDEX idx_period (period)
) ENGINE=InnoDB;

-- Table 10: ListItem (Junction table connecting ReadingList and Book (many-to-many))
CREATE TABLE ListItem (
    list_id INT NOT NULL,
    book_id INT NOT NULL,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    priority INT DEFAULT 0,
    
    -- Composite primary key
    PRIMARY KEY (list_id, book_id),
    
    -- Foreign keys
    FOREIGN KEY (list_id) REFERENCES ReadingList(list_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES Book(book_id) ON DELETE CASCADE,
    
    -- Index
    INDEX idx_date_added (date_added)
) ENGINE=InnoDB;

-- Table 11: BookAuthor (Junction table connecting Book and Author (many-to-many))
CREATE TABLE BookAuthor (
    book_id INT NOT NULL,
    author_id INT NOT NULL,
    author_order INT DEFAULT 1,
    
    -- Composite primary key
    PRIMARY KEY (book_id, author_id),
    
    -- Foreign keys
    FOREIGN KEY (book_id) REFERENCES Book(book_id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES Author(author_id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- Show all created tables
SHOW TABLES;

-- Display success message
SELECT 'All 11 tables created successfully!' AS Status;
SELECT 'Tables: User, Author, Book, ReadingGoal, ReadingList, ReadingProgress, Review, GoalMilestone, ReadingStatistics, ListItem, BookAuthor' AS Tables_Created;
