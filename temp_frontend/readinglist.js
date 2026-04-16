document.addEventListener("DOMContentLoaded", () => {
    const listsContainer = document.getElementById("lists-container");
    const readingListContainer = document.getElementById("reading-list-container");
    const selectedListTitle = document.getElementById("selected-list-title");

    const createListBtn = document.getElementById("create-list-btn");
    const createListPopup = document.getElementById("create-list-popup");
    const createClose = document.getElementById("create-close");
    const saveListBtn = document.getElementById("save-list-btn");
    const newListName = document.getElementById("new-list-name");

    const popup = document.getElementById("review-popup");
    const popupClose = document.getElementById("popup-close");
    const popupBookInfo = document.getElementById("popup-book-info");
    const reviewText = document.getElementById("review-text");
    const saveReviewBtn = document.getElementById("save-review-btn");
    const removeBookBtn = document.getElementById("remove-book-btn");

    const popupStars = document.querySelectorAll(".popup-star");
    const starContainer = document.querySelector(".popup-stars");

    let lists = [];
    let currentList = null;
    let currentBook = null;
    let popupRating = 0;

    const user_id = localStorage.getItem("user_id");

    async function loadLists() {
        try {
            const res = await fetch(`http://localhost:3000/api/lists/user/${user_id}`);
            lists = await res.json();
            renderLists();
        } catch (error) {
            console.error("Failed to load lists.", error);
        }
    }

    function renderLists() {
        listsContainer.innerHTML = lists.map(list => `
            <div class="list-card" data-id="${list.list_id}">
                <h3>${list.name}</h3>
                <p>${list.book_count || 0} books</p>
                <button class="delete-list-btn" data-delete="${list.list_id}">Delete List</button>
            </div>
        `).join("");

        document.querySelectorAll(".list-card").forEach(card => {
            card.addEventListener("click", (e) => {
                if (e.target.dataset.delete) return;
                openList(card.dataset.id);
            });
        });

        document.querySelectorAll(".delete-list-btn").forEach(btn => {
            btn.addEventListener("click", () => deleteList(btn.dataset.delete));
        });
    }

    async function openList(list_id) {
        try {
            const user_id = localStorage.getItem("user_id");

            const res = await fetch(`http://localhost:3000/api/lists/${list_id}?user_id=${user_id}`);
            const data = await res.json();

            currentList = data;

            selectedListTitle.textContent = currentList.name;
            selectedListTitle.classList.remove("hidden");

            popup.classList.add("hidden");
            renderBooks();

        } catch (error) {
            console.error("Failed to open list:", error);
        }
    }

    function renderBooks() {
        readingListContainer.innerHTML = currentList.books.map(book => `
            <div class="book-card" data-id="${book.book_id}">
                <img src="${book.cover_image_url || book.cover || 'https://via.placeholder.com/150'}" alt="cover">
                <h3>${book.title}</h3>
                <p>${book.author}</p>

                ${book.status === "Reading" ? 
                    `<span class="reading-tag">Reading</span>` :
                    `<button class="start-reading-btn" data-start="${book.book_id}">Start Reading</button>`
                }
            </div>
        `).join("");

        document.querySelectorAll(".start-reading-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();

                const book_id = btn.dataset.start;
                const user_id = localStorage.getItem("user_id");

                try {
                    const res = await fetch("http://localhost:3000/api/progress", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body : JSON.stringify({
                            user_id,
                            book_id,
                            status: "Reading",
                            current_page: 0
                        })
                    });

                    const data = await res.json();
                    
                    if (!res.ok) {
                        alert(data.error || "Failed to update reading status.");
                        return;
                    }

                    await openList(currentList.list_id);
                } catch (error) {
                    console.error(error);
                }
            });
        });

        document.querySelectorAll(".book-card").forEach(card => {
            card.addEventListener("click", () => openBookPopup(card.dataset.id));
        });
    }

    function openBookPopup(book_id) {
        currentBook = currentList.books.find(b => String(b.book_id) === String(book_id));
        if (!currentBook) return;

        popupRating = Number(currentBook.rating) || 0;

        popupBookInfo.innerHTML = `
            <img src="${currentBook.cover_image_url || currentBook.cover}" class="popup-cover">
            <h2>${currentBook.title}</h2>
            <p>${currentBook.author}</p>
        `;
        
        updatePopupStars(popupRating);
        reviewText.value = currentBook.review || "";
        popup.classList.remove("hidden");
    }

    popupClose.addEventListener("click", () => popup.classList.add("hidden"));

    function updatePopupStars(value) {
        popupStars.forEach(star => {
            const starValue = Number(star.dataset.value);
            star.textContent = starValue <= value ? "★" : "☆";
            star.classList.toggle("selected", starValue <= value);
        });
    }

    popupStars.forEach(star => {
        star.addEventListener("mouseover", () => updatePopupStars(Number(star.dataset.value)));
        star.addEventListener("click", () => {
            popupRating = Number(star.dataset.value);
            updatePopupStars(popupRating);
        });
    });

    starContainer.addEventListener("mouseleave", () => updatePopupStars(popupRating));

    saveReviewBtn.addEventListener("click", async () => {
        const user_id = localStorage.getItem("user_id");

        try {
            await fetch("http://localhost:3000/api/reviews/add", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body : JSON.stringify({
                    user_id,
                    book_id: currentBook.book_id,
                    rating: popupRating,
                    review_text: reviewText.value
                })
            });

            await fetch("http://localhost:3000/api/progress", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body : JSON.stringify({
                    user_id,
                    book_id: currentBook.book_id,
                    status: "Finished",
                    current_page: currentBook.page_count || 0
                })
            });

            await openList(currentList.list_id);
            popup.classList.add("hidden");

        } catch (error) {
            console.error(error);
        }
    });

    // ⭐ DELETE BOOK — confirmation + book count update
    removeBookBtn.addEventListener("click", async () => {
        const confirmDelete = confirm(`Remove "${currentBook.title}" from this list?`);
        if (!confirmDelete) return;

        await fetch("http://localhost:3000/api/lists/delete-book", {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                list_id: currentList.list_id,
                book_id: currentBook.book_id
            })
        });

        await openList(currentList.list_id); 
        await loadLists(); 
        popup.classList.add("hidden");
    });

    // ⭐ DELETE LIST — confirmation added
    async function deleteList(list_id) {
        const confirmDelete = confirm("Are you sure you want to delete this entire reading list?");
        if (!confirmDelete) return;

        try {
            await fetch(`http://localhost:3000/api/lists/delete/${list_id}`, {
                method: "DELETE"
            });

            await loadLists();

        } catch (error) {
            console.error("Failed to delete list:", error);
        }

        readingListContainer.innerHTML = "";
        selectedListTitle.classList.add("hidden");
    }

    createListBtn.addEventListener("click", () => {
        createListPopup.classList.remove("hidden");
    });

    createClose.addEventListener("click", () => {
        createListPopup.classList.add("hidden");
        newListName.value = "";
    });

    saveListBtn.addEventListener("click", async () => {
        const name = newListName.value.trim();
        if (!name) return;

        try {
            const res = await fetch("http://localhost:3000/api/lists/create", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body : JSON.stringify({
                    user_id,
                    name,
                    description: "",
                    is_public: false
                })
            });

            const data = await res.json();
            
            if (!res.ok) {
                if (res.status === 409) {
                    alert("A list with this name already exists.");
                } else {
                    alert(data.error || "Failed to create list.");
                }
                return;
            }

            loadLists();
        
        } catch (error) {
            console.error(error);
        }

        createListPopup.classList.add("hidden");
        newListName.value = "";
    });

    loadLists();
});
