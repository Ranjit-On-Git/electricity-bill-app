const API_URL = "http://localhost:5000/api/bill";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
  if (!token) window.location.href = "index.html";
  document.getElementById("userNameDisplay").innerText =
    localStorage.getItem("userName") || "User";
  loadHistory();
});

// Navigation Logic
document
  .getElementById("nav-calc")
  .addEventListener("click", (e) => switchTab(e, "calculatorSection"));
document
  .getElementById("nav-history")
  .addEventListener("click", (e) => switchTab(e, "historySection"));

function switchTab(e, sectionId) {
  e.preventDefault();
  document
    .querySelectorAll(".sidebar a")
    .forEach((el) => el.classList.remove("active"));
  e.target.classList.add("active");
  document.getElementById("calculatorSection").classList.add("d-none");
  document.getElementById("historySection").classList.add("d-none");
  document.getElementById(sectionId).classList.remove("d-none");
  if (sectionId === "historySection") loadHistory();
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

// Calculate Bill
document.getElementById("calcForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const loader = document.getElementById("calcLoader");
  const alertBox = document.getElementById("calcAlert");
  loader.style.display = "inline-block";
  alertBox.classList.add("d-none");

  const payload = {
    units: document.getElementById("units").value,
    fixedCharges: document.getElementById("fixedCharges").value,
    taxPercentage: document.getElementById("tax").value,
  };

  try {
    const response = await fetch(`${API_URL}/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (response.ok) {
      document.getElementById("resultCard").classList.remove("d-none");
      document.getElementById("resEnergy").innerText =
        `₹${data.data.energyCharge.toFixed(2)}`;
      document.getElementById("resFixed").innerText =
        `₹${data.data.fixedCharges.toFixed(2)}`;
      document.getElementById("resTax").innerText =
        `₹${data.data.taxAmount.toFixed(2)}`;
      document.getElementById("resTotal").innerText =
        `₹${data.data.totalBill.toFixed(2)}`;
    } else {
      alertBox.className = "alert alert-danger mt-3";
      alertBox.innerText = data.message;
    }
  } catch (error) {
    alertBox.className = "alert alert-danger mt-3";
    alertBox.innerText = "Failed to connect to server.";
  } finally {
    loader.style.display = "none";
  }
});

// Load History
async function loadHistory() {
  try {
    const response = await fetch(`${API_URL}/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const bills = await response.json();

    const tbody = document.getElementById("historyTableBody");
    tbody.innerHTML = "";

    if (bills.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="text-center">No history found.</td></tr>';
      return;
    }

    bills.forEach((bill) => {
      const date = new Date(bill.calculationDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      tbody.innerHTML += `
                <tr>
                    <td>${date}</td>
                    <td>${bill.units}</td>
                    <td>₹${bill.energyCharge.toFixed(2)}</td>
                    <td>₹${bill.fixedCharges.toFixed(2)}</td>
                    <td>₹${bill.taxAmount.toFixed(2)}</td>
                    <td class="fw-bold text-success">₹${bill.totalBill.toFixed(2)}</td>
                </tr>
            `;
    });
  } catch (error) {
    console.error("Error loading history:", error);
  }
}
