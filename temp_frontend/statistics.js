document.addEventListener("DOMContentLoaded", () => {

    // Load lists
    const lists = JSON.parse(localStorage.getItem("readingLists")) || [];
    const allBooks = lists.flatMap(list => list.books);

    // Finished books
    const finishedBooks = allBooks.filter(
        book => book.status === "Finished" || book.dateRead
    );

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // --- BOOKS READ THIS MONTH ---
    const booksThisMonth = finishedBooks.filter(book => {
        if (!book.dateRead) return false;
        const d = new Date(book.dateRead);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // --- TOTAL BOOKS READ ---
    const totalBooksRead = finishedBooks.length;

    // --- BOOKS READ THIS YEAR ---
    const booksThisYear = finishedBooks.filter(book => {
        if (!book.dateRead) return false;
        const d = new Date(book.dateRead);
        return d.getFullYear() === currentYear;
    });

    // --- FASTEST READ BOOK ---
    let fastestBook = null;
    let fastestTime = Infinity;

    finishedBooks.forEach(book => {
        if (!book.dateRead || !book.dateAdded) return;

        const start = new Date(book.dateAdded);
        const end = new Date(book.dateRead);
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
    const ratings = finishedBooks
        .map(book => Number(book.rating))
        .filter(r => !isNaN(r) && r > 0);

    const avgRating = ratings.length
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : "0";

    // --- UPDATE STAT CARDS ---
    document.getElementById("stat-books-month").textContent = booksThisMonth.length;
    document.getElementById("stat-books-total").textContent = totalBooksRead;
    document.getElementById("stat-books-year").textContent = booksThisYear.length;
    document.getElementById("stat-fastest-book").textContent = fastestText;
    document.getElementById("stat-author").textContent = mostReadAuthor;
    document.getElementById("stat-rating").textContent = avgRating;

    // --- YEARLY GOAL ---
    const yearlyGoal = Number(localStorage.getItem("readingGoal")) || 20;

    const booksRead = finishedBooks.length;
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
    saveGoalBtn.addEventListener("click", () => {
        const newGoal = Number(goalInput.value);

        if (!newGoal || newGoal < 1) {
            alert("Please enter a valid goal.");
            return;
        }

        localStorage.setItem("readingGoal", newGoal);

        // Refresh page to redraw ring + stats
        location.reload();
    });

});
