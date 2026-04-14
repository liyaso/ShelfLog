// -------------------------------
// AUTH CHECK
// -------------------------------
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
}

// -------------------------------
// LOAD USER'S READING LISTS
// -------------------------------
async function loadReadingLists() {
    try {
        const res = await fetch("http://localhost:5000/api/lists/my", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const lists = await res.json();
        const container = document.getElementById("reading-list-container");

        container.innerHTML = "";

        if (!lists.length) {
            container.innerHTML = "<p>You haven't created any reading lists yet.</p>";
            return;
        }

        lists.forEach(list => {
            const card = document.createElement("div");
            card.className = "book-card";

            card.innerHTML = `
                <h3>${list.name}</h3>
                <p>${list.description || "No description provided."}</p>
            `;

            container.appendChild(card);
        });

    } catch (err) {
        console.error("Error loading reading lists:", err);
        alert("Could not load your reading lists.");
    }
}

// Run on page load
loadReadingLists();
