const form = document.getElementById("signup-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("signup-username").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirm = document.getElementById("signup-confirm").value;

    // -------------------------------
    // VALIDATION
    // -------------------------------
    if (!username || !email || !password || !confirm) {
        alert("Please fill out all fields.");
        return;
    }

    if (password !== confirm) {
        alert("Passwords do not match.");
        return;
    }

    // -------------------------------
    // SEND SIGNUP REQUEST
    // -------------------------------
    try {
        const res = await fetch("http://localhost:5000/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Signup successful! Please log in.");
            window.location.href = "login.html";
        } else {
            alert(data.error || "Signup failed.");
        }

    } catch (err) {
        console.error("Signup error:", err);
        alert("Could not connect to server.");
    }
});
