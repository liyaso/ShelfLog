async function loadMyBooks() {
    const token = localStorage.getItem("token");
    if (!token) {
        document.getElementById("my-books-container").innerHTML =
            "<p>You must be logged in.</p>";
        return;
    }

    const res = await fetch("http://localhost:5000/api/books/my", {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const books = await res.json();
    const container = document.getElementById("my-books-container");

    container.innerHTML = "";

    if (books.length === 0) {
        container.innerHTML = "<p>No books saved yet.</p>";
        return;
    }

    books.forEach(book => {
        const card = document.createElement("div");
        card.className = "book-card";

        card.innerHTML = `
            <img src="${book.cover_url || 'https://via.placeholder.com/150x200'}">
            <h3>${book.title}</h3>
            <p>${book.author}</p>
        `;

        container.appendChild(card);
    });
}

loadMyBooks();
