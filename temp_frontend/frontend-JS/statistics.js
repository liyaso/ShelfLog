// -------------------------------
// AUTH CHECK
// -------------------------------
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
}

// -------------------------------
// LOAD USER STATISTICS
// -------------------------------
async function loadStatistics() {
    try {
        const res = await fetch("http://localhost:5000/api/stats/my", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const stats = await res.json();

        // If no stats exist yet
        if (!stats.length) {
            document.getElementById("stat-books-month").textContent = 0;
            document.getElementById("stat-pages-week").textContent = 0;
            document.getElementById("stat-pages-day").textContent = 0;
            renderMilestoneChart([]);
            return;
        }

        const s = stats[0];

        // Quick stats
        document.getElementById("stat-books-month").textContent = s.books_read || 0;
        document.getElementById("stat-pages-week").textContent = s.pages_read || 0;
        document.getElementById("stat-pages-day").textContent = s.avg_book_length || 0;

        // Milestones (array of { date, progress })
        const milestones = s.milestones ? JSON.parse(s.milestones) : [];
        renderMilestoneChart(milestones);

    } catch (err) {
        console.error("Statistics load error:", err);
        alert("Could not load statistics.");
    }
}

// -------------------------------
// SIMPLE MILESTONE CHART RENDERER
// -------------------------------
function renderMilestoneChart(milestones) {
    const chart = document.getElementById("milestone-chart");
    chart.innerHTML = "";

    if (!milestones.length) {
        chart.innerHTML = "<p style='padding:20px;'>No milestone data yet.</p>";
        return;
    }

    // Create a simple bar chart
    const maxProgress = Math.max(...milestones.map(m => m.progress));

    milestones.forEach(m => {
        const bar = document.createElement("div");
        bar.style.height = "20px";
        bar.style.margin = "8px";
        bar.style.background = "#4a90e2";
        bar.style.width = (m.progress / maxProgress * 100) + "%";
        bar.style.borderRadius = "5px";
        bar.style.color = "#fff";
        bar.style.padding = "4px 8px";
        bar.style.fontSize = "14px";

        bar.textContent = `${m.date}: ${m.progress}%`;

        chart.appendChild(bar);
    });
}

// Run on page load
loadStatistics();
