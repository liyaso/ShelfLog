// -------------------------------
// AUTH CHECK
// -------------------------------
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
}

// -------------------------------
// SEARCH SETUP
// -------------------------------
const cache = {};
const headers = new Headers({
    "User-Agent": "ShelfLog/1.0 (email@gmail.com)"
});
const options = { method: "GET", headers };

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const resultsContainer = document.getElementById("results");

let currentPage = 1;
let booksPerPage = 25;
let booksData = [];

// -------------------------------
// FETCH BOOKS FROM OPENLIBRARY
// -------------------------------
async function fetchBooks(query) {
    if (cache[query]) {
        booksData = cache[query].docs;
        currentPage = 1;
        displayBooks();
        return;
    }

    try {
        const apiURL = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;
        const response = await fetch(apiURL, options);
        const data = await response.json();

        cache[query] = data;
        booksData = data.docs;
        currentPage = 1;

        displayBooks();
    } catch (err) {
        console.error("Error fetching books:", err);
        resultsContainer.innerHTML = `<p>Error: ${err.message}</p>`;
    }
}

// -------------------------------
// DISPLAY BOOK RESULTS
// -------------------------------
function displayBooks() {
    resultsContainer.innerHTML = "";

    const start = (currentPage - 1) * booksPerPage;
    const end = start + booksPerPage;
    const booksToShow = booksData.slice(start, end);

    if (!booksToShow.length) {
        resultsContainer.innerHTML = "<p>No books found.</p>";
        return;
    }

    booksToShow.forEach(book => {
        const cover = book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : "https://via.placeholder.com/150x200?text=No+Image";

        const card = document.createElement("div");
        card.className = "book-card";
        card.innerHTML = `
            <img src="${cover}">
            <h3>${book.title}</h3>
            <p>${book.author_name ? book.author_name.join(", ") : "Unknown Author"}</p>
        `;

        card.addEventListener("click", () => openBookPage(book));
        resultsContainer.appendChild(card);
    });
}

// -------------------------------
// SEARCH BUTTON
// -------------------------------
searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (!query) {
        resultsContainer.innerHTML = "<p>Please enter a search.</p>";
        return;
    }
    fetchBooks(query);
});

// -------------------------------
// POPUP BOOK PAGE
// -------------------------------
const bookPage = document.getElementById("book-page");
const pageClose = document.getElementById("page-close");

const pageCover = document.getElementById("page-cover");
const pageTitle = document.getElementById("page-title");
const pageAuthor = document.getElementById("page-author");
const pageRating = document.getElementById("book-rating");
const pageDescription = document.getElementById("page-description");
const pageGenre = document.getElementById("page-genre");
const pagePages = document.getElementById("page-pages");
const pageYear = document.getElementById("page-year");
const pagePublisher = document.getElementById("page-publisher");

const addToListButton = document.getElementById("add-to-list-button");
const stars = document.querySelectorAll(".star");

let currentBook = null;
let userRating = 0;

// -------------------------------
// CLEAN DESCRIPTION
// -------------------------------
function cleanDescription(text) {
    if (!text) return "";

    return text
        .replace(/\[.*?\]\(.*?\)/g, "")        
        .replace(/https?:\/\/\S+/g, "")        
        .replace(/See also:.*/gi, "")          
        .replace(/source:.*/gi, "")            
        .replace(/\([^)]*source[^)]*\)/gi, "") 
        .replace(/-{3,}/g, "")                 
        .replace(/\s+/g, " ")                  
        .trim();
}

// -------------------------------
// DISPLAY FIELD (HIDE IF UNKNOWN)
// -------------------------------
function displayField(element, label, value) {
    if (!value || value === "Unknown") {
        element.textContent = "";
        element.style.display = "none";
    } else {
        element.style.display = "block";
        element.textContent = `${label}: ${value}`;
    }
}

