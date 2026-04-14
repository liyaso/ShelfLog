const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

// -------------------------------
// GET BOOK TITLE FROM URL
// -------------------------------
const params = new URLSearchParams(window.location.search);
const bookTitle = params.get("title");

// If no title provided, show error
if (!bookTitle) {
    document.getElementById("book-title").textContent = "No book selected.";
    document.getElementById("reviews-container").innerHTML =
        "<p>Invalid request — no book title provided.</p>";
    throw new Error("Missing ?title= in URL");
}

document.getElementById("book-title").textContent = `Reviews for: ${bookTitle}`;

// -------------------------------
// LOAD REVIEWS FOR THIS BOOK
// -------------------------------
async function loadBookReviews() {
    const container = document.getElementById("reviews-container");
    container.innerHTML = "<p>Loading reviews...</p>";

    try {
        const res = await fetch(
            `http://localhost:5000/api/reviews/book?title=${encodeURIComponent(bookTitle)}`,
            {
                headers: { "Authorization": "Bearer " + token }
            }
        );

        if (!res.ok) {
            container.innerHTML = "<p>Could not load reviews.</p>";
            return;
        }

        const reviews = await res.json();
        container.innerHTML = "";

        if (!reviews.length) {
            container.innerHTML = "<p>No reviews for this book yet.</p>";
            return;
        }

        reviews.forEach(r => {
            const card = document.createElement("div");
            card.className = "review-card";

            const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);

            const cover = r.cover_url
                ? r.cover_url
                : "https://via.placeholder.com/120x180?text=No+Image";

            card.innerHTML = `
                <div class="review-header">
                    <img src="${cover}" class="review-cover">
                    <div>
                        <h3>${r.book_title}</h3>
                        <p class="rating">${stars}</p>
                    </div>
                </div>

                <p class="review-text">${r.review_text}</p>

                <p class="small-text">
                    Posted on: ${new Date(r.date_posted).toLocaleDateString()}
                </p>
            `;

            container.appendChild(card);
        });

    } catch (err) {
        console.error("Error loading book reviews:", err);
        container.innerHTML = "<p>Error loading reviews. Please try again later.</p>";
    }
}

loadBookReviews();
