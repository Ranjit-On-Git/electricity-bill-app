const API_URL = "https://electricity-bill-app-suih.onrender.com/api/bill";
const token = localStorage.getItem("token");

// Sidebar DOM Elements
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");

document.addEventListener("DOMContentLoaded", () => {
  if (!token) window.location.href = "index.html";

  // Set User details
  document.getElementById("userNameDisplay").innerText =
    localStorage.getItem("userName") || "User";

  // Set Current Date in header
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  document.getElementById("currentDate").innerText =
    new Date().toLocaleDateString("en-US", options);

  loadHistory();
});

function showToast(message, type = "success") {
  const toastEl = document.getElementById("dashToast");
  const toastBody = document.getElementById("dashToastMessage");
  toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
  toastBody.innerText = message;
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

// --- MOBILE SIDEBAR LOGIC ---
function openSidebar() {
  sidebar.classList.add("show");
  sidebarOverlay.classList.add("show");
}

function closeSidebar() {
  sidebar.classList.remove("show");
  sidebarOverlay.classList.remove("show");
}

sidebarToggleBtn.addEventListener("click", openSidebar);
sidebarCloseBtn.addEventListener("click", closeSidebar);
sidebarOverlay.addEventListener("click", closeSidebar);
// ----------------------------

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
  e.currentTarget.classList.add("active");

  document.getElementById("calculatorSection").classList.add("d-none");
  document.getElementById("historySection").classList.add("d-none");

  document.getElementById(sectionId).classList.remove("d-none");
  if (sectionId === "historySection") loadHistory();

  // Automatically close sidebar on mobile when a link is clicked
  if (window.innerWidth <= 768) {
    closeSidebar();
  }
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.clear();
  window.location.href = "index.html";
});

// Calculate Bill Logic
document.getElementById("calcForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("calcBtn");
  const originalBtnHTML = btn.innerHTML;

  btn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2"></span>Calculating...';
  btn.disabled = true;

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
      document.getElementById("placeholderCard").classList.add("d-none");
      document.getElementById("resultCard").classList.remove("d-none");

      document.getElementById("resEnergy").innerText =
        `₹${data.data.energyCharge.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
      document.getElementById("resFixed").innerText =
        `₹${data.data.fixedCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
      document.getElementById("resTax").innerText =
        `₹${data.data.taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
      document.getElementById("resTotal").innerText =
        `₹${data.data.totalBill.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

      showToast("Bill calculated and saved successfully!", "success");
    } else {
      showToast(data.message, "danger");
    }
  } catch (error) {
    showToast("Failed to connect to server. Check your backend.", "danger");
  } finally {
    btn.innerHTML = originalBtnHTML;
    btn.disabled = false;
  }
});

// Load History Logic
async function loadHistory() {
  const tbody = document.getElementById("historyTableBody");
  tbody.innerHTML =
    '<tr><td colspan="6" class="text-center py-4"><span class="spinner-border text-primary"></span></td></tr>';

  try {
    const response = await fetch(`${API_URL}/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const bills = await response.json();

    tbody.innerHTML = "";

    if (bills.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="text-center py-5 text-muted"><i class="bi bi-inbox fs-2 d-block mb-2"></i>No calculations found. Head to the calculator to create one!</td></tr>';
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
                    <td><span class="text-muted"><i class="bi bi-calendar2-week me-2"></i>${date}</span></td>
                    <td class="fw-medium">${bill.units} <small class="text-muted fw-normal">kWh</small></td>
                    <td>₹${bill.energyCharge.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td>₹${bill.fixedCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td>₹${bill.taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td><span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 fs-6">₹${bill.totalBill.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></td>
                </tr>
            `;
    });
  } catch (error) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="text-center text-danger py-4"><i class="bi bi-exclamation-triangle me-2"></i>Error loading history data</td></tr>';
  }
}
