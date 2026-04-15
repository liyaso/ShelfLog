document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("reading-list-container");
    const list = JSON.parse(localStorage.getItem("readingList")) || [];

    if (list.length === 0) {
        container.innerHTML = "<p>No books in your reading list yet.</p>";
        return;
    }

    container.innerHTML = list.map(book => `
        <div class="book-card">
            <img src="${book.cover}" alt="Book Cover">
            <h3>${book.title}</h3>
            <p>${book.author}</p>
            <p>${book.isbn}</p>
        </div>
    `).join("");
});
