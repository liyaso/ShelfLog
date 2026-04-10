// -------------------------------
// AUTH CHECK
// -------------------------------
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
}

// -------------------------------
// LOAD USER'S SAVED BOOKS
// -------------------------------
async function loadMyBooks() {
    try {
        const res = await fetch("http://localhost:5000/api/books/my", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const books = await res.json();
        const container = document.getElementById("my-books-container");

        container.innerHTML = "";

        if (!books.length) {
            container.innerHTML = "<p>You haven't added any books yet.</p>";
            return;
        }

        books.forEach(book => {
            const card = document.createElement("div");
            card.className = "book-card";

            const cover = book.cover_url
                ? book.cover_url
                : "https://via.placeholder.com/150x200?text=No+Image";

            card.innerHTML = `
                <img src="${cover}">
                <h3>${book.title}</h3>
                <p>${book.author}</p>
            `;

            container.appendChild(card);
        });

    } catch (err) {
        console.error("Error loading My Books:", err);
        alert("Could not load your books.");
    }
}

// Run on page load
loadMyBooks();
