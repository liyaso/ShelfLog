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

    let lists = [];
    let currentList = null;
    let currentBook = null;

    const user_id = localStorage.getItem("user_id");

    async function loadLists() {
        try {
            const res = await fetch(`http://localhost:3000/api/lists/user/${user_id}`);
            lists = await res.json();

            console.log(lists);
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
            const res = await fetch(`http://localhost:3000/api/lists/${list_id}`);
            const list = await res.json();

            currentList = list;

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
            <div class="book-card" data-key="${book.key}">
                <img src="${book.cover}">
                <h3>${book.title}</h3>
                <p>${book.author}</p>

                ${book.status === "Reading" ? 
                    `<span class="reading-tag">Reading</span>` :
                    `<button class="start-reading-btn" data-start="${book.key}">Start Reading</button>`
                }
            </div>
        `).join("");

        // Start Reading buttons
        document.querySelectorAll(".start-reading-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation(); // prevent opening popup

                const key = btn.dataset.start;
                const book = currentList.books.find(b => b.key === key);
                if (!book) return;

                book.status = "Reading";
                book.dateStarted = new Date().toISOString();

                renderBooks();
                showStartReadingPopup(book.title);
            });
        });

        // Book card click → open popup
        document.querySelectorAll(".book-card").forEach(card => {
            card.addEventListener("click", () => openBookPopup(card.dataset.key));
        });
    }

    function showStartReadingPopup(title) {
        const popup = document.getElementById("start-reading-popup");
        const msg = document.getElementById("start-reading-msg");

        msg.textContent = `"${title}" added to Currently Reading!`;

        popup.classList.remove("hidden");

        setTimeout(() => {
            popup.classList.add("hidden");
        }, 2000);
    }

    async function deleteList(list_id) {
        try {
            await fetch(`http://localhost:3000/api/lists/delete/${list_id}`, {
                method: "DELETE"
            });

            loadLists();

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

    function openBookPopup(key) {
        currentBook = currentList.books.find(b => b.key === key);
        if (!currentBook) return;

        const finished = currentBook.dateRead
            ? new Date(currentBook.dateRead).toLocaleDateString()
            : "Not finished";

        const rating = currentBook.rating
            ? `Rating: ${currentBook.rating}★`
            : "No rating yet";

        popupBookInfo.innerHTML = `
            <img src="${currentBook.cover}" class="popup-cover">
            <h2>${currentBook.title}</h2>
            <p>${currentBook.author}</p>
            <p>${rating}</p>
            <p>Finished: ${finished}</p>
        `;

        reviewText.value = currentBook.review || "";
        popup.classList.remove("hidden");
    }

    popupClose.addEventListener("click", () => popup.classList.add("hidden"));

    saveReviewBtn.addEventListener("click", () => {
        currentBook.review = reviewText.value;
        currentBook.dateRead = new Date().toISOString();
        currentBook.status = "Finished";

        renderBooks();
        popup.classList.add("hidden");
    });

    removeBookBtn.addEventListener("click", async () => {
        await fetch("http://localhost:3000/api/lists/delete-book", {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                list_id: currentList.list_id,
                book_id: currentBook.book_id
            })
        });
        await openList(currentList.list_id);
        popup.classList.add("hidden");
    });

    loadLists();
});
