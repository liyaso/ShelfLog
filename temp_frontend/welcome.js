// -------------------------------
// AUTH CHECK
// -------------------------------
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
}

// -------------------------------
// LOAD QUICK STATS
// -------------------------------
async function loadQuickStats() {
    try {
        const res = await fetch("http://localhost:5000/api/stats/my", {
            headers: { "Authorization": "Bearer " + token }
        });

        const stats = await res.json();

        if (!stats.length) {
            document.getElementById("stat-books-month").textContent = 0;
            document.getElementById("stat-pages-week").textContent = 0;
            document.getElementById("stat-pages-day").textContent = 0;
            return;
        }

        const s = stats[0];

        document.getElementById("stat-books-month").textContent = s.books_read || 0;
        document.getElementById("stat-pages-week").textContent = s.pages_read || 0;
        document.getElementById("stat-pages-day").textContent = s.avg_book_length || 0;

    } catch (err) {
        console.error("Quick stats error:", err);
    }
}

// -------------------------------
// LOAD CURRENTLY READING
// -------------------------------
async function loadCurrentlyReading() {
    try {
        const res = await fetch("http://localhost:5000/api/books/current", {
            headers: { "Authorization": "Bearer " + token }
        });

        const books = await res.json();
        const container = document.getElementById("current-reading");
        container.innerHTML = "";

        if (!books.length) {
            container.innerHTML = "<p>You are not currently reading any books.</p>";
            return;
        }

        books.forEach(book => {
            const cover = book.cover_url
                ? book.cover_url
                : "https://via.placeholder.com/150x200?text=No+Image";

            const card = document.createElement("div");
            card.className = "book-card";

            card.innerHTML = `
                <img src="${cover}">
                <h3>${book.title}</h3>
                <p>${book.author}</p>
            `;

            container.appendChild(card);
        });

    } catch (err) {
        console.error("Currently reading error:", err);
    }
}

// -------------------------------
// LOAD READING GOAL
// -------------------------------
async function loadReadingGoal() {
    try {
        const res = await fetch("http://localhost:5000/api/goals/current", {
            headers: { "Authorization": "Bearer " + token }
        });

        const goal = await res.json();

        const goalText = document.querySelector(".goal-box p");
        const fill = document.querySelector(".goal-fill");

        if (!goal || !goal.target_books) {
            goalText.innerHTML = `You’ve read <strong>0</strong> out of <strong>0</strong> books.`;
            fill.style.width = "0%";
            return;
        }

        const percent = Math.min(
            Math.round((goal.books_completed / goal.target_books) * 100),
            100
        );

        goalText.innerHTML = `
            You’ve read <strong>${goal.books_completed}</strong> 
            out of <strong>${goal.target_books}</strong> books.
        `;

        fill.style.width = percent + "%";

    } catch (err) {
        console.error("Goal load error:", err);
    }
}

// -------------------------------
// RUN ALL LOADERS
// -------------------------------
loadQuickStats();
loadCurrentlyReading();
loadReadingGoal();
