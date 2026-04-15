// -------------------------------
// AUTH CHECK
// -------------------------------
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
}

let currentListId = null;

// -------------------------------
// LOAD USER'S READING LISTS
// -------------------------------
async function loadReadingLists() {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        const res = await fetch(`http://localhost:5000/api/readinglist/user/${user.user_id}`, {
            headers: { "Authorization": "Bearer " + token }
        });

        const lists = await res.json();
        const container = document.getElementById("reading-list-container");

        container.innerHTML = "";

        if (!lists.length) {
            container.innerHTML = "<p>You haven't created any reading lists yet.</p>";
            return;
        }

        lists.forEach(list => {
            const card = document.createElement("div");
            card.className = "book-card";

            card.innerHTML = `
                <h3>${list.name}</h3>
                <p>${list.description || "No description provided."}</p>
                <p class="small-text">Created: ${new Date(list.created_date).toLocaleDateString()}</p>
            `;

            card.addEventListener("click", () => openListDetails(list.list_id));
            container.appendChild(card);
        });

    } catch (err) {
        console.error("Error loading reading lists:", err);
        alert("Could not load your reading lists.");
    }
}

// -------------------------------
// CREATE NEW LIST
// -------------------------------
document.getElementById("create-list-button").addEventListener("click", async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const name = document.getElementById("new-list-name").value.trim();
    const description = document.getElementById("new-list-description").value.trim();

    if (!name) {
        alert("List name is required.");
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/api/readinglist/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                user_id: user.user_id,
                name,
                description,
                is_public: false
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Failed to create list.");
            return;
        }

        alert("List created!");
        loadReadingLists();

    } catch (err) {
        console.error("Create list error:", err);
        alert("Failed to create list.");
    }
});

// -------------------------------
// OPEN LIST DETAILS POPUP
// -------------------------------
async function openListDetails(list_id) {
    currentListId = list_id;

    try {
        const res = await fetch(`http://localhost:5000/api/readinglist/${list_id}`, {
            headers: { "Authorization": "Bearer " + token }
        });

        const list = await res.json();

        const popup = document.getElementById("list-popup");
        const title = document.getElementById("popup-title");
        const desc = document.getElementById("popup-description");
        const booksContainer = document.getElementById("popup-books");

        title.textContent = list.name;
        desc.textContent = list.description || "No description provided.";
        booksContainer.innerHTML = "";

        if (!list.books.length) {
            booksContainer.innerHTML = "<p>No books in this list yet.</p>";
        } else {
            list.books.forEach(book => {
                const item = document.createElement("div");
                item.className = "book-card";

                item.innerHTML = `
                    <img src="${book.cover_image_url}" alt="Cover">
                    <h3>${book.title}</h3>
                    <p>${book.author || "Unknown Author"}</p>
                    <p class="small-text">${book.page_count || 0} pages</p>
                    <button class="delete-book-btn" data-book-id="${book.book_id}">Remove</button>
                `;

                booksContainer.appendChild(item);
            });
        }

        popup.classList.remove("hidden");

        // Attach delete book listeners
        document.querySelectorAll(".delete-book-btn").forEach(btn => {
            btn.addEventListener("click", () => deleteBook(list_id, btn.dataset.bookId));
        });

    } catch (err) {
        console.error("Error loading list details:", err);
        alert("Failed to load list details.");
    }
}

// -------------------------------
// DELETE BOOK FROM LIST
// -------------------------------
async function deleteBook(list_id, book_id) {
    try {
        const res = await fetch("http://localhost:5000/api/readinglist/delete-book", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ list_id, book_id })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Failed to delete book.");
            return;
        }

        alert("Book removed!");
        openListDetails(list_id);

    } catch (err) {
        console.error("Delete book error:", err);
        alert("Failed to delete book.");
    }
}

// -------------------------------
// DELETE ENTIRE LIST
// -------------------------------
document.getElementById("delete-list-button").addEventListener("click", async () => {
    if (!currentListId) return;

    if (!confirm("Are you sure you want to delete this list?")) return;

    try {
        const res = await fetch(`http://localhost:5000/api/readinglist/delete/${currentListId}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Failed to delete list.");
            return;
        }

        alert("List deleted!");
        document.getElementById("list-popup").classList.add("hidden");
        loadReadingLists();

    } catch (err) {
        console.error("Delete list error:", err);
        alert("Failed to delete list.");
    }
});

// -------------------------------
// CLOSE POPUP
// -------------------------------
document.getElementById("popup-close").addEventListener("click", () => {
    document.getElementById("list-popup").classList.add("hidden");
});

// -------------------------------
// RUN ON PAGE LOAD
// -------------------------------
loadReadingLists();
