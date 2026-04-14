// -------------------------------
// AUTH CHECK
// -------------------------------
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
}

let selectedBookId = null;
let selectedBook = null;

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

            card.addEventListener("click", () => {
                selectedBookId = book.book_id;
                selectedBook = book;

                document.getElementById("optCover").src = cover;
                document.getElementById("optTitle").textContent = book.title;
                document.getElementById("optAuthor").textContent = book.author;

                document.getElementById("bookOptionsModal").classList.remove("hidden");
            });

            container.appendChild(card);
        });

    } catch (err) {
        console.error("Error loading My Books:", err);
        alert("Could not load your books.");
    }
}

// -------------------------------
// CLOSE OPTIONS POPUP
// -------------------------------
document.getElementById("closeOptionsModal").onclick = () => {
    document.getElementById("bookOptionsModal").classList.add("hidden");
};

// -------------------------------
// ADD TO READING LIST
// -------------------------------
document.getElementById("optAddList").onclick = async () => {
    const res = await fetch("http://localhost:5000/api/lists/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            book_id: selectedBookId,
            title: selectedBook.title,
            author: selectedBook.author,
            cover_url: selectedBook.cover_url
        })
    });

    alert("Book added to your reading list!");
};

// -------------------------------
// WRITE REVIEW → OPEN REVIEW MODAL
// -------------------------------
document.getElementById("optWriteReview").onclick = () => {
    document.getElementById("bookOptionsModal").classList.add("hidden");

    document.getElementById("modalCover").src = document.getElementById("optCover").src;
    document.getElementById("modalTitle").textContent = document.getElementById("optTitle").textContent;
    document.getElementById("modalAuthor").textContent = document.getElementById("optAuthor").textContent;

    document.getElementById("modalRating").value = "";
    document.getElementById("modalText").value = "";

    document.getElementById("reviewModal").classList.remove("hidden");
};

// -------------------------------
// VIEW REVIEWS (for this book)
// -------------------------------
document.getElementById("optViewReviews").onclick = () => {
    const title = encodeURIComponent(selectedBook.title);
    window.location.href = `bookreviews.html?title=${title}`;
};

// -------------------------------
// CLOSE / CANCEL REVIEW MODAL
// -------------------------------
document.getElementById("closeModal").onclick =
document.getElementById("cancelReview").onclick = () => {
    document.getElementById("reviewModal").classList.add("hidden");
};

// -------------------------------
// SAVE REVIEW
// -------------------------------
document.getElementById("saveReview").onclick = async () => {
    const rating = document.getElementById("modalRating").value;
    const review_text = document.getElementById("modalText").value;

    if (!rating || !review_text) {
        alert("Please fill out all fields.");
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/api/reviews/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                book_id: selectedBookId,
                rating,
                review_text
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Review saved!");
            window.location.href = "myreviews.html";
        } else {
            alert(data.error || "Error saving review.");
        }

    } catch (err) {
        console.error("Review error:", err);
        alert("Could not save review.");
    }
};

// -------------------------------
// RUN ON PAGE LOAD
// -------------------------------
loadMyBooks();
