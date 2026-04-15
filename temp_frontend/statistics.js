document.addEventListener("DOMContentLoaded", () => {

    const lists = JSON.parse(localStorage.getItem("readingLists")) || [];

    const allBooks = lists.flatMap(list => list.books);

    const finishedBooks = allBooks.filter(
        book => book.status === "Finished" || book.dateRead
    );

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Books read this month
    const booksThisMonth = finishedBooks.filter(book => {
        if (!book.dateRead) return false;
        const d = new Date(book.dateRead);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Total books read
    const totalBooksRead = finishedBooks.length;

    // Books read this year
    const booksThisYear = finishedBooks.filter(book => {
        if (!book.dateRead) return false;
        const d = new Date(book.dateRead);
        return d.getFullYear() === currentYear;
    });

    // Most read genre
    const genreCount = {};
    finishedBooks.forEach(book => {
        if (!book.genre) return;
        const genres = book.genre.split(",");
        genres.forEach(g => {
            g = g.trim();
            genreCount[g] = (genreCount[g] || 0) + 1;
        });
    });

    const mostReadGenre = Object.keys(genreCount).length
        ? Object.keys(genreCount).reduce((a, b) =>
            genreCount[a] > genreCount[b] ? a : b
        )
        : "—";

    // Most read author
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

    // Average rating
    // Average rating
    const ratings = finishedBooks
        .map(book => Number(book.rating))
        .filter(r => !isNaN(r) && r > 0);

    const avgRating = ratings.length
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : "0";


    // Update UI
    document.getElementById("stat-books-month").textContent = booksThisMonth.length;
    document.getElementById("stat-books-total").textContent = totalBooksRead;
    document.getElementById("stat-books-year").textContent = booksThisYear.length;
    document.getElementById("stat-genre").textContent = mostReadGenre;
    document.getElementById("stat-author").textContent = mostReadAuthor;
    document.getElementById("stat-rating").textContent = avgRating;
});
