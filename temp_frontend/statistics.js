document.addEventListener("DOMContentLoaded", async () => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
        console.error("No user_id found.");
        return;
    }
    try {
        //load progress from the database
        const progressRes = await fetch(`http://localhost:3000/api/progress/${user_id}`);

        const allBooks = await progressRes.json();

            // Finished books
        const finishedBooks = allBooks.filter(
            book => book.status === "Finished"
        );

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // --- BOOKS READ THIS MONTH ---
        const booksThisMonth = finishedBooks.filter(book => {
            if (!book.finish_date) return false;
            const d = new Date(book.finish_date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

            // --- TOTAL BOOKS READ ---
        const totalBooksRead = finishedBooks.length;

        // --- BOOKS READ THIS YEAR ---
        const booksThisYear = finishedBooks.filter(book => {
            if (!book.finish_date) return false;
            const d = new Date(book.finish_date);
            return d.getFullYear() === currentYear;
        });

        // --- FASTEST READ BOOK ---
        let fastestBook = null;
        let fastestTime = Infinity;

        finishedBooks.forEach(book => {
            if (!book.start_date || !book.finish_date) return;

            const start = new Date(book.start_date);
            const end = new Date(book.finish_date);
            const duration = end - start; // milliseconds

            if (duration > 0 && duration < fastestTime) {
                fastestTime = duration;
                fastestBook = book;
            }
        });

        let fastestText = "—";

        if (fastestBook) {
            const days = Math.ceil(fastestTime / (1000 * 60 * 60 * 24));
            fastestText = `${fastestBook.title} (${days} day${days !== 1 ? "s" : ""})`;
        }

        // --- MOST READ AUTHOR ---
        const authorCount = {};
        finishedBooks.forEach(book => {
            if (!book.author) return;
            authorCount[book.author] = (authorCount[book.author] || 0) + 1;
        });

        const mostReadAuthor = Object.keys(authorCount).length
            ? Object.keys(authorCount).reduce((a, b) =>
                authorCount[a] > authorCount[b] ? a : b
            )
            : "—";

        // --- AVERAGE RATING ---
        const statsRes = await fetch(`http://localhost:3000/api/statistics/${user_id}`);

        const statsData = await statsRes.json();

        const avgRating = 
            statsData[0]?.avg_rating_given
            ? Number(statsData[0].avg_rating_given).toFixed(1)
            : "0";

            // --- UPDATE STAT CARDS ---
        document.getElementById("stat-books-month").textContent = booksThisMonth.length;
        document.getElementById("stat-books-total").textContent = totalBooksRead;
        document.getElementById("stat-books-year").textContent = booksThisYear.length;
        document.getElementById("stat-fastest-book").textContent = fastestText;
        document.getElementById("stat-author").textContent = mostReadAuthor;
        document.getElementById("stat-rating").textContent = avgRating;

        // --- YEARLY GOAL ---

        const goalRes = await fetch(`http://localhost:3000/api/goals/${user_id}`);

        const goals = await goalRes.json();

        const yearlyGoal =
            goals.length > 0
            ? goals[0].target_books
            : 20;

        const booksRead = totalBooksRead;
        const percent = Math.min((booksRead / yearlyGoal) * 100, 100).toFixed(0);

        // Update ring label
        document.getElementById("goalRingLabel").textContent =
            `${percent}% • ${booksRead}/${yearlyGoal}`;

        // --- DRAW GOAL COMPLETION RING ---
        const ctx = document.getElementById("goalRing").getContext("2d");

        new Chart(ctx, {
            type: "doughnut",
            data: {
                datasets: [{
                    data: [booksRead, Math.max(yearlyGoal - booksRead, 0)],
                    backgroundColor: ["#4CAF50", "#e0e0e0"],
                    borderWidth: 0,
                    cutout: "75%"
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });

        // --- SET GOAL POPUP LOGIC ---
        const setGoalBtn = document.getElementById("set-goal-btn");
        const setGoalPopup = document.getElementById("set-goal-popup");
        const goalClose = document.getElementById("goal-close");
        const goalInput = document.getElementById("goal-input");
        const saveGoalBtn = document.getElementById("save-goal-btn");

        // Open popup
        setGoalBtn.addEventListener("click", () => {
            goalInput.value = yearlyGoal; // preload current goal
            setGoalPopup.classList.remove("hidden");
        });

        // Close popup
        goalClose.addEventListener("click", () => {
            setGoalPopup.classList.add("hidden");
        });

        // Save new goal
        saveGoalBtn.addEventListener("click", async () => {
            const newGoal = Number(goalInput.value);

            if (!newGoal || newGoal < 1) {
                alert("Please enter a valid goal.");
                return;
            }

            await fetch (`http://localhost:3000/api/goals`, {
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({
                    user_id,
                    year: new Date().getFullYear(),
                    target_books : newGoal
                })
            });

            // Refresh page to redraw ring + stats
            location.reload();
        });

    } catch (error) {
        console.error("Failed to load statistics:", error);
    }

});
