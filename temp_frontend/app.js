// OpenLibrary WebAPI calls - Mati Sawadogo

const cache = {};

//app identification header for openlibrary.org API calls
const headers = new Headers({
    "User-Agent": "ShelfLog/1.0 (email@gmail.com)"
});

const options = {
    method: 'GET'
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
    const apiURL = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&_app=ShelfLog&_email=matisawadogo@email.com`;
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


