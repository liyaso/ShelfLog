document.addEventListener("DOMContentLoaded", async () => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
        console.error(error);
        return;
    }

    try{
        const progressRes = await fetch(`http://localhost:3000/api/progress/${user_id}`);

        const allBooks = await progressRes.json();

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

            // -------------------------------
        // BOOKS READ THIS MONTH
        // -------------------------------
        const finishedBooks = allBooks.filter(
            b => b.status === "Finished"
        );

        const booksThisMonth = finishedBooks.filter(book => {
            if (!book.finish_date) return false;
            const d = new Date(book.finish_date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        document.getElementById("stat-books-month").textContent = booksThisMonth.length;

        // -------------------------------
        // PAGES THIS WEEK
        // -------------------------------
        let pagesThisWeek = 0;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);

        finishedBooks.forEach(book => {
            if (!book.finish_date || !book.page_count) return;
            const d = new Date(book.finish_date);
            if (d >= oneWeekAgo) pagesThisWeek += Number(book.page_count);
        });

        document.getElementById("stat-pages-week").textContent = pagesThisWeek;

        // -------------------------------
        // AVERAGE PAGES PER DAY
        // -------------------------------
        let totalPages = 0;
        let activeDays = new Set();

        finishedBooks.forEach(book => {
            if (!book.finish_date || !book.page_count) return;

            totalPages += Number(book.page_count);

            const day = new Date(book.finish_date).toDateString();
            activeDays.add(day);
        });

        const avgPages = activeDays.size > 0
            ? Math.round(totalPages / activeDays.size)
            : 0;

        document.getElementById("stat-pages-day").textContent = avgPages;

        // -------------------------------
        // READING GOAL SUMMARY
        // -------------------------------
        const goalRes = await fetch(`http://localhost:3000/api/goals/${user_id}`
            );
        const goals = await goalRes.json();

        const yearlyGoal = goals.length > 0 ? goals[0].target_books : 20;
        const booksRead = finishedBooks.length;

        const percent = Math.min((booksRead / yearlyGoal) * 100, 100);

        document.querySelector(".goal-box p").innerHTML =
            `You’ve read <strong>${booksRead}</strong> out of <strong>${yearlyGoal}</strong> books.`;

        document.querySelector(".goal-fill").style.width = percent + "%";

        // -------------------------------
        // CURRENTLY READING
        // -------------------------------
        const currentlyReading = allBooks.filter(
            b => b.status === "Reading"
        );

        const container = document.getElementById("current-reading");

        if (currentlyReading.length === 0) {
            container.innerHTML = "<p>You are not currently reading any books.</p>";
        } else {
            container.innerHTML = currentlyReading.map(book => `
                <div class="book-card">
                    <img src="${book.cover_image_url}">
                    <h3>${book.title}</h3>
                    <p>${book.author}</p>
                </div>
            `).join("");
        }

    } catch (error) {
        console.error("Failed to load dashboard:", error);
    }

});
