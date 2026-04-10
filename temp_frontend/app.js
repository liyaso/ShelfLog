// OpenLibrary WebAPI calls - Mati Sawadogo

const cache = {};

//app identification header for openlibrary.org API calls
const headers = new Headers({
    "User-Agent": "ShelfLog/1.0 (email@gmail.com)"
});

const options = {
    method: 'GET',
    headers: headers
};

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const resultsContainer = document.getElementById("results");

let currentPage = 1;
let booksPerPage = 25;
let booksData = [];

//search books
async function fetchBooks(query) {
    if (cache[query]) {
        booksData = cache[query].docs;
        currentPage = 1;
        displayBooks();
        return;
    }
    try {
        const apiURL = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&_app=ShelfLog&_email=matisawadogo@email.com`;
        const response = await fetch(apiURL, options);
        const data = await response.json();
        cache[query] = data;
        booksData = data.docs;
        currentPage = 1;
        displayBooks();
    } catch (error) {
        console.error("Error fetching books: ", error);
        resultsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

//display results
function displayBooks() {
    resultsContainer.innerHTML = "";
    const start = (currentPage - 1) * booksPerPage;
    const end = start + booksPerPage;
    const booksToShow = booksData.slice(start, end);

    if (booksToShow.length == 0) {
        resultsContainer.innerHTML = "<p>No books found.</p>";
        return;
    }

    booksToShow.forEach((book) => {
        const bookCover = book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : "https://via.placeholder.com/150x200?text=No+Image";

        const bookElement = document.createElement("div");
        bookElement.className = "book-card";
        bookElement.innerHTML = `
            <img src="${bookCover}" alt="Book Cover">
            <h3>${book.title}</h3>
            <p>${book.author_name ? book.author_name.join(", ") : "Unknown Author"}</p>
        `;

        bookElement.addEventListener("click", () => openBookPage(book));

        resultsContainer.appendChild(bookElement);
    });
}

//search button
searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (!query) {
        resultsContainer.innerHTML = "<p>Please enter a search.</p>";
        return;
    }
    fetchBooks(query);
});

//pop-up book page for when you click on a book
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

let userRating = 0;
let currentBook = null;

//open page of selected book
function openBookPage(book) {
    currentBook = book;
    userRating = 0;

    stars.forEach(s => {
        s.textContent = "☆";
        s.classList.remove("selected");
    });

    const bookCover = book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
        : "https://via.placeholder.com/150x200?text=No+Image";

    pageCover.innerHTML = `<img src="${bookCover}" alt="Book Cover">`;

    pageTitle.textContent = book.title ?? "Unknown";
    pageAuthor.textContent = book.author_name ? book.author_name.join(", ") : "Unknown";
    pageRating.textContent = book.ratings_average ? `☆ ${book.ratings_average.toFixed(1)}` : "No ratings yet.";
    pageDescription.textContent = book.description ?? "";
    pageGenre.textContent = book.subject?.slice(0, 3).join(", ") ?? "Unknown";
    pagePages.textContent = book.number_of_pages_median ? `${book.number_of_pages_median} pages` : "";
    pageLanguage.textContent = book.language?.[0] ?? "";
    pageYear.textContent = book.first_publish_year ?? "";
    pagePublisher.textContent = book.publisher?.[0] ?? "";

    bookPage.classList.remove("hidden");
}

pageClose.addEventListener("click", () => {
    bookPage.classList.add("hidden");
    currentBook = null;
});

bookPage.addEventListener("click", (e) => {
    if (e.target === bookPage) {
        bookPage.classList.add("hidden");
        currentBook = null;
    }
});

stars.forEach(star => {
    star.addEventListener("click", () => {
        userRating = star.dataset.value;
        stars.forEach(s => {
            s.textContent = s.dataset.value <= userRating ? "★" : "☆";
            s.classList.toggle("selected", s.dataset.value <= userRating);
        });
    });
});

//  SAVE BOOK TO BACKEND 
async function saveBookToDatabase(book) {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("You must be logged in to save books.");
        return;
    }

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
        console.error("Error saving book:", err);
        alert("Server error — could not save book.");
    }
}

// Add to list button
addToListButton.addEventListener("click", () => {
    if (!currentBook) return;
    saveBookToDatabase(currentBook);
});
