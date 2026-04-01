document.addEventListener("DOMContentLoaded", async () => {

    if (!localStorage.getItem("login-page")) {
        const user = {
            name: "",
            password: "",
            message: ""
        }
        localStorage.setItem("login-page", JSON.stringify(user));
    }

    const API_URL = "https://clocktower-homebrew-collection-13pz.onrender.com";

    const storage = JSON.parse(localStorage.getItem("login-page"));

    function saveLocalStorage() {
        localStorage.setItem("login-page", JSON.stringify(storage));
    }

    if (!await databaseIsConnected()) {
        window.location = "index.html";
        return;
    }

    const userNameInput = document.getElementById("username-input");
    const passwordInput = document.getElementById("password-input");
    const confirmPasswordRow = document.getElementById("confirm-password-row");
    const confirmPasswordInput = document.getElementById("confirm-password-input");
    const loginButton = document.getElementById("login-page-login-button");
    const loginMessage = document.getElementById("login-message");
    loginMessage.textContent = "";
    const userNames = [];
    let users = await fetch(API_URL + '/users').then(res => res.json());
    for (const user of users) {
        userNames.push(user.name);
    }

    userNameInput.addEventListener("input", () => {
        if (userNames.includes(userNameInput.value)) {
            loginMessage.textContent = "Username exists (might be yours)";
            loginButton.textContent = "Login";
            confirmPasswordRow.style.visibility = "hidden";
        } else {
            loginMessage.textContent = "";
            loginButton.textContent = "Sign Up";
            confirmPasswordRow.style.visibility = "visible";
        }
    });

    loginButton.addEventListener("click", async () => {
        if (!userNameInput.value) {
            loginMessage.textContent = "You have to provide a username";
            return;
        }
        if (!userNames.includes(userNameInput.value)) {

            if (passwordInput.value !== confirmPasswordInput.value) {
                loginMessage.textContent = "Passwords do not match";
                return;
            }

            const user = {
                name: userNameInput.value,
                password: document.getElementById("password-input").value
            }

            await fetch(API_URL + '/users/create', {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(user)
            });
            loginMessage.textContent = "Enter your name and password again to login";
            saveLocalStorage();
            userNames.push(user.name);
            users.push(user);
            userNameInput.value = "";
            passwordInput.value = "";
            confirmPasswordInput.value = "";
        } else if (userNames.includes(userNameInput.value)) {
            const user = users.find(user => user.name === userNameInput.value);
            const response = await fetch(API_URL + '/users/check-password', {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({inputPassword: passwordInput.value, databasePassword: user.password})
            });
            const data = await response.json();
            if (!data.isValid) {
                loginMessage.innerHTML = "Incorrect password <br> If you have forgotten your password, message Bread (brot5) on discord.";
                return;
            }
            storage.name = user.name;
            storage.password = user.password;
            storage.message = "You may now go to a page you see below";
            loginMessage.textContent = storage.message;

            saveLocalStorage();
            document.querySelector(".redirect-div").style.display = "flex";
        }
    });

    document.getElementById("clocktower-homebrew-collection-button").addEventListener("click", () => {
        window.location = "https://bread-005.github.io/Clocktower-Homebrew-Collection/index.html";
    });

    document.getElementById("grimoire-of-lies-button").addEventListener("click", () => {
        window.location = "https://bread-005.github.io/Grimoire-of-Lies/index.html";
    });

    async function databaseIsConnected() {
        try {
            const response = await fetch(API_URL + "/roles");
            return response.ok;
        } catch (err) {
            return false;
        }
    }
});