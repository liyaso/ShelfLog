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

    let lists = JSON.parse(localStorage.getItem("readingLists")) || [];
    let allBooks = lists.flatMap(list => list.books);
    let reviewedBooks = allBooks.filter(book => book.review && book.review.trim() !== "");
    let currentBook = null;

    function renderReviews() {
        reviewsContainer.innerHTML = reviewedBooks.length === 0
            ? "<p>You have not written any reviews yet.</p>"
            : reviewedBooks.map(book => `
                <div class="book-card" data-key="${book.key}">
                    <img src="${book.cover}">
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
        currentBook = allBooks.find(b => b.key === key);
        if (!currentBook) return;

        popupRating = Number(currentBook.rating) || 0;

        const finished = currentBook.dateRead
            ? new Date(currentBook.dateRead).toLocaleDateString()
            : "Not finished";

        popupBookInfo.innerHTML = `
            <img src="${currentBook.cover}" class="popup-cover">
            <h2>${currentBook.title}</h2>
            <p>${currentBook.author}</p>
            <p>Finished: ${finished}</p>
        `;

        // Reset stars
        popupStars.forEach(s => {
            s.textContent = s.dataset.value <= popupRating ? "★" : "☆";
        });

        reviewText.value = currentBook.review || "";
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
    saveReviewBtn.addEventListener("click", () => {
        if (popupRating === 0) {
            alert("Please rate this book before saving your review.");
            return;
        }

        currentBook.rating = popupRating;
        currentBook.review = reviewText.value;
        currentBook.dateRead = currentBook.dateRead || new Date().toISOString();
        currentBook.status = "Finished";

        localStorage.setItem("readingLists", JSON.stringify(lists));

        reviewedBooks = allBooks.filter(book => book.review && book.review.trim() !== "");
        renderReviews();

        popup.classList.add("hidden");
    });

    // ⭐ Delete review
    deleteReviewBtn.addEventListener("click", () => {
        currentBook.review = "";
        currentBook.rating = 0;

        localStorage.setItem("readingLists", JSON.stringify(lists));

        reviewedBooks = allBooks.filter(book => book.review && book.review.trim() !== "");
        renderReviews();

        popup.classList.add("hidden");
    });

    renderReviews();
});
