// OpenLibrary WebAPI calls - Mati Sawadogo

const cache = {};

//app identification header for openlibrary.org API calls
const headers = new Headers({
    "User-Agent": "ShelfLog/1.0 (matisawadogo@gmail.com)"
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
        //displayPagination();
        return;
    }
    try {
    const apiURL = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&_app=ShelfLog&_email=matisawadogo@gmail.com`;
    const response = await fetch(apiURL, options);
    const data = await response.json();
    cache[query] = data;
    booksData = data.docs;
    currentPage = 1;
    displayBooks();
    //displayPagination();
} catch (error) {
    console.error("Error fetchig books: ", error)
    resultsContainer.innerHTML= `<p>Error: ${error.message}</p>`;
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
        return
    }
    fetchBooks(query);
})

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
const pageISBN = document.getElementById("page-isbn");
const addToListButton = document.getElementById("add-to-list-button");
const stars = document.querySelectorAll(".star");


//get book details
async function fetchBookDetails(bookKey) {
    if (cache[bookKey]) return cache[bookKey];
    try {
        const apiURL2 = `https://openlibrary.org${bookKey}.json`;

        const apiURL3 = `https://openlibrary.org${bookKey}/editions.json`;

        const [worksResponse, editionsResponse] = await Promise.all([fetch(apiURL2), fetch(apiURL3)]);

        const worksData = await worksResponse.json();
        const editionsData = await editionsResponse.json();

        const edition = editionsData.entries?.find(e => e.number_of_pages&& e.publishers) 
        ?? editionsData?.find(e => e.number_of_pages)
        ?? editionsData.entries?.[0] ?? {};

        const details = {
            description: typeof worksData.description === "string"
            ? worksData.description : worksData.description?.value ?? "No description available.",
            genre: worksData.subjects ? worksData.subjects.slice(0,3).join(", ") : "",
            page_count: edition.number_of_pages ?? "",
            publisher: edition.publishers?.[0] ?? "",
            isbn: edition.isbn_13?.[0] ?? ""
        };

        cache[bookKey] = details;
        return details
    
    } catch (error) {
        console.error("Error fetching description: ", error);
        return {
            description: "Failed to load.",
            genre: "Failed to load.",
            page_count: "Failed to load.",
            publisher: "Failed to load.",
            isbn: "Failed to load."
        };
    }
}

let userRating = 0;
let currentBook = null;

//open page of selected book
async function openBookPage(book) {
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
    
    //book details
    const details = await fetchBookDetails(book.key);

    pageTitle.textContent = book.title ?? "Unknown";
    pageAuthor.textContent = book.author_name ? book.author_name.join(", ") : "Unknown";
    pageRating.textContent = book.ratings_average ? `☆ ${book.ratings_average.toFixed(1)}` : "No ratings yet.";
    pageDescription.textContent = details.description;
    pageGenre.textContent = details.genre || book.subjects?.slice(0,3).join(", ") || "";
    pagePages.textContent = details.page_count ? `${details.page_count} pages` : "";
    pageLanguage.textContent = book.language?.find(lang => lang === "eng" || lang === "en") ? "English" : book.language?.[0] ?? "";
    pagePublisher.textContent = details.publisher ? `Publisher: ${details.publisher}` : "";
    pageYear.textContent = book.first_publish_year ?? "";
    pageISBN.textContent = details.isbn ? `ISBN: ${details.isbn}` : "";

    bookPage.classList.remove("hidden");
}

//entering and exiting book page popup
pageClose.addEventListener("click", () => {
    bookPage.classList.add("hidden");
    currentBook = null;
});

bookPage.addEventListener("click", (e) => {
    if (e.target === bookPage) {
        bookPage.classList.add("hidden");
        currentBook =null;
    }
});

//star rating
stars.forEach(star => {
    star.addEventListener("click", () => {
        userRating = star.dataset.value;
        stars.forEach(s => {
            s.textContent = s.dataset.value <= userRating ? "★" : "☆";
            s.classList.toggle("selected", s.dataset.value <= userRating);
        });
    });
});

