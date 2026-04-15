document.addEventListener("DOMContentLoaded", () => {

    const lists = JSON.parse(localStorage.getItem("readingLists")) || [];
    const allBooks = lists.flatMap(list => list.books);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // -------------------------------
    // BOOKS READ THIS MONTH
    // -------------------------------
    const finishedBooks = allBooks.filter(
        b => b.status === "Finished" || b.dateRead
    );

    const booksThisMonth = finishedBooks.filter(book => {
        if (!book.dateRead) return false;
        const d = new Date(book.dateRead);
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
        if (!book.dateRead || !book.pageCount) return;
        const d = new Date(book.dateRead);
        if (d >= oneWeekAgo) pagesThisWeek += Number(book.pageCount);
    });

    document.getElementById("stat-pages-week").textContent = pagesThisWeek;

    // -------------------------------
    // AVERAGE PAGES PER DAY
    // -------------------------------
    let totalPages = 0;
    let activeDays = new Set();

    finishedBooks.forEach(book => {
        if (!book.dateRead || !book.pageCount) return;

        totalPages += Number(book.pageCount);

        const day = new Date(book.dateRead).toDateString();
        activeDays.add(day);
    });

    const avgPages = activeDays.size > 0
        ? Math.round(totalPages / activeDays.size)
        : 0;

    document.getElementById("stat-pages-day").textContent = avgPages;

    // -------------------------------
    // READING GOAL SUMMARY
    // -------------------------------
    const yearlyGoal = Number(localStorage.getItem("readingGoal")) || 20;
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
                <img src="${book.cover}">
                <h3>${book.title}</h3>
                <p>${book.author}</p>
            </div>
        `).join("");
    }

});
