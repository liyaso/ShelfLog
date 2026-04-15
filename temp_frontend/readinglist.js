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

    let lists = JSON.parse(localStorage.getItem("readingLists")) || [];
    let currentList = null;
    let currentBook = null;

    function saveLists() {
        localStorage.setItem("readingLists", JSON.stringify(lists));
    }

    function renderLists() {
        listsContainer.innerHTML = lists.map(list => `
            <div class="list-card" data-id="${list.id}">
                <h3>${list.name}</h3>
                <p>${list.books.length} books</p>
                <button class="delete-list-btn" data-delete="${list.id}">Delete List</button>
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

    function openList(id) {
        currentList = lists.find(l => l.id === id);
        selectedListTitle.textContent = currentList.name;
        selectedListTitle.classList.remove("hidden");

        popup.classList.add("hidden"); // close any open popup

        renderBooks();
    }


    function renderBooks() {
        readingListContainer.innerHTML = currentList.books.map(book => `
            <div class="book-card" data-key="${book.key}">
                <img src="${book.cover}">
                <h3>${book.title}</h3>
                <p>${book.author}</p>
            </div>
        `).join("");

        document.querySelectorAll(".book-card").forEach(card => {
            card.addEventListener("click", () => openBookPopup(card.dataset.key));
        });
    }

    function deleteList(id) {
        lists = lists.filter(l => l.id !== id);
        saveLists();
        renderLists();
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

    saveListBtn.addEventListener("click", () => {
        const name = newListName.value.trim();
        if (!name) return;

        lists.push({
            id: Date.now().toString(),
            name,
            books: []
        });

        saveLists();
        renderLists();
        createListPopup.classList.add("hidden");
        newListName.value = "";
    });

    function openBookPopup(key) {
        currentBook = currentList.books.find(b => b.key === key);
        if (!currentBook) {
            alert("Book not found in this list.");
            return;
        }

        popupBookInfo.innerHTML = `
            <img src="${currentBook.cover}" class="popup-cover">
            <h2>${currentBook.title}</h2>
            <p>${currentBook.author}</p>
        `;

        reviewText.value = currentBook.review || "";
        popup.classList.remove("hidden");
    }

    popupClose.addEventListener("click", () => popup.classList.add("hidden"));

    saveReviewBtn.addEventListener("click", () => {
        currentBook.review = reviewText.value;
        saveLists();
        popup.classList.add("hidden");
    });

    removeBookBtn.addEventListener("click", () => {
        currentList.books = currentList.books.filter(b => b.key !== currentBook.key);
        saveLists();
        renderBooks();
        popup.classList.add("hidden");
    });

    renderLists();
});
