document.addEventListener("DOMContentLoaded", () => {
    const reviewsContainer = document.getElementById("reviews-container");

    const popup = document.getElementById("review-popup");
    const popupClose = document.getElementById("popup-close");
    const popupBookInfo = document.getElementById("popup-book-info");
    const reviewText = document.getElementById("review-text");
    const saveReviewBtn = document.getElementById("save-review-btn");
    const deleteReviewBtn = document.getElementById("delete-review-btn");

    const popupStars = document.querySelectorAll(".popup-star");
    let popupRating = 0;

    let reviewedBooks =[];
    let currentBook = null;

    const user_id = localStorage.getItem("user_id");

    async function loadReviews() {
        try {
            const res = await fetch(`http://localhost:3000/api/reviews/user/${user_id}`);
            const data = await res.json();

            reviewedBooks = data;
            renderReviews();

        } catch (err) {
            console.error("Failed to load reviews:", err);
        }
    }

    function renderReviews() {
        reviewsContainer.innerHTML = reviewedBooks.length === 0
            ? "<p>You have not written any reviews yet.</p>"
            : reviewedBooks.map(book => `
                <div class="book-card" data-key="${book.book_id}">
                    <img src="${book.cover_image_url}">
                    <h3>${book.title}</h3>
                    <p>${book.author}</p>
                    <p>Rating: ${book.rating || "No rating"}</p>
                </div>
            `).join("");

        document.querySelectorAll(".book-card").forEach(card => {
            card.addEventListener("click", () => openReviewPopup(card.dataset.key));
        });
    }

    function openReviewPopup(key) {
        currentBook = reviewedBooks.find(b => String(b.book_id) === String(key));
        if (!currentBook) return;

        popupRating = Number(currentBook.rating) || 0;

        const finished = currentBook.dateRead
            ? new Date(currentBook.dateRead).toLocaleDateString()
            : "Not finished";

        popupBookInfo.innerHTML = `
            <img src="${currentBook.cover_image_url || 'https://via.placeholder.com/150'}" class="popup-cover">
            <h2>${currentBook.title}</h2>
            <p>${currentBook.author}</p>
        `;

        // Reset stars
        popupStars.forEach(s => {
            s.textContent = s.dataset.value <= popupRating ? "★" : "☆";
        });

        reviewText.value = currentBook.review_text || "";
        popup.classList.remove("hidden");
    }

    popupClose.addEventListener("click", () => popup.classList.add("hidden"));

    // ⭐ Rating stars inside popup
    popupStars.forEach(star => {
        star.addEventListener("click", () => {
            popupRating = Number(star.dataset.value);

            popupStars.forEach(s => {
                s.textContent = s.dataset.value <= popupRating ? "★" : "☆";
            });
        });
    });

    // ⭐ Save review (rating required)
    saveReviewBtn.addEventListener("click", async () => {
        if (popupRating === 0) {
            alert("Please rate this book before saving your review.");
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/api/reviews/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id,
                    book_id: currentBook.book_id,
                    rating: popupRating,
                    review_text: reviewText.value
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            alert("Review saved!");

            popup.classList.add("hidden");

            loadReviews(); // 🆕 refresh data from backend

        } catch (error) {
            console.error(error);
            alert("Failed to save review");
        }
    });

    // ⭐ Delete review
    deleteReviewBtn.addEventListener("click", async () => {
        try {
            const res = await fetch("http://localhost:3000/api/reviews/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id,
                    book_id: currentBook.book_id,
                    rating: 0,
                    review_text: ""
                })
            });

            if (!res.ok) throw new Error("Delete failed");

            popup.classList.add("hidden");
            loadReviews();

        } catch (err) {
            console.error(err);
            alert("Failed to delete review");
        }
    });

    loadReviews();
});