function cleanGenres(subjects) {
    if (!subjects || !Array.isArray(subjects)) return "";

    const bannedWords = [
        "juvenile", "children", "child", "study", "guide", "guides",
        "series", "fiction for", "film", "movie", "motion picture",
        "good and evil", "evil", "dementors", "characters", "plots",
        "analysis", "criticism", "fan", "fanfiction", "adaptations",
        "harry potter", "hogwarts", "wizarding world"
    ];

    return subjects
        .map(s => s.toLowerCase())
        .filter(s => !bannedWords.some(b => s.includes(b)))
        .map(s => s.replace(/\bfiction\b/g, "").trim()) // remove trailing "fiction"
        .map(s => s.replace(/\bnovels?\b/g, "").trim())
        .map(s => s.replace(/\bseries\b/g, "").trim())
        .map(s => s.replace(/\bbooks?\b/g, "").trim())
        .map(s => s.replace(/\bworks?\b/g, "").trim())
        .map(s => s.replace(/\benglish\b/g, "").trim())
        .map(s => s.replace(/\bamerican\b/g, "").trim())
        .map(s => s.replace(/\b20th century\b/g, "").trim())
        .filter(s => s.length > 2)
        .slice(0, 5) // limit to 5 clean genres
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join(", ");
}


// -------------------------------
// OPEN BOOK DETAILS POPUP
// -------------------------------
async function openBookPage(book) {
    currentBook = book;
    userRating = 0;

    stars.forEach(s => {
        s.textContent = "☆";
        s.classList.remove("selected");
    });

    const cover = book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
        : "https://via.placeholder.com/150x200?text=No+Image";

    pageCover.innerHTML = `<img src="${cover}">`;
    pageTitle.textContent = book.title ?? "Unknown";
    pageAuthor.textContent = book.author_name?.join(", ") ?? "Unknown";

    pageDescription.textContent = "Loading description...";

    try {
        const workKey = book.key;
        const url = `https://openlibrary.org${workKey}.json`;

        const res = await fetch(url);
        const full = await res.json();

        // DESCRIPTION
        let rawDescription = "";
        if (full.description) {
            rawDescription = typeof full.description === "string"
                ? full.description
                : full.description.value;
        }
        displayField(pageDescription, "Description", cleanDescription(rawDescription));

        // GENRES
        const genres = full.subjects
            ? cleanGenres(full.subjects)
            : "Unknown";
        displayField(pageGenre, "Genre", genres);

        // PAGES
        const pages = full.number_of_pages
            ? `${full.number_of_pages} pages`
            : book.number_of_pages_median
                ? `${book.number_of_pages_median} pages`
                : "Unknown";
        displayField(pagePages, "Pages", pages);

        // YEAR
        const year = full.first_publish_date ?? book.first_publish_year ?? "Unknown";
        displayField(pageYear, "Year", year);

        // PUBLISHER
        const publisher = full.publishers
            ? full.publishers.join(", ")
            : book.publisher?.[0] ?? "Unknown";
        displayField(pagePublisher, "Publisher", publisher);

    } catch (err) {
        console.error("Error loading full book details:", err);
        pageDescription.textContent = "Error loading full details.";
    }

    bookPage.classList.remove("hidden");
    attachViewReviewsHandler();
}

// -------------------------------
// STAR RATING
// -------------------------------
stars.forEach(star => {
    star.addEventListener("click", () => {
        userRating = star.dataset.value;

        stars.forEach(s => {
            s.textContent = s.dataset.value <= userRating ? "★" : "☆";
            s.classList.toggle("selected", s.dataset.value <= userRating);
        });
    });
});

// -------------------------------
// SAVE BOOK TO BACKEND
// -------------------------------
async function saveBookToDatabase(book) {
    const coverUrl = book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : null;

    const payload = {
        title: book.title,
        author: book.author_name?.join(", ") || "Unknown",
        cover_url: coverUrl
    };

    try {
        const res = await fetch("http://localhost:5000/api/books/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            alert("Book added to My Books!");
        } else {
            alert(data.error || "Could not save book.");
        }
    } catch (err) {
        console.error("Save book error:", err);
        alert("Server error — could not save book.");
    }
}

addToListButton.addEventListener("click", () => {
    if (!currentBook) return;
    saveBookToDatabase(currentBook);
});

// -------------------------------
// VIEW REVIEWS BUTTON
// -------------------------------
function attachViewReviewsHandler() {
    const btn = document.getElementById("view-reviews-button");
    btn.onclick = () => {
        if (!currentBook || !currentBook.title) return;
        window.location.href = `bookreviews.html?title=${encodeURIComponent(currentBook.title)}`;
    };
}

// -------------------------------
// CLOSE POPUP
// -------------------------------
pageClose.addEventListener("click", () => {
    bookPage.classList.add("hidden");
});

// Close when clicking outside the popup content
bookPage.addEventListener("click", (e) => {
    if (e.target.id === "book-page") {
        bookPage.classList.add("hidden");
    }
});

