// ======== ВІДКРИТТЯ ТА ЗАКРИТТЯ МОДАЛКИ ========

const loginBtn = document.getElementById("login-btn");
const loginModal = document.getElementById("login-form");
const closeLogin = document.getElementById("close-login");

loginBtn.addEventListener("click", () => {
    loginModal.style.display = "flex";
});

closeLogin.addEventListener("click", () => {
    loginModal.style.display = "none";
});

// Закриття по кліку поза вікном
window.addEventListener("click", (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = "none";
    }
});


// ======== ПЕРЕМИКАННЯ ВХІД / РЕЄСТРАЦІЯ ========

const loginBox = document.getElementById("login-box");
const registerBox = document.getElementById("register-box");
const showRegister = document.getElementById("show-register");
const showLogin = document.getElementById("show-login");

showRegister.addEventListener("click", () => {
    loginBox.style.display = "none";
    registerBox.style.display = "block";
});

showLogin.addEventListener("click", () => {
    registerBox.style.display = "none";
    loginBox.style.display = "block";
});


// ======== ОБРОБКА ФОРМИ РЕЄСТРАЦІЇ ========

const registerForm = document.getElementById("registerForm");
const successMessage = document.getElementById("success-message");

registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let formData = new FormData(registerForm);

    fetch("register.php", {
        method: "POST",
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                // Показати повідомлення
                successMessage.style.display = "block";
                setTimeout(() => {
                    successMessage.style.opacity = 1;
                }, 50);

                // Очистити форму
                registerForm.reset();

                // Повернутися до входу
                setTimeout(() => {
                    successMessage.style.opacity = 0;
                    setTimeout(() => {
                        successMessage.style.display = "none";
                    }, 300);

                    registerBox.style.display = "none";
                    loginBox.style.display = "block";
                }, 2000);
            } else {
                alert(data.msg);
            }
        })
        .catch(error => {
            alert("Помилка сервера: " + error);
        });
});


// ======== ОБРОБКА ФОРМИ ВХОДУ (можна дописати пізніше) ========

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Вхід поки не налаштований. Можу зробити систему логіну, якщо хочеш!");
});
