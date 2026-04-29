let isLogin = true;
const API_URL = "https://electricity-bill-app-suih.onrender.com/api/auth";

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("token")) window.location.href = "dashboard.html";
});

function showToast(message, type = "danger") {
  const toastEl = document.getElementById("authToast");
  const toastBody = document.getElementById("toastMessage");
  toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
  toastBody.innerText = message;
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

document.getElementById("toggleAuth").addEventListener("click", (e) => {
  e.preventDefault();
  isLogin = !isLogin;

  const nameGroup = document.getElementById("nameGroup");
  const formTitle = document.getElementById("formTitle");
  const formSubtitle = document.getElementById("formSubtitle");
  const submitBtn = document.getElementById("submitBtn");

  if (isLogin) {
    nameGroup.classList.add("d-none");
    formTitle.innerText = "Welcome Back";
    formSubtitle.innerText = "Login to your account";
    submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Login';
    e.target.innerText = "Don't have an account? Register here";
  } else {
    nameGroup.classList.remove("d-none");
    formTitle.innerText = "Create Account";
    formSubtitle.innerText = "Join PowerCalc today";
    submitBtn.innerHTML = '<i class="bi bi-person-plus me-2"></i>Register';
    e.target.innerText = "Already have an account? Login here";
  }
});

document.getElementById("authForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("name").value;
  const submitBtn = document.getElementById("submitBtn");

  const originalBtnText = submitBtn.innerHTML;
  submitBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
  submitBtn.disabled = true;

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
        showToast("Registration successful! Please login.", "success");
        document.getElementById("toggleAuth").click();
        document.getElementById("authForm").reset();
      }
    } else {
      showToast(data.message, "danger");
    }
  } catch (error) {
    showToast(
      "Server error. Please verify your backend is running on port 5000.",
      "danger",
    );
  } finally {
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
  }
});
