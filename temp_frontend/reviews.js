document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("reviews-container");
    const popup = document.getElementById("review-popup");
    const popupClose = document.getElementById("popup-close");
    const popupBookInfo = document.getElementById("popup-book-info");
    const reviewText = document.getElementById("review-text");
    const saveReviewBtn = document.getElementById("save-review-btn");
    const deleteReviewBtn = document.getElementById("delete-review-btn");

    let list = JSON.parse(localStorage.getItem("readingList")) || [];
    let currentBook = null;

    function renderReviews() {
        const reviewedBooks = list.filter(b => b.review && b.review.trim() !== "");

        if (reviewedBooks.length === 0) {
            container.innerHTML = "<p>You haven't written any reviews yet.</p>";
            return;
        }

        container.innerHTML = reviewedBooks.map(book => `
            <div class="book-card" data-key="${book.key}">
                <img src="${book.cover}" alt="Book Cover">
                <h3>${book.title}</h3>
                <p>${book.author}</p>
                <p class="review-snippet">"${book.review.slice(0, 60)}..."</p>
            </div>
        `).join("");

        document.querySelectorAll(".book-card").forEach(card => {
            card.addEventListener("click", () => openPopup(card.dataset.key));
        });
    }

    function openPopup(bookKey) {
        currentBook = list.find(b => b.key === bookKey);

        popupBookInfo.innerHTML = `
            <img src="${currentBook.cover}" class="popup-cover">
            <h2>${currentBook.title}</h2>
            <p>${currentBook.author}</p>
        `;

        reviewText.value = currentBook.review || "";

        popup.classList.remove("hidden");
    }

    popupClose.addEventListener("click", () => {
        popup.classList.add("hidden");
        currentBook = null;
    });

    saveReviewBtn.addEventListener("click", () => {
        if (!currentBook) return;

        currentBook.review = reviewText.value;
        localStorage.setItem("readingList", JSON.stringify(list));

        popup.classList.add("hidden");
        renderReviews();
    });

    deleteReviewBtn.addEventListener("click", () => {
        if (!currentBook) return;

        currentBook.review = "";
        localStorage.setItem("readingList", JSON.stringify(list));

        popup.classList.add("hidden");
        renderReviews();
    });

    renderReviews();
});
