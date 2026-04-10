const form = document.getElementById("login-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            // Save JWT token
            localStorage.setItem("token", data.token);

            // Redirect to dashboard
            window.location.href = "welcome.html";
        } else {
            alert(data.error || "Login failed");
        }
    } catch (err) {
        console.error("Login error:", err);
        alert("Could not connect to server.");
    }
});
