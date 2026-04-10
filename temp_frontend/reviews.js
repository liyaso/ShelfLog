// -------------------------------
// AUTH CHECK
// -------------------------------
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
}

// -------------------------------
// LOAD USER'S REVIEWS
// -------------------------------
async function loadMyReviews() {
    try {
        const res = await fetch("http://localhost:5000/api/reviews/my", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const reviews = await res.json();
        const container = document.getElementById("reviews-container");

        container.innerHTML = "";

        if (!reviews.length) {
            container.innerHTML = "<p>You haven't written any reviews yet.</p>";
            return;
        }

        reviews.forEach(review => {
            const card = document.createElement("div");
            card.className = "book-card";

            const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

            card.innerHTML = `
                <h3>${review.book_title}</h3>
                <p><strong>Rating:</strong> ${stars}</p>
                <p>${review.review_text || "No review text provided."}</p>
                <p class="small-text">Posted on: ${new Date(review.date_posted).toLocaleDateString()}</p>
            `;

            container.appendChild(card);
        });

    } catch (err) {
        console.error("Error loading reviews:", err);
        alert("Could not load your reviews.");
    }
}

// Run on page load
loadMyReviews();
