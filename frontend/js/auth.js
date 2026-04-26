let isLogin = true;
const API_URL = "http://localhost:5000/api/auth";

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("token")) window.location.href = "dashboard.html";
});

document.getElementById("toggleAuth").addEventListener("click", (e) => {
  e.preventDefault();
  isLogin = !isLogin;
  document.getElementById("nameGroup").classList.toggle("d-none");
  document.getElementById("formTitle").innerText = isLogin
    ? "Login"
    : "Register";
  document.getElementById("submitBtn").innerText = isLogin
    ? "Login"
    : "Register";
  e.target.innerText = isLogin
    ? "Don't have an account? Register"
    : "Already have an account? Login";
});

document.getElementById("authForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("name").value;
  const alertBox = document.getElementById("alertBox");

  const endpoint = isLogin ? "/login" : "/register";
  const payload = isLogin ? { email, password } : { name, email, password };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (response.ok) {
      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.user.name);
        window.location.href = "dashboard.html";
      } else {
        alertBox.className = "alert alert-success";
        alertBox.innerText = "Registration successful! Please login.";
        document.getElementById("toggleAuth").click();
      }
    } else {
      alertBox.className = "alert alert-danger";
      alertBox.innerText = data.message;
    }
  } catch (error) {
    alertBox.className = "alert alert-danger";
    alertBox.innerText = "Server error. Please try again later.";
  }
});
