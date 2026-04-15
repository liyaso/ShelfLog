// OpenLibrary WebAPI calls - Mati Sawadogo

const cache = {};
const options = { method: "GET" };

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const resultsContainer = document.getElementById("results");

let currentPage = 1;
let booksPerPage = 25;
let booksData = [];

// -------------------------------
// SEARCH BOOKS
// -------------------------------
async function fetchBooks(query) {
    document.getElementById("loading").classList.remove("hidden");

    if (cache[query]) {
        booksData = cache[query].docs;
        currentPage = 1;
        displayBooks();
        document.getElementById("loading").classList.add("hidden");
        return;
    }

    try {
        const apiURL = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;
        const response = await fetch(apiURL, options);

        if (!response.ok) throw new Error("OpenLibrary request failed");

        const data = await response.json();
        cache[query] = data;
        booksData = data.docs;

        currentPage = 1;
        displayBooks();

    } catch (error) {
        console.error("Error fetching books:", error);
        resultsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    }

    document.getElementById("loading").classList.add("hidden");
}

// -------------------------------
// DISPLAY RESULTS
// -------------------------------
function displayBooks() {
    resultsContainer.innerHTML = "";

    const start = (currentPage - 1) * booksPerPage;
    const end = start + booksPerPage;
    const booksToShow = booksData.slice(start, end);

    if (booksToShow.length === 0) {
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
// POPUP ELEMENTS
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
const pageISBN = document.getElementById("page-isbn");

const addToListButton = document.getElementById("add-to-list-button");
const stars = document.querySelectorAll(".star");

let userRating = 0;
let currentBook = null;

// -------------------------------
// FETCH BOOK DETAILS
// -------------------------------
async function fetchBookDetails(bookKey) {
    if (cache[bookKey]) return cache[bookKey];

    try {
        const workURL = `https://openlibrary.org${bookKey}.json`;
        const editionsURL = `https://openlibrary.org${bookKey}/editions.json`;

        const [workRes, editionsRes] = await Promise.all([
            fetch(workURL),
            fetch(editionsURL)
        ]);

        const workData = await workRes.json();
        const editionsData = await editionsRes.json();

        const edition =
            editionsData.entries?.find(e => e.number_of_pages) ||
            editionsData.entries?.[0] ||
            {};

        const details = {
            description:
                typeof workData.description === "string"
                    ? workData.description
                    : workData.description?.value || "No description available.",
            genre: workData.subjects ? workData.subjects.slice(0, 3).join(", ") : "",
            page_count: edition.number_of_pages || "",
            publisher: edition.publishers?.[0] || "",
            isbn: edition.isbn_13?.[0] || ""
        };

        cache[bookKey] = details;
        return details;

    } catch (error) {
        console.error("Error fetching details:", error);
        return {
            description: "Failed to load.",
            genre: "",
            page_count: "",
            publisher: "",
            isbn: ""
        };
    }
}

// -------------------------------
// OPEN POPUP
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

    const details = await fetchBookDetails(book.key);

    pageTitle.textContent = book.title;
    pageAuthor.textContent = book.author_name?.join(", ") || "Unknown";
    pageRating.textContent = book.ratings_average
        ? `☆ ${book.ratings_average.toFixed(1)}`
        : "No ratings yet.";

    pageDescription.textContent = details.description;
    pageGenre.textContent = details.genre;
    pagePages.textContent = details.page_count ? `${details.page_count} pages` : "";
    pageLanguage.textContent = book.language?.[0] || "";
    pagePublisher.textContent = details.publisher;
    pageYear.textContent = book.first_publish_year || "";
    pageISBN.textContent = details.isbn;

    bookPage.classList.remove("hidden");
}

// -------------------------------
// CLOSE POPUP
// -------------------------------
pageClose.addEventListener("click", () => {
    bookPage.classList.add("hidden");
});

bookPage.addEventListener("click", e => {
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
// CONFIRMATION POPUP ELEMENTS
// -------------------------------
const confirmPopup = document.getElementById("confirm-add-popup");
const confirmAddBtn = document.getElementById("confirm-add-btn");
const cancelAddBtn = document.getElementById("cancel-add-btn");
const confirmBookTitle = document.getElementById("confirm-book-title");

let pendingBook = null;

// -------------------------------
// OPEN CONFIRMATION POPUP
// -------------------------------
addToListButton.addEventListener("click", () => {
    if (!currentBook) return;

    pendingBook = currentBook;
    confirmBookTitle.textContent = currentBook.title;
    confirmPopup.classList.remove("hidden");
});

// -------------------------------
// CANCEL ADD
// -------------------------------
cancelAddBtn.addEventListener("click", () => {
    confirmPopup.classList.add("hidden");
    pendingBook = null;
});

// -------------------------------
// CONFIRM ADD TO READING LIST
// -------------------------------
confirmAddBtn.addEventListener("click", async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !token || !pendingBook) return;

    const details = await fetchBookDetails(pendingBook.key);

    // Get user's first reading list
    const listRes = await fetch(`http://localhost:5000/api/readinglist/user/${user.user_id}`, {
        headers: { "Authorization": "Bearer " + token }
    });
    const lists = await listRes.json();
    const list_id = lists[0]?.list_id;

    if (!list_id) {
        alert("You don't have a reading list yet.");
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/api/readinglist/add-book", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                list_id,
                book: pendingBook,
                details,
                notes: null,
                priority: 0
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Failed to add book.");
            return;
        }

        confirmPopup.classList.add("hidden");
        pendingBook = null;

        // Redirect to reading list page
        window.location.href = "readinglist.html";

    } catch (err) {
        console.error("Add to list error:", err);
        alert("Failed to add book.");
    }
});
