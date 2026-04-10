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
const pageLanguage = document.getElementById("page-language");
const pageYear = document.getElementById("page-year");
const pagePublisher = document.getElementById("page-publisher");

const addToListButton = document.getElementById("add-to-list-button");
const stars = document.querySelectorAll(".star");

let currentBook = null;
let userRating = 0;

// -------------------------------
// OPEN BOOK DETAILS POPUP
// -------------------------------
function openBookPage(book) {
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
    pageRating.textContent = book.ratings_average
        ? `☆ ${book.ratings_average.toFixed(1)}`
        : "No ratings yet.";

    pageDescription.textContent = book.description ?? "";
    pageGenre.textContent = book.subject?.slice(0, 3).join(", ") ?? "Unknown";
    pagePages.textContent = book.number_of_pages_median
        ? `${book.number_of_pages_median} pages`
        : "";
    pageLanguage.textContent = book.language?.[0] ?? "";
    pageYear.textContent = book.first_publish_year ?? "";
    pagePublisher.textContent = book.publisher?.[0] ?? "";

    bookPage.classList.remove("hidden");
}

// Close popup
pageClose.addEventListener("click", () => {
    bookPage.classList.add("hidden");
});

// Close when clicking outside
bookPage.addEventListener("click", (e) => {
    if (e.target === bookPage) {
        bookPage.classList.add("hidden");
    }
});

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